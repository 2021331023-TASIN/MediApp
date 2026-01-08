// frontend/src/components/History.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // <-- Changed from side-effect import
import './Prescriptions.css';

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

    const generatePDF = () => {
        try {
            const doc = new jsPDF();

            // Header
            doc.setFillColor(16, 132, 126); // Teal Primary
            doc.rect(0, 0, 210, 20, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(16);
            doc.text('MediTrack Medical Report', 14, 13);

            // User Info
            doc.setTextColor(50, 50, 50);
            doc.setFontSize(12);
            doc.text(`Patient Name: ${user.name}`, 14, 30);
            doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 38);

            // Table
            const tableColumn = ["Medicine", "Dosage", "End Date / Status"];
            const tableRows = [];

            historyList.forEach(item => {
                const ticketData = [
                    item.name,
                    item.dosage,
                    item.end_date ? new Date(item.end_date).toLocaleDateString() : 'Inactive'
                ];
                tableRows.push(ticketData);
            });

            // Use the imported function instead of doc.autoTable
            autoTable(doc, {
                head: [tableColumn],
                body: tableRows,
                startY: 45,
                theme: 'grid',
                headStyles: { fillColor: [16, 132, 126] }
            });

            doc.save(`MediTrack_Report_${new Date().toISOString().split('T')[0]}.pdf`);
        } catch (err) {
            console.error("PDF Export Error:", err);
            alert("Failed to generate PDF. Please try again.");
        }
    };

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="container">
            <div className="header-flex" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>Prescription History</h2>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={generatePDF} className="button" style={{ background: '#f2d43d', color: '#000' }}>
                        📄 Download Report
                    </button>
                    <Link to="/dashboard" className="button nav-back-btn" style={{ textDecoration: 'none' }}>← Back to Dashboard</Link>
                </div>
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
