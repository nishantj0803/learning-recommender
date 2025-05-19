// frontend/src/components/SkeletonCard.js
import React from 'react';
import './SkeletonCard.css'; // We'll create this CSS file next

const SkeletonCard = ({ type = 'course' }) => {
  if (type === 'module') {
    return (
      <div className="skeleton-card skeleton-module-item">
        <div className="skeleton-line skeleton-title" style={{ width: '60%', height: '20px' }}></div>
        <div className="skeleton-line skeleton-text" style={{ width: '80%' }}></div>
        <div className="skeleton-line skeleton-text" style={{ width: '70%' }}></div>
        <div className="skeleton-line skeleton-text" style={{ width: '90%', marginTop: '10px' }}></div>
        <div className="skeleton-line skeleton-text" style={{ width: '80%' }}></div>
      </div>
    );
  }

  // Default course card skeleton
  return (
    <div className="skeleton-card skeleton-course-item">
      <div className="skeleton-line skeleton-title" style={{ width: '70%', height: '24px' }}></div>
      <div className="skeleton-line skeleton-text" style={{ width: '90%' }}></div>
      <div className="skeleton-line skeleton-text" style={{ width: '80%' }}></div>
      <div className="skeleton-meta-group">
        <div className="skeleton-line skeleton-tag" style={{ width: '25%', height: '20px' }}></div>
        <div className="skeleton-line skeleton-tag" style={{ width: '30%', height: '20px' }}></div>
      </div>
      <div className="skeleton-line skeleton-button" style={{ width: '40%', height: '36px', marginTop: '15px' }}></div>
    </div>
  );
};

export default SkeletonCard;
