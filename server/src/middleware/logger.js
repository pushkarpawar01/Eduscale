import Log from '../models/Log.js';

const logger = async (req, res, next) => {
  const start = Date.now();
  const endpoint = req.originalUrl;
  
  // Hook into response finish to capture status and time
  res.on('finish', async () => {
    try {
      const responseTime = Date.now() - start;
      const logEntry = new Log({
        method: req.method,
        url: endpoint,
        status: res.statusCode,
        responseTime,
        ip: req.ip,
        userAgent: req.get('user-agent'),
        user: req.user ? req.user.userId : null
      });
      await logEntry.save();
    } catch (err) {
      console.error('Logging error:', err);
    }
  });

  const timestamp = new Date().toISOString();
  const userId = req.user ? req.user.userId : 'anonymous';
  console.log(`[${timestamp}] ${req.method} ${endpoint} - ${userId}`);
  
  next();
};

export default logger;
