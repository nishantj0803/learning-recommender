// backend/controllers/courseController.js
const asyncHandler = require('express-async-handler');
const Course = require('../models/courseModel');
const Module = require('../models/moduleModel');
const Lesson = require('../models/lessonModel');
const UserProgress = require('../models/userProgressModel');

// @desc    Create a new course
// @route   POST /api/courses
// @access  Private (typically Admin or Instructor role)
const createCourse = asyncHandler(async (req, res) => {
  const { title, description, category, tags, difficulty } = req.body;

  if (!title || !description || !category || !difficulty) {
    res.status(400);
    throw new Error('Please provide title, description, category, and difficulty for the course.');
  }
  const courseExists = await Course.findOne({ title });
  if (courseExists) {
    res.status(400);
    throw new Error('A course with this title already exists.');
  }
  const course = new Course({
    title,
    description,
    category,
    tags: tags || [],
    difficulty,
    modules: [],
  });
  const createdCourse = await course.save();
  res.status(201).json(createdCourse);
});

// @desc    Get all courses (with optional search and filtering)
// @route   GET /api/courses
// @access  Public (or Private if you want to restrict access)
const getCourses = asyncHandler(async (req, res) => {
  const pageSize = 10; // Number of courses per page for pagination
  const page = Number(req.query.pageNumber) || 1; // Current page number

  const keyword = req.query.keyword // Search keyword from query params
    ? {
        // Search in title, description, tags, and category
        $or: [
          { title: { $regex: req.query.keyword, $options: 'i' } }, // Case-insensitive search
          { description: { $regex: req.query.keyword, $options: 'i' } },
          { tags: { $regex: req.query.keyword, $options: 'i' } }, // Search if keyword is in tags array
          { category: { $regex: req.query.keyword, $options: 'i' } },
        ],
      }
    : {}; // Empty object if no keyword

  const categoryFilter = req.query.category // Category filter from query params
    ? { category: req.query.category }
    : {};

  const difficultyFilter = req.query.difficulty // Difficulty filter from query params
    ? { difficulty: req.query.difficulty }
    : {};

  // Combine all filters and search criteria
  const filterCriteria = {
    ...keyword,
    ...categoryFilter,
    ...difficultyFilter,
  };

  const count = await Course.countDocuments(filterCriteria); // Get total count of matching documents
  const courses = await Course.find(filterCriteria)
    .populate({
        path: 'modules',
        select: 'title lessons', // Only populate essential fields for course listing
        populate: {
            path: 'lessons',
            select: 'title'
        }
    })
    .select('_id title description category tags difficulty modules createdAt') // Ensure all needed fields are selected
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .sort({ createdAt: -1 }); // Sort by newest first, or by relevance if implementing search score

  res.json({ 
    courses, 
    page, 
    pages: Math.ceil(count / pageSize), // Total number of pages
    count // Total number of courses matching criteria
  });
});

// @desc    Get single course by ID (with user progress)
// @route   GET /api/courses/:id
// @access  Private
const getCourseById = asyncHandler(async (req, res) => {
  const courseId = req.params.id;
  const userId = req.user._id;

  const course = await Course.findById(courseId)
    .populate({
      path: 'modules',
      select: 'title description lessons',
      populate: {
        path: 'lessons',
        select: 'title content isCompleted' // Assuming isCompleted is part of how you get lesson data
      }
    });

  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  const lessonIdsInCourse = course.modules.reduce((acc, moduleItem) => {
    if (moduleItem.lessons && moduleItem.lessons.length > 0) {
      moduleItem.lessons.forEach(lesson => acc.push(lesson._id));
    }
    return acc;
  }, []);

  const userProgressRecords = await UserProgress.find({
      user: userId,
      lesson: { $in: lessonIdsInCourse }
  });

  const completedLessonsMap = new Map();
  userProgressRecords.forEach(record => {
      if (record.completed) {
          completedLessonsMap.set(record.lesson.toString(), true);
      }
  });

  const courseWithProgress = course.toObject();
  courseWithProgress.modules = courseWithProgress.modules.map(moduleItem => {
      if (moduleItem.lessons && moduleItem.lessons.length > 0) {
          moduleItem.lessons = moduleItem.lessons.map(lesson => {
              lesson.isCompleted = completedLessonsMap.has(lesson._id.toString());
              return lesson;
          });
      }
      return moduleItem;
  });
  res.json(courseWithProgress);
});


// @desc    Create a new module for a specific course
// @route   POST /api/courses/:courseId/modules
// @access  Private
const createModule = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const { title, description } = req.body;

  if (!title) {
    res.status(400);
    throw new Error('Please provide a title for the module.');
  }
  const course = await Course.findById(courseId);
  if (!course) {
    res.status(404);
    throw new Error('Course not found. Cannot add module.');
  }
  const module = new Module({ title, description: description || '', lessons: [] });
  const createdModule = await module.save();
  course.modules.push(createdModule._id);
  await course.save();
  res.status(201).json(createdModule);
});

// @desc    Create a new lesson for a specific module
// @route   POST /api/courses/:courseId/modules/:moduleId/lessons
// @access  Private
const createLesson = asyncHandler(async (req, res) => {
  const { courseId, moduleId } = req.params;
  const { title, content } = req.body;

   if (!title || !content) {
    res.status(400);
    throw new Error('Please provide title and content for the lesson.');
  }
  const course = await Course.findById(courseId);
  if (!course) { res.status(404); throw new Error('Parent course not found.'); }
  const moduleExistsInCourse = course.modules.some(modId => modId.toString() === moduleId);
  if (!moduleExistsInCourse) { res.status(400); throw new Error('Module does not belong to the specified course.');}
  const module = await Module.findById(moduleId);
  if (!module) { res.status(404); throw new Error('Module not found. Cannot add lesson.');}

  const lesson = new Lesson({ title, content, module: moduleId, course: courseId });
  const createdLesson = await lesson.save();
  module.lessons.push(createdLesson._id);
  await module.save();
  res.status(201).json(createdLesson);
});

module.exports = {
  createCourse,
  getCourses,
  getCourseById,
  createModule,
  createLesson,
};
