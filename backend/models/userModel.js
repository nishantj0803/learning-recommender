// backend/models/userModel.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // For password hashing

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true, // Ensure email is unique
    },
    password: {
      type: String,
      required: true,
    },
    // We can add fields for interests, skills, goals here later
    // interests: [{ type: String }],
    // skills: [{ type: String }],
    // goals: { type: String },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt timestamps
  }
);

// --- Password Hashing ---
// This pre-save middleware will hash the password before saving the user
userSchema.pre('save', async function (next) {
  // Only hash if the password field is modified
  if (!this.isModified('password')) {
    next(); // Move to the next middleware
  }

  // Generate a salt and hash the password
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next(); // Move to saving the user
});

// --- Password Matching ---
// Method to compare entered password with hashed password in the database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;