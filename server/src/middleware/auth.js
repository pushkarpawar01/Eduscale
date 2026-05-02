import jwt from 'jsonwebtoken';
import { isTokenBlacklisted } from '../config/redis.js';

const auth = async (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');

    // Stateless check: is this token blacklisted (i.e., user has logged out)?
    if (decoded.jti) {
      const blacklisted = await isTokenBlacklisted(decoded.jti);
      if (blacklisted) {
        return res.status(401).json({ message: 'Token has been revoked. Please log in again.' });
      }
    }

    req.user = decoded;
    next();
  } catch (ex) {
    res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

export default auth;
