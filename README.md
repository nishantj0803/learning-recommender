# Smart Learning Recommender

## 🚀 Overview

Welcome to the Smart Learning Recommender! This full-stack web application is designed to revolutionize your learning journey by offering AI-powered personalized learning paths, comprehensive course management, and robust progress tracking. Whether you're looking to master a new skill or explore diverse subjects, our platform guides you every step of the way.


## ✨ Features

* **User Authentication:**
    * Secure user registration with password confirmation.
    * User login with JWT-based session management.
    * Automatic redirection for logged-in users.

* **Interactive Dashboard (`DashboardPage.js`):**
    * At-a-glance view of recommended courses and current progress.
    * Quick access to learning goals and AI path generation.

* **Comprehensive Course Exploration (`AllCoursesPage.js`):**
    * Browse a wide range of courses.
    * Filter courses by keyword (search), category, and difficulty level.
    * Paginated course results for easy navigation.
    * View course tags and brief descriptions.

* **Detailed Course & Lesson Interface (`CourseDetailsPage.js`, `LessonDetailsPage.js`):**
    * View structured courses with modules and individual lessons.
    * Navigate seamlessly between lessons (Previous/Next).
    * Mark lessons as complete to track progress.
    * Clear visual indicators for completed lessons and the next lesson to take.
    * Rich content display for lesson materials (HTML rendering).

* **Personalized User Profile (`ProfilePage.js`):**
    * View and manage user name and email.
    * Update learning interests and goals to tailor recommendations.
    * Track learning activity:
        * View courses currently in progress.
        * See a list of completed courses with completion dates.

* **AI-Powered Learning Assistant (`AiPathGeneratorPage.js`):**
    * **Generate Learning Paths:** Input a topic (e.g., "mobile app development") to receive a structured, step-by-step learning path from the AI.
    * **Ask Programming Questions:** Get explanations for concepts (e.g., "How do closures work in JavaScript?").
    * **Seek Learning Advice:** Ask for tips on effective learning strategies (e.g., "How can I stay motivated?").
    * **Career Guidance:** Inquire about skills for specific roles or compare technologies.
    * Displays AI-generated steps, course suggestions, resource links, and general advice.
    * Clear usage guide with examples provided to the user.

* **User Experience:**
    * Responsive design for various screen sizes.
    * Toast notifications (`react-toastify`) for user feedback (success, errors).
    * Skeleton loading cards (`SkeletonCard`) for improved perceived performance during data fetching.
    * Custom SVG icons for a polished UI.

## 🛠️ Tech Stack

**Frontend:**

* **Core:** React.js (v17+), React Router DOM (v6+)
* **State Management:** React Hooks (`useState`, `useEffect`, `useCallback`)
* **API Communication:** Axios
* **UI Components:** Custom-built components, `SkeletonCard`
* **Notifications:** `react-toastify`
* **Styling:** CSS (details like CSS Modules, SASS, or specific frameworks can be added if used)

**Backend:**

* **Core:** Node.js, Express.js
* **Database:** MongoDB with Mongoose (ODM)
* **Authentication:** JSON Web Tokens (JWT), `bcryptjs` for password hashing
* **AI Integration:** Google Generative AI SDK (`@google/generative-ai`)
* **Middleware:** `cors`, `dotenv`
* **Error Handling:** Custom error handling middleware

**Deployment:**

* **Frontend:** Vercel (Live at: `https://learning-recommender.vercel.app` - *confirm URL*)
* **Backend:** Render (Live at: `https://learning-recommender.onrender.com` - *confirm URL*)

## 📂 Project Structure

The project is a monorepo with two main folders:

* `frontend/`: Contains the React client application.
    * `src/pages/`: Main page components (e.g., `DashboardPage.js`, `LoginPage.js`).
    * `src/components/`: Reusable UI components (e.g., `Header.js`, `SkeletonCard.js`).
    * `src/App.js`: Main application component with routing.
    * `src/index.js`: Entry point of the React application.
* `backend/`: Contains the Node.js Express API.
    * `config/`: Database connection, etc.
    * `controllers/`: Logic for handling requests.
    * `middleware/`: Custom middleware (auth, error handling).
    * `models/`: Mongoose schemas.
    * `routes/`: API route definitions.
    * `server.js`: Main server entry point.

## ⚙️ Setup and Installation (Local Development)

### Prerequisites

* Node.js (LTS version, e.g., v18.x or v20.x)
* npm (comes with Node.js) or yarn
* MongoDB (local instance or a cloud service like MongoDB Atlas)
* Git

### Steps

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd smart-learning-recommender
    ```

2.  **Backend Setup:**
    * Navigate to the backend directory: `cd backend`
    * Install dependencies: `npm install`
    * Create a `.env` file in `backend/` (see "Environment Variables" section).
    * Start the server: `npm start` (or `npm run dev` if you have a nodemon script).
    * The backend typically runs on `http://localhost:5001`.

3.  **Frontend Setup:**
    * Navigate to the frontend directory: `cd ../frontend`
    * Install dependencies: `npm install`
    * Create a `.env` file in `frontend/` (see "Environment Variables" section).
    * Start the development server: `npm start`.
    * The frontend typically runs on `http://localhost:3000`.

## <caption>🔑 Environment Variables</caption>

### Backend (`backend/.env`)

```env
PORT=5001
MONGO_URI=<your_mongodb_connection_string>
JWT_SECRET=<your_super_secret_jwt_key_at_least_32_chars_long>
GEMINI_API_KEY=<your_google_gemini_api_key>
FRONTEND_URL=http://localhost:3000 # For local CORS
NODE_ENV=development
