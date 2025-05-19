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

// --- CORS Configuration ---
// Define allowed origins. Your Vercel frontend URL MUST be in this list.
const allowedOrigins = [
  'http://localhost:3000', // For local frontend development
  process.env.FRONTEND_URL,  // e.g., https://learning-recommender.vercel.app
  // You might need to add specific Vercel preview deployment URLs if they differ
  // and you want to test them directly.
];

console.log('[CORS] Allowed Origins:', allowedOrigins); // Log allowed origins
console.log('[CORS] FRONTEND_URL from env:', process.env.FRONTEND_URL);


const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests, Postman)
    if (!origin) {
      console.log('[CORS] Request with no origin allowed.');
      return callback(null, true);
    }
    if (allowedOrigins.indexOf(origin) !== -1) {
      console.log(`[CORS] Origin ${origin} allowed.`);
      callback(null, true);
    } else {
      console.error(`[CORS] Origin ${origin} NOT allowed.`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Explicitly list allowed methods
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'], // Explicitly list allowed headers
  credentials: true, // If you plan to use cookies or sessions
  optionsSuccessStatus: 204 // Some legacy browsers (IE11, various SmartTVs) choke on 204
};

// Use CORS middleware *before* any routes
// It's important that this handles OPTIONS requests correctly.
app.use(cors(corsOptions));

// --- Body Parsing Middleware ---
// This should come after CORS, but before your route handlers.
app.use(express.json());

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/ai', aiRoutes);

// --- Test Route ---
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend API on Render is running!' });
});

// --- Root Route ---
app.get('/', (req, res) => {
  res.send('Smart Learning Recommender API Backend (Render)');
});

// --- Error Handling Middleware (must be last) ---
app.use(notFound); // For 404 errors (route not found)
app.use(errorHandler); // For other errors

// --- Server Listening (for Render and local) ---
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log("DEBUG SERVER.JS: GEMINI_API_KEY from process.env:", process.env.GEMINI_API_KEY ? "Key Found" : "KEY IS MISSING OR UNDEFINED");
  console.log("DEBUG SERVER.JS: MONGO_URI from process.env:", process.env.MONGO_URI ? "URI Found" : "MONGO_URI IS MISSING OR UNDEFINED");
});
