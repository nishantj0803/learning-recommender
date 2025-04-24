// frontend/src/ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom'; // Import Navigate for redirection

// This component checks if a user is logged in before rendering a route
function ProtectedRoute({ element: Component, ...rest }) {
  // Check if the user token exists in local storage
  // 'userToken' is the key we used in LoginPage.js to store the token
  const isAuthenticated = localStorage.getItem('userToken');

  // If the user is authenticated (token exists), render the component
  // Otherwise, redirect them to the login page
  return isAuthenticated ? <Component {...rest} /> : <Navigate to="/login" replace />;
}

export default ProtectedRoute;