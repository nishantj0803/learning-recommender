// backend/server.js
const dotenv = require('dotenv');
dotenv.config();
const express = require('express');

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const courseRoutes = require('./routes/courseRoutes');
const lessonRoutes = require('./routes/lessonRoutes');
const progressRoutes = require('./routes/progressRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes'); // Import recommendation routes
const cors = require('cors');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const aiRoutes = require('./routes/aiRoutes');

connectDB();

const app = express();

app.use(express.json()); // Middleware to parse JSON request bodies
app.use(cors()); // Middleware to enable Cross-Origin Resource Sharing

// Use your routes
app.use('/api/auth', authRoutes); // Authentication routes (login, register)
app.use('/api/user', userRoutes); // User-related routes (e.g., get profile)
app.use('/api/courses', courseRoutes); // Course-related routes
app.use('/api/lessons', lessonRoutes); // Lesson-related routes
app.use('/api/progress', progressRoutes); // User progress-related routes
app.use('/api/recommendations', recommendationRoutes); // Mount recommendation routes at /api/recommendations
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/ai', aiRoutes);

// Error Handling Middleware (These should be the last middleware used)
// notFound middleware handles requests that don't match any defined routes
app.use(notFound);
// errorHandler middleware handles errors thrown by other middleware or route handlers
app.use(errorHandler);


const PORT = process.env.PORT || 5001; // Define the port the server will listen on

// Start the server and listen on the specified port
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log("DEBUG SERVER.JS: GEMINI_API_KEY from process.env:", process.env.GEMINI_API_KEY ? "Key Found" : "KEY IS MISSING OR UNDEFINED");
});
