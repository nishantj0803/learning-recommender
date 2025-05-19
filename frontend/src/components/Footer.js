// frontend/src/components/Footer.js
import React from 'react';

function Footer() {
  // Get the current year dynamically
  const currentYear = new Date().getFullYear();

  return (
    // Basic footer element
    <footer className="app-footer">
      <p>&copy; {currentYear} Learning Recommender. All rights reserved.</p>
      {/* You can add more links or information here later */}
      {/* Example: <p><Link to="/privacy">Privacy Policy</Link> | <Link to="/terms">Terms of Service</Link></p> */}
    </footer>
  );
}

export default Footer; // Export the Footer component
