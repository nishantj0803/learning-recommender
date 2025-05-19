// frontend/src/pages/CourseDetailsPage.js
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

// --- SVG Icons ---
const ModuleIcon = () => <svg viewBox="0 0 20 20" fill="currentColor" width="1em" height="1em" style={{ marginRight: '8px', verticalAlign: 'middle' }}><path fillRule="evenodd" d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10zm0 5.25a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 01-.75-.75z" clipRule="evenodd" /></svg>;
const LessonIcon = () => <svg viewBox="0 0 20 20" fill="currentColor" width="1em" height="1em" style={{ marginRight: '8px', verticalAlign: 'middle' }}><path d="M2.97 5.279A1 1 0 013.5 5h13a1 1 0 01.53.181C17.19 5.107 17.302 5 17.5 5c.206 0 .39.082.512.208A1.023 1.023 0 0118 5a1 1 0 011 1v8a1 1 0 01-1 1h-.5a1.023 1.023 0 01-.012-.208C17.39 14.918 17.206 15 17 15h-1.5a1 1 0 01-.53-.181A1.004 1.004 0 0114.5 15H3.5a1 1 0 01-.53-.181A1.004 1.004 0 012.5 15H2a1 1 0 01-1-1V6a1 1 0 011-1h.5c.012.208.124.107.27.279zM10 9a.75.75 0 000-1.5H3.75a.75.75 0 000 1.5H10zm6.25-3a.75.75 0 000-1.5h-12.5a.75.75 0 000 1.5h12.5zM3.75 12a.75.75 0 010 1.5H10a.75.75 0 010-1.5H3.75z" /></svg>;
const CheckCircleIcon = () => <svg viewBox="0 0 20 20" fill="currentColor" width="1em" height="1em" className="check-circle-completed" style={{ marginLeft: '8px', verticalAlign: 'middle' }}><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" /></svg>;
const TrophyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="1.5em" height="1.5em" style={{ marginRight: '8px', verticalAlign: 'middle' }}><path fillRule="evenodd" d="M15.5 5.5a3 3 0 00-5.886.039L8.25 8.227a.75.75 0 001.06 1.06l1.364-1.363a.75.75 0 001.314-.01V10.5h-1.34a.75.75 0 000 1.5h1.34v1.16a.75.75 0 001.5 0V12h1.34a.75.75 0 000-1.5h-1.34V7.84a.75.75 0 00-1.314-.01L10.75 9.2a.75.75 0 00-1.06-1.06l1.364-1.364A3.001 3.001 0 0012.5 3a3 3 0 00-3 3c0 1.31.85 2.425 2.006 2.831L9.8 10.5H7.5a.75.75 0 000 1.5h2.3l-1.684 1.684A2.251 2.251 0 006.75 15.75V17h-1V7.5a.75.75 0 00-1.5 0V17h-1V7.5a.75.75 0 00-1.5 0V17a1.5 1.5 0 001.5 1.5h1.05a2.25 2.25 0 004.385-1.006l1.684-1.684H15.5a.75.75 0 000-1.5h-2.3l1.646-1.646A3.001 3.001 0 0015.5 5.5z" clipRule="evenodd" /></svg>;
const NextUpIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="1em" height="1em" className="next-up-icon" style={{ color: 'var(--warning-yellow-light)', marginLeft: '8px', verticalAlign: 'middle' }}><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-.75-4.75a.75.75 0 001.5 0V8.66l1.95 2.1a.75.75 0 101.1-1.02l-3.25-3.5a.75.75 0 00-1.1 0L6.2 9.74a.75.75 0 101.1 1.02l1.95-2.1v4.59z" clipRule="evenodd" /></svg>;

function CourseDetailsPage() {
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [nextLessonToTakeId, setNextLessonToTakeId] = useState(null);

  const { id: courseId } = useParams();
  const navigate = useNavigate();

  let userInfo = null;
  try {
    const storedUserInfo = localStorage.getItem('userInfo');
    if (storedUserInfo) userInfo = JSON.parse(storedUserInfo);
  } catch (e) { console.error("Error parsing userInfo for CourseDetailsPage:", e); }

  useEffect(() => {
    if (!userInfo || !userInfo.token) {
      setError("Please login to view course details.");
      setLoading(false);
      return;
    }

    const fetchCourseDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        const { data } = await axios.get(`/api/courses/${courseId}`, config);
        setCourse(data);

        if (data && data.modules) {
            let firstUncompleted = null;
            for (const moduleItem of data.modules) { // Renamed module to moduleItem to avoid conflict
                // Calculate if this module is completed for adding a property to it
                moduleItem.isFullyCompleted = moduleItem.lessons && moduleItem.lessons.length > 0 && moduleItem.lessons.every(l => l.isCompleted);

                if (!firstUncompleted && moduleItem.lessons && moduleItem.lessons.length > 0) {
                    for (const lesson of moduleItem.lessons) {
                        if (!lesson.isCompleted) {
                            firstUncompleted = lesson._id;
                            break; 
                        }
                    }
                }
                if (firstUncompleted && !moduleItem.isFullyCompleted) break; // Stop if next lesson is in a non-completed module
            }
            setNextLessonToTakeId(firstUncompleted);
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Failed to fetch course details.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [courseId, userInfo?.token]);

  const handleCourseAction = () => {
    if (nextLessonToTakeId) {
      navigate(`/lessons/${nextLessonToTakeId}`);
    } else if (course && course.modules && course.modules[0] && course.modules[0].lessons && course.modules[0].lessons[0]) {
      navigate(`/lessons/${course.modules[0].lessons[0]._id}`);
    } else {
      alert("This course currently has no lessons.");
    }
  };
  
  if (loading) return <div className="page-container"><p>Loading course details...</p></div>;
  if (error) return <div className="page-container"><p className="message error">{error}</p></div>;
  if (!course) return <div className="page-container"><p>Course not found.</p></div>;

  const totalLessons = course.modules?.reduce((sum, moduleItem) => sum + (moduleItem.lessons?.length || 0), 0);
  const completedLessons = course.modules?.reduce((sum, moduleItem) => 
    sum + (moduleItem.lessons?.filter(l => l.isCompleted).length || 0), 0
  );
  const courseProgressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  const isCourseCompleted = courseProgressPercentage === 100 && totalLessons > 0;

  return (
    <div className={`page-container course-details-page ${isCourseCompleted ? 'course-fully-completed-page' : ''}`}>
      <header className="course-details-header">
        <h2>{course.title}</h2>
        <div className="course-meta-details">
          {course.category && <span className="course-category-detail">Category: {course.category}</span>}
          {course.difficulty && <span className={`difficulty-badge difficulty-${course.difficulty.toLowerCase().replace(' ', '-')}`}>{course.difficulty}</span>}
        </div>
        {course.tags && Array.isArray(course.tags) && course.tags.length > 0 && (
          <div className="course-tags-detail">
            {course.tags.map(tag => (<span key={tag} className="tag-item">{tag}</span>))}
          </div>
        )}
      </header>

      <p className="course-description-full">{course.description}</p>

      {isCourseCompleted && (
        <div className="course-completion-banner message success page-section">
          <TrophyIcon />
          <h3>Congratulations! You've completed this course!</h3>
        </div>
      )}

      <div className="course-action-section page-section">
        <h3>Course Progress: {completedLessons} / {totalLessons} lessons ({courseProgressPercentage}%)</h3>
        <button 
            onClick={handleCourseAction} 
            className={`button course-action-button ${isCourseCompleted ? 'button-secondary' : 'button-primary'}`}
        >
          {isCourseCompleted ? "Review Course Content" : (nextLessonToTakeId ? "Continue to Next Lesson" : (completedLessons > 0 ? "Continue Course" : "Start Course"))}
        </button>
      </div>

      <div className="course-modules-section page-section">
        <h3>Modules & Lessons</h3>
        {course.modules && course.modules.length > 0 ? (
          course.modules.map((moduleItem, moduleIndex) => {
            // isFullyCompleted property is now directly on moduleItem from useEffect
            return (
              <div key={moduleItem._id} className={`module-item card-item ${moduleItem.isFullyCompleted ? 'module-completed-item' : ''}`}>
                <h4 className="module-title">
                    <ModuleIcon />
                    {moduleItem.title}
                    {moduleItem.isFullyCompleted && <CheckCircleIcon />}
                </h4>
                {moduleItem.description && <p className="module-description">{moduleItem.description}</p>}
                {moduleItem.lessons && moduleItem.lessons.length > 0 ? (
                  <ul className="lesson-list">
                    {moduleItem.lessons.map((lesson, lessonIndex) => (
                      <li key={lesson._id} className={`lesson-item ${lesson.isCompleted ? 'lesson-completed' : 'lesson-pending'} ${lesson._id === nextLessonToTakeId ? 'lesson-next-up' : ''}`}>
                        <Link to={`/lessons/${lesson._id}`}>
                          <LessonIcon />
                          {lesson.title}
                        </Link>
                        <div className="lesson-status-icons">
                          {lesson._id === nextLessonToTakeId && !lesson.isCompleted && <NextUpIcon />}
                          {lesson.isCompleted && <CheckCircleIcon />}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No lessons in this module yet.</p>
                )}
              </div>
            );
          })
        ) : (
          <p>No modules available for this course yet.</p>
        )}
      </div>
    </div>
  );
}

export default CourseDetailsPage;
