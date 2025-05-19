// backend/controllers/lessonController.js
const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose'); // Ensure mongoose is imported for ObjectId validation
const Lesson = require('../models/lessonModel');
const Module = require('../models/moduleModel');
const Course = require('../models/courseModel');

// @desc    Get single lesson by ID, including next/previous lesson IDs and context
// @route   GET /api/lessons/:id
// @access  Public (or Private, depending on your needs)
const getLessonById = asyncHandler(async (req, res) => {
  const lessonId = req.params.id;

  const lesson = await Lesson.findById(lessonId)
    .populate({ path: 'course', select: 'title modules _id' }) // Ensure _id is selected for course
    .populate({ path: 'module', select: 'title lessons _id' }); // Ensure _id is selected for module

  if (!lesson) {
    res.status(404);
    throw new Error('Lesson not found');
  }

  let previousLessonId = null;
  let nextLessonId = null;
  let previousLessonTitle = null;
  let nextLessonTitle = null;

  // Ensure lesson.course and lesson.module are populated objects before proceeding
  if (lesson.module && lesson.module.lessons && lesson.course && lesson.course.modules) {
    const currentModuleWithLessons = await Module.findById(lesson.module._id)
      .populate({ 
        path: 'lessons', 
        select: '_id title order',
        options: { sort: { order: 1 } } 
      });

    if (currentModuleWithLessons && currentModuleWithLessons.lessons) {
      const lessonsInModule = currentModuleWithLessons.lessons.map(l => ({ id: l._id.toString(), title: l.title }));
      const currentIndexInModule = lessonsInModule.findIndex(l => l.id === lessonId);

      // Find previous lesson
      if (currentIndexInModule > 0) {
        previousLessonId = lessonsInModule[currentIndexInModule - 1].id;
        previousLessonTitle = lessonsInModule[currentIndexInModule - 1].title;
      } else { 
        const courseModulesIds = lesson.course.modules.map(m => m.toString());
        const currentModuleIndexInCourse = courseModulesIds.indexOf(lesson.module._id.toString());
        if (currentModuleIndexInCourse > 0) {
          const previousModuleId = lesson.course.modules[currentModuleIndexInCourse - 1];
          const previousModuleData = await Module.findById(previousModuleId)
            .populate({ 
              path: 'lessons', 
              select: '_id title order', 
              options: { sort: { order: -1 } } 
            });
          if (previousModuleData && previousModuleData.lessons && previousModuleData.lessons.length > 0) {
            previousLessonId = previousModuleData.lessons[0]._id.toString();
            previousLessonTitle = previousModuleData.lessons[0].title;
          }
        }
      }

      // Find next lesson
      if (currentIndexInModule > -1 && currentIndexInModule < lessonsInModule.length - 1) {
        nextLessonId = lessonsInModule[currentIndexInModule + 1].id;
        nextLessonTitle = lessonsInModule[currentIndexInModule + 1].title;
      } else { 
        const courseModulesIds = lesson.course.modules.map(m => m.toString());
        const currentModuleIndexInCourse = courseModulesIds.indexOf(lesson.module._id.toString());
        if (currentModuleIndexInCourse > -1 && currentModuleIndexInCourse < courseModulesIds.length - 1) {
          const nextModuleId = lesson.course.modules[currentModuleIndexInCourse + 1];
          const nextModuleData = await Module.findById(nextModuleId)
            .populate({ 
              path: 'lessons', 
              select: '_id title order', 
              options: { sort: { order: 1 } } 
            });
          if (nextModuleData && nextModuleData.lessons && nextModuleData.lessons.length > 0) {
            nextLessonId = nextModuleData.lessons[0]._id.toString();
            nextLessonTitle = nextModuleData.lessons[0].title;
          }
        }
      }
    }
  }

  const lessonObject = lesson.toObject();
  lessonObject.course = lesson.course ? { _id: lesson.course._id, title: lesson.course.title } : null;
  lessonObject.module = lesson.module ? { _id: lesson.module._id, title: lesson.module.title } : null;
  lessonObject.previousLesson = previousLessonId ? { _id: previousLessonId, title: previousLessonTitle || "Previous Lesson" } : null;
  lessonObject.nextLesson = nextLessonId ? { _id: nextLessonId, title: nextLessonTitle || "Next Lesson" } : null;
  res.json(lessonObject);
});


// @desc    Batch update lessons with their course and module context
// @route   POST /api/lessons/batch-update-context
// @access  Private (Admin/Developer only)
const batchUpdateLessonsWithContext = asyncHandler(async (req, res) => {
  const updates = req.body; 

  if (!Array.isArray(updates) || updates.length === 0) {
    res.status(400);
    throw new Error('Request body must be a non-empty array of lesson updates.');
  }

  const results = [];
  let successfulUpdates = 0;
  let failedUpdates = 0;

  for (const update of updates) {
    const { lessonId, courseId, moduleId } = update;

    if (!lessonId || !courseId || !moduleId) {
      results.push({ lessonId, status: 'failed', reason: 'Missing lessonId, courseId, or moduleId.' });
      failedUpdates++;
      continue;
    }

    if (!mongoose.Types.ObjectId.isValid(lessonId) || 
        !mongoose.Types.ObjectId.isValid(courseId) || 
        !mongoose.Types.ObjectId.isValid(moduleId)) {
      results.push({ lessonId, status: 'failed', reason: 'Invalid ObjectId format.' });
      failedUpdates++;
      continue;
    }

    try {
      const lesson = await Lesson.findById(lessonId);
      if (!lesson) {
        results.push({ lessonId, status: 'failed', reason: 'Lesson not found.' });
        failedUpdates++;
        continue;
      }

      lesson.course = courseId;
      lesson.module = moduleId;
      await lesson.save();
      results.push({ lessonId, status: 'success' });
      successfulUpdates++;
    } catch (error) {
      results.push({ lessonId, status: 'failed', reason: error.message });
      failedUpdates++;
    }
  }

  res.status(200).json({
    message: `Batch update completed. Successful: ${successfulUpdates}, Failed: ${failedUpdates}.`,
    results,
  });
});

// Ensure both functions are defined above this export block
module.exports = {
  getLessonById,
  batchUpdateLessonsWithContext, // This function must be defined in this file
};
