// frontend/src/components/History.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/apiService';
import { Navigate, Link } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import './Prescriptions.css';

const History = () => {
    const { isAuthenticated, user } = useAuth();
    const [historyList, setHistoryList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchHistory = async () => {
            if (!user) return;
            setLoading(true);
            try {
                const data = await apiService.getHistory();
                setHistoryList(data || []);
            } catch (err) {
                setError(err.message || err.toString());
            } finally {
                setLoading(false);
            }
        };

        if (isAuthenticated && user) {
            fetchHistory();
        }
    }, [isAuthenticated, user]);


    const generatePDF = () => {
        try {
            console.log("Starting History PDF generation...");
            const doc = new jsPDF();
            const timestamp = new Date().toLocaleString();

            // Header Section
            doc.setFillColor(16, 132, 126); // MediTrack Teal
            doc.rect(0, 0, 210, 45, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(24);
            doc.setFont("helvetica", "bold");
            doc.text('OFFICIAL HISTORY REPORT', 105, 18, { align: 'center' });
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
            const tableColumn = ["Medicine", "Dosage", "End Date / Status"];
            const tableRows = (historyList || []).map(item => [
                item.name || 'N/A',
                item.dosage || 'N/A',
                item.end_date ? new Date(item.end_date).toLocaleDateString() : 'Inactive / Discontinued'
            ]);

            autoTable(doc, {
                head: [tableColumn],
                body: tableRows.length > 0 ? tableRows : [["No history records found", "-", "-"]],
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

            const fileName = `History_Report_${user?.name?.replace(/\s+/g, '_') || 'Patient'}_${new Date().toISOString().split('T')[0]}.pdf`;
            doc.save(fileName);
            console.log("PDF saved successfully:", fileName);
        } catch (err) {
            console.error("PDF Export Error:", err);
            alert("Failed to generate PDF. Details: " + err.message);
        }
    };

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="container">
            <div className="header-flex">
                <h2>Prescription History</h2>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={generatePDF} className="button button-secondary">
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
