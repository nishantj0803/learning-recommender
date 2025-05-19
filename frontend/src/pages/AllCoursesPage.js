// frontend/src/pages/AllCoursesPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import SkeletonCard from '../components/SkeletonCard'; // Import the SkeletonCard component

// Helper to parse query params from URL
function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function AllCoursesPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = useQuery(); // For reading initial params from URL

  // State for fetched data
  const [courses, setCourses] = useState([]);
  const [page, setPage] = useState(Number(queryParams.get('pageNumber')) || 1);
  const [pages, setPages] = useState(1); // Total pages from API
  const [count, setCount] = useState(0);   // Total count of courses from API
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for filters and search term
  const [searchTerm, setSearchTerm] = useState(queryParams.get('keyword') || '');
  const [selectedCategory, setSelectedCategory] = useState(queryParams.get('category') || '');
  const [selectedDifficulty, setSelectedDifficulty] = useState(queryParams.get('difficulty') || '');

  // State for filter dropdown options
  const [categories, setCategories] = useState(['All Categories']); // Initialize with default
  const difficulties = ['All Levels', 'Beginner', 'Intermediate', 'Advanced']; // Predefined (fixed typo in 'intermediate')

  // Debounce search term to avoid API calls on every keystroke
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // 500ms delay
    return () => {
      clearTimeout(timerId);
    };
  }, [searchTerm]);
  
  // Fetch categories for the filter dropdown
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // This is a simplified way. Ideally, you'd have a dedicated API endpoint
        // that returns all unique categories present in your courses.
        // For now, we fetch all courses once to derive categories.
        // This might be inefficient if you have a very large number of courses.
        const { data } = await axios.get('/api/courses'); // Fetches first page of all courses
        if (data.courses) {
            const uniqueCategories = ['All Categories', ...new Set(data.courses.map(course => course.category).filter(Boolean))];
            setCategories(uniqueCategories.sort());
        }
      } catch (catError) {
        console.error("Failed to fetch categories for filter:", catError);
        setCategories(['All Categories']); // Fallback
      }
    };
    fetchCategories();
  }, []); // Fetch categories once on component mount


  // useCallback to memoize fetchCourses function
  const fetchCoursesCallback = useCallback(async (currentPage) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (debouncedSearchTerm) params.append('keyword', debouncedSearchTerm);
      if (selectedCategory && selectedCategory !== 'All Categories') params.append('category', selectedCategory);
      if (selectedDifficulty && selectedDifficulty !== 'All Levels') params.append('difficulty', selectedDifficulty);
      params.append('pageNumber', currentPage.toString());

      // Update URL query string without causing a full page reload,
      // but allowing for back/forward navigation and shareable links.
      navigate(`${location.pathname}?${params.toString()}`, { replace: true });
      
      console.log(`Fetching courses with params: /api/courses?${params.toString()}`);
      const { data } = await axios.get(`/api/courses?${params.toString()}`);
      
      setCourses(data.courses || []);
      setPage(data.page || 1);
      setPages(data.pages || 1);
      setCount(data.count || 0);

    } catch (err) {
      console.error("Error fetching courses:", err);
      setError(err.response?.data?.message || err.message || "Failed to fetch courses.");
      setCourses([]);
      setPage(1);
      setPages(1);
      setCount(0);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchTerm, selectedCategory, selectedDifficulty, navigate, location.pathname]);

  // useEffect to fetch courses when filters, debounced search term, or page (from URL) change
  useEffect(() => {
    const currentPageFromUrl = Number(queryParams.get('pageNumber')) || 1;
    // Only update page state if it's different, to avoid potential loop if fetchCoursesCallback also sets page
    if (page !== currentPageFromUrl) {
        setPage(currentPageFromUrl);
    }
    fetchCoursesCallback(currentPageFromUrl);
  }, [debouncedSearchTerm, selectedCategory, selectedDifficulty, queryParams.get('pageNumber'), fetchCoursesCallback, page]);


  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    // Reset to first page on new search/filter to avoid being on a non-existent page
    if (page !== 1) {
        const params = new URLSearchParams(location.search);
        params.set('pageNumber', '1');
        navigate(`${location.pathname}?${params.toString()}`, { replace: true });
    }
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    if (page !== 1) {
        const params = new URLSearchParams(location.search);
        params.set('pageNumber', '1');
        navigate(`${location.pathname}?${params.toString()}`, { replace: true });
    }
  };

  const handleDifficultyChange = (e) => {
    setSelectedDifficulty(e.target.value);
     if (page !== 1) {
        const params = new URLSearchParams(location.search);
        params.set('pageNumber', '1');
        navigate(`${location.pathname}?${params.toString()}`, { replace: true });
    }
  };
  
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pages && newPage !== page) {
      const params = new URLSearchParams(location.search);
      params.set('pageNumber', newPage.toString());
      navigate(`${location.pathname}?${params.toString()}`);
      // The useEffect listening to queryParams.get('pageNumber') will trigger the fetch
    }
  };

  // Helper to render skeleton loaders
  const renderSkeletons = (count, type = 'course') => {
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

  return (
    <div className="page-container all-courses-page">
      <h2>Explore Courses</h2>

      <div className="filters-and-search-bar card-item page-section">
        <div className="search-input-group">
          <label htmlFor="search-courses" className="sr-only">Search Courses</label>
          <input
            type="text"
            id="search-courses"
            placeholder="Search by keyword, title, tag..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
          />
        </div>
        <div className="filter-controls">
          <div className="filter-group">
            <label htmlFor="category-filter">Category:</label>
            <select id="category-filter" value={selectedCategory} onChange={handleCategoryChange} disabled={categories.length <= 1 || loading}>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          <div className="filter-group">
            <label htmlFor="difficulty-filter">Difficulty:</label>
            <select id="difficulty-filter" value={selectedDifficulty} onChange={handleDifficultyChange} disabled={loading}>
              {difficulties.map(diff => <option key={diff} value={diff}>{diff}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="course-list-section page-section">
        {loading && renderSkeletons(6, 'course-list')} {/* Show 6 skeleton cards while loading */}
        {error && <p className="message error">{error}</p>}
        {!loading && !error && courses.length === 0 && (
          <p>No courses found matching your criteria. Try adjusting your search or filters.</p>
        )}
        
        {!loading && !error && count > 0 && <p className="search-results-count">Found {count} course(s).</p>}

        {!loading && courses.length > 0 && (
          <ul className="course-list-all"> {/* Use a different class than dashboard's course list if styles differ */}
            {courses.map(course => (
              <li key={course._id} className="card-item course-list-item-all"> {/* Specific class for these items */}
                <div className="course-item-content-all">
                  <Link to={`/courses/${course._id}`} className="course-link-all">
                    <strong>{course.title}</strong>
                  </Link>
                  <p className="course-description-all">{course.description?.substring(0, 150)}...</p>
                  <div className="course-meta-all">
                    {course.category && <span className="course-category">Category: {course.category}</span>}
                    {course.difficulty && <span className={`difficulty-badge difficulty-${course.difficulty.toLowerCase().replace(' ', '-')}`}>{course.difficulty}</span>}
                  </div>
                  {course.tags && Array.isArray(course.tags) && course.tags.length > 0 && (
                    <div className="course-tags">
                      {course.tags.slice(0, 4).map(tag => (<span key={tag} className="tag-item">{tag}</span>))}
                    </div>
                  )}
                </div>
                <div className="course-list-item-action">
                  <Link to={`/courses/${course._id}`} className="button button-small">View Details</Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {!loading && pages > 1 && (
        <div className="pagination-controls page-section">
          <button onClick={() => handlePageChange(page - 1)} disabled={page === 1} className="button">
            &laquo; Previous
          </button>
          <span> Page {page} of {pages} </span>
          <button onClick={() => handlePageChange(page + 1)} disabled={page === pages} className="button">
            Next &raquo;
          </button>
        </div>
      )}
    </div>
  );
}

export default AllCoursesPage;