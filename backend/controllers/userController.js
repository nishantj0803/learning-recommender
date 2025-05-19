// backend/controllers/userController.js
const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const Course = require('../models/courseModel'); // Needed for getUserLearningActivity
const UserProgress = require('../models/userProgressModel'); // Needed for getUserLearningActivity
// const Module = require('../models/moduleModel'); // Potentially for getUserLearningActivity if needed
// const Lesson = require('../models/lessonModel'); // Potentially for getUserLearningActivity if needed
// const generateToken = require('../utils/generateToken'); // Only if authUser/registerUser are defined here

// @desc    Get user profile
// @route   GET /api/user/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      interests: user.interests,
      goals: user.goals,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update user profile (name, email, password)
// @route   PUT /api/user/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    if (req.body.password) {
      user.password = req.body.password; // Mongoose pre-save hook will hash it
    }
    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
      interests: updatedUser.interests,
      goals: updatedUser.goals,
      // token: generateToken(updatedUser._id) // Optionally re-issue token
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update user interests
// @route   PUT /api/user/interests
// @access  Private
const updateUserInterests = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    if (req.body.interests && Array.isArray(req.body.interests)) {
      user.interests = req.body.interests;
    } else if (req.body.interests !== undefined) {
      res.status(400);
      throw new Error('Interests must be provided as an array.');
    }
    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
      interests: updatedUser.interests,
      goals: updatedUser.goals,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update user goals
// @route   PUT /api/user/goals
// @access  Private
const updateUserGoals = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    if (req.body.goals && Array.isArray(req.body.goals)) {
      user.goals = req.body.goals;
    } else if (req.body.goals !== undefined) {
      res.status(400);
      throw new Error('Goals must be provided as an array.');
    }
    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
      interests: updatedUser.interests,
      goals: updatedUser.goals,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Get user's learning activity summary
// @route   GET /api/user/activity
// @access  Private
const getUserLearningActivity = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const allCourses = await Course.find({})
    .populate({
      path: 'modules',
      populate: { path: 'lessons', select: '_id' }
    })
    .select('_id title modules');

  const userProgressRecords = await UserProgress.find({ user: userId, completed: true })
    .select('lesson completedAt');

  const completedLessonIds = new Set(userProgressRecords.map(p => p.lesson.toString()));
  
  let totalLessonsCompletedOverall = completedLessonIds.size;
  const coursesInProgress = [];
  const completedCoursesList = [];
  let totalCoursesStarted = 0;

  for (const course of allCourses) {
    let lessonsInThisCourseCount = 0;
    let completedLessonsInThisCourseCount = 0;
    let courseHasProgress = false;

    if (course.modules && course.modules.length > 0) {
      for (const moduleItem of course.modules) { // Renamed to avoid conflict if Module model is imported
        if (moduleItem.lessons && moduleItem.lessons.length > 0) {
          lessonsInThisCourseCount += moduleItem.lessons.length;
          for (const lesson of moduleItem.lessons) {
            if (completedLessonIds.has(lesson._id.toString())) {
              completedLessonsInThisCourseCount++;
              courseHasProgress = true;
            }
          }
        }
      }
    }

    if (courseHasProgress) {
        totalCoursesStarted++;
        const progressPercentage = lessonsInThisCourseCount > 0 
            ? Math.round((completedLessonsInThisCourseCount / lessonsInThisCourseCount) * 100) 
            : 0;

        if (completedLessonsInThisCourseCount === lessonsInThisCourseCount && lessonsInThisCourseCount > 0) {
            let lastCompletionDate = null;
            if (course.modules && course.modules.length > 0) {
                const lessonIdsForThisCourse = course.modules.flatMap(m => m.lessons.map(l => l._id.toString()));
                userProgressRecords.forEach(p => {
                    if (lessonIdsForThisCourse.includes(p.lesson.toString())) {
                        if (!lastCompletionDate || new Date(p.completedAt) > new Date(lastCompletionDate)) {
                            lastCompletionDate = p.completedAt;
                        }
                    }
                });
            }
            completedCoursesList.push({
                courseId: course._id,
                title: course.title,
                completedAt: lastCompletionDate,
                totalLessons: lessonsInThisCourseCount
            });
        } else {
            coursesInProgress.push({
                courseId: course._id,
                title: course.title,
                completedLessons: completedLessonsInThisCourseCount,
                totalLessons: lessonsInThisCourseCount,
                progressPercentage: progressPercentage,
            });
        }
    }
  }

  res.json({
    coursesInProgress,
    completedCourses: completedCoursesList.sort((a,b) => new Date(b.completedAt) - new Date(a.completedAt)),
    stats: {
      totalCoursesStarted: totalCoursesStarted,
      totalCoursesCompleted: completedCoursesList.length,
      totalLessonsCompleted: totalLessonsCompletedOverall,
    },
  });
});

// Ensure all defined functions are exported
module.exports = {
  getUserProfile,
  updateUserProfile,
  updateUserInterests,
  updateUserGoals,
  getUserLearningActivity,
};
