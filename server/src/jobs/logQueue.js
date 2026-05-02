// Lightweight in-process async log queue — no Redis required.
// Jobs are processed in the background using setImmediate so they
// never block the request/response cycle.

import Log from '../models/Log.js';

let queueActive = true;

const logQueue = {
  _errorLogged: false,

  add(logData) {
    if (!queueActive) return Promise.resolve();

    // setImmediate defers execution until after I/O events — true async
    return new Promise((resolve) => {
      setImmediate(async () => {
        try {
          await new Log({
            method: logData.method,
            url: logData.url,
            status: logData.status,
            responseTime: logData.responseTime,
            ip: logData.ip,
            userAgent: logData.userAgent,
            user: logData.userId || null,
          }).save();
        } catch (err) {
          if (!this._errorLogged) {
            console.warn('[LogQueue] DB write error:', err.message);
            this._errorLogged = true;
          }
        }
        resolve();
      });
    });
  },

  // Graceful shutdown — wait for in-flight jobs to complete
  shutdown() {
    queueActive = false;
    console.log('[LogQueue] Queue shut down.');
  }
};

console.log('[LogQueue] ✅ In-process async queue ready (no Redis required).');

export default logQueue;
