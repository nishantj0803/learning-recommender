// backend/server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors'); // Ensure cors is imported
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

// --- Middleware ---
// CORS Middleware (try the simple app.use(cors()) for now to be broad)
app.use(cors());

// Body Parser Middleware (to parse JSON in request body)
app.use(express.json());

// --- Routes ---
// Basic test route - Add this temporarily
app.get('/test', (req, res) => {
  res.send('Test route working!');
});


// Mount the auth routes at /api/auth
app.use('/api/auth', require('./routes/authRoutes'));

// TODO: Add other route groups later

// --- Error Handling Middleware (We can add this later) ---
// app.use(notFound);
// app.use(errorHandler);


const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});