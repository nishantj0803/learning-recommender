// backend/routes/progressRoutes.js
const express = require('express');
const router = express.Router();
// Import controller functions
const { markLessonComplete, getLessonProgress, getOverallProgress } = require('../controllers/progressController'); // Import getOverallProgress
// Import the authentication middleware
const { protect } = require('../middleware/authMiddleware');


// @desc    Mark a specific lesson as complete for the logged-in user
// @route   POST /api/progress/lessons/:lessonId/complete
// @access  Private
router.route('/lessons/:lessonId/complete').post(protect, markLessonComplete);

// @desc    Get user progress status for a specific lesson for the logged-in user
// @route   GET /api/progress/lessons/:lessonId
// @access  Private (Requires authentication)
router.route('/lessons/:lessonId').get(protect, getLessonProgress);

// @desc    Get overall user progress summary across all courses
// @route   GET /api/progress/overall
// @access  Private (Requires authentication)
router.route('/overall').get(protect, getOverallProgress); // New protected GET route


module.exports = router;
