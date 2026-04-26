import express from 'express';
import { startSession, endSession, getSessionStatus } from '../controllers/sessionController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.post('/start', auth, startSession);
router.post('/end', auth, endSession);
router.get('/status', auth, getSessionStatus);

export default router;
