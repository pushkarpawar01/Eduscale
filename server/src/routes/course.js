import express from 'express';
import { createCourse, addModule, createQuiz, getCourseFullDetails, updateCourse, deleteCourse, getAllCourses } from '../controllers/courseController.js';
import auth from '../middleware/auth.js';
import adminAuth from '../middleware/adminAuth.js';
import { upload } from '../config/s3.js';

const router = express.Router();

// Admin only routes
router.post('/create', adminAuth, createCourse);
router.put('/:courseId', adminAuth, updateCourse);
router.delete('/:courseId', adminAuth, deleteCourse);
router.post('/:courseId/module', adminAuth, addModule);
router.post('/:courseId/quiz', adminAuth, createQuiz);

// File upload route - returns the S3 URL
router.post('/upload', adminAuth, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  res.json({ url: req.file.location });
});

router.get('/', adminAuth, getAllCourses);
router.get('/:courseId', auth, getCourseFullDetails);

export default router;
