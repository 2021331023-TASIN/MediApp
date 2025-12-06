import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import './Prescriptions.css'; // Assuming you might want specific styles, though we'll use inline or App.css for now

const Prescriptions = () => {
    const { isAuthenticated, authenticatedRequest, user } = useAuth();
    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Form states
    const [medicineName, setMedicineName] = useState('');
    const [dosageAmount, setDosageAmount] = useState(''); // e.g. "10mg"
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // New specific states
    const [selectedTimes, setSelectedTimes] = useState({
        morning: false,
        noon: false,
        night: false
    });
    const [mealTiming, setMealTiming] = useState('after'); // 'before' or 'after'
    const [formLoading, setFormLoading] = useState(false);

    // Duration State
    const [durationValue, setDurationValue] = useState('');
    const [durationUnit, setDurationUnit] = useState('days');

    // Auto-calculate End Date
    useEffect(() => {
        if (!startDate || !durationValue) return;

        const val = parseInt(durationValue);
        if (isNaN(val) || val <= 0) return;

        let multiplier = 1;
        if (durationUnit === 'weeks') multiplier = 7;
        if (durationUnit === 'months') multiplier = 30;

        const totalDays = val * multiplier;
        const start = new Date(startDate);
        const end = new Date(start);
        end.setDate(start.getDate() + totalDays);
        setEndDate(end.toISOString().split('T')[0]);
    }, [startDate, durationValue, durationUnit]);

    // --- Data Fetching ---
    const fetchPrescriptions = React.useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const data = await authenticatedRequest('get', '/prescriptions');
            setPrescriptions(data);
        } catch (err) {
            setError(err.toString());
        } finally {
            setLoading(false);
        }
    }, [user, authenticatedRequest]);

    useEffect(() => {
        if (isAuthenticated && user) {
            fetchPrescriptions();
        }
    }, [isAuthenticated, user, fetchPrescriptions]);

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // --- Form Handling ---
    const handleTimeChange = (time) => {
        setSelectedTimes(prev => ({
            ...prev,
            [time]: !prev[time]
        }));
    };

    const handleAddPrescription = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        setError(null);

        // 1. Construct Schedule Times Array
        const scheduleTimes = [];
        if (selectedTimes.morning) scheduleTimes.push('10:00');
        if (selectedTimes.noon) scheduleTimes.push('14:00');
        if (selectedTimes.night) scheduleTimes.push('21:00');

        if (scheduleTimes.length === 0) {
            setError("Please select at least one time (Morning, Noon, or Night).");
            setFormLoading(false);
            return;
        }

        // 2. Construct Combined Dosage String
        // Format: "10mg - After Meal"
        const mealText = mealTiming === 'before' ? 'Before Meal' : 'After Meal';
        const finalDosage = `${dosageAmount} - ${mealText}`;

        const newPrescription = {
            medicineName,
            dosage: finalDosage,
            startDate,
            endDate: endDate || null,
            scheduleTimes,
        };

        try {
            await authenticatedRequest('post', '/prescriptions', newPrescription);
            alert('Prescription added successfully!');

            // Reset Form
            setMedicineName('');
            setDosageAmount('');
            setStartDate('');
            setEndDate('');
            setSelectedTimes({ morning: false, noon: false, night: false });
            setMealTiming('after');

            fetchPrescriptions();

        } catch (err) {
            setError(err.toString());
        } finally {
            setFormLoading(false);
        }
    };

    // --- Delete Handling ---
    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this prescription?")) return;

        try {
            await authenticatedRequest('delete', `/prescriptions/${id}`);
            // Optimistic update or refetch
            setPrescriptions(prev => prev.filter(p => p.prescription_id !== id));
        } catch (err) {
            console.error(err);
            alert("Failed to delete: " + (err.response?.data?.message || err.message || err.toString()));
        }
    };

    // --- Render ---
    return (
        <div className="container">
            <h2>Manage Prescriptions</h2>

            {/* Add Prescription Form */}
            <div className="card add-form">
                <h3>Add New Medication</h3>
                <form onSubmit={handleAddPrescription}>
                    {error && <p className="error-message">{error}</p>}

                    <div className="form-group">
                        <label>Medicine Name</label>
                        <input
                            type="text"
                            placeholder="e.g., Metformin"
                            value={medicineName}
                            onChange={(e) => setMedicineName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-grid">
                        <div className="form-group">
                            <label>Dosage Amount</label>
                            <input
                                type="text"
                                placeholder="e.g., 500mg"
                                value={dosageAmount}
                                onChange={(e) => setDosageAmount(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Start From</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group section-group">
                        <label className="section-label">Duration</label>
                        <div className="duration-input-wrapper">
                            <input
                                type="number"
                                placeholder="e.g. 7"
                                value={durationValue}
                                onChange={(e) => setDurationValue(e.target.value)}
                                min="1"
                            />
                            <select
                                value={durationUnit}
                                onChange={(e) => setDurationUnit(e.target.value)}
                            >
                                <option value="days">Days</option>
                                <option value="weeks">Weeks</option>
                                <option value="months">Months</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group section-group">
                        <label className="section-label">When to take?</label>
                        <div className="checkbox-group">
                            <label className={`choice-chip ${selectedTimes.morning ? 'active' : ''}`}>
                                <input
                                    type="checkbox"
                                    checked={selectedTimes.morning}
                                    onChange={() => handleTimeChange('morning')}
                                />
                                🌅 Morning
                            </label>
                            <label className={`choice-chip ${selectedTimes.noon ? 'active' : ''}`}>
                                <input
                                    type="checkbox"
                                    checked={selectedTimes.noon}
                                    onChange={() => handleTimeChange('noon')}
                                />
                                ☀️ Noon
                            </label>
                            <label className={`choice-chip ${selectedTimes.night ? 'active' : ''}`}>
                                <input
                                    type="checkbox"
                                    checked={selectedTimes.night}
                                    onChange={() => handleTimeChange('night')}
                                />
                                🌙 Night
                            </label>
                        </div>
                    </div>

                    <div className="form-group section-group">
                        <label className="section-label">Meal Instruction</label>
                        <div className="radio-group">
                            <label className={`choice-chip ${mealTiming === 'before' ? 'active' : ''}`}>
                                <input
                                    type="radio"
                                    name="mealTiming"
                                    value="before"
                                    checked={mealTiming === 'before'}
                                    onChange={(e) => setMealTiming(e.target.value)}
                                />
                                🍽️ Before Meal
                            </label>
                            <label className={`choice-chip ${mealTiming === 'after' ? 'active' : ''}`}>
                                <input
                                    type="radio"
                                    name="mealTiming"
                                    value="after"
                                    checked={mealTiming === 'after'}
                                    onChange={(e) => setMealTiming(e.target.value)}
                                />
                                😋 After Meal
                            </label>
                        </div>
                    </div>

                    <button type="submit" className="submit-btn" disabled={formLoading}>
                        {formLoading ? 'Saving...' : 'Save Prescription'}
                    </button>
                </form>
            </div>

            {/* View Existing Prescriptions */}
            <div className="card list-view">
                <h3>Current Medications</h3>
                {loading && <p>Loading prescriptions...</p>}
                {!loading && prescriptions.length === 0 && <p>No active prescriptions found.</p>}

                {!loading && prescriptions.length > 0 && (
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
                                    <button
                                        className="delete-btn"
                                        onClick={() => handleDelete(p.prescription_id)}
                                        title="Delete Prescription"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>


        </div>
    );
};

export default Prescriptions;