import React, { useState, useEffect } from 'react';
import './BMICalculator.css';
import bmiChartImg from '../assets/bmi-calculator.jpg';

const BMICalculator = () => {
    const [weight, setWeight] = useState('');
    const [heightFeet, setHeightFeet] = useState('');
    const [heightInches, setHeightInches] = useState('');
    const [bmi, setBmi] = useState(null);
    const [status, setStatus] = useState('');

    useEffect(() => {
        if (weight && (heightFeet || heightInches)) {
            const feet = parseFloat(heightFeet) || 0;
            const inches = parseFloat(heightInches) || 0;
            const totalInches = (feet * 12) + inches;
            const heightInMeters = totalInches * 0.0254;

            if (heightInMeters > 0) {
                const calculatedBmi = weight / (heightInMeters * heightInMeters);
                setBmi(calculatedBmi.toFixed(1));

                if (calculatedBmi < 18.5) setStatus('Underweight');
                else if (calculatedBmi >= 18.5 && calculatedBmi < 25) setStatus('Normal');
                else if (calculatedBmi >= 25 && calculatedBmi < 30) setStatus('Overweight');
                else setStatus('Obese');
            }
        } else {
            setBmi(null);
            setStatus('');
        }
    }, [weight, heightFeet, heightInches]);

    const handleReset = () => {
        setWeight('');
        setHeightFeet('');
        setHeightInches('');
        setBmi(null);
        setStatus('');
    };

    const getStatusColor = () => {
        switch (status) {
            case 'Normal': return '#10b981'; // Vibrant Emerald
            case 'Underweight': return '#3b82f6'; // Bright Blue
            case 'Overweight': return '#f59e0b'; // Warm Amber
            case 'Obese': return '#ef4444'; // Sharp Red
            default: return '#cbd5e1';
        }
    };

    const getStatusIcon = () => {
        switch (status) {
            case 'Normal': return 'verified_user';
            case 'Underweight': return 'opacity';
            case 'Overweight': return 'warning';
            case 'Obese': return 'emergency';
            default: return 'monitor_weight';
        }
    };

    // Calculate stroke extension for the gauge (0 to 100 range for SVG)
    const getGaugeDash = () => {
        if (!bmi) return 0;
        const value = parseFloat(bmi);
        const percentage = Math.min(Math.max((value / 40) * 100, 0), 100);
        return (percentage / 100) * 283; // 283 is circumference for r=45
    };

    return (
        <div className="luxe-bmi-page">
            <div className="mesh-gradient-bg"></div>

            <header className="luxe-header">
                <div className="header-badge">Clinical Suite v2.0</div>
                <h1 className="luxe-title">BMI <span>Predictor</span></h1>
                <p className="luxe-subtitle">Advanced Body Composition Analytics</p>
            </header>

            <main className="luxe-container">
                <div className="luxe-console">
                    {/* LEFT PANEL: INPUTS */}
                    <div className="console-panel panel-inputs">
                        <div className="panel-header">
                            <span className="panel-icon">tune</span>
                            <h3>Patient Metrics</h3>
                        </div>

                        <div className="luxe-form-grid">
                            <div className="luxe-input-group">
                                <label>Weight (kg)</label>
                                <div className="luxe-input-wrapper">
                                    <input
                                        type="number"
                                        value={weight}
                                        onChange={(e) => setWeight(e.target.value)}
                                        placeholder="00.0"
                                    />
                                    <span className="unit-tag">KG</span>
                                </div>
                            </div>

                            <div className="luxe-input-group">
                                <label>Height (Ft/In)</label>
                                <div className="dual-input">
                                    <div className="luxe-input-wrapper">
                                        <input
                                            type="number"
                                            value={heightFeet}
                                            onChange={(e) => setHeightFeet(e.target.value)}
                                            placeholder="0"
                                        />
                                        <span className="unit-tag">FT</span>
                                    </div>
                                    <div className="luxe-input-wrapper">
                                        <input
                                            type="number"
                                            value={heightInches}
                                            onChange={(e) => setHeightInches(e.target.value)}
                                            placeholder="0"
                                        />
                                        <span className="unit-tag">IN</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button className="luxe-reset-btn" onClick={handleReset}>
                            <span className="material-icons-round">refresh</span>
                            Reset Console
                        </button>
                    </div>

                    {/* RIGHT PANEL: GAUGE & RESULT */}
                    <div className="console-panel panel-results">
                        <div className="panel-header">
                            <span className="panel-icon">analytics</span>
                            <h3>Health Analysis</h3>
                        </div>

                        <div className="analysis-content">
                            {bmi ? (
                                <div className="luxe-result-view">
                                    <div className="gauge-container">
                                        <svg viewBox="0 0 100 100" className="luxe-gauge">
                                            <circle className="gauge-bg" cx="50" cy="50" r="45" />
                                            <circle
                                                className="gauge-progress"
                                                cx="50" cy="50" r="45"
                                                style={{
                                                    strokeDasharray: `${getGaugeDash()} 283`,
                                                    stroke: getStatusColor()
                                                }}
                                            />
                                        </svg>
                                        <div className="gauge-center">
                                            <span className="bmi-value">{bmi}</span>
                                            <span className="bmi-label">INDEX</span>
                                        </div>
                                    </div>

                                    <div className="luxe-status-card" style={{ borderColor: getStatusColor() }}>
                                        <div className="status-badge" style={{ backgroundColor: getStatusColor() }}>
                                            {status}
                                        </div>
                                        <p className="status-advice">
                                            {status === 'Normal' && "Optimal range maintained."}
                                            {status === 'Underweight' && "Nutritional focus recommended."}
                                            {status === 'Overweight' && "Activity increase suggested."}
                                            {status === 'Obese' && "Clinical guidance advised."}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="luxe-placeholder">
                                    <div className="placeholder-animation">
                                        <span className="material-icons-round">monitor_weight</span>
                                    </div>
                                    <p>Awaiting Metric Inputs</p>
                                    <div className="scan-line"></div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* BOTTOM SECTION: REFERENCE */}
                <div className="luxe-infobox">
                    <div className="reference-header">
                        <span className="material-icons-round">info</span>
                        <h4>Reference Thresholds</h4>
                    </div>
                    <div className="reference-strip">
                        <div className="ref-node" data-status="Underweight"><span>Under:</span> <small>&lt;18.5</small></div>
                        <div className="ref-node" data-status="Normal"><span>Normal:</span> <small>18.5-25</small></div>
                        <div className="ref-node" data-status="Overweight"><span>Over:</span> <small>25-30</small></div>
                        <div className="ref-node" data-status="Obese"><span>Obese:</span> <small>&gt;30</small></div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default BMICalculator;
