import express from 'express';
import { createOrder, verifyPayment } from '../controllers/paymentController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.post('/order', auth, createOrder);
router.post('/verify', auth, verifyPayment);

export default router;
