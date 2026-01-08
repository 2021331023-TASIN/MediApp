// frontend/src/components/Vitals.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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
                    <div className="card chart-card">
                        <h3 style={{ color: '#8884d8', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span>🩺</span> Blood Pressure Trends
                        </h3>
                        {bpData.length > 0 ? (
                            <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer>
                                    <AreaChart data={bpData}>
                                        <defs>
                                            <linearGradient id="colorBp" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                                        <XAxis
                                            dataKey="date"
                                            tickFormatter={(str) => new Date(str).toLocaleDateString()}
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#666', fontSize: 12 }}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#666', fontSize: 12 }}
                                        />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                            labelFormatter={(str) => new Date(str).toLocaleString()}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="value"
                                            stroke="#8884d8"
                                            strokeWidth={3}
                                            fillOpacity={1}
                                            fill="url(#colorBp)"
                                            activeDot={{ r: 6, strokeWidth: 0 }}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                                <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '10px' }}>*Graphing raw values. For BP "120/80", ensure you enter only Systolic or simplify.</p>
                            </div>
                        ) : <p>No data recorded.</p>}
                    </div>

                    {/* Sugar Chart */}
                    <div className="card chart-card">
                        <h3 style={{ color: '#10847e', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span>🩸</span> Blood Sugar
                        </h3>
                        {sugarData.length > 0 ? (
                            <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer>
                                    <AreaChart data={sugarData}>
                                        <defs>
                                            <linearGradient id="colorSugar" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10847e" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="#10847e" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                                        <XAxis
                                            dataKey="date"
                                            tickFormatter={(str) => new Date(str).toLocaleDateString()}
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#666', fontSize: 12 }}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#666', fontSize: 12 }}
                                        />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="value"
                                            stroke="#10847e"
                                            strokeWidth={3}
                                            fillOpacity={1}
                                            fill="url(#colorSugar)"
                                            activeDot={{ r: 6, strokeWidth: 0 }}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        ) : <p>No data recorded.</p>}
                    </div>

                    {/* Weight Chart */}
                    <div className="card chart-card">
                        <h3 style={{ color: '#f2a13d', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span>⚖️</span> Weight Trends
                        </h3>
                        {weightData.length > 0 ? (
                            <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer>
                                    <AreaChart data={weightData}>
                                        <defs>
                                            <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#f2a13d" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="#f2a13d" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                                        <XAxis
                                            dataKey="date"
                                            tickFormatter={(str) => new Date(str).toLocaleDateString()}
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#666', fontSize: 12 }}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#666', fontSize: 12 }}
                                        />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="value"
                                            stroke="#f2a13d"
                                            strokeWidth={3}
                                            fillOpacity={1}
                                            fill="url(#colorWeight)"
                                            activeDot={{ r: 6, strokeWidth: 0 }}
                                        />
                                    </AreaChart>
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
