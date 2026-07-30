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
router.post('/upload', adminAuth, (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      // Multer-specific errors (file size, file type)
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ message: 'File too large. Maximum size is 500MB.' });
      }
      if (err.message?.startsWith('File type not allowed')) {
        return res.status(415).json({ message: err.message });
      }
      // Connection was aborted mid-upload (client gave up)
      if (err.message === 'Request aborted' || err.code === 'ECONNRESET') {
        console.warn('[Upload] Client disconnected mid-upload. Upload cancelled.');
        return; // Response already gone, do nothing
      }
      console.error('[Upload] Unexpected error:', err.message);
      return res.status(500).json({ message: 'Upload failed. Please try again.' });
    }

    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    res.json({ url: req.file.location });
  });
});


router.get('/', adminAuth, getAllCourses);
router.get('/:courseId', auth, getCourseFullDetails);

export default router;
