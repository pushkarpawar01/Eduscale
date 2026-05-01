import express from 'express';
import { getSystemStats } from '../controllers/analyticsController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Only admins should access this in production, but for now we'll allow auth users
router.get('/stats', auth, getSystemStats);

export default router;
