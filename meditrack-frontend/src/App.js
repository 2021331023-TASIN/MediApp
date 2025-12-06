// // frontend/src/App.js

// import React from 'react';
// import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
// import './App.css'; 

// // Components
// import Register from './components/Register'; 
// import Login from './components/Login'; 
// import Prescriptions from './components/Prescriptions'; 
// import { useAuth } from './context/AuthContext'; 

// // --- Placeholder Components ---
// // Home component updated to use the new CSS class
// const Home = () => (
//     <h1 className="main-heading">Welcome to MediTrack! Simplify your medication.</h1>
// );

// // --- UPDATED Dashboard Component for Modern UX ---
// const Dashboard = () => {
//   const { user, logout } = useAuth();
//   if (!user) return <Navigate to="/login" replace />;

//   return (
//     <div className="container dashboard-grid">
//       <h2>Welcome back, {user.name}!</h2>

//       {/* --- Quick Status Cards (Flexible Grid) --- */}
//       <div className="status-cards">
//         <div className="card status-card primary-card">
//           <h3>Today's Doses</h3>
//           {/* Placeholder for now; will be dynamic later */}
//           <p className="big-number">4</p> 
//           <span>Doses remaining</span>
//         </div>

//         <div className="card status-card secondary-card">
//           <h3>Total Prescriptions</h3>
//           {/* Placeholder for now; will be dynamic later */}
//           <p className="big-number">6</p> 
//           <span>Active medications</span>
//         </div>
//       </div>

//       {/* --- Quick Action Card --- */}
//       <div className="quick-actions card">
//           <h3>Quick Actions</h3>
//           <div className="action-buttons">
//             <Link to="/prescriptions" className="button action-button primary-action">
//                 Manage Prescriptions
//             </Link>
//             {/* Added a link placeholder for future History functionality */}
//             <Link to="/history" className="button action-button secondary-action">
//                 View History
//             </Link>
//           </div>
//       </div>

//       {/* --- Notification Panel (Alert Styling) --- */}
//       <div className="card notification-panel">
//           <h3>Reminders & Alerts</h3>
//           {/* Placeholder for alert */}
//           <p className="alert-text">💊 Don't forget your next dose at 08:00 AM.</p>
//           <button onClick={logout} className="nav-button logout-btn">Logout</button>
//       </div>

//     </div>
//   );
// };

// // A protective route wrapper to ensure only logged-in users access certain pages
// const ProtectedRoute = ({ element: Element, ...rest }) => {
//     const { isAuthenticated, loading } = useAuth();

//     if (loading) {
//         return <div>Loading authentication...</div>;
//     }

//     return isAuthenticated ? <Element {...rest} /> : <Navigate to="/login" replace />;
// };


// function App() {
//   const { isAuthenticated, logout } = useAuth();

//   return (
//     <Router>
//       <div className="App">
//         <header>
//           <nav className="navbar">
//             <Link to="/" className="nav-logo">MediTrack</Link>
//             <div className="nav-links">
//                 <Link to="/">Home</Link>

//                 {/* Conditional Navigation Links */}
//                 {isAuthenticated ? (
//                     <>
//                         <Link to="/dashboard">Dashboard</Link>
//                         <Link to="/prescriptions">Prescriptions</Link>
//                         <button onClick={logout} className="nav-button">Logout</button>
//                     </>
//                 ) : (
//                     <>
//                         <Link to="/login">Login</Link>
//                         <Link to="/register">Register</Link>
//                     </>
//                 )}
//             </div>
//           </nav>
//         </header>

//         <main>
//           {/* ALL <Route> elements must be INSIDE this <Routes> tag */}
//           <Routes>
//             <Route path="/" element={<Home />} />
//             <Route path="/register" element={<Register />} />
//             <Route path="/login" element={<Login />} />

//             {/* Protected Routes */}
//             <Route path="/dashboard" element={<ProtectedRoute element={Dashboard} />} />
//             <Route path="/prescriptions" element={<ProtectedRoute element={Prescriptions} />} />

//             {/* Fallback for unknown paths */}
//             <Route path="*" element={<h1>404 - Page Not Found</h1>} />
//           </Routes>
//         </main>
//       </div>
//     </Router>
//   );
// }

// export default App;


// frontend/src/App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import './App.css';

// Components
import Home from './components/Home';
import Register from './components/Register';
import Login from './components/Login';
import Prescriptions from './components/Prescriptions';
import History from './components/History';


import './components/Prescriptions.css'; // Import Prescription styles
import { useAuth } from './context/AuthContext';

// --- UPDATED Dashboard Component for Modern UX ---
const Dashboard = () => {
  const { user, logout, authenticatedRequest } = useAuth();
  const [stats, setStats] = React.useState({ activePrescriptions: 0, dailyDoses: 0 });
  const [prescriptions, setPrescriptions] = React.useState([]);
  const [todaySchedules, setTodaySchedules] = React.useState([]);
  const [loadingStats, setLoadingStats] = React.useState(true);
  const [loadingPrescriptions, setLoadingPrescriptions] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Stats
        const statsData = await authenticatedRequest('get', '/prescriptions/stats');
        setStats(statsData);
        setLoadingStats(false);

        // Fetch Prescriptions
        const presData = await authenticatedRequest('get', '/prescriptions');
        setPrescriptions(presData);
        setLoadingPrescriptions(false);

        // Fetch Today's Schedules (For Alarms)
        const schedules = await authenticatedRequest('get', '/prescriptions/today');
        setTodaySchedules(schedules);

      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
        setLoadingStats(false);
        setLoadingPrescriptions(false);
      }
    };
    if (user) fetchData();
  }, [user, authenticatedRequest]);

  // --- ALARM SYSTEM ---
  React.useEffect(() => {
    if (!todaySchedules || todaySchedules.length === 0) return;

    // Request Notification Permission
    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }

    const checkAlarms = () => {
      const now = new Date();
      const currentHours = now.getHours().toString().padStart(2, '0');
      const currentMinutes = now.getMinutes().toString().padStart(2, '0');
      const currentTimeString = `${currentHours}:${currentMinutes}`; // "14:00"

      // Find matching schedules
      // time_of_day format from DB might be "14:00:00"
      const dues = todaySchedules.filter(s => s.time_of_day.startsWith(currentTimeString));

      dues.forEach(dose => {
        // Trigger Alarm
        new Notification(`Time for Medicine: ${dose.name}`, {
          body: `Take ${dose.dosage} now!`,
        });
        alert(`⏰ ALARM: Time to take ${dose.name} (${dose.dosage})`);
      });
    };

    // Check every minute
    const interval = setInterval(checkAlarms, 60000);
    // Also check immediately on load/schedule update just in case (optional, maybe too aggressive)

    return () => clearInterval(interval);
  }, [todaySchedules]);

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="container dashboard-grid">
      <h2>Welcome back, {user.name}!</h2>

      {/* --- Quick Status Cards (Flexible Grid) --- */}
      <div className="status-cards">
        <div className="card status-card primary-card">
          <h3>Today's Doses</h3>
          <p className="big-number">
            {loadingStats ? '-' : stats.dailyDoses}
          </p>
          <span>Doses remaining</span>
        </div>

        <div className="card status-card secondary-card">
          <h3>Total Prescriptions</h3>
          <p className="big-number">
            {loadingStats ? '-' : stats.activePrescriptions}
          </p>
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

      {/* --- Current Medications List --- */}
      <div className="card list-view">
        <h3>Current Medications</h3>
        {loadingPrescriptions ? <p>Loading...</p> : (
          prescriptions.length === 0 ? <p>No active prescriptions.</p> : (
            <ul className="prescription-list">
              {prescriptions.map(p => (
                <li key={p.prescription_id} className="prescription-item">
                  <div className="pres-info">
                    <strong>{p.name}</strong>
                    <span className="pres-dosage">{p.dosage}</span>
                    <span className="pres-duration" style={{ fontSize: '0.85rem', color: '#666', display: 'block', marginTop: '2px' }}>
                      Duration: {(() => {
                        if (!p.end_date) return 'Ongoing';
                        const start = new Date(p.start_date);
                        const end = new Date(p.end_date);
                        const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
                        if (diffDays % 30 === 0) return `${diffDays / 30} Month(s)`;
                        if (diffDays % 7 === 0) return `${diffDays / 7} Week(s)`;
                        return `${diffDays} Days`;
                      })()}
                    </span>
                  </div>
                  <div className="pres-actions">
                    <div className="pres-dates">
                      Start: {new Date(p.start_date).toLocaleDateString()}
                    </div>
                    <span className="delete-icon" style={{ opacity: 0.5, cursor: 'default' }} title="Go to Manage Prescriptions to delete">🗑️</span>
                  </div>
                </li>
              ))}
            </ul>
          )
        )}
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
            <Route path="/history" element={<ProtectedRoute element={History} />} />


            {/* Fallback for unknown paths */}
            <Route path="*" element={<h1>404 - Page Not Found</h1>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;