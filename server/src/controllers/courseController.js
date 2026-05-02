import Content from '../models/Content.js';
import Quiz from '../models/Quiz.js';
import Enrollment from '../models/Enrollment.js';
import { cacheGet, cacheSet, cacheDel, cacheDelPattern } from '../config/redis.js';

// Cache key constants
const CACHE_ALL_COURSES = 'courses:all';
const courseKey = (id) => `course:${id}`;

export const createCourse = async (req, res) => {
  try {
    const { title, description, imageUrl, price, isFree, category } = req.body;
    const newCourse = new Content({ title, description, imageUrl, price, isFree, category });
    await newCourse.save();

    // Invalidate the all-courses cache so next fetch is fresh
    await cacheDel(CACHE_ALL_COURSES);

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

    // Invalidate this course's cache and the all-courses list
    await cacheDel(courseKey(courseId), CACHE_ALL_COURSES);
    
    res.status(200).json(course);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const createQuiz = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, questions } = req.body;

    const newQuiz = new Quiz({ course: courseId, title, questions });
    await newQuiz.save();

    // Invalidate individual course cache (quiz is embedded in getCourseFullDetails)
    await cacheDel(courseKey(courseId));

    res.status(201).json(newQuiz);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getCourseFullDetails = async (req, res) => {
  try {
    const { courseId } = req.params;
    const cKey = courseKey(courseId);

    // 1. Try cache first
    const cached = await cacheGet(cKey);
    if (cached) {
      console.log(`[Cache] HIT: ${cKey}`);
      return res.json(cached);
    }

    // 2. Cache MISS → fetch from DB
    console.log(`[Cache] MISS: ${cKey}`);
    const course = await Content.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    const quiz = await Quiz.findOne({ course: courseId });

    const payload = { course, quiz };

    // 3. Store in cache for 10 minutes
    await cacheSet(cKey, payload, 600);

    res.json(payload);
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

    // Invalidate both individual course and list cache
    await cacheDel(courseKey(courseId), CACHE_ALL_COURSES);

    res.json(course);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getAllCourses = async (req, res) => {
  try {
    // 1. Try cache first
    const cached = await cacheGet(CACHE_ALL_COURSES);
    if (cached) {
      console.log(`[Cache] HIT: ${CACHE_ALL_COURSES}`);
      return res.json(cached);
    }

    // 2. Cache MISS → fetch from DB
    console.log(`[Cache] MISS: ${CACHE_ALL_COURSES}`);
    const courses = await Content.find();

    // 3. Cache for 5 minutes
    await cacheSet(CACHE_ALL_COURSES, courses, 300);

    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    await Content.findByIdAndDelete(courseId);
    await Enrollment.deleteMany({ course: courseId });
    await Quiz.deleteMany({ course: courseId });

    // Invalidate all related cache entries
    await cacheDel(courseKey(courseId), CACHE_ALL_COURSES);
    await cacheDelPattern(`enrollment:*`); // User enrollment lists may reference this course

    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
