// backend/routes/lessonRoutes.js
const express = require('express');
const router = express.Router();
const {
  getLessonById,
  batchUpdateLessonsWithContext, // <-- New function to import
} = require('../controllers/lessonController'); // Ensure path is correct
const { protect } = require('../middleware/authMiddleware'); // Assuming admin/dev task

// GET a single lesson by ID
router.route('/:id').get(getLessonById); // Or .get(protect, getLessonById)

// POST route for batch updating lessons with course and module context
// This should be a protected route, accessible only by an admin or during development.
router.route('/batch-update-context').post(protect, batchUpdateLessonsWithContext);

module.exports = router;
