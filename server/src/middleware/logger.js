import logQueue from '../jobs/logQueue.js';

const logger = (req, res, next) => {
  const start = Date.now();
  const endpoint = req.originalUrl;

  res.on('finish', () => {
    // Push to async queue — fires after response is sent, no latency added
    logQueue.add({
      method: req.method,
      url: endpoint,
      status: res.statusCode,
      responseTime: Date.now() - start,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      userId: req.user ? req.user.userId : null,
    });

    // Terminal log (sync — instant)
    console.log(`[${new Date().toISOString()}] ${req.method} ${endpoint} - ${req.user?.userId || 'anonymous'}`);
  });

  next();
};

export default logger;
