// frontend/src/pages/AiPathGeneratorPage.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import SkeletonCard from '../components/SkeletonCard'; // Import the SkeletonCard component

// --- SVG Icons ---
const StepIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="1.2em" height="1.2em" style={{ marginRight: '8px', verticalAlign: 'middle', opacity: '0.7' }}><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11.25a.75.75 0 00-1.5 0v4.59L7.3 9.74a.75.75 0 00-1.1 1.02l3.25 3.5a.75.75 0 001.1 0l3.25-3.5a.75.75 0 10-1.1-1.02l-1.95 2.1V6.75z" clipRule="evenodd" /></svg>;
const CourseSuggestionIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="1em" height="1em" style={{ marginRight: '6px', verticalAlign: 'middle', color: 'var(--primary-blue-light)'}}><path d="M2.97 5.279A1 1 0 013.5 5h13a1 1 0 01.53.181C17.19 5.107 17.302 5 17.5 5c.206 0 .39.082.512.208A1.023 1.023 0 0118 5a1 1 0 011 1v8a1 1 0 01-1 1h-.5a1.023 1.023 0 01-.012-.208C17.39 14.918 17.206 15 17 15h-1.5a1 1 0 01-.53-.181A1.004 1.004 0 0114.5 15H3.5a1 1 0 01-.53-.181A1.004 1.004 0 012.5 15H2a1 1 0 01-1-1V6a1 1 0 011-1h.5c.012.208.124.107.27.279zM10 9a.75.75 0 000-1.5H3.75a.75.75 0 000 1.5H10zm6.25-3a.75.75 0 000-1.5h-12.5a.75.75 0 000 1.5h12.5zM3.75 12a.75.75 0 010 1.5H10a.75.75 0 010-1.5H3.75z" /></svg>;
const QuestionIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="1.2em" height="1.2em" style={{ marginRight: '8px', verticalAlign: 'middle', opacity: '0.7' }}><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM8.94 6.94a.75.75 0 11-1.061-1.061 3 3 0 112.871 5.026v.345a.75.75 0 01-1.5 0v-.5c0-.72.57-1.172 1.081-1.287A1.5 1.5 0 108.94 6.94zM10 15a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>;


function AiPathGeneratorPage() {
  const [userQuery, setUserQuery] = useState('');
  const [aiResponse, setAiResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [queryType, setQueryType] = useState(null);

  let userInfo = null;
  try {
    const storedUserInfo = localStorage.getItem('userInfo');
    if (storedUserInfo) userInfo = JSON.parse(storedUserInfo);
  } catch (e) { console.error("Error parsing userInfo for AiPathGeneratorPage:", e); }

  const handleSubmitQuery = async (e) => {
    e.preventDefault();
    if (!userQuery.trim()) {
      toast.error("Please enter your learning goal or question.");
      return;
    }
    if (!userInfo || !userInfo.token) {
      toast.error("You need to be logged in to use this feature.");
      return;
    }

    setLoading(true);
    setAiResponse(null);
    setQueryType(null);

    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      
      // Check for question patterns
      const questionPatterns = ["what is", "what are", "how does", "explain", "define", "describe", "why", "difference", "?"];
      const isLikelyQuestion = questionPatterns.some(pattern => 
        userQuery.toLowerCase().includes(pattern)
      );
      
      // Check for learning path patterns
      const learningPathPatterns = ["learning path", "roadmap", "steps to", "become", "how to learn"];
      const isLikelyLearningPath = learningPathPatterns.some(pattern => 
        userQuery.toLowerCase().includes(pattern)
      );
      
      // Display appropriate loading message
      if (isLikelyQuestion) {
        toast.info("Processing your question...", { autoClose: 3000 });
      } else if (isLikelyLearningPath) {
        toast.info("Generating your learning path...", { autoClose: 3000 });
      } else {
        toast.info("Processing your request...", { autoClose: 3000 });
      }
      
      const { data } = await axios.post('/api/ai/generate-path', { query: userQuery }, config);
      setAiResponse(data);
      setQueryType(data.responseType);
      
      // Show appropriate success message based on what was actually generated
      if (data.suggestedPath && data.suggestedPath.length > 0) {
        toast.success("Learning path generated!");
      } else if (data.generalResponse) {
        toast.success("Answer generated!");
      } else {
        toast.info("Could not generate a complete response. Please try rephrasing your query.");
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Failed to process your request.";
      toast.error(errorMsg);
      console.error("Error processing request:", err);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to render skeleton loaders
  const renderSkeleton = () => (
    <div className="ai-response-skeleton">
      <SkeletonCard type="ai-response" />
    </div>
  );

  const renderLearningPathSkeleton = () => (
    <div className="learning-path-skeleton">
      {Array(3).fill(0).map((_, index) => (
        <SkeletonCard key={index} type="path-step" />
      ))}
    </div>
  );

  if (!userInfo || !userInfo.token) {
    return (
      <div className="page-container">
        <h2>AI Learning Assistant</h2>
        <p className="message error">Please <Link to="/login">login</Link> to use the AI Learning Assistant.</p>
      </div>
    );
  }

  return (
    <div className="page-container ai-path-generator-page">
      <h2>AI Learning Assistant</h2>
      <p className="page-description">
        Ask any learning-related question or describe your learning goals. You can:
        <br/>• Request a structured learning path (e.g., "How do I become a full-stack developer?")
        <br/>• Ask specific questions (e.g., "What is recursion in programming?")
        <br/>• Get explanations on concepts (e.g., "Explain dependency injection")
      </p>

      <form onSubmit={handleSubmitQuery} className="ai-query-form card-item page-section">
        <div className="form-group">
          <label htmlFor="ai-user-query">Your Question or Learning Goal:</label>
          <textarea
            id="ai-user-query"
            rows="4"
            placeholder="Ask a question or describe what you want to learn..."
            value={userQuery}
            onChange={(e) => setUserQuery(e.target.value)}
            disabled={loading}
          />
        </div>
        <button type="submit" className="button button-primary" disabled={loading}>
          {loading ? 'Processing...' : 'Get AI Response'}
        </button>
      </form>

      {loading && (
        <div className="loading-section page-section">
          <h3>Generating Response...</h3>
          {renderSkeleton()}
          {renderLearningPathSkeleton()}
        </div>
      )}

      {!loading && aiResponse && (
        <div className="ai-response-section page-section">
          {/* Display user input summary */}
          {aiResponse.userInput && (
            <div className="user-input-summary card-item">
              <p><strong>Your Query:</strong> {aiResponse.userInput.query}</p>
              {aiResponse.userInput.interests?.length > 0 && <p><strong>Considering Your Interests:</strong> {aiResponse.userInput.interests.join(', ')}</p>}
              {aiResponse.userInput.goals?.length > 0 && <p><strong>Considering Your Goals:</strong> {aiResponse.userInput.goals.join(', ')}</p>}
            </div>
          )}
          
          {/* Display general response */}
          {aiResponse.generalResponse && (
            <div className="general-response card-item">
              <div className="response-header">
                <QuestionIcon />
                <h3>Response to Your Question</h3>
              </div>
              <div className="response-content">
                {/* Split paragraphs and display each in a separate p element */}
                {aiResponse.generalResponse.split('\n\n').map((paragraph, index) => (
                  paragraph.trim() && (
                    <p key={index} dangerouslySetInnerHTML={{ 
                      __html: paragraph
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold text
                        .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic text
                    }} />
                  )
                ))}
              </div>
            </div>
          )}
          
          {/* Display learning path */}
          {aiResponse.suggestedPath && aiResponse.suggestedPath.length > 0 ? (
            <div className="learning-path-container">
              <h3>Suggested Learning Path:</h3>
              <ol className="learning-path-list">
                {aiResponse.suggestedPath.map((step) => (
                  <li key={step.step} className="path-step-item card-item">
                    <div className="path-step-header">
                      <StepIcon />
                      <h4>Step {step.step}: {step.title}</h4>
                    </div>
                    <p className="path-step-description">{step.description}</p>
                    {step.type === 'course_suggestion' && step.courseId && (
                      <div className="path-step-course-link">
                        <CourseSuggestionIcon />
                        Suggested Course: <Link to={`/courses/${step.courseId}`}>{step.courseTitle || "View Course"}</Link>
                      </div>
                    )}
                    {step.type === 'foundational_skill' && step.suggestedCourses && step.suggestedCourses.length > 0 && (
                      <div className="path-step-course-link">
                        <CourseSuggestionIcon />
                        Consider starting with: {step.suggestedCourses.join(' or ')}
                      </div>
                    )}
                    {step.type === 'skill_area' && step.suggestedCourses && step.suggestedCourses.length > 0 && (
                      <div className="path-step-course-link">
                        <CourseSuggestionIcon />
                        Relevant courses might include: {step.suggestedCourses.join(' or ')}
                      </div>
                    )}
                  </li>
                ))}
              </ol>
            </div>
          ) : (
            queryType === "LEARNING_PATH" && !loading && !aiResponse.generalResponse && (
              <p>Could not generate a specific learning path. Please try rephrasing your query or adding more details.</p>
            )
          )}
          
          {/* Display AI notes */}
          {aiResponse.aiNotes && (
            <p className="ai-notes"><em>Note: {aiResponse.aiNotes}</em></p>
          )}
        </div>
      )}

      {/* Display guide on how to use the AI assistant */}
      {!aiResponse && !loading && (
        <div className="ai-usage-guide page-section card-item">
          <h3>How to Use the AI Learning Assistant</h3>
          <ul className="usage-examples">
            <li><strong>For a learning path:</strong> "I want to learn mobile app development" or "What's the best way to learn data science?"</li>
            <li><strong>For a programming question:</strong> "How do closures work in JavaScript?" or "Explain dependency injection"</li>
            <li><strong>For learning advice:</strong> "What's the most effective way to practice coding?" or "How can I stay motivated while learning?"</li>
            <li><strong>For career guidance:</strong> "What skills should I focus on to become a DevOps engineer?" or "Is Python or JavaScript better for beginners?"</li>
          </ul>
          <p><strong>Tip:</strong> Be specific with your questions for more relevant responses!</p>
        </div>
      )}
    </div>
  );
}

export default AiPathGeneratorPage;