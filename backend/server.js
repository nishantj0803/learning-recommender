// backend/server.js
const dotenv = require('dotenv');
dotenv.config(); // Load environment variables from .env file

const express = require('express');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const courseRoutes = require('./routes/courseRoutes');
const lessonRoutes = require('./routes/lessonRoutes');
const progressRoutes = require('./routes/progressRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');
const aiRoutes = require('./routes/aiRoutes');
const cors = require('cors');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(express.json()); // To parse JSON request bodies

// CORS Configuration
// Configure CORS properly for your frontend's domain in production
// For development, app.use(cors()) might be fine.
// For production, be more specific:
const allowedOrigins = [
  'http://localhost:3000', // Your local frontend
  process.env.FRONTEND_URL, // Your deployed frontend URL from .env
  // Add any other domains that need access, like your Vercel frontend preview URLs
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
}));


// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/ai', aiRoutes);

// Test route (optional, good for checking if the server is up)
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend API is running!' });
});

// Root route (optional, what Vercel will hit if you go to the base URL)
app.get('/', (req, res) => {
  res.send('Smart Learning Recommender API Backend');
});


// Error Handling Middleware (must be last)
app.use(notFound); // For 404 errors (route not found)
app.use(errorHandler); // For other errors

// Vercel will use this exported app. It handles the listening.
module.exports = app;

// --- For Local Development Only ---
// This part will not run on Vercel, but allows you to run `node backend/server.js` locally.
if (process.env.NODE_ENV !== 'production_vercel') { // Use a distinct env var for Vercel if needed, or just rely on Vercel not running this.
                                                // Vercel sets its own PORT.
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => {
    console.log(`Server running locally on port ${PORT}`);
    console.log("DEBUG SERVER.JS (Local): GEMINI_API_KEY from process.env:", process.env.GEMINI_API_KEY ? "Key Found" : "KEY IS MISSING OR UNDEFINED");
    console.log("DEBUG SERVER.JS (Local): FRONTEND_URL from process.env:", process.env.FRONTEND_URL || "FRONTEND_URL IS MISSING");

  });
}
