import express from 'express';
import { register, login, refresh, logout, updateProfile, getMe } from '../controllers/authController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/me', auth, getMe);
router.put('/profile', auth, updateProfile);

export default router;
