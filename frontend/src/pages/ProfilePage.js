// frontend/src/pages/ProfilePage.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import SkeletonCard from '../components/SkeletonCard'; // Import the SkeletonCard component

// --- API functions ---
const fetchUserProfileAPI = async (token) => {
  const config = { headers: { Authorization: `Bearer ${token}` } };
  const { data } = await axios.get('/api/user/profile', config);
  return data;
};

const updateUserInterestsAPI = async (interests, token) => {
  const config = { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } };
  const { data } = await axios.put('/api/user/interests', { interests }, config);
  return data;
};

const updateUserGoalsAPI = async (goals, token) => {
  const config = { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } };
  const { data } = await axios.put('/api/user/goals', { goals }, config);
  return data;
};

const fetchUserLearningActivityAPI = async (token) => {
  const config = { headers: { Authorization: `Bearer ${token}` } };
  const { data } = await axios.get('/api/user/activity', config);
  return data;
};
// --- End API functions ---


function ProfilePage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currentInterests, setCurrentInterests] = useState('');
  const [currentGoals, setCurrentGoals] = useState('');

  const [learningActivity, setLearningActivity] = useState(null);
  const [activityLoading, setActivityLoading] = useState(true);
  const [activityError, setActivityError] = useState(null); // For activity fetch error

  const [formLoading, setFormLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState(null); // For profile fetch error


  const [currentUserInfo, setCurrentUserInfo] = useState(() => {
    try {
      const storedUserInfo = localStorage.getItem('userInfo');
      return storedUserInfo ? JSON.parse(storedUserInfo) : null;
    } catch (e) { return null; }
  });

  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const storedUserInfo = localStorage.getItem('userInfo');
        setCurrentUserInfo(storedUserInfo ? JSON.parse(storedUserInfo) : null);
      } catch (e) { setCurrentUserInfo(null); }
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('authChange', handleStorageChange);
    window.addEventListener('focus', handleStorageChange);
    handleStorageChange();
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authChange', handleStorageChange);
      window.removeEventListener('focus', handleStorageChange);
    };
  }, []);


  useEffect(() => {
    if (!currentUserInfo || !currentUserInfo.token) {
      setProfileError("You must be logged in to view this page.");
      toast.error("You must be logged in to view this page."); // Toast for auth error
      setProfileLoading(false);
      setActivityLoading(false);
      return;
    }

    const fetchProfileAndActivity = async () => {
      setProfileLoading(true);
      setProfileError(null);
      try {
        const data = await fetchUserProfileAPI(currentUserInfo.token);
        setName(data.name || '');
        setEmail(data.email || '');
        setCurrentInterests((data.interests || []).join(', '));
        setCurrentGoals((data.goals || []).join(', '));
      } catch (err) {
        const errorMsg = `Error fetching profile: ${err.response?.data?.message || err.message}`;
        setProfileError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setProfileLoading(false);
      }

      setActivityLoading(true);
      setActivityError(null);
      try {
        const activityData = await fetchUserLearningActivityAPI(currentUserInfo.token);
        setLearningActivity(activityData);
      } catch (err) {
        const errorMsg = `Error fetching learning activity: ${err.response?.data?.message || err.message}`;
        setActivityError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setActivityLoading(false);
      }
    };

    fetchProfileAndActivity();

  }, [currentUserInfo]);

  const handleInterestsSubmit = async (e) => {
    e.preventDefault();
    if (!currentUserInfo || !currentUserInfo.token) { toast.error("Please login to update."); return; }
    setFormLoading(true);
    const interestsArray = currentInterests.split(',').map(item => item.trim()).filter(item => item);
    try {
      await updateUserInterestsAPI(interestsArray, currentUserInfo.token);
      toast.success('Interests updated successfully!');
    } catch (error) {
      toast.error(`Error updating interests: ${error.response?.data?.message || error.message}`);
    } finally { setFormLoading(false); }
  };

  const handleGoalsSubmit = async (e) => {
    e.preventDefault();
    if (!currentUserInfo || !currentUserInfo.token) { toast.error("Please login to update."); return; }
    setFormLoading(true);
    const goalsArray = currentGoals.split(',').map(item => item.trim()).filter(item => item);
    try {
      await updateUserGoalsAPI(goalsArray, currentUserInfo.token);
      toast.success('Goals updated successfully!');
    } catch (error) {
      toast.error(`Error updating goals: ${error.response?.data?.message || error.message}`);
    } finally { setFormLoading(false); }
  };

  // Helper function to render skeleton loaders
  const renderSkeletons = (count, type = 'default') => {
    return (
      <ul className="skeleton-list">
        {Array(count).fill(0).map((_, index) => (
          <li key={`skeleton-${type}-${index}`}>
            <SkeletonCard type={type} />
          </li>
        ))}
      </ul>
    );
  };

  // Skeleton for user profile info
  const renderProfileInfoSkeleton = () => (
    <div className="profile-info-skeleton">
      <SkeletonCard type="profile-info" />
    </div>
  );

  // Skeleton for stats
  const renderStatsSkeleton = () => (
    <div className="stats-skeleton">
      <SkeletonCard type="stats" />
    </div>
  );

  // Skeleton for forms
  const renderFormSkeleton = () => (
    <div className="form-skeleton">
      <SkeletonCard type="form" />
    </div>
  );

  if (profileLoading && !currentUserInfo) { 
    return (
      <div className="page-container">
        <h2>User Profile</h2>
        {renderProfileInfoSkeleton()}
      </div>
    );
  }
  
  if (!currentUserInfo || !currentUserInfo.token) { 
    return <div className="page-container"><p className="message error">{profileError || "Please login to view your profile."} <Link to="/login">Login</Link>.</p></div>;
  }

  return (
    <div className="page-container profile-page">
      <h2>User Profile</h2>
      
      <div className="profile-details-grid page-section">
        <div className="profile-info card-item">
            <h3>Your Information</h3>
            {profileLoading ? (
              renderProfileInfoSkeleton()
            ) : (
              profileError ? (
                <p className="message error">{profileError}</p>
              ) : (
                <> 
                  <p><strong>Name:</strong> {name || 'N/A'}</p> 
                  <p><strong>Email:</strong> {email || 'N/A'}</p> 
                </>
              )
            )}
        </div>

        <div className="learning-stats card-item">
            <h3>Learning Stats</h3>
            {activityLoading ? (
              renderStatsSkeleton()
            ) : (
              activityError ? (
                <p className="message error">{activityError}</p>
              ) : (
                learningActivity && learningActivity.stats ? (
                  <ul>
                    <li><strong>Courses Started:</strong> {learningActivity.stats.totalCoursesStarted}</li>
                    <li><strong>Courses Completed:</strong> {learningActivity.stats.totalCoursesCompleted}</li>
                    <li><strong>Lessons Completed:</strong> {learningActivity.stats.totalLessonsCompleted}</li>
                  </ul>
                ) : (
                  <p>No learning activity yet.</p>
                )
              )
            )}
        </div>
      </div>

      <form onSubmit={handleInterestsSubmit} className="page-section card-item">
        <h3>Your Interests</h3>
        {profileLoading ? (
          renderFormSkeleton()
        ) : (
          <>
            <div className="form-group">
              <label htmlFor="interests">Interests (comma-separated):</label>
              <textarea 
                id="interests" 
                rows="3" 
                placeholder="e.g., Web Development, Python" 
                value={currentInterests} 
                onChange={(e) => setCurrentInterests(e.target.value)} 
                disabled={formLoading || profileLoading}
              ></textarea>
            </div>
            <button type="submit" className="button" disabled={formLoading || profileLoading}> 
              {formLoading ? 'Saving...' : 'Save Interests'} 
            </button>
          </>
        )}
      </form>

      <form onSubmit={handleGoalsSubmit} className="page-section card-item">
        <h3>Your Learning Goals</h3>
        {profileLoading ? (
          renderFormSkeleton()
        ) : (
          <>
            <div className="form-group">
              <label htmlFor="goals">Goals (comma-separated):</label>
              <textarea 
                id="goals" 
                rows="3" 
                placeholder="e.g., Build a full-stack app, Master data analysis" 
                value={currentGoals} 
                onChange={(e) => setCurrentGoals(e.target.value)} 
                disabled={formLoading || profileLoading}
              ></textarea>
            </div>
            <button type="submit" className="button" disabled={formLoading || profileLoading}> 
              {formLoading ? 'Saving...' : 'Save Goals'} 
            </button>
          </>
        )}
      </form>

      {/* Courses in Progress Section */}
      <div className="page-section courses-in-progress-section">
        <h3>Courses in Progress</h3>
        {activityLoading ? (
          renderSkeletons(3, 'course-progress')
        ) : (
          activityError ? (
            <p className="message error">{activityError}</p>
          ) : (
            learningActivity && learningActivity.coursesInProgress && learningActivity.coursesInProgress.length > 0 ? (
              <ul className="profile-course-list">
                {learningActivity.coursesInProgress.map(course => (
                  <li key={course.courseId} className="card-item">
                    <Link to={`/courses/${course.courseId}`}><strong>{course.title}</strong></Link>
                    <p>Progress: {course.progressPercentage}% ({course.completedLessons}/{course.totalLessons} lessons)</p>
                    <Link to={`/courses/${course.courseId}`} className="button button-small button-secondary">Continue Course</Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p>You have no courses currently in progress. Start learning!</p>
            )
          )
        )}
      </div>

      {/* Completed Courses Section */}
      <div className="page-section completed-courses-section">
        <h3>Completed Courses</h3>
        {activityLoading ? (
          renderSkeletons(2, 'completed-course')
        ) : (
          activityError ? (
            <p className="message error">{activityError}</p>
          ) : (
            learningActivity && learningActivity.completedCourses && learningActivity.completedCourses.length > 0 ? (
              <ul className="profile-course-list">
                {learningActivity.completedCourses.map(course => (
                  <li key={course.courseId} className="card-item">
                    <Link to={`/courses/${course.courseId}`}><strong>{course.title}</strong></Link>
                    <p>Completed on: {course.completedAt ? new Date(course.completedAt).toLocaleDateString() : 'N/A'}</p>
                    <Link to={`/courses/${course.courseId}`} className="button button-small">Review Course</Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p>You haven't completed any courses yet.</p>
            )
          )
        )}
      </div>
    </div>
  );
}

export default ProfilePage;