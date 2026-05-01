import Enrollment from '../models/Enrollment.js';
import Content from '../models/Content.js';
import User from '../models/User.js';
import { sendEnrollmentEmail, sendCertificateEmail } from '../utils/emailService.js';

export const enrollInCourse = async (req, res) => {
  try {
    const { courseId, paymentId } = req.body;
    const userId = req.user.userId;

    const existingEnrollment = await Enrollment.findOne({ user: userId, course: courseId });
    if (existingEnrollment) {
      return res.status(400).json({ message: 'Already enrolled in this course' });
    }

    const course = await Content.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const user = await User.findById(userId);
    const isPaid = !course.isFree;
    
    const enrollment = new Enrollment({
      user: userId,
      course: courseId,
      paymentStatus: course.isFree ? 'free' : 'completed',
      paymentId: paymentId || (course.isFree ? 'FREE' : 'MOCK_PAYMENT_' + Date.now())
    });

    await enrollment.save();
    await sendEnrollmentEmail(user.email, user.name, course.title, isPaid, course.price);

    res.status(201).json({ message: 'Enrolled successfully', enrollment });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getMyEnrolledCourses = async (req, res) => {
  try {
    const userId = req.user.userId;
    const enrollments = await Enrollment.find({ user: userId }).populate('course');
    res.json(enrollments);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getCourseProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.userId;

    const enrollment = await Enrollment.findOne({ user: userId, course: courseId });
    if (!enrollment) return res.status(404).json({ message: 'Enrollment not found' });

    res.json({ progress: enrollment.progress, completedModules: enrollment.completedModules });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { moduleId } = req.body;
    const userId = req.user.userId;

    const enrollment = await Enrollment.findOne({ user: userId, course: courseId });
    if (!enrollment) return res.status(404).json({ message: 'Enrollment not found' });

    if (!enrollment.completedModules.includes(moduleId)) {
      enrollment.completedModules.push(moduleId);
      
      const course = await Content.findById(courseId);
      const totalModules = course.modules.length;
      enrollment.progress = Math.round((enrollment.completedModules.length / totalModules) * 100);
      
      if (enrollment.progress === 100) {
        enrollment.completed = true;
        enrollment.completionDate = Date.now();
      }

      await enrollment.save();
    }

    res.json(enrollment);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const sendCertificate = async (req, res) => {
  try {
    const { enrollmentId } = req.params;
    const userId = req.user.userId;

    const enrollment = await Enrollment.findOne({ _id: enrollmentId, user: userId }).populate('course');
    if (!enrollment || !enrollment.completed) {
      return res.status(400).json({ message: 'Course not completed or enrollment not found' });
    }

    const user = await User.findById(userId);
    const certificateUrl = `https://eduscale.com/verify/ESC-${enrollmentId.substring(18).toUpperCase()}`;

    await sendCertificateEmail(user.email, user.name, enrollment.course.title, certificateUrl);

    res.json({ message: 'Certificate emailed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
