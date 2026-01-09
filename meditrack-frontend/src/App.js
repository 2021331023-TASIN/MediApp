import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable'; // <-- Added import
import Login from './components/Login';
import Register from './components/Register';
import Home from './components/Home';
import Prescriptions from './components/Prescriptions';
import History from './components/History';
import Vitals from './components/Vitals'; // <-- New Component
import BMICalculator from './components/BMICalculator'; // <-- New Component
import './App.css';
import { useAuth } from './context/AuthContext';

// --- UPDATED Dashboard Component for Modern UX ---
const Dashboard = () => {
  const { user, authenticatedRequest } = useAuth();
  const [stats, setStats] = React.useState({ activePrescriptions: 0, dailyDoses: 0 });
  const [activePrescriptions, setActivePrescriptions] = React.useState([]);
  const [lowStockItems, setLowStockItems] = React.useState([]);
  const [todaySchedules, setTodaySchedules] = React.useState([]);
  const [loadingStats, setLoadingStats] = React.useState(true);
  const [loadingPrescriptions, setLoadingPrescriptions] = React.useState(true);
  const [loadingSchedules, setLoadingSchedules] = React.useState(true);

  const fetchTodaySchedules = React.useCallback(async () => {
    try {
      const schedules = await authenticatedRequest('get', '/prescriptions/today');
      setTodaySchedules(schedules);
      setLoadingSchedules(false);
    } catch (error) {
      console.error("Failed to fetch today's schedules", error);
    }
  }, [authenticatedRequest]);

  const fetchPrescriptionsList = React.useCallback(async () => {
    try {
      const presData = await authenticatedRequest('get', '/prescriptions');
      setActivePrescriptions(presData);
      // Filter for low stock (e.g., less than 5 pills)
      const lowStock = presData.filter(p => p.current_quantity !== null && p.current_quantity <= 5);
      setLowStockItems(lowStock);
      setLoadingPrescriptions(false);
    } catch (error) {
      console.error("Failed to fetch prescriptions list", error);
    }
  }, [authenticatedRequest]);

  // --- PDF Generation for Current Prescriptions ---
  const generateCurrentMedsPDF = () => {
    try {
      console.log("Starting Medication PDF generation...");
      const doc = new jsPDF();
      const timestamp = new Date().toLocaleString();

      // Header Section
      doc.setFillColor(16, 132, 126); // MediTrack Teal
      doc.rect(0, 0, 210, 45, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.text('OFFICIAL MEDICATION REPORT', 105, 18, { align: 'center' });
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text('MediTrack Personal Health Monitoring System', 105, 28, { align: 'center' });
      doc.text(`Generated on: ${timestamp}`, 105, 36, { align: 'center' });

      // Patient info block
      doc.setFillColor(245, 245, 245);
      doc.rect(14, 50, 182, 30, 'F');
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text('PATIENT PROFILE', 20, 58);
      doc.setFont("helvetica", "normal");
      doc.text(`Name: ${user?.name || 'Guest User'}`, 20, 66);
      doc.text(`Age: ${user?.age || 'N/A'} Years`, 20, 73);

      // Table
      const tableColumn = ["Medicine", "Dosage", "Instructions", "Remaining", "Next Due"];
      const tableRows = (activePrescriptions || []).map(item => [
        item.name || 'N/A',
        item.dosage || 'N/A',
        item.instructions || 'As prescribed',
        item.current_quantity !== null ? `${item.current_quantity} pills` : 'N/A',
        item.next_dose_time || 'N/A'
      ]);

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows.length > 0 ? tableRows : [["No active medications found", "-", "-", "-", "-"]],
        startY: 90,
        theme: 'grid',
        headStyles: { fillColor: [16, 132, 126], textColor: 255 },
        alternateRowStyles: { fillColor: [240, 252, 251] }
      });

      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text(`Page ${i} of ${pageCount} | MediTrack System`, 105, 285, { align: 'center' });
      }

      const fileName = `Medication_Report_${user?.name?.replace(/\s+/g, '_') || 'Patient'}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      console.log("PDF saved successfully:", fileName);
    } catch (err) {
      console.error("PDF Export Error:", err);
      alert("Failed to generate PDF. Details: " + err.message);
    }
  };

  const fetchStats = React.useCallback(async () => {
    try {
      const statsData = await authenticatedRequest('get', '/prescriptions/stats');
      setStats(statsData);
      setLoadingStats(false);
    } catch (error) {
      console.error("Failed to fetch stats", error);
    }
  }, [authenticatedRequest]);

  React.useEffect(() => {
    if (user) {
      fetchStats();
      fetchPrescriptionsList();
      fetchTodaySchedules();
    }
  }, [user, fetchStats, fetchPrescriptionsList, fetchTodaySchedules]);

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

      // Find matching schedules that are NOT taken
      const dues = todaySchedules.filter(s =>
        s.time_of_day.startsWith(currentTimeString) && !s.is_taken
      );

      dues.forEach(dose => {
        // Trigger Alarm
        new Notification(`Time for Medicine: ${dose.name}`, {
          body: `Take ${dose.dosage} now!`,
        });
        // Optional: play sound or show toast
      });
    };

    // Check every minute
    const interval = setInterval(checkAlarms, 60000);
    return () => clearInterval(interval);
  }, [todaySchedules]);

  const handleMarkTaken = async (prescriptionId, scheduleTime) => {
    try {
      await authenticatedRequest('post', '/prescriptions/take', { prescriptionId, scheduleTime });
      // Refresh list to update UI
      // Refresh list and stats to update UI (reduce quantity in all views)
      fetchTodaySchedules();
      fetchPrescriptionsList();
      fetchStats();
    } catch (error) {
      console.error("Failed to mark dose as taken", error);
      alert("Failed to mark as taken.");
    }
  };

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="container dashboard-grid">
      <h2>Welcome back, {user.name}!</h2>

      {/* --- Low Stock Alert --- */}
      {lowStockItems.length > 0 && (
        <div className="card card-alert">
          <h3><span>⚠️</span> Refill Needed</h3>
          <ul>
            {lowStockItems.map(item => (
              <li key={item.prescription_id}>
                <strong>{item.name}</strong>
                <span>Only {item.current_quantity} left</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="dashboard-columns">
        <div className="main-column">
          {/* --- Today's Medicine Checklist --- */}
          <div className="card checklist-card">
            <h3><span>✅</span> Today's Medicine</h3>
            {loadingSchedules ? <p>Loading schedule...</p> : (
              todaySchedules.filter(s => !s.is_taken).length === 0 ? <p>No pending medicines for now.</p> : (
                <ul className="checklist">
                  {todaySchedules.filter(s => !s.is_taken).map((schedule, index) => (
                    <li key={`${schedule.prescription_id}-${index}`} className="checklist-item">
                      <div className="checklist-info">
                        <span className="checklist-time">
                          {schedule.time_of_day.substring(0, 5)}
                        </span>
                        <div className="checklist-drug">
                          <strong>{schedule.name}</strong>
                          <span>{schedule.dosage}</span>
                          {schedule.current_quantity !== null && (
                            <span style={{ fontSize: '0.8rem', color: schedule.current_quantity > 0 ? 'var(--primary-color)' : '#dc3545' }}>
                              {schedule.current_quantity > 0 ? `Qty: ${schedule.current_quantity}` : 'Out of Stock'}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        className="mark-taken-btn"
                        onClick={() => handleMarkTaken(schedule.prescription_id, schedule.time_of_day)}
                        disabled={schedule.current_quantity === 0}
                        style={{ cursor: schedule.current_quantity === 0 ? 'not-allowed' : 'pointer', opacity: schedule.current_quantity === 0 ? 0.5 : 1 }}
                      >
                        {schedule.current_quantity === 0 ? 'Refill' : 'Mark as Taken'}
                      </button>
                    </li>
                  ))}
                </ul>
              )
            )}
          </div>

          {/* --- Current Medications List --- */}
          <div className="card list-view">
            <h3>Current Medications</h3>
            {loadingPrescriptions ? <p>Loading...</p> : (
              activePrescriptions.length === 0 ? <p>No active prescriptions.</p> : (
                <ul className="prescription-list">
                  {activePrescriptions.map(p => {
                    // Calculate Course Progress
                    const totalDosesToTake = (p.duration_days && p.doses_per_day)
                      ? (p.duration_days * p.doses_per_day)
                      : null;

                    const takenCount = p.total_taken || 0;

                    let remainingDoses = null;
                    if (totalDosesToTake !== null) {
                      remainingDoses = Math.max(0, totalDosesToTake - takenCount);
                    }

                    return (
                      <li key={p.prescription_id} className="prescription-item">
                        <div className="pres-info" style={{ width: '100%' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                            <div>
                              <strong style={{ fontSize: '1.2rem' }}>{p.name}</strong>
                              <span className="pres-dosage" style={{ marginLeft: '10px', background: '#eef', padding: '2px 8px', borderRadius: '4px' }}>{p.dosage}</span>
                            </div>
                          </div>

                          {/* Course Progress Section */}
                          <div className="dose-progress-container" style={{
                            background: '#f8f9fa',
                            padding: '15px',
                            borderRadius: '8px',
                            marginTop: '5px',
                            border: '1px solid #e9ecef'
                          }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', textAlign: 'center' }}>
                              <div>
                                <span style={{ fontSize: '0.85rem', color: '#666', marginBottom: '5px', display: 'block' }}>Total Course</span>
                                <strong style={{ fontSize: '1.4rem', color: 'var(--primary-color)' }}>
                                  {totalDosesToTake !== null ? totalDosesToTake : '∞'}
                                </strong>
                                <span style={{ fontSize: '0.7rem', color: '#999', display: 'block' }}>doses</span>
                              </div>
                              <div style={{ borderLeft: '1px solid #ddd', borderRight: '1px solid #ddd' }}>
                                <span style={{ fontSize: '0.85rem', color: '#666', marginBottom: '5px', display: 'block' }}>Taken</span>
                                <strong style={{ fontSize: '1.4rem', color: '#28a745' }}>{takenCount}</strong>
                                <span style={{ fontSize: '0.7rem', color: '#999', display: 'block' }}>doses</span>
                              </div>
                              <div>
                                <span style={{ fontSize: '0.85rem', color: '#666', marginBottom: '5px', display: 'block' }}>Remaining</span>
                                <strong style={{ fontSize: '1.4rem', color: '#dc3545' }}>
                                  {remainingDoses !== null ? remainingDoses : '∞'}
                                </strong>
                                <span style={{ fontSize: '0.7rem', color: '#999', display: 'block' }}>doses</span>
                              </div>
                            </div>
                          </div>

                          <div className="pres-dates" style={{ marginTop: '12px', fontSize: '0.85rem', color: '#777', borderTop: '1px solid #f0f0f0', paddingTop: '8px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '8px' }}>
                              <span>Frequency: <b>{p.doses_per_day}x / day</b></span>
                              <span>Pills per dose: <b>{p.pills_per_dose}</b></span>
                            </div>
                            {p.instructions && (
                              <div style={{ marginBottom: '8px', fontStyle: 'italic', color: '#555' }}>
                                " {p.instructions} "
                              </div>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px' }}>
                              <span>Start: {new Date(p.start_date).toLocaleDateString()}</span>
                              {p.end_date && <span>End: {new Date(p.end_date).toLocaleDateString()}</span>}
                            </div>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )
            )}
          </div>
        </div >

        <div className="sidebar-column">
          {/* --- Quick Status Cards --- */}
          <div className="status-cards-vertical">
            <div className="card status-card primary-card">
              <h3>Today's Doses</h3>
              <p className="big-number">
                {loadingStats ? '-' : stats.dailyDoses}
              </p>
              <span>Doses / Day</span>
            </div>

            <div className="card status-card secondary-card">
              <h3>Active Meds</h3>
              <p className="big-number">
                {loadingStats ? '-' : stats.activePrescriptions}
              </p>
              <span>Prescriptions</span>
            </div>
          </div>

          {/* --- Quick Action Card --- */}
          <div className="quick-actions card">
            <h3>Quick Actions</h3>
            <div className="action-buttons-vertical">
              <Link to="/prescriptions" className="button action-button primary-action" style={{ textDecoration: 'none' }}>
                Manage Prescriptions
              </Link>
              <Link to="/history" className="button action-button secondary-action" style={{ textDecoration: 'none' }}>
                View History
              </Link>
              <button onClick={generateCurrentMedsPDF} className="button" style={{ background: '#f2d43d', color: '#000', marginTop: '5px' }}>
                📄 Download Report
              </button>
            </div>
          </div>
        </div>
      </div >
    </div >
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
                  <Link to="/vitals">Health Vitals</Link>
                  <Link to="/bmi">BMI Calculator</Link> {/* <-- New Link */}
                  <Link to="/history">History</Link>
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
            <Route path="/vitals" element={<ProtectedRoute element={Vitals} />} />
            <Route path="/bmi" element={<ProtectedRoute element={BMICalculator} />} /> {/* <-- New Route */}
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