// backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  updateUserProfile,
  updateUserInterests,
  updateUserGoals,
  getUserLearningActivity, // <-- Import new function
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router
  .route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

router.route('/interests').put(protect, updateUserInterests);
router.route('/goals').put(protect, updateUserGoals);

router.route('/activity').get(protect, getUserLearningActivity); // <-- NEW ROUTE

module.exports = router;
