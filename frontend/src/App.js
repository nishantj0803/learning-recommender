// frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProtectedRoute from './ProtectedRoute'; // Import ProtectedRoute

function App() {
  return (
    <Router>
      <main>
        <Routes>
          {/* Public Routes (accessible to everyone) */}
          {/* Maybe the root path redirects to login if not logged in */}
          <Route path="/" element={<div><h1>Welcome to the App!</h1>{/* Add links to Login/Register */}</div>} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Routes (only accessible if logged in) */}
          {/* Wrap the Dashboard route with ProtectedRoute */}
          <Route
            path="/dashboard"
            element={<ProtectedRoute element={DashboardPage} />} // Use ProtectedRoute
          />

          {/* Optional: Fallback route for unknown paths */}
          {/* <Route path="*" element={<div>Page Not Found</div>} /> */}
        </Routes>
      </main>
    </Router>
  );
}

export default App;