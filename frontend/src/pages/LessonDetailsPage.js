// frontend/src/pages/LessonDetailsPage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify'; // <-- Import toast

// ... (SVG Icons and API functions remain the same)
// --- SVG Icons ---
const CheckCircleIcon = () => <svg viewBox="0 0 20 20" fill="currentColor" width="1.2em" height="1.2em" style={{ verticalAlign: 'middle' }} className="check-circle-completed"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" /></svg>;
const PrevIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="1em" height="1em" style={{ marginRight: '4px'}}><path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" /></svg>
const NextIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="1em" height="1em" style={{ marginLeft: '4px'}}><path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" /></svg>

// --- API Functions ---
const fetchLessonDetailsAPI = async (lessonId, token) => {
  const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  const { data } = await axios.get(`/api/lessons/${lessonId}`, config);
  return data;
};

const markLessonCompleteAPI = async (lessonId, token) => {
  const config = { headers: { Authorization: `Bearer ${token}` } };
  const { data } = await axios.post(`/api/progress/lessons/${lessonId}/complete`, {}, config);
  return data;
};

const fetchLessonCompletionStatusAPI = async (lessonId, token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const { data } = await axios.get(`/api/progress/lessons/${lessonId}`, config);
    return data;
};


function LessonDetailsPage() {
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Still use this for major page errors
  const [isCompleted, setIsCompleted] = useState(false);
  const [markingComplete, setMarkingComplete] = useState(false);

  const { id: lessonId } = useParams();
  const navigate = useNavigate();

  let userInfo = null;
  try {
    const storedUserInfo = localStorage.getItem('userInfo');
    if (storedUserInfo) userInfo = JSON.parse(storedUserInfo);
  } catch (e) { console.error("Error parsing userInfo for LessonDetailsPage:", e); }

  useEffect(() => {
    if (!userInfo || !userInfo.token) {
      toast.error("Please login to view lessons."); // Use toast for error
      setError("Please login to view lessons."); // Keep for page-level error display if needed
      setLoading(false);
      return;
    }

    const fetchDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        setIsCompleted(false);

        const lessonData = await fetchLessonDetailsAPI(lessonId, userInfo.token);
        setLesson(lessonData);

        const progressData = await fetchLessonCompletionStatusAPI(lessonId, userInfo.token);
        if (progressData && progressData.completed) {
          setIsCompleted(true);
        }
      } catch (err) {
        const errorMsg = err.response?.data?.message || err.message || "Failed to fetch lesson.";
        toast.error(errorMsg);
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [lessonId, userInfo?.token]);


  const handleMarkComplete = async () => {
    if (!userInfo || !userInfo.token) {
      toast.error("Please login to mark lessons complete.");
      return;
    }
    setMarkingComplete(true);
    // setError(null); // Error state is for page level, toast handles action error
    try {
      await markLessonCompleteAPI(lessonId, userInfo.token);
      setIsCompleted(true);
      toast.success("Lesson marked as complete!"); // <-- Replaced alert
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Failed to mark complete.";
      toast.error(errorMsg); // Use toast for action error
      // setError(errorMsg); // Optionally also set page-level error if needed
    } finally {
      setMarkingComplete(false);
    }
  };

  const handleNavigate = (targetLessonId) => {
    if (targetLessonId) {
        setLoading(true); 
        navigate(`/lessons/${targetLessonId}`);
    }
  };

  // Initial loading or main error rendering
  if (loading && !lesson) return <div className="page-container"><p>Loading lesson...</p></div>; // Show loading only if lesson is not yet fetched
  if (error && !lesson) return <div className="page-container"><p className="message error">{error}</p></div>; // Show main error if lesson couldn't be fetched
  if (!lesson) return <div className="page-container"><p>Lesson not found.</p></div>; // Should ideally be caught by error state

  const { title, content, course, module: lessonModule, previousLesson, nextLesson } = lesson;

  return (
    <div className="page-container lesson-details-page">
      <header className="lesson-header page-section">
        <h2>{title || "Lesson Title"}</h2>
        <p className="lesson-breadcrumb">
          {course && course.title ? (
            <Link to={`/courses/${course._id}`}>{course.title}</Link>
          ) : ( "Course" )}
          {lessonModule && lessonModule.title && (
            <> <span className="breadcrumb-separator"> &gt; </span> <span>{lessonModule.title}</span></>
          )}
        </p>
      </header>

      {/* Display page-level error if it occurred during fetch and lesson data is available but might be incomplete/stale */}
      {error && lesson && <p className="message error page-section">{error}</p>}


      <div className="lesson-content-area page-section" dangerouslySetInnerHTML={{ __html: content || "" }} />

      <div className="lesson-actions-area page-section">
        {previousLesson && previousLesson._id && (
            <button onClick={() => handleNavigate(previousLesson._id)} className="button button-secondary">
                <PrevIcon /> {previousLesson.title ? `Prev: ${previousLesson.title.substring(0,20)}...` : "Previous Lesson"}
            </button>
        )}

        {!isCompleted ? (
          <button 
            onClick={handleMarkComplete} 
            disabled={markingComplete} 
            className="button button-success lesson-complete-btn"
          >
            {markingComplete ? "Marking..." : "Mark as Complete"}
          </button>
        ) : (
          <p className="message success lesson-completed-message">
            <CheckCircleIcon /> Lesson Completed!
          </p>
        )}

        {nextLesson && nextLesson._id && (
            <button onClick={() => handleNavigate(nextLesson._id)} className="button button-primary lesson-next-btn">
                {nextLesson.title ? `Next: ${nextLesson.title.substring(0,20)}...` : "Next Lesson"} <NextIcon />
            </button>
        )}
        {!nextLesson && isCompleted && course && course._id && (
             <button onClick={() => navigate(`/courses/${course._id}`)} className="button">
                Back to Course Overview
            </button>
        )}
      </div>
    </div>
  );
}

export default LessonDetailsPage;
