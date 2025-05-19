// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/userModel'); // Make sure the path to your User model is correct
// backend/middleware/errorMiddleware.js

// Middleware to handle 404 Not Found errors for routes that don't exist
const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404); // Set status to 404 Not Found
    next(error); // Pass the error to the next error handling middleware
  };
  
  // Middleware to handle general errors thrown in the application
  const errorHandler = (err, req, res, next) => {
    // If the status code is not already set to a specific error code (like 404 or 401), default to 500 Internal Server Error
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
    res.status(statusCode); // Set the response status code
  
    // Send a JSON response with the error message
    res.json({
      message: err.message, // The error message (e.g., "Not authorized, no token")
      stack: process.env.NODE_ENV === 'production' ? null : err.stack, // Include stack trace only in development mode
    });
  };
  
  module.exports = { notFound, errorHandler }; // Export the middleware functions
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check for the token in the 'Authorization' header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1]; // Split 'Bearer TOKEN' and get the token part

      // Verify token
      // *** IMPORTANT *** Replace 'YOUR_JWT_SECRET' with the secret key from your backend .env file
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'YOUR_JWT_SECRET'); // Use your actual secret

      // Attach the user from the token payload to the request object (excluding password)
      req.user = await User.findById(decoded.id).select('-password');

      // Proceed to the next middleware or route handler
      next();

    } catch (error) {
      console.error('Not authorized, token failed:', error.message);
      res.status(401); // 401 Unauthorized
      throw new Error('Not authorized, token failed');
    }
  }

  // If no token is found in the header
  if (!token) {
    res.status(401); // 401 Unauthorized
    throw new Error('Not authorized, no token');
  }
});

module.exports = { protect }; // Export the protect middleware