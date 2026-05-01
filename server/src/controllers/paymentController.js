import Razorpay from 'razorpay';
import crypto from 'crypto';
import dotenv from 'dotenv';
import Enrollment from '../models/Enrollment.js';
import Content from '../models/Content.js';
import User from '../models/User.js';
import { sendEnrollmentEmail } from '../utils/emailService.js';
import { generateReceiptPDF } from '../utils/certificateService.js';

dotenv.config();

export const createOrder = async (req, res) => {
  try {
    const { courseId } = req.body;

    // Use a fresh instance or ensure keys are loaded
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    if (!process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID.includes('YourKey')) {
      return res.status(400).json({ message: 'Razorpay keys not configured' });
    }

    const course = await Content.findById(courseId);
    
    if (!course) return res.status(404).json({ message: 'Course not found' });
    if (course.isFree) return res.status(400).json({ message: 'This is a free course' });

    const options = {
      amount: Math.round(course.price * 100), // amount in smallest currency unit (paise)
      currency: "INR",
      receipt: `receipt_order_${courseId.substring(0, 5)}_${Date.now()}`,
    };

    console.log('Creating Razorpay Order:', options);
    const order = await razorpay.orders.create(options);
    res.json({ order, key_id: process.env.RAZORPAY_KEY_ID });
  } catch (error) {
    console.error('Razorpay Error:', error);
    res.status(500).json({ message: 'Razorpay order creation failed', error: error.message });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      courseId 
    } = req.body;
    const userId = req.user.userId;

    if (!process.env.RAZORPAY_KEY_SECRET) {
      return res.status(400).json({ message: 'Razorpay secret not configured' });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      // Payment Verified - Enroll user
      const course = await Content.findById(courseId);
      const user = await User.findById(userId);

      const enrollment = new Enrollment({
        user: userId,
        course: courseId,
        paymentStatus: 'completed',
        paymentId: razorpay_payment_id
      });

      await enrollment.save();

      // Generate Receipt and Mail
      const receiptBuffer = await generateReceiptPDF(
        user.name,
        course.title,
        course.price,
        razorpay_payment_id,
        Date.now()
      );

      await sendEnrollmentEmail(user.email, user.name, course.title, true, course.price, receiptBuffer);

      res.status(200).json({ 
        message: "Payment verified and enrollment successful", 
        enrollment 
      });
    } else {
      res.status(400).json({ message: "Invalid signature, payment verification failed" });
    }
  } catch (error) {
    res.status(500).json({ message: 'Verification failed', error: error.message });
  }
};
