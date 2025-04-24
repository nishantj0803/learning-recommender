// frontend/src/pages/LoginPage.js
import React, { useState } from 'react';
import axios from 'axios';
// If you add a link to the register page later, uncomment this:
// import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for redirection

function LoginPage() {
  // State variables for email, password, and messages
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState(null); // State for messages (success/error)

  // Initialize the navigate function from react-router-dom
  const navigate = useNavigate();

  // Handler for the form submission
  const submitHandler = async (e) => {
    e.preventDefault(); // Prevent the default form submission and page reload

    setMessage(null); // Clear any previous messages

    try {
      // --- Make API Call to Backend for Login ---
      const config = {
        headers: {
          'Content-Type': 'application/json', // Tell the backend we're sending JSON
        },
      };

      // Send POST request to the backend login endpoint
      // *** IMPORTANT *** Replace <YOUR_PORT> with your backend's actual running port (e.g., 5001)
      const { data } = await axios.post(
        `http://localhost:5001/api/auth/login`, // Use your backend port!
        { email, password }, // Send email and password in the request body
        config // Include the headers
      );
      // --- End API Call ---

      // If the request is successful (axios throws an error for non-2xx responses by default)

      setMessage('Login Successful!'); // Display a success message on the page

      // The backend should return user info and the token in the response data
      if (data && data.token) {
          // Store the received JWT token in the browser's local storage
          // This token will be used for accessing protected routes later
          localStorage.setItem('userToken', data.token);

          // Optional: Store other basic user info if your backend returns it
          // if (data.userInfo) { // Assuming backend sends a user info object
          //   localStorage.setItem('userInfo', JSON.stringify(data.userInfo));
          // }

          // --- Redirect the user to another page ---
          // Redirect them to the main application page (e.g., dashboard)
          // Replace '/dashboard' with the actual path you want to redirect to
          navigate('/dashboard'); // Redirect the user after successful login
          // --- End Redirect ---

      } else {
           // If login was successful but no token was received (unlikely with your backend code)
           setMessage('Login failed: No token received');
      }


    } catch (error) {
      // --- Handle Errors from the Backend ---
      // If the backend returns an error response (e.g., 401, 400)
      // The error message from the backend is usually in error.response.data.message
      setMessage(error.response && error.response.data.message
                 ? error.response.data.message // Display the backend's error message
                 : error.message); // Otherwise, display a generic error message (e.g., network error)
    }
  };

  return (
    <div>
      <h2>Login</h2>
      {/* Display success or error messages */}
      {message && <p style={{ color: message.includes('Successful') ? 'green' : 'red' }}>{message}</p>} {/* Simple styling */}

      {/* Login Form */}
      <form onSubmit={submitHandler}>
        <div>
          <label htmlFor="email">Email Address</label>
          <input
            id="email"
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required // Make email required
          />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required // Make password required
          />
        </div>
        {/* Submit Button */}
        <button type="submit">Login</button>
      </form>

       {/* Link to the Registration Page (optional) */}
       {/* Uncomment this if you want a link */}
       {/* <p>
         New User? <Link to="/register">Register</Link>
       </p> */}
    </div>
  );
}

export default LoginPage;