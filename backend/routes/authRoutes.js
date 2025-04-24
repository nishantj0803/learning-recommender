// backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/authController'); // We'll create this file next

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', registerUser);

// @desc    Authenticate a user and get token
// @route   POST /api/auth/login
// @access  Public
router.post('/login', loginUser);

module.exports = router;