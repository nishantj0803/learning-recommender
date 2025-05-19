// backend/models/moduleModel.js
const mongoose = require('mongoose');

// Define the schema for a Module
const moduleSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a title for the module'], // Module title is required
    },
    description: {
      type: String,
      // Description is optional for a module, depends on your design
    },
    // This is the key part: an array of references to Lesson documents
    lessons: [
      {
        type: mongoose.Schema.Types.ObjectId, // Each item in the array will be a MongoDB ObjectId
        ref: 'Lesson', // This ObjectId will reference a document in the 'lessons' collection (based on the Lesson model name)
      },
    ],
    // We can add more fields later, like:
    // order: { type: Number }, // To define order within a course
    // courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true }, // Link to the Course this module belongs to (We'll use this more when we update the Course model)
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

// Create the Module model from the schema
const Module = mongoose.model('Module', moduleSchema);

module.exports = Module; // Export the model