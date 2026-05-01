import Enrollment from '../models/Enrollment.js';
import Content from '../models/Content.js';
import User from '../models/User.js';
import { sendEnrollmentEmail, sendCertificateEmail } from '../utils/emailService.js';
import { generateCertificatePDF, generateReceiptPDF } from '../utils/certificateService.js';

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

    let receiptBuffer = null;
    if (isPaid) {
      receiptBuffer = await generateReceiptPDF(
        user.name,
        course.title,
        course.price,
        enrollment.paymentId,
        Date.now()
      );
    }

    await sendEnrollmentEmail(user.email, user.name, course.title, isPaid, course.price, receiptBuffer);

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

    res.json({ 
      progress: enrollment.progress, 
      completedModules: enrollment.completedModules,
      quizResults: enrollment.quizResults || []
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const submitQuizResult = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { moduleId, score, totalQuestions } = req.body;
    const userId = req.user.userId;

    const enrollment = await Enrollment.findOne({ user: userId, course: courseId });
    if (!enrollment) return res.status(404).json({ message: 'Enrollment not found' });

    // Remove existing result for this module if any
    enrollment.quizResults = enrollment.quizResults.filter(r => r.moduleId !== moduleId);

    const passed = (score / totalQuestions) >= 0.6; // 60% pass mark

    enrollment.quizResults.push({
      moduleId,
      score,
      totalQuestions,
      passed
    });

    await enrollment.save();
    res.json(enrollment);
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
    
    // Generate PDF Buffer
    const certificateId = `ESC-${enrollmentId.substring(18).toUpperCase()}`;
    const pdfBuffer = await generateCertificatePDF(
      user.name, 
      enrollment.course.title, 
      enrollment.completionDate || Date.now(),
      certificateId
    );

    await sendCertificateEmail(user.email, user.name, enrollment.course.title, pdfBuffer);

    res.json({ message: 'Certificate emailed successfully as PDF attachment' });
  } catch (error) {
    console.error('Certificate Error:', error);
    res.status(500).json({ message: 'Server error while generating/sending certificate' });
  }
};

export const getAllEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.find()
      .populate('user', 'name email mobile college degree')
      .populate('course', 'title');
    res.json(enrollments);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
