import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import './Prescriptions.css'; // Reusing the same styles for list clarity

const History = () => {
    const { isAuthenticated, authenticatedRequest, user } = useAuth();
    const [historyList, setHistoryList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchHistory = async () => {
            if (!user) return;
            setLoading(true);
            try {
                const data = await authenticatedRequest('get', '/prescriptions/history');
                setHistoryList(data);
            } catch (err) {
                setError(err.toString());
            } finally {
                setLoading(false);
            }
        };

        if (isAuthenticated && user) {
            fetchHistory();
        }
    }, [isAuthenticated, user, authenticatedRequest]);

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="container">
            <div className="header-flex">
                <h2>Prescription History</h2>
                <Link to="/dashboard" className="button nav-back-btn">← Back to Dashboard</Link>
            </div>

            <div className="card list-view">
                <h3>Inactive / Past Medications</h3>

                {loading && <p>Loading history...</p>}
                {error && <p className="error-message">{error}</p>}

                {!loading && !error && historyList.length === 0 && (
                    <p>No history found. All prescriptions are currently active.</p>
                )}

                {!loading && historyList.length > 0 && (
                    <ul className="prescription-list history-list">
                        {historyList.map(p => (
                            <li key={p.prescription_id} className="prescription-item history-item">
                                <div className="pres-info">
                                    <strong>{p.name}</strong>
                                    <span className="pres-dosage">{p.dosage} (Inactive)</span>
                                </div>
                                <div className="pres-actions">
                                    <div className="pres-dates">
                                        Ended: {p.end_date ? new Date(p.end_date).toLocaleDateString() : 'Discontinued'}
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default History;
