// backend/routes/courseRoutes.js
const express = require('express');
const router = express.Router();
const {
  createCourse, // <-- Import
  getCourses,
  getCourseById,
  createModule,
  createLesson,
} = require('../controllers/courseController');
const { protect } = require('../middleware/authMiddleware'); // Assuming you want to protect these routes

// GET all courses & POST a new course
router.route('/')
  .get(getCourses) // Public or use protect if only for logged-in users
  .post(protect, createCourse); // Protected: only authenticated users (e.g., admin) can create

// GET a single course by ID
router.route('/:id').get(protect, getCourseById); // Protected

// POST a new module to a specific course
router.route('/:courseId/modules').post(protect, createModule); // Protected

// POST a new lesson to a specific module (courseId in URL for clarity, but moduleId is key)
router.route('/:courseId/modules/:moduleId/lessons').post(protect, createLesson); // Protected

module.exports = router;
