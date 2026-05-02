// logWorker.js — no-op when using in-process queue.
// The logQueue itself handles DB writes via setImmediate.
// This file is kept for future extension (e.g., switching to BullMQ for multi-server).

console.log('[LogWorker] In-process mode active. No external worker needed.');
