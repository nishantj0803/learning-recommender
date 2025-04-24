// frontend/src/pages/RegisterPage.js
import React, { useState } from 'react';
import axios from 'axios';
// import { Link } from 'react-router-dom';

function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState(null); // State for messages (success/error)

  const submitHandler = async (e) => { // Make the function async
    e.preventDefault();

    // --- Basic Validation ---
    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
      return; // Stop the function if passwords don't match
    } else {
       setMessage(null); // Clear previous messages
    }
    // --- End Validation ---

    try {
      // --- Make API Call to Backend ---
      const config = {
        headers: {
          'Content-Type': 'application/json', // Tell the backend we're sending JSON
        },
      };

      // Send POST request to the backend registration endpoint
      const { data } = await axios.post(
        `http://localhost:5001/api/auth/register`, // Corrected URL
        { name, email, password },
        config
      );
      // --- End API Call ---

      // If successful (backend returns 201), set a success message
      setMessage('Registration Successful!');
      // Optional: Clear the form fields after success
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');

      // TODO: Maybe redirect to login page after successful registration

    } catch (error) {
      // Handle errors from the backend
      // The error response from backend might have a message in error.response.data.message
      setMessage(error.response && error.response.data.message
                 ? error.response.data.message
                 : error.message); // Display the error message
    }
  };

  return (
    <div>
      <h2>Register</h2>
      {/* Display messages here */}
      {message && <p style={{ color: message.includes('Successful') ? 'green' : 'red' }}>{message}</p>} {/* Simple styling for message */}

      <form onSubmit={submitHandler}>
        <div>
          <label htmlFor="name">Name</label> {/* Add htmlFor for accessibility */}
          <input
            id="name" // Add id to match htmlFor
            type="text"
            placeholder="Enter name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="email">Email Address</label> {/* Add htmlFor */}
          <input
            id="email" // Add id
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Password</label> {/* Add htmlFor */}
          <input
            id="password" // Add id
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="confirmPassword">Confirm Password</label> {/* Add htmlFor */}
          <input
            id="confirmPassword" // Add id
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Register</button>
      </form>
      {/* TODO: Add Link to Login Page using react-router-dom's Link component */}
      {/* <p>
        Have an Account? <Link to="/login">Login</Link>
      </p> */}
    </div>
  );
}

export default RegisterPage;