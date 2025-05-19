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
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    isAdmin: {
      type: Boolean,
      required: true,
      default: false,
    },
    interests: {
      type: [String], // Array of strings for interests
      default: [],
    },
    goals: { // <-- NEW FIELD
      type: [String], // Array of strings for learning goals
      default: [],
    },
    // You could also consider a more structured approach for goals if needed:
    // goals: [
    //   {
    //     title: String,
    //     description: String,
    //     priority: Number, // e.g., 1-5
    //   }
    // ],
  },
  {
    timestamps: true, // Adds createdAt and updatedAt timestamps
  }
);

// Method to compare entered password with hashed password in DB
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Middleware to hash password before saving a new user
userSchema.pre('save', async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);

module.exports = User;
