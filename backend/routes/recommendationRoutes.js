// backend/routes/recommendationRoutes.js
const express = require('express'); // Import the express library
const router = express.Router(); // Create a new router instance
// Import the controller function for getting recommendations
const { getRecommendations } = require('../controllers/recommendationController');
// Import the authentication middleware - this route must be protected
const { protect } = require('../middleware/authMiddleware');


// Define routes using the router instance and link them to controller functions

// @desc    Get personalized course recommendations for the logged-in user
// @route   GET /api/recommendations
// @access  Private (Requires authentication)
router.route('/').get(protect, getRecommendations); // Handles GET requests to /api/recommendations and protects it


module.exports = router; // Export the router to be used in server.js
