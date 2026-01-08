// frontend/src/components/Vitals.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Vitals = () => {
    const { authenticatedRequest } = useAuth();
    const [vitals, setVitals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newVital, setNewVital] = useState({ type: 'blood_pressure', value: '' });

    const fetchVitals = async () => {
        try {
            const data = await authenticatedRequest('get', '/vitals');
            // Transform for chart: reverse to show newest last (left to right time)
            setVitals(data.reverse());
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
            await authenticatedRequest('post', '/vitals', newVital);
            setNewVital({ type: 'blood_pressure', value: '' });
            fetchVitals(); // Refresh list
        } catch (error) {
            console.error("Save Vital Error:", error);
            alert(`Failed to add vital: ${error.message || "Unknown error"}`);
        }
    };

    // Filter data for charts
    const bpData = vitals.filter(v => v.type === 'blood_pressure');
    const sugarData = vitals.filter(v => v.type === 'sugar');
    const weightData = vitals.filter(v => v.type === 'weight');

    return (
        <div className="container" style={{ paddingBottom: '50px' }}>
            <h1>❤️ Health Vitals Log</h1>

            <div className="dashboard-columns">
                {/* --- Input Form --- */}
                <div className="card" style={{ height: 'fit-content' }}>
                    <h3>Log New Reading</h3>
                    <form onSubmit={handleSubmit}>
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
                        <button type="submit">Log Entry</button>
                    </form>
                </div>

                {/* --- Charts --- */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* BP Chart */}
                    <div className="card">
                        <h3>Blood Pressure Trends</h3>
                        {bpData.length > 0 ? (
                            <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer>
                                    <LineChart data={bpData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" tickFormatter={(str) => new Date(str).toLocaleDateString()} />
                                        <YAxis />
                                        <Tooltip labelFormatter={(str) => new Date(str).toLocaleString()} />
                                        <Legend />
                                        {/* Simple numeric parsing approx for BP since it is string "120/80" - usually just chart Systolic or need complex parsing. 
                                            For simple MVP, let's assume user inputs a single number or we just graph the string as category if recharts fails, 
                                            BUT Recharts needs numbers. 
                                            Let's try to parse: if it contains '/', split and take first.
                                        */}
                                        <Line type="monotone" dataKey="value" stroke="#8884d8" activeDot={{ r: 8 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                                <p style={{ fontSize: '0.8rem', color: '#666' }}>*Graphing raw values. For BP "120/80", ensure you enter only Systolic or simplify.</p>
                            </div>
                        ) : <p>No data recorded.</p>}
                    </div>

                    {/* Sugar Chart */}
                    <div className="card">
                        <h3>Blood Sugar</h3>
                        {sugarData.length > 0 ? (
                            <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer>
                                    <LineChart data={sugarData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" tickFormatter={(str) => new Date(str).toLocaleDateString()} />
                                        <YAxis />
                                        <Tooltip />
                                        <Line type="monotone" dataKey="value" stroke="#82ca9d" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        ) : <p>No data recorded.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Vitals;
