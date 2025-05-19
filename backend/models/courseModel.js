// backend/models/courseModel.js
const mongoose = require('mongoose');

const courseSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a title for the course'],
      unique: true, // Ensures course titles are unique
    },
    description: {
      type: String,
      required: [true, 'Please add a description for the course'],
    },
    category: {
      type: String,
      required: [true, 'Please add a category for the course'],
    },
    tags: {
      type: [String], // Array of strings for tags/keywords
      default: [],
    },
    difficulty: { // <-- NEW FIELD
      type: String,
      required: [true, 'Please specify the course difficulty'],
      enum: ['Beginner', 'Intermediate', 'Advanced', 'All Levels'], // Predefined difficulty levels
      default: 'All Levels', // Default difficulty if not specified
    },
    modules: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Module',
      },
    ],
    createdBy: { // Optional: if you track who created the course
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      // required: true, // Only if mandatory
    },
    duration: { // Optional: estimated duration
      type: String, // e.g., "10 hours", "4 weeks"
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;
