// frontend/src/App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import './App.css'; 

// Components
import Register from './components/Register'; 
import Login from './components/Login'; 
import Prescriptions from './components/Prescriptions'; 
import { useAuth } from './context/AuthContext'; 

// --- Placeholder Components ---
// Home component updated to use the new CSS class
const Home = () => (
    <h1 className="main-heading">Welcome to MediTrack! Simplify your medication.</h1>
);

// --- UPDATED Dashboard Component for Modern UX ---
const Dashboard = () => {
  const { user, logout } = useAuth();
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="container dashboard-grid">
      <h2>Welcome back, {user.name}!</h2>

      {/* --- Quick Status Cards (Flexible Grid) --- */}
      <div className="status-cards">
        <div className="card status-card primary-card">
          <h3>Today's Doses</h3>
          {/* Placeholder for now; will be dynamic later */}
          <p className="big-number">4</p> 
          <span>Doses remaining</span>
        </div>

        <div className="card status-card secondary-card">
          <h3>Total Prescriptions</h3>
          {/* Placeholder for now; will be dynamic later */}
          <p className="big-number">6</p> 
          <span>Active medications</span>
        </div>
      </div>

      {/* --- Quick Action Card --- */}
      <div className="quick-actions card">
          <h3>Quick Actions</h3>
          <div className="action-buttons">
            <Link to="/prescriptions" className="button action-button primary-action">
                Manage Prescriptions
            </Link>
            {/* Added a link placeholder for future History functionality */}
            <Link to="/history" className="button action-button secondary-action">
                View History
            </Link>
          </div>
      </div>

      {/* --- Notification Panel (Alert Styling) --- */}
      <div className="card notification-panel">
          <h3>Reminders & Alerts</h3>
          {/* Placeholder for alert */}
          <p className="alert-text">💊 Don't forget your next dose at 08:00 AM.</p>
          <button onClick={logout} className="nav-button logout-btn">Logout</button>
      </div>

    </div>
  );
};

// A protective route wrapper to ensure only logged-in users access certain pages
const ProtectedRoute = ({ element: Element, ...rest }) => {
    const { isAuthenticated, loading } = useAuth();
    
    if (loading) {
        return <div>Loading authentication...</div>;
    }
    
    return isAuthenticated ? <Element {...rest} /> : <Navigate to="/login" replace />;
};


function App() {
  const { isAuthenticated, logout } = useAuth();
  
  return (
    <Router>
      <div className="App">
        <header>
          <nav className="navbar">
            <Link to="/" className="nav-logo">MediTrack</Link>
            <div className="nav-links">
                <Link to="/">Home</Link>
                
                {/* Conditional Navigation Links */}
                {isAuthenticated ? (
                    <>
                        <Link to="/dashboard">Dashboard</Link>
                        <Link to="/prescriptions">Prescriptions</Link>
                        <button onClick={logout} className="nav-button">Logout</button>
                    </>
                ) : (
                    <>
                        <Link to="/login">Login</Link>
                        <Link to="/register">Register</Link>
                    </>
                )}
            </div>
          </nav>
        </header>
        
        <main>
          {/* ALL <Route> elements must be INSIDE this <Routes> tag */}
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            
            {/* Protected Routes */}
            <Route path="/dashboard" element={<ProtectedRoute element={Dashboard} />} />
            <Route path="/prescriptions" element={<ProtectedRoute element={Prescriptions} />} />

            {/* Fallback for unknown paths */}
            <Route path="*" element={<h1>404 - Page Not Found</h1>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
