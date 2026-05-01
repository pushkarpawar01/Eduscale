import express from 'express';
import { enrollInCourse, getMyEnrolledCourses, getCourseProgress, updateProgress, sendCertificate } from '../controllers/enrollmentController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.post('/enroll', auth, enrollInCourse);
router.get('/my-courses', auth, getMyEnrolledCourses);
router.get('/progress/:courseId', auth, getCourseProgress);
router.post('/progress/:courseId', auth, updateProgress);
router.post('/certificate/:enrollmentId/email', auth, sendCertificate);

export default router;
