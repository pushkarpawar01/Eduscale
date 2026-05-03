#!/usr/bin/env node
/**
 * Eduscale Auto-Scaler — Phase 6
 * ================================
 * Monitors CPU usage and container count, then scales the
 * backend service up or down using docker-compose commands.
 *
 * Usage:
 *   node scripts/autoscale.js              # Run once
 *   node scripts/autoscale.js --watch      # Run every 30s continuously
 *   node scripts/autoscale.js --scale=5    # Force scale to 5 instances
 */

import { execSync, exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// ── Config ──────────────────────────────────────────────────────
const CONFIG = {
  minInstances: 2,          // Always run at least 2 (high availability)
  maxInstances: 10,         // Cap at 10 (adjust based on your server RAM)
  scaleUpCpuThreshold: 70,  // Scale up if avg CPU > 70%
  scaleDownCpuThreshold: 30,// Scale down if avg CPU < 30%
  scaleUpStep: 2,           // Add 2 instances at a time
  scaleDownStep: 1,         // Remove 1 instance at a time
  watchIntervalMs: 30000,   // Check every 30 seconds in --watch mode
  serviceName: 'backend',   // Docker Compose service to scale
  composeFile: 'docker-compose.yml',
};

// ── Helpers ─────────────────────────────────────────────────────

const log = (msg) => console.log(`[AutoScaler] ${new Date().toISOString().slice(11, 19)} ${msg}`);

/** Get all running backend containers with their CPU usage */
async function getBackendStats() {
  try {
    const { stdout } = await execAsync(
      `docker stats --no-stream --format "{{.Name}},{{.CPUPerc}},{{.MemPerc}}" ` +
      `$(docker ps --filter "name=eduscale-backend" --format "{{.ID}}")`
    );

    const lines = stdout.trim().split('\n').filter(Boolean);
    const instances = lines.map(line => {
      const [name, cpu, mem] = line.split(',');
      return {
        name: name.trim(),
        cpu: parseFloat(cpu.replace('%', '')),
        mem: parseFloat(mem.replace('%', '')),
      };
    });

    return instances;
  } catch {
    return [];
  }
}

/** Get current number of running backend replicas */
async function getCurrentReplicas() {
  try {
    const { stdout } = await execAsync(
      `docker ps --filter "name=eduscale-backend" --format "{{.ID}}" | wc -l`
    );
    return parseInt(stdout.trim()) || 0;
  } catch {
    return 0;
  }
}

/** Scale backend to a specific number of instances */
async function scaleTo(count) {
  const clamped = Math.max(CONFIG.minInstances, Math.min(CONFIG.maxInstances, count));
  log(`⚙️  Scaling ${CONFIG.serviceName} to ${clamped} instances...`);

  try {
    await execAsync(
      `docker-compose -f ${CONFIG.composeFile} up -d --scale ${CONFIG.serviceName}=${clamped} --no-recreate`
    );
    log(`✅ Scaled to ${clamped} instances successfully.`);
    return clamped;
  } catch (err) {
    log(`❌ Scale failed: ${err.message}`);
    return null;
  }
}

/** Print a visual dashboard of current state */
function printDashboard(instances, avgCpu, currentReplicas, action) {
  console.log('\n' + '─'.repeat(60));
  console.log(`  EDUSCALE AUTO-SCALER  |  ${new Date().toLocaleTimeString()}`);
  console.log('─'.repeat(60));
  console.log(`  Replicas   : ${currentReplicas} running`);
  console.log(`  Avg CPU    : ${avgCpu.toFixed(1)}%  (up: >${CONFIG.scaleUpCpuThreshold}%  down: <${CONFIG.scaleDownCpuThreshold}%)`);
  console.log(`  Min/Max    : ${CONFIG.minInstances} / ${CONFIG.maxInstances}`);
  console.log('─'.repeat(60));

  if (instances.length > 0) {
    instances.forEach(i => {
      const bar = '█'.repeat(Math.round(i.cpu / 5)).padEnd(20, '░');
      console.log(`  ${i.name.padEnd(35)} CPU: ${bar} ${i.cpu.toFixed(1)}%`);
    });
  } else {
    console.log('  No backend containers found.');
  }

  console.log('─'.repeat(60));
  console.log(`  Action     : ${action}`);
  console.log('─'.repeat(60) + '\n');
}

// ── Main Logic ───────────────────────────────────────────────────

async function runScalingCheck() {
  const instances = await getBackendStats();
  const currentReplicas = await getCurrentReplicas();

  if (instances.length === 0) {
    log('⚠️  No backend containers running. Is docker-compose up?');
    printDashboard([], 0, 0, '⚠️  No containers detected');
    return;
  }

  const avgCpu = instances.reduce((sum, i) => sum + i.cpu, 0) / instances.length;
  let action = '✅ No change needed';

  if (avgCpu > CONFIG.scaleUpCpuThreshold) {
    const target = currentReplicas + CONFIG.scaleUpStep;
    if (target > CONFIG.maxInstances) {
      action = `⚠️  At max capacity (${CONFIG.maxInstances} instances)`;
    } else {
      action = `📈 Scaling UP: ${currentReplicas} → ${target} (CPU: ${avgCpu.toFixed(1)}%)`;
      printDashboard(instances, avgCpu, currentReplicas, action);
      await scaleTo(target);
      return;
    }
  } else if (avgCpu < CONFIG.scaleDownCpuThreshold && currentReplicas > CONFIG.minInstances) {
    const target = currentReplicas - CONFIG.scaleDownStep;
    action = `📉 Scaling DOWN: ${currentReplicas} → ${target} (CPU: ${avgCpu.toFixed(1)}%)`;
    printDashboard(instances, avgCpu, currentReplicas, action);
    await scaleTo(target);
    return;
  }

  printDashboard(instances, avgCpu, currentReplicas, action);
}

// ── Entry Point ──────────────────────────────────────────────────

const args = process.argv.slice(2);

// Force scale: node scripts/autoscale.js --scale=5
const forceScale = args.find(a => a.startsWith('--scale='));
if (forceScale) {
  const count = parseInt(forceScale.split('=')[1]);
  log(`🔧 Force scaling to ${count} instances...`);
  await scaleTo(count);
  process.exit(0);
}

// Watch mode: node scripts/autoscale.js --watch
if (args.includes('--watch')) {
  log(`👀 Watch mode active. Checking every ${CONFIG.watchIntervalMs / 1000}s...`);
  log(`   Scale up   when CPU > ${CONFIG.scaleUpCpuThreshold}%`);
  log(`   Scale down when CPU < ${CONFIG.scaleDownCpuThreshold}%`);
  log(`   Range: ${CONFIG.minInstances} – ${CONFIG.maxInstances} instances\n`);

  await runScalingCheck(); // Run immediately
  setInterval(runScalingCheck, CONFIG.watchIntervalMs);
} else {
  // Single run
  await runScalingCheck();
}
