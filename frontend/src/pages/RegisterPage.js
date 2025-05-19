// frontend/src/pages/RegisterPage.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify'; // Import toast

function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  // const [error, setError] = useState(null); // Can be removed if toasts handle all error feedback
  // const [message, setMessage] = useState(null); // For specific messages like password mismatch

  const navigate = useNavigate();

  let userInfo = null;
  try {
    const storedUserInfo = localStorage.getItem('userInfo');
    if (storedUserInfo) userInfo = JSON.parse(storedUserInfo);
  } catch (e) { /* Ignore error, user is not logged in */ }

  useEffect(() => {
    if (userInfo && userInfo.token) {
      navigate('/dashboard'); // Redirect if already logged in
    }
  }, [navigate, userInfo]);

  const submitHandler = async (e) => {
    e.preventDefault();
    // setMessage(null); // Clear previous non-toast messages
    // setError(null);

    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      // setMessage("Passwords do not match!"); // Optionally keep for inline message
      return;
    }

    setLoading(true);
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
        },
      };
      // The backend /api/auth/register might return the user object without a token,
      // or with a token if you want to auto-login upon registration.
      // Adjust based on your backend's response.
      // For this example, assume it doesn't auto-login and just returns user data or success message.
      const { data } = await axios.post(
        '/api/auth/register', // Using relative path for proxy
        { name, email, password },
        config
      );

      toast.success('Registration successful! Please login.');
      setLoading(false);
      navigate('/login'); // Redirect to login page after successful registration

    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Registration failed. Please try again.';
      toast.error(errorMsg);
      // setError(errorMsg); // Optionally keep for inline error display
      setLoading(false);
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: '500px' }}>
      <h2>Register</h2>
      {/* {error && <div className="message error">{error}</div>} */}
      {/* {message && <div className="message error">{message}</div>} {/* For password mismatch etc. */}
      {loading && <p>Registering...</p>}
      <form onSubmit={submitHandler}>
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            placeholder="Enter name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <button type="submit" className="button" disabled={loading}>
          {loading ? 'Processing...' : 'Register'}
        </button>
      </form>

      <div style={{ marginTop: '15px' }}>
        Already have an account?{' '}
        <Link to="/login">
          Login here
        </Link>
      </div>
    </div>
  );
}

export default RegisterPage;
