// // frontend/src/components/Prescriptions.js

// import React, { useState, useEffect } from 'react';
// import { useAuth } from '../context/AuthContext';
// import { Navigate } from 'react-router-dom';

// const Prescriptions = () => {
//     const { isAuthenticated, authenticatedRequest, user } = useAuth();
//     const [prescriptions, setPrescriptions] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);

//     // Form states for adding a new prescription
//     const [medicineName, setMedicineName] = useState('');
//     const [dosage, setDosage] = useState('');
//     const [startDate, setStartDate] = useState('');
//     const [endDate, setEndDate] = useState('');
//     // Schedule states (simplified for frontend demo)
//     const [scheduleTimes, setScheduleTimes] = useState(['08:00', '20:00']); 
//     const [formLoading, setFormLoading] = useState(false);

//     // --- Data Fetching ---
//     const fetchPrescriptions = async () => {
//         if (!user) return; // Wait for user data
//         setLoading(true);
//         try {
//             const data = await authenticatedRequest('get', '/prescriptions');
//             setPrescriptions(data);
//         } catch (err) {
//             setError(err.toString());
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         // If the user is authenticated, fetch their prescriptions
//         if (isAuthenticated && user) {
//             fetchPrescriptions();
//         }
//     }, [isAuthenticated, user]); 

//     if (!isAuthenticated) {
//         return <Navigate to="/login" replace />;
//     }

//     // --- Form Handling ---
//     const handleAddPrescription = async (e) => {
//         e.preventDefault();
//         setFormLoading(true);
//         setError(null);

//         const newPrescription = {
//             medicineName,
//             dosage,
//             startDate,
//             endDate: endDate || null, // Allow null for ongoing meds
//             scheduleTimes, // Array of strings (e.g., ['08:00', '16:00'])
//         };

//         try {
//             await authenticatedRequest('post', '/prescriptions', newPrescription);
//             alert('Prescription added successfully!');
//             // Clear form and refresh list
//             setMedicineName('');
//             setDosage('');
//             setStartDate('');
//             setEndDate('');
//             setScheduleTimes(['08:00', '20:00']);
//             fetchPrescriptions();

//         } catch (err) {
//             setError(err.toString());
//         } finally {
//             setFormLoading(false);
//         }
//     };
    
//     // Simple helper to add/remove schedule times
//     const handleScheduleChange = (index, value) => {
//         const newTimes = [...scheduleTimes];
//         newTimes[index] = value;
//         setScheduleTimes(newTimes);
//     };

//     const addScheduleTime = () => setScheduleTimes([...scheduleTimes, '']);
//     const removeScheduleTime = (index) => {
//         setScheduleTimes(scheduleTimes.filter((_, i) => i !== index));
//     };


//     // --- Render ---
//     return (
//         <div className="container">
//             <h2>Manage Prescriptions</h2>
            
//             {/* Add Prescription Form */}
//             <div className="card add-form">
//                 <h3>Add New Medication</h3>
//                 <form onSubmit={handleAddPrescription}>
//                     {error && <p className="error-message">{error}</p>}
                    
//                     <input type="text" placeholder="Medicine Name (e.g., Ibuprofen)" value={medicineName} onChange={(e) => setMedicineName(e.target.value)} required />
//                     <input type="text" placeholder="Dosage (e.g., 20mg, 1 tablet)" value={dosage} onChange={(e) => setDosage(e.target.value)} required />
//                     <input type="date" placeholder="Start Date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
//                     <input type="date" placeholder="End Date (Optional)" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                    
//                     <h4>Schedule Times (e.g., 08:00)</h4>
//                     {scheduleTimes.map((time, index) => (
//                         <div key={index} className="schedule-input-group">
//                             <input
//                                 type="time"
//                                 value={time}
//                                 onChange={(e) => handleScheduleChange(index, e.target.value)}
//                                 required
//                             />
//                             <button type="button" onClick={() => removeScheduleTime(index)} disabled={scheduleTimes.length === 1}>Remove</button>
//                         </div>
//                     ))}
//                     <button type="button" onClick={addScheduleTime}>+ Add Time</button>
                    
//                     <button type="submit" disabled={formLoading}>
//                         {formLoading ? 'Adding...' : 'Save Prescription'}
//                     </button>
//                 </form>
//             </div>

//             {/* View Existing Prescriptions */}
//             <div className="card list-view">
//                 <h3>Current Medications</h3>
//                 {loading && <p>Loading prescriptions...</p>}
//                 {!loading && prescriptions.length === 0 && <p>No active prescriptions found. Add one above!</p>}
                
//                 {!loading && prescriptions.length > 0 && (
//                     <ul>
//                         {prescriptions.map(p => (
//                             <li key={p.prescription_id}>
//                                 <strong>{p.name}</strong> - {p.dosage} 
//                                 <span> (Start: {p.start_date})</span>
//                             </li>
//                         ))}
//                     </ul>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default Prescriptions;



// frontend/src/components/Prescriptions.js

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const Prescriptions = () => {
    const { isAuthenticated, authenticatedRequest, user } = useAuth();
    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Form states for adding a new prescription
    const [medicineName, setMedicineName] = useState('');
    const [dosage, setDosage] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    // Schedule states (simplified for frontend demo)
    const [scheduleTimes, setScheduleTimes] = useState(['08:00', '20:00']); 
    const [formLoading, setFormLoading] = useState(false);

    // --- Data Fetching ---
    const fetchPrescriptions = async () => {
        if (!user) return; // Wait for user data
        setLoading(true);
        try {
            const data = await authenticatedRequest('get', '/prescriptions');
            setPrescriptions(data);
        } catch (err) {
            setError(err.toString());
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // If the user is authenticated, fetch their prescriptions
        if (isAuthenticated && user) {
            fetchPrescriptions();
        }
    }, [isAuthenticated, user]); 

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // --- Form Handling ---
    const handleAddPrescription = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        setError(null);

        const newPrescription = {
            medicineName,
            dosage,
            startDate,
            endDate: endDate || null, // Allow null for ongoing meds
            scheduleTimes, // Array of strings (e.g., ['08:00', '16:00'])
        };

        try {
            await authenticatedRequest('post', '/prescriptions', newPrescription);
            alert('Prescription added successfully!');
            // Clear form and refresh list
            setMedicineName('');
            setDosage('');
            setStartDate('');
            setEndDate('');
            setScheduleTimes(['08:00', '20:00']);
            fetchPrescriptions();

        } catch (err) {
            setError(err.toString());
        } finally {
            setFormLoading(false);
        }
    };
    
    // Simple helper to add/remove schedule times
    const handleScheduleChange = (index, value) => {
        const newTimes = [...scheduleTimes];
        newTimes[index] = value;
        setScheduleTimes(newTimes);
    };

    const addScheduleTime = () => setScheduleTimes([...scheduleTimes, '']);
    const removeScheduleTime = (index) => {
        setScheduleTimes(scheduleTimes.filter((_, i) => i !== index));
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
                    
                    <input type="text" placeholder="Medicine Name (e.g., Ibuprofen)" value={medicineName} onChange={(e) => setMedicineName(e.target.value)} required />
                    <input type="text" placeholder="Dosage (e.g., 20mg, 1 tablet)" value={dosage} onChange={(e) => setDosage(e.target.value)} required />
                    <input type="date" placeholder="Start Date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
                    <input type="date" placeholder="End Date (Optional)" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                    
                    <h4>Schedule Times (e.g., 08:00)</h4>
                    {scheduleTimes.map((time, index) => (
                        <div key={index} className="schedule-input-group">
                            <input
                                type="time"
                                value={time}
                                onChange={(e) => handleScheduleChange(index, e.target.value)}
                                required
                            />
                            <button type="button" onClick={() => removeScheduleTime(index)} disabled={scheduleTimes.length === 1}>Remove</button>
                        </div>
                    ))}
                    <button type="button" onClick={addScheduleTime}>+ Add Time</button>
                    
                    <button type="submit" disabled={formLoading}>
                        {formLoading ? 'Adding...' : 'Save Prescription'}
                    </button>
                </form>
            </div>

            {/* View Existing Prescriptions */}
            <div className="card list-view">
                <h3>Current Medications</h3>
                {loading && <p>Loading prescriptions...</p>}
                {!loading && prescriptions.length === 0 && <p>No active prescriptions found. Add one above!</p>}
                
                {!loading && prescriptions.length > 0 && (
                    <ul>
                        {prescriptions.map(p => (
                            <li key={p.prescription_id}>
                                <strong>{p.name}</strong> - {p.dosage} 
                                <span> (Start: {p.start_date})</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default Prescriptions;