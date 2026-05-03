import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import connectDB from './src/config/db.js';
import logger from './src/middleware/logger.js';
import authRoutes from './src/routes/auth.js';
import sessionRoutes from './src/routes/session.js';
import contentRoutes from './src/routes/content.js';
import courseRoutes from './src/routes/course.js';
import enrollmentRoutes from './src/routes/enrollment.js';
import paymentRoutes from './src/routes/payment.js';
import analyticsRoutes from './src/routes/analytics.js';
import './src/jobs/logWorker.js';

// Load env vars
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Apply logger to all API routes
app.use('/api', logger);

// Health check endpoint — used by Docker healthcheck and load balancer
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        instance: process.env.HOSTNAME || 'local',
        uptime: Math.floor(process.uptime()),
        memory: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
        timestamp: new Date().toISOString()
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/session', sessionRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/course', courseRoutes);
app.use('/api/enrollment', enrollmentRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/analytics', analyticsRoutes);

// Static file serving:
// - In Docker: Nginx container handles this — backend is API-only
// - In local dev/Render: backend serves the built client
const distPath = path.resolve(__dirname, '../client/dist');
const distExists = fs.existsSync(distPath);

if (distExists) {
    app.use(express.static(distPath));
    // SPA fallback — serve index.html for all non-API routes
    app.use((req, res) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
    });
    console.log('[Server] Serving frontend static files from:', distPath);
} else {
    // Docker mode — backend is API-only, Nginx handles frontend
    app.get('/', (req, res) => {
        res.json({ message: 'Eduscale API is running.', mode: 'docker-api-only' });
    });
    console.log('[Server] API-only mode (no client/dist found — Nginx serves frontend)');
}

// Database connection
connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
