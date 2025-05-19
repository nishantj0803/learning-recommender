// frontend/src/components/Header.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate

// Simple sun and moon icons (can be replaced with SVGs or icon library)
const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"></circle>
    <line x1="12" y1="1" x2="12" y2="3"></line>
    <line x1="12" y1="21" x2="12" y2="23"></line>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
    <line x1="1" y1="12" x2="3" y2="12"></line>
    <line x1="21" y1="12" x2="23" y2="12"></line>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
  </svg>
);

const MoonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
  </svg>
);

const ThemeToggleButton = () => {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) return savedTheme;
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    return 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <button
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      className="theme-toggle-button"
    >
      {theme === 'light' ? <MoonIcon /> : <SunIcon />}
      <span className="theme-toggle-text">
        {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
      </span>
    </button>
  );
};


function Header() {
  const navigate = useNavigate();
  // State to hold userInfo, initially null or read from localStorage
  const [localUserInfo, setLocalUserInfo] = useState(() => {
    try {
      const storedUserInfo = localStorage.getItem('userInfo');
      return storedUserInfo ? JSON.parse(storedUserInfo) : null;
    } catch (e) {
      console.error("Error parsing userInfo from localStorage in Header initial state:", e);
      return null;
    }
  });

  // Effect to listen for changes in localStorage or custom events (more advanced)
  // For now, this simple check on mount is often sufficient if login/logout causes page navigation/reload.
  // A more robust solution might involve React Context or Redux for global auth state.
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const storedUserInfo = localStorage.getItem('userInfo');
        setLocalUserInfo(storedUserInfo ? JSON.parse(storedUserInfo) : null);
      } catch (e) {
        console.error("Error parsing userInfo from localStorage on storage event:", e);
        setLocalUserInfo(null);
      }
    };

    // Listen for a custom event that can be dispatched after login/logout
    window.addEventListener('authChange', handleStorageChange);
    // Also check storage on focus, in case login happened in another tab
    window.addEventListener('focus', handleStorageChange);


    // Initial check, in case the component mounts after localStorage has been set
    handleStorageChange();


    return () => {
      window.removeEventListener('authChange', handleStorageChange);
      window.removeEventListener('focus', handleStorageChange);
    };
  }, []);


  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    setLocalUserInfo(null); // Update state
    // Dispatch a custom event so other components (like Header) can react if needed
    window.dispatchEvent(new Event('authChange'));
    navigate('/login');
  };

  // Determine authentication status based on the localUserInfo state
  const isAuthenticated = localUserInfo && localUserInfo.token;

  return (
    <header className="app-header">
      <div className="site-title">
        <Link to={isAuthenticated ? "/dashboard" : "/"} style={{ textDecoration: 'none', color: 'inherit' }}>
          <h1>Learning Recommender</h1>
        </Link>
      </div>

      <nav className="main-nav">
        <ul>
          {isAuthenticated ? (
            <>
            <li><Link to="/ai-path-generator">AI Path Generator</Link></li>
              <li><Link to="/courses">All Courses</Link></li>
              <li><Link to="/dashboard">Dashboard</Link></li>
              <li><Link to="/profile">Profile</Link></li> {/* Profile link is here */}
              <li>
                <button onClick={handleLogout} className="nav-button logout-button-nav">
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li><Link to="/login">Login</Link></li>
              <li><Link to="/register">Register</Link></li>
            </>
          )}
        </ul>
      </nav>
      <ThemeToggleButton />
    </header>
  );
}

export default Header;
