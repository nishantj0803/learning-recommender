// backend/utils/generateToken.js

// backend/utils/generateToken.js
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  // The first argument is the payload - data you want to store in the token (like user ID)
  // The second argument is your JWT secret from your .env file
  // The third argument is options, like when the token expires
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d', // Token expires in 30 days
  });
};

module.exports = generateToken;
// We will implement the actual logic later when we work on login.

