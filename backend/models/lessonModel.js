// backend/models/lessonModel.js
const mongoose = require('mongoose');

const lessonSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a title for the lesson'],
    },
    content: {
      type: String,
      required: [true, 'Please add content for the lesson'],
    },
    module: { // <-- NEW: Reference to the parent Module
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Module',
    },
    course: { // <-- NEW: Reference to the parent Course
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Course',
    },
    // Optional: order/sequence number within the module, if you want explicit ordering
    // order: {
    //   type: Number,
    //   default: 0,
    // },
  },
  {
    timestamps: true,
  }
);

const Lesson = mongoose.model('Lesson', lessonSchema);

module.exports = Lesson;
