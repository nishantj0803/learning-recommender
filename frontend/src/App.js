// frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import axios from 'axios'; 
// Import Toastify CSS and Container
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Default styling for react-toastify

// Page Imports
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import CourseDetailsPage from './pages/CourseDetailsPage';
import LessonDetailsPage from './pages/LessonDetailsPage';
import ProfilePage from './pages/ProfilePage';
import AllCoursesPage from './pages/AllCoursesPage'; // Assuming you have this
import AiPathGeneratorPage from './pages/AiPathGeneratorPage'; // Assuming you have this

// Component Imports
import Header from './components/Header';
import Footer from './components/Footer';
// import ProtectedRoute from './components/ProtectedRoute'; // If you implement this
axios.defaults.baseURL = process.env.REACT_APP_API_URL;
function App() {
  return (
    <Router>
      {/* ToastContainer should be rendered once at the top level */}
      <ToastContainer
        position="top-right" // Or any other position: top-left, top-center, bottom-left, bottom-right, bottom-center
        autoClose={5000} // Auto close after 5 seconds
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light" // Options: light, dark, colored
        // You can also apply a transition effect
        // transition: Bounce, // or Slide, Zoom, Flip
      />
      {/* The rest of your app */}
      <Header />
      <main className="app-main-content">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<LoginPage />} exact />

          {/* Protected Routes */}
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/courses" element={<AllCoursesPage />} /> {/* For course discovery */}
          <Route path="/courses/:id" element={<CourseDetailsPage />} />
          <Route path="/lessons/:id" element={<LessonDetailsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/ai-path-generator" element={<AiPathGeneratorPage />} />

          {/* Add other routes as needed */}
        </Routes>
      </main>
      <Footer />
    </Router>
  );
}

export default App;
