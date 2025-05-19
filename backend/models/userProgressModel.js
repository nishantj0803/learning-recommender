// backend/models/userProgressModel.js
const mongoose = require('mongoose');

// Define the schema for User Progress
const userProgressSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId, // Reference to the User who made the progress
      required: true,
      ref: 'User', // Refers to the 'User' model
    },
    lesson: {
      type: mongoose.Schema.Types.ObjectId, // Reference to the Lesson being tracked
      required: true,
      ref: 'Lesson', // Refers to the 'Lesson' model
    },
    completed: {
      type: Boolean,
      required: true,
      default: false, // Default is false, meaning not completed initially
    },
    completedAt: {
      type: Date,
      // Will be set automatically when completed status is updated to true
    },
    // We could add more fields later, like:
    // module: { type: mongoose.Schema.Types.ObjectId, ref: 'Module' }, // Optional reference to module
    // course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' }, // Optional reference to course
    // quizScore: { type: Number }, // If lessons have quizzes
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields for the progress record itself
  }
);

// Optional: Add a unique index to ensure a user can only have one progress record per lesson
// This prevents a user from having multiple 'completed' entries for the same lesson.
userProgressSchema.index({ user: 1, lesson: 1 }, { unique: true });


// Create the UserProgress model from the schema
const UserProgress = mongoose.model('UserProgress', userProgressSchema);

module.exports = UserProgress; // Export the model