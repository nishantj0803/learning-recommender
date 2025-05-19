// frontend/src/pages/DashboardPage.js
import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import SkeletonCard from '../components/SkeletonCard'; // Ensure this path is correct

// --- SVG Icons ---
const GoalIcon = () => <svg viewBox="0 0 20 20" fill="currentColor" width="20" height="20" aria-hidden="true"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5.5a.75.75 0 00.22.53l2.5 2.5a.75.75 0 00-1.06-1.06L10 10.19V5z" clipRule="evenodd" /></svg>;
const PathIcon = () => <svg viewBox="0 0 20 20" fill="currentColor" width="20" height="20" aria-hidden="true"><path d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02zM16 10a.75.75 0 01-.75.75H4.75a.75.75 0 010-1.5H15.25A.75.75 0 0116 10z" clipRule="evenodd" /></svg>;
const InterestIcon = () => <svg viewBox="0 0 20 20" fill="currentColor" width="20" height="20" aria-hidden="true"><path fillRule="evenodd" d="M9.653 16.915l-.005-.003-.019-.01a20.759 20.759 0 01-1.162-.682 22.045 22.045 0 01-2.582-1.9C4.045 12.733 2 10.352 2 7.5a4.5 4.5 0 018-2.828A4.5 4.5 0 0118 7.5c0 2.852-2.044 5.233-3.885 6.82a22.049 22.049 0 01-3.744 2.582l-.019.01-.005.003h-.002a.739.739 0 01-.69.001l-.002-.001z" clipRule="evenodd" /></svg>;
const CategoryIcon = () => <svg viewBox="0 0 20 20" fill="currentColor" width="20" height="20" aria-hidden="true"><path fillRule="evenodd" d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10zm0 5.25a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 5.25z" clipRule="evenodd" /></svg>;
const RecentIcon = () => <svg viewBox="0 0 20 20" fill="currentColor" width="20" height="20" aria-hidden="true"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5.5c0 .27.144.518.378.651l3.5 2a.75.75 0 10.744-1.302L11.25 10.31V5z" clipRule="evenodd" /></svg>;

function DashboardPage() {
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [errorCourses, setErrorCourses] = useState(null);
  const [overallProgress, setOverallProgress] = useState([]);
  const [loadingProgress, setLoadingProgress] = useState(true);
  const [errorProgress, setErrorProgress] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecs, setLoadingRecs] = useState(true);
  const [errorRecs, setErrorRecs] = useState(null);
  const navigate = useNavigate();

  const [currentUserInfo, setCurrentUserInfo] = useState(() => {
    try {
      const storedUserInfo = localStorage.getItem('userInfo');
      return storedUserInfo ? JSON.parse(storedUserInfo) : null;
    } catch (e) { 
      console.error("Error parsing userInfo from localStorage on init (DashboardPage):", e); 
      return null; 
    }
  });

  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const storedUserInfo = localStorage.getItem('userInfo');
        setCurrentUserInfo(storedUserInfo ? JSON.parse(storedUserInfo) : null);
      } catch (e) { 
        console.error("Error parsing userInfo from localStorage on storage event:", e);
        setCurrentUserInfo(null); 
      }
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('authChange', handleStorageChange);
    window.addEventListener('focus', handleStorageChange);
    handleStorageChange(); // Initial check
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authChange', handleStorageChange);
      window.removeEventListener('focus', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoadingCourses(true); // Set loading true at the start
      setErrorCourses(null);
      try {
        const { data } = await axios.get('/api/courses');
        // Ensure data.courses exists if backend sends paginated object, otherwise assume data is the array
        setCourses(data.courses || data || []);
      } catch (error) {
        const errorMsg = error.response?.data?.message || error.message || 'Failed to fetch courses';
        setErrorCourses(errorMsg);
        toast.error(errorMsg);
      } finally { 
        setLoadingCourses(false); 
      }
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    if (!currentUserInfo || !currentUserInfo.token) {
      setErrorProgress('Login to see your progress.'); 
      setLoadingProgress(false); 
      return;
    }
    const fetchOverallProgress = async () => {
      setLoadingProgress(true);
      setErrorProgress(null);
      try {
        const config = { headers: { Authorization: `Bearer ${currentUserInfo.token}` } };
        const { data } = await axios.get(`/api/progress/overall`, config);
        setOverallProgress(data);
      } catch (error) {
        setErrorProgress(error.response?.data?.message || error.message || 'Failed to fetch progress');
      } finally { 
        setLoadingProgress(false); 
      }
    };
    fetchOverallProgress();
  }, [currentUserInfo]);

  useEffect(() => {
    if (!currentUserInfo || !currentUserInfo.token) {
      setErrorRecs('Login to get recommendations.'); 
      setLoadingRecs(false); 
      return;
    }
    
    const fetchRecommendations = async () => {
      setLoadingRecs(true);
      setErrorRecs(null);
      
      // Get the latest token from localStorage to ensure we're using the most current one
      let tokenForAPI = null;
      try {
        const storedUserInfo = localStorage.getItem('userInfo');
        if (storedUserInfo) {
          const localUserInfoForRecs = JSON.parse(storedUserInfo);
          if (localUserInfoForRecs && localUserInfoForRecs.token) {
            tokenForAPI = localUserInfoForRecs.token;
          }
        }
      } catch (e) {
        console.error("Error parsing userInfo from localStorage for recommendations:", e);
      }

      if (!tokenForAPI) {
        setErrorRecs('Authentication token not available. Please log in again.');
        setLoadingRecs(false);
        return;
      }

      try {
        const config = { headers: { Authorization: `Bearer ${tokenForAPI}` } };
        const { data } = await axios.get(`/api/recommendations`, config);
        setRecommendations(data);
      } catch (error) {
        const errorMsg = error.response?.data?.message || error.message || 'Failed to fetch recommendations';
        setErrorRecs(errorMsg);
        toast.error(errorMsg);
      } finally { 
        setLoadingRecs(false); 
      }
    };
    
    fetchRecommendations();
  }, [currentUserInfo]);

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    setCurrentUserInfo(null);
    window.dispatchEvent(new Event('authChange'));
    navigate('/login');
  };

  const groupedRecommendations = recommendations.reduce((acc, rec) => {
    const type = rec.type || 'general';
    if (!acc[type]) acc[type] = [];
    acc[type].push(rec);
    return acc;
  }, {});

  const recommendationTypeDetails = {
    next_step: { title: "Continue Your Learning Path", Icon: PathIcon, emphasis: true, numbered: true, cta: "Continue Lesson" },
    goal_driven: { title: "Based on Your Goals", Icon: GoalIcon, numbered: true, cta: "View Course" },
    interest_based: { title: "Explore Your Interests", Icon: InterestIcon, cta: "Explore Course" },
    category_based: { title: "More in Categories You've Engaged With", Icon: CategoryIcon, cta: "Explore Course" },
    fallback_recent: { title: "Recently Added Courses", Icon: RecentIcon, cta: "View Course" },
    general: { title: "General Recommendations", Icon: () => null, cta: "View Details" }
  };

  const baseOrder = ['goal_driven', 'interest_based', 'category_based', 'fallback_recent', 'general'];
  let recommendationOrder = baseOrder;
  if (groupedRecommendations['next_step'] && groupedRecommendations['next_step'].length > 0) {
    recommendationOrder = ['next_step', ...baseOrder.filter(type => type !== 'next_step')];
  }

  if (!currentUserInfo || !currentUserInfo.token) {
    return ( <div className="page-container"><h2>Dashboard</h2><p className="message error">Please <Link to="/login">login</Link> to view your dashboard.</p></div> );
  }

  // Helper to render skeleton loaders
  const renderSkeletons = (count, type = 'course') => {
    // Wrap skeletons in a list if they are replacing list items
    if (type === 'course' || type === 'recommendation') {
      return <ul className="skeleton-list">{Array(count).fill(0).map((_, index) => <li key={`skeleton-${type}-${index}`}><SkeletonCard type={type} /></li>)}</ul>;
    }
    // For other types, or if not in a list context
    return Array(count).fill(0).map((_, index) => <SkeletonCard key={`skeleton-${type}-${index}`} type={type} />);
  };

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Dashboard</h2>
        <button onClick={handleLogout} className="button button-secondary">Logout</button>
      </div>

      <div className="page-section recommendations-section">
        <h3>Personalized Recommendations</h3>
        {loadingRecs && renderSkeletons(3, 'recommendation')}
        {errorRecs && !loadingRecs && <p className="message error">{errorRecs}</p>}
        {!loadingRecs && !errorRecs && recommendations.length === 0 && (
          <p>No recommendations available. Update your interests and goals on your profile!</p>
        )}

        {!loadingRecs && recommendations.length > 0 && recommendationOrder.map(typeKey => {
          const group = groupedRecommendations[typeKey];
          const details = recommendationTypeDetails[typeKey];
          if (group && group.length > 0 && details) {
            const IconComponent = details.Icon;
            const groupClassName = `recommendation-group recommendation-group-${typeKey} ${details.emphasis ? 'recommendation-group-emphasis' : ''}`;
            return (
              <div key={typeKey} className={groupClassName}>
                <h4 className="recommendation-group-title">
                  <IconComponent />
                  <span>{details.title}</span>
                </h4>
                {details.numbered ? (
                  <ol className="recommendation-list-numbered">
                    {group.map((rec, index) => (
                      <li key={`${rec.courseId || rec.lessonId}-${index}`} className={`card-item recommendation-item recommendation-item-${rec.type}`}>
                        <div className="recommendation-content">
                          <Link to={rec.link} className="recommendation-link">
                            <strong>{rec.courseTitle}</strong>
                            {rec.lessonTitle && ` - ${rec.lessonTitle}`}
                          </Link>
                          <p className="recommendation-message">{rec.message}</p>
                          {rec.description && <p className="recommendation-description-snippet">{rec.description.substring(0, 120)}...</p>}
                          <div className="recommendation-meta">
                            {rec.category && <span className="recommendation-category">Category: {rec.category}</span>}
                            {rec.difficulty && <span className={`difficulty-badge difficulty-${rec.difficulty.toLowerCase().replace(' ', '-')}`}>{rec.difficulty}</span>}
                          </div>
                          {rec.tags && Array.isArray(rec.tags) && rec.tags.length > 0 && (
                            <div className="recommendation-tags">
                              {rec.tags.slice(0, 4).map(tag => (<span key={tag} className="tag-item">{tag}</span>))}
                            </div>
                          )}
                        </div>
                        {details.cta && (
                          <div className="recommendation-cta">
                            <Link to={rec.link} className="button button-small recommendation-action-button">
                              {details.cta}
                            </Link>
                          </div>
                        )}
                      </li>
                    ))}
                  </ol>
                ) : (
                  <ul>
                    {group.map((rec, index) => (
                      <li key={`${rec.courseId || rec.lessonId}-${index}`} className={`card-item recommendation-item recommendation-item-${rec.type}`}>
                        <div className="recommendation-content">
                          <Link to={rec.link} className="recommendation-link">
                            <strong>{rec.courseTitle}</strong>
                            {rec.lessonTitle && ` - ${rec.lessonTitle}`}
                          </Link>
                          <p className="recommendation-message">{rec.message}</p>
                          {rec.description && <p className="recommendation-description-snippet">{rec.description.substring(0, 120)}...</p>}
                          <div className="recommendation-meta">
                            {rec.category && <span className="recommendation-category">Category: {rec.category}</span>}
                            {rec.difficulty && <span className={`difficulty-badge difficulty-${rec.difficulty.toLowerCase().replace(' ', '-')}`}>{rec.difficulty}</span>}
                          </div>
                          {rec.tags && Array.isArray(rec.tags) && rec.tags.length > 0 && (
                            <div className="recommendation-tags">
                              {rec.tags.slice(0, 4).map(tag => (<span key={tag} className="tag-item">{tag}</span>))}
                            </div>
                          )}
                        </div>
                        {details.cta && (
                          <div className="recommendation-cta">
                            <Link to={rec.link} className="button button-small recommendation-action-button">
                              {details.cta}
                            </Link>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          }
          return null;
        })}
      </div>

      <div className="page-section available-courses-section">
        <h3>Explore All Available Courses</h3>
        {loadingCourses && renderSkeletons(4, 'course')}
        {errorCourses && !loadingCourses && <p className="message error">{errorCourses}</p>}
        {!loadingCourses && !errorCourses && courses.length === 0 && (<p>No courses available yet.</p>)}
        {!loadingCourses && courses.length > 0 && (
          <ul className="course-list-all">
            {courses.map(course => (
              <li key={course._id} className="card-item course-list-item">
                <div className="course-item-content">
                  <Link to={`/courses/${course._id}`} className="course-link">
                    <strong>{course.title}</strong>
                  </Link>
                  <p className="course-description">{course.description?.substring(0, 100)}...</p>
                  <div className="course-meta">
                    {course.category && <span className="course-category">Category: {course.category}</span>}
                    {course.difficulty && <span className={`difficulty-badge difficulty-${course.difficulty.toLowerCase().replace(' ', '-')}`}>{course.difficulty}</span>}
                  </div>
                  {course.tags && Array.isArray(course.tags) && course.tags.length > 0 && (
                    <div className="course-tags">
                      {course.tags.slice(0, 3).map(tag => (<span key={tag} className="tag-item">{tag}</span>))}
                    </div>
                  )}
                </div>
                <div className="course-progress-indicator">
                  {loadingProgress ? (<span style={{ whiteSpace: 'nowrap' }}>Loading...</span>
                  ) : errorProgress && overallProgress.length === 0 ? (<span className="message error" style={{ fontSize: '0.9em' }}>N/A</span>
                  ) : (
                    (() => {
                      const courseProgress = overallProgress.find(p => p._id === course._id);
                      return (<span style={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                        {courseProgress ? `${courseProgress.completionPercentage}% Completed` : '0% Completed'}
                      </span>);
                    })()
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
        {!loadingProgress && errorProgress && overallProgress.length === 0 && <p className="message error">{errorProgress}</p>}
      </div>
    </div>
  );
}

export default DashboardPage;