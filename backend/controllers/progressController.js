// backend/controllers/progressController.js
const asyncHandler = require('express-async-handler');
const UserProgress = require('../models/userProgressModel'); // Import the UserProgress model
const Lesson = require('../models/lessonModel'); // Import Lesson model
const Course = require('../models/courseModel'); // Import Course model
const Module = require('../models/moduleModel'); // Import Module model


// @desc    Mark a specific lesson as complete for the logged-in user
// @route   POST /api/progress/lessons/:lessonId/complete
// @access  Private
const markLessonComplete = asyncHandler(async (req, res) => {
  // The logged-in user is available on req.user thanks to the 'protect' middleware
  const userId = req.user._id; // Get the user ID from the authenticated user
  const { lessonId } = req.params; // Get the lesson ID from the URL parameters

  // Optional: Check if the lesson actually exists
  const lesson = await Lesson.findById(lessonId);
  if (!lesson) {
      res.status(404);
      throw new Error('Lesson not found');
  }

  // Find a progress record for this user and lesson, or create a new one if it doesn't exist (upsert)
  const userProgress = await UserProgress.findOneAndUpdate(
    { user: userId, lesson: lessonId }, // Find a document with this user and lesson ID
    { completed: true, completedAt: new Date() }, // Update completed to true and set completedAt to now
    { new: true, upsert: true } // Options: return the updated/new document, create if it doesn't exist
  );

  // Respond with the updated or newly created progress document
  res.status(200).json(userProgress); // 200 OK status (or 201 if always creating, but upsert updates if exists)

});


// @desc    Get user progress status for a specific lesson for the logged-in user
// @route   GET /api/progress/lessons/:lessonId
// @access  Private
const getLessonProgress = asyncHandler(async (req, res) => {
  // The logged-in user is available on req.user thanks to the 'protect' middleware
  const userId = req.user._id; // Get the user ID from the authenticated user
  const { lessonId } = req.params; // Get the lesson ID from the URL parameters

  // Optional: Check if the lesson actually exists
  const lesson = await Lesson.findById(lessonId);
  if (!lesson) {
      res.status(404);
      throw new Error('Lesson not found');
  }

  // Find the progress record for this specific user and lesson
  const userProgress = await UserProgress.findOne({ user: userId, lesson: lessonId });

  // Respond with the progress record (will be null if not found)
  if (userProgress) {
      res.status(200).json(userProgress);
  } else {
      // If no progress record found for this user/lesson
      res.status(200).json(null);
  }
});


// @desc    Get overall user progress summary across all courses
// @route   GET /api/progress/overall
// @access  Private (Requires authentication)
const getOverallProgress = asyncHandler(async (req, res) => {
    const userId = req.user._id; // Get the logged-in user's ID

    // 1. Fetch all courses and populate their modules and lessons to get the total lesson count per course
    // We only need the _id of lessons and modules for counting
    const courses = await Course.find({})
        .populate({
            path: 'modules',
            populate: {
                path: 'lessons',
                select: '_id' // Only select the _id of lessons
            },
            select: '_id lessons' // Only select the _id and lessons array of modules
        })
        .select('_id title modules'); // Only select the _id, title, and modules array of courses

    // 2. Fetch all user progress records for the logged-in user
    // We only need the lesson ID and completed status
    const userProgressRecords = await UserProgress.find({ user: userId, completed: true }).select('lesson');

    // Create a set of completed lesson IDs for quick lookup
    const completedLessonIds = new Set(userProgressRecords.map(record => record.lesson.toString()));

    // 3. Calculate progress for each course
    const overallProgress = courses.map(course => {
        let totalLessonsInCourse = 0;
        let completedLessonsInCourse = 0;

        // Iterate through modules and lessons to count total and completed lessons
        course.modules.forEach(module => {
            module.lessons.forEach(lesson => {
                totalLessonsInCourse++;
                // Check if this lesson's ID is in the set of completed lesson IDs
                if (completedLessonIds.has(lesson._id.toString())) {
                    completedLessonsInCourse++;
                }
            });
        });

        // Calculate completion percentage
        const completionPercentage = totalLessonsInCourse === 0
            ? 0 // Avoid division by zero if a course has no lessons
            : Math.round((completedLessonsInCourse / totalLessonsInCourse) * 100); // Calculate percentage and round

        return {
            _id: course._id,
            title: course.title,
            totalLessons: totalLessonsInCourse,
            completedLessons: completedLessonsInCourse,
            completionPercentage: completionPercentage,
        };
    });

    // Respond with the array of courses including their progress summary
    res.status(200).json(overallProgress);

});


module.exports = {
  markLessonComplete,
  getLessonProgress,
  getOverallProgress, // Export the new function
};
