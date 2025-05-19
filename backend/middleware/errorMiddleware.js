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