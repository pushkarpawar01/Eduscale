import Content from '../models/Content.js';
import Quiz from '../models/Quiz.js';
import Enrollment from '../models/Enrollment.js';

export const createCourse = async (req, res) => {
  try {
    const { title, description, imageUrl, price, isFree, category } = req.body;
    const newCourse = new Content({
      title,
      description,
      imageUrl,
      price,
      isFree,
      category
    });
    await newCourse.save();
    res.status(201).json(newCourse);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const addModule = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, videoUrl, pdfUrl, duration } = req.body;
    
    const course = await Content.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    course.modules.push({ title, videoUrl, pdfUrl, duration });
    await course.save();
    
    res.status(200).json(course);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const createQuiz = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, questions } = req.body;

    const newQuiz = new Quiz({
      course: courseId,
      title,
      questions
    });
    await newQuiz.save();

    res.status(201).json(newQuiz);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getCourseFullDetails = async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Content.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const quiz = await Quiz.findOne({ course: courseId });
    
    res.json({ course, quiz });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, description, imageUrl, price, isFree, category, modules } = req.body;

    const course = await Content.findByIdAndUpdate(
      courseId,
      { title, description, imageUrl, price, isFree, category, modules },
      { new: true }
    );

    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    await Content.findByIdAndDelete(courseId);
    // Optionally delete related enrollments and quizzes
    await Enrollment.deleteMany({ course: courseId });
    await Quiz.deleteMany({ course: courseId });
    
    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
