import express from 'express';
import { enrollInCourse, getMyEnrolledCourses, getCourseProgress, updateProgress, submitQuizResult, sendCertificate, getAllEnrollments } from '../controllers/enrollmentController.js';
import auth from '../middleware/auth.js';
import adminAuth from '../middleware/adminAuth.js';

const router = express.Router();

router.post('/enroll', auth, enrollInCourse);
router.get('/my-courses', auth, getMyEnrolledCourses);
router.get('/all', adminAuth, getAllEnrollments);
router.get('/progress/:courseId', auth, getCourseProgress);
router.post('/progress/:courseId', auth, updateProgress);
router.post('/quiz/:courseId', auth, submitQuizResult);
router.post('/certificate/:enrollmentId/email', auth, sendCertificate);

export default router;
