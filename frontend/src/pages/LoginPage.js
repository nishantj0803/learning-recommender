// frontend/src/pages/LoginPage.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify'; // <-- Import toast

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  // const [error, setError] = useState(null); // Can be removed if toasts handle all error feedback

  const navigate = useNavigate();

  useEffect(() => {
    try {
      const userInfoFromStorage = localStorage.getItem('userInfo');
      if (userInfoFromStorage) {
        const parsedUserInfo = JSON.parse(userInfoFromStorage);
        if (parsedUserInfo && parsedUserInfo.token) {
          navigate('/dashboard');
        }
      }
    } catch (e) {
      console.error("Error parsing userInfo from localStorage during redirect check (LoginPage):", e);
    }
  }, [navigate]);

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    // setError(null); // Clear previous page-level errors if any

    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
        },
      };
      const { data } = await axios.post(
        '/api/auth/login', // Using relative path for proxy
        { email, password },
        config
      );

      localStorage.setItem('userInfo', JSON.stringify(data));
      window.dispatchEvent(new Event('authChange'));
      
      toast.success('Logged in successfully!'); // <-- Success Toast
      setLoading(false);
      navigate('/dashboard');

    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Login failed. Please check your credentials.';
      toast.error(errorMsg); // <-- Error Toast
      // setError(errorMsg); // Optionally keep for inline error display too
      setLoading(false);
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: '500px' }}>
      <h2>Login</h2>
      {/* If you remove the error state, remove this line too */}
      {/* {error && <div className="message error">{error}</div>} */}
      {loading && <p>Loading...</p>}
      <form onSubmit={submitHandler}>
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

        <button type="submit" className="button" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <div style={{ marginTop: '15px' }}>
        New Customer?{' '}
        <Link to="/register">
          Register here
        </Link>
      </div>
    </div>
  );
}

export default LoginPage;
