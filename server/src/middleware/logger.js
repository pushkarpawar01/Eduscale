const logger = (req, res, next) => {
  const userId = req.user ? req.user.userId : 'anonymous';
  const endpoint = req.originalUrl;
  const timestamp = new Date().toISOString();
  
  // In a real application, this might go to an ELK stack or CloudWatch
  console.log(`[${timestamp}] User: ${userId} | Endpoint: ${req.method} ${endpoint}`);
  next();
};

export default logger;
