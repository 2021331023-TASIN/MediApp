// frontend/src/components/Vitals.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/apiService';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const Vitals = () => {
    const { user } = useAuth();
    const [vitals, setVitals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newVital, setNewVital] = useState({ type: 'blood_pressure', value: '' });

    const fetchVitals = async () => {
        try {
            const data = await apiService.getVitals();
            // Transform for chart: reverse to show newest last (left to right time)
            if (data && Array.isArray(data)) {
                setVitals(data.reverse());
            }
            setLoading(false);
        } catch (error) {
            console.error("Failed to fetch vitals", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVitals();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await apiService.addVital(newVital);
            setNewVital({ type: 'blood_pressure', value: '' });
            fetchVitals(); // Refresh list
        } catch (error) {
            console.error("Save Vital Error:", error);
            alert(`Failed to add vital: ${error.message || "Unknown error"}`);
        }
    };


    const getHealthSummary = () => {
        let alerts = [];
        let condition = "Good";
        const age = user?.age || "N/A";

        // Blood Pressure Logic (Age-Adjusted)
        if (bpStats) {
            let userAgeNum = parseInt(age);
            let highThreshold = 140;
            let lowThreshold = 90;

            if (!isNaN(userAgeNum)) {
                if (userAgeNum > 60) highThreshold = 150;
                if (userAgeNum < 18) highThreshold = 120;
            }

            if (bpStats.latest > highThreshold) {
                alerts.push(`🚨 High Blood Pressure (Hypertension) detected for age ${age}.`);
                condition = "Needs Attention";
            } else if (bpStats.latest < lowThreshold) {
                alerts.push(`⚠️ Low Blood Pressure (Hypotension) detected for age ${age}.`);
                condition = "Needs Attention";
            } else if (bpStats.latest > (highThreshold - 20)) {
                alerts.push("ℹ️ Blood Pressure is slightly elevated.");
            } else {
                alerts.push("✅ Blood Pressure is healthy.");
            }
        }

        // Blood Sugar Logic
        if (sugarStats) {
            if (sugarStats.latest > 140) {
                alerts.push("⚠️ High Blood Sugar levels detected.");
                condition = "Needs Attention";
            } else if (sugarStats.latest > 100) {
                alerts.push("ℹ️ Blood Sugar is above optimal fasting levels.");
            } else {
                alerts.push("✅ Blood Sugar levels are stable.");
            }
        }

        // Weight Logic (Age-Adjusted standard)
        if (weightStats) {
            let userAgeNum = parseInt(age);
            let standardMin = 50;
            let standardMax = 90;

            if (!isNaN(userAgeNum)) {
                if (userAgeNum < 18) { standardMin = 30; standardMax = 60; }
                if (userAgeNum > 60) { standardMin = 55; standardMax = 85; }
            }

            if (weightStats.latest > standardMax) {
                alerts.push(`⚠️ Weight category: Obesity for age ${age}.`);
                condition = "Needs Attention";
            } else if (weightStats.latest < standardMin) {
                alerts.push(`ℹ️ Weight is below standard for age ${age} (Underweight).`);
                condition = "Needs Attention";
            } else {
                alerts.push("✅ Weight is in the healthy standard range.");
            }
        }

        return { alerts, condition, age };
    };

    const downloadPDF = () => {
        try {
            console.log("Starting PDF generation...");
            const doc = new jsPDF();
            const { condition, alerts, age } = getHealthSummary();
            const timestamp = new Date().toLocaleString();

            // Header Section
            doc.setFillColor(16, 132, 126); // MediTrack Teal
            doc.rect(0, 0, 210, 45, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(24);
            doc.setFont("helvetica", "bold");
            doc.text('OFFICIAL HEALTH REPORT', 105, 18, { align: 'center' });
            doc.setFontSize(12);
            doc.setFont("helvetica", "normal");
            doc.text('MediTrack Personal Health Monitoring System', 105, 28, { align: 'center' });
            doc.text(`Generated on: ${timestamp}`, 105, 36, { align: 'center' });

            // Patient info block
            doc.setFillColor(245, 245, 245);
            doc.rect(14, 50, 182, 35, 'F');
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(11);
            doc.setFont("helvetica", "bold");
            doc.text('PATIENT PROFILE', 20, 58);
            doc.setFont("helvetica", "normal");
            doc.text(`Name: ${user?.name || 'Guest User'}`, 20, 66);
            doc.text(`Age: ${age} Years`, 20, 73);
            doc.text(`Condition: ${condition}`, 120, 66);

            doc.setFontSize(13);
            if (condition === "Good") {
                doc.setTextColor(16, 132, 126);
            } else {
                doc.setTextColor(211, 47, 47);
            }
            doc.setFont("helvetica", "bold");
            doc.text(`STATUS: ${condition.toUpperCase()}`, 120, 73);

            // Analysis Section
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(12);
            doc.text("Clinical Health Analysis:", 14, 95);
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            let yPos = 102;
            if (alerts.length === 0) {
                doc.text("• No sufficient data for analysis yet.", 20, yPos);
                yPos += 7;
            } else {
                alerts.forEach(alert => {
                    doc.text(`• ${alert}`, 20, yPos);
                    yPos += 7;
                });
            }

            // Vitals Table
            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.text("Complete Vitals History:", 14, yPos + 8);
            const tableColumn = ["Date & Time", "Vital Type", "Recorded Value"];
            const tableRows = (vitals || []).map(v => [
                new Date(v.date).toLocaleString(),
                v.type ? v.type.replace('_', ' ').toUpperCase() : 'N/A',
                v.value || 'N/A'
            ]);

            autoTable(doc, {
                head: [tableColumn],
                body: tableRows.length > 0 ? tableRows : [["No records found", "-", "-"]],
                startY: yPos + 15,
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

            const fileName = `Health_Report_${user?.name?.replace(/\s+/g, '_') || 'Patient'}_${new Date().toISOString().split('T')[0]}.pdf`;
            doc.save(fileName);
            console.log("PDF saved successfully:", fileName);
        } catch (error) {
            console.error("PDF Export Error:", error);
            alert("Failed to generate report. Details: " + error.message);
        }
    };

    // Filter data for charts
    const bpData = vitals.filter(v => v.type === 'blood_pressure');
    const sugarData = vitals.filter(v => v.type === 'sugar');
    const weightData = vitals.filter(v => v.type === 'weight');

    const getStats = (data) => {
        if (!data || data.length === 0) return null;
        const values = data.map(v => parseFloat(v.value.split('/')[0])).filter(v => !isNaN(v));
        if (values.length === 0) return null;
        return {
            latest: values[values.length - 1],
            avg: (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1),
            max: Math.max(...values),
            min: Math.min(...values)
        };
    };

    const bpStats = getStats(bpData);
    const sugarStats = getStats(sugarData);
    const weightStats = getStats(weightData);

    const StatBox = ({ stats, unit }) => {
        if (!stats) return null;
        return (
            <div className="stats-row">
                <div className="stat-item" style={{ animation: 'slideInRight 0.5s ease-out' }}>
                    <strong>Latest:</strong> {stats.latest} {unit}
                </div>
                <div className="stat-item" style={{ animation: 'slideInRight 0.6s ease-out' }}>
                    <strong>Avg:</strong> {stats.avg} {unit}
                </div>
                <div className="stat-item" style={{ color: '#d32f2f', animation: 'slideInRight 0.7s ease-out' }}>
                    <strong>Max:</strong> {stats.max} {unit}
                </div>
                <div className="stat-item" style={{ color: '#10847e', animation: 'slideInRight 0.8s ease-out' }}>
                    <strong>Min:</strong> {stats.min} {unit}
                </div>
            </div>
        );
    };

    const { alerts, condition } = getHealthSummary();

    return (
        <div className="container" style={{ paddingBottom: '100px' }}>
            <div style={{ marginBottom: '30px' }}>
                <h1 style={{ textAlign: 'center' }}>❤️ Health Vitals Log</h1>
            </div>

            {/* --- 1. Input Section (Top - Full Width) --- */}
            <div className="vitals-form-section">
                <div className="card">
                    <h3><span>➕</span> Log New Reading</h3>
                    <form onSubmit={handleSubmit} className="vitals-form">
                        <div className="form-group">
                            <label>Vital Type</label>
                            <select
                                value={newVital.type}
                                onChange={(e) => setNewVital({ ...newVital, type: e.target.value })}
                            >
                                <option value="blood_pressure">Blood Pressure (mmHg)</option>
                                <option value="sugar">Blood Sugar (mg/dL)</option>
                                <option value="weight">Weight (kg)</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Value</label>
                            <input
                                type="text"
                                placeholder="e.g. 120/80 or 95"
                                value={newVital.value}
                                onChange={(e) => setNewVital({ ...newVital, value: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <button type="submit" className="button">
                                Log Entry
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* --- 2. Current Health Condition Section (Below Input) --- */}
            <div className="health-condition-section" style={{ marginBottom: '30px' }}>
                <div
                    className={`card health-status-card ${condition === "Good" ? "status-good" : "status-warning"}`}
                    style={{
                        animation: condition === "Good" ? '' : 'pulse 2s infinite ease-in-out'
                    }}
                >
                    <h3>
                        <span>📊</span> Current Health Status: <span style={{ fontWeight: '800' }}>{condition.toUpperCase()}</span>
                    </h3>
                    <div style={{ display: 'flex', gap: '40px', marginTop: '15px', flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: '250px' }}>
                            <p style={{ fontWeight: 'bold', marginBottom: '10px' }}>Detailed Analysis:</p>
                            <ul style={{ paddingLeft: '20px', fontSize: '1rem', lineHeight: '1.6' }}>
                                {alerts.map((a, i) => <li key={i} style={{ marginBottom: '10px' }}>{a}</li>)}
                            </ul>
                        </div>
                        <div style={{ flex: 1, minWidth: '250px', background: 'rgba(255,255,255,0.4)', padding: '15px', borderRadius: '8px' }}>
                            <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>Standard Reference (Adults):</p>
                            <div style={{ fontSize: '0.9rem', color: '#444' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}><span>BP Normal:</span> <span>90-120 mmHg</span></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}><span>Sugar Normal:</span> <span>70-100 mg/dL</span></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Weight Std:</span> <span>50-85 kg</span></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- 3. Charts Grid (Historical Data) --- */}

            {/* --- Charts Grid (Bottom) --- */}
            <div className="vitals-charts-grid">
                {/* BP Chart */}
                <div className="card chart-card" style={{ borderLeft: '8px solid #6366f1' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                        <h3 style={{ color: '#4f46e5', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span>🩺</span> Blood Pressure Trends
                        </h3>
                        <StatBox stats={bpStats} unit="mmHg" />
                    </div>
                    {bpData.length > 0 ? (
                        <div style={{ width: '100%', height: 350 }}>
                            <ResponsiveContainer>
                                <AreaChart data={bpData}>
                                    <defs>
                                        <linearGradient id="colorBp" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis
                                        dataKey="date"
                                        tickFormatter={(str) => new Date(str).toLocaleDateString()}
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#888', fontSize: 12 }}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#888', fontSize: 12 }}
                                        label={{ value: 'mmHg', angle: -90, position: 'insideLeft', offset: 0, fill: '#aaa' }}
                                    />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', background: 'rgba(255,255,255,0.9)' }}
                                        labelFormatter={(str) => new Date(str).toLocaleString()}
                                        formatter={(value) => [`${value} mmHg`, "Level"]}
                                    />
                                    <ReferenceLine y={120} stroke="#10b981" strokeDasharray="5 5" label={{ position: 'right', value: 'Normal', fill: '#10b981', fontSize: 11, fontWeight: 'bold' }} />
                                    <ReferenceLine y={140} stroke="#ef4444" strokeDasharray="5 5" label={{ position: 'right', value: 'High', fill: '#ef4444', fontSize: 11, fontWeight: 'bold' }} />
                                    <Area
                                        type="monotone"
                                        dataKey="value"
                                        stroke="#4f46e5"
                                        strokeWidth={4}
                                        fillOpacity={1}
                                        fill="url(#colorBp)"
                                        animationDuration={1500}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                            <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '10px' }}>*Green dashed line (120) is the Normal limit. Red (140) indicates High.</p>
                        </div>
                    ) : <p>No data recorded.</p>}
                </div>

                {/* Sugar Chart */}
                <div className="card chart-card" style={{ borderLeft: '8px solid #059669' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                        <h3 style={{ color: '#059669', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span>🩸</span> Blood Sugar
                        </h3>
                        <StatBox stats={sugarStats} unit="mg/dL" />
                    </div>
                    {sugarData.length > 0 ? (
                        <div style={{ width: '100%', height: 350 }}>
                            <ResponsiveContainer>
                                <AreaChart data={sugarData}>
                                    <defs>
                                        <linearGradient id="colorSugar" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#059669" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis
                                        dataKey="date"
                                        tickFormatter={(str) => new Date(str).toLocaleDateString()}
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#888', fontSize: 12 }}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#888', fontSize: 12 }}
                                        label={{ value: 'mg/dL', angle: -90, position: 'insideLeft', offset: 0, fill: '#aaa' }}
                                    />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', background: 'rgba(255,255,255,0.9)' }}
                                        formatter={(value) => [`${value} mg/dL`, "Level"]}
                                    />
                                    <ReferenceLine y={100} stroke="#10b981" strokeDasharray="5 5" label={{ position: 'right', value: 'Normal', fill: '#10b981', fontSize: 11, fontWeight: 'bold' }} />
                                    <ReferenceLine y={140} stroke="#ef4444" strokeDasharray="5 5" label={{ position: 'right', value: 'Post-Meal', fill: '#ef4444', fontSize: 11, fontWeight: 'bold' }} />
                                    <Area
                                        type="monotone"
                                        dataKey="value"
                                        stroke="#059669"
                                        strokeWidth={4}
                                        fillOpacity={1}
                                        fill="url(#colorSugar)"
                                        animationDuration={1500}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    ) : <p>No data recorded.</p>}
                </div>

                {/* Weight Chart */}
                <div className="card chart-card" style={{ borderLeft: '8px solid #d97706' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                        <h3 style={{ color: '#d97706', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span>⚖️</span> Weight Trends
                        </h3>
                        <StatBox stats={weightStats} unit="kg" />
                    </div>
                    {weightData.length > 0 ? (
                        <div style={{ width: '100%', height: 350 }}>
                            <ResponsiveContainer>
                                <AreaChart data={weightData}>
                                    <defs>
                                        <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#d97706" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="#d97706" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis
                                        dataKey="date"
                                        tickFormatter={(str) => new Date(str).toLocaleDateString()}
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#888', fontSize: 12 }}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#888', fontSize: 12 }}
                                        label={{ value: 'kg', angle: -90, position: 'insideLeft', offset: 0, fill: '#aaa' }}
                                    />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', background: 'rgba(255,255,255,0.9)' }}
                                        formatter={(value) => [`${value} kg`, "Level"]}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="value"
                                        stroke="#d97706"
                                        strokeWidth={4}
                                        fillOpacity={1}
                                        fill="url(#colorWeight)"
                                        animationDuration={1500}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    ) : <p>No data recorded.</p>}
                </div>
            </div>
            {/* --- 4. Download Button (Centered Middle-Bottom Area) --- */}
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '60px 0',
                marginTop: '30px',
                background: 'rgba(255,255,255,0.4)',
                borderRadius: '20px',
                border: '1px dashed #ccc'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <button
                        onClick={downloadPDF}
                        className="button"
                        style={{
                            width: '500px',
                            maxWidth: '92vw',
                            padding: '18px 0',
                            background: 'linear-gradient(135deg, #f2d43d 0%, #dab40c 100%)',
                            color: '#000',
                            fontSize: '1.3rem',
                            fontWeight: '800',
                            borderRadius: '50px',
                            boxShadow: '0 10px 30px rgba(218, 180, 12, 0.4)',
                            border: 'none',
                            cursor: 'pointer',
                            margin: '0 auto',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '12px'
                        }}
                    >
                        <span>📥</span> Download Health Information Report
                    </button>
                    <p style={{ marginTop: '15px', color: '#666', fontSize: '1rem' }}>
                        {/* Includes Patient Profile & Historical Records */}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Vitals;
