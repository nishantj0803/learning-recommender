// backend/routes/aiRoutes.js
const express = require('express');
const router = express.Router();
const { generateAiLearningPath } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

// POST /api/ai/generate-path
router.route('/generate-path').post(protect, generateAiLearningPath);

module.exports = router;
