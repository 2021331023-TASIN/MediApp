import React, { useState } from 'react';
import axios from 'axios';
import './Home.css'; // We'll create this specific CSS file for better modularity

const Home = () => {
       const [query, setQuery] = useState('');
       const [medication, setMedication] = useState(null);
       const [loading, setLoading] = useState(false);
       const [error, setError] = useState(null);
       const [searched, setSearched] = useState(false);

       const searchMedicine = async (e) => {
              e.preventDefault();
              if (!query.trim()) return;

              setLoading(true);
              setError(null);
              setMedication(null);
              setSearched(true);

              try {
                     // Using OpenFDA API
                     // search for brand_name OR generic_name
                     const response = await axios.get(`https://api.fda.gov/drug/label.json?search=openfda.brand_name:"${query}"+openfda.generic_name:"${query}"&limit=1`);

                     if (response.data.results && response.data.results.length > 0) {
                            setMedication(response.data.results[0]);
                     } else {
                            setError('No results found.');
                     }
              } catch (err) {
                     console.error("Search error:", err);
                     if (err.response && err.response.status === 404) {
                            setError('Medicine not found in the database. Please check the spelling or try a different name.');
                     } else {
                            setError('An error occurred while fetching data. Please try again later.');
                     }
              } finally {
                     setLoading(false);
              }
       };

       return (
              <div className="home-container">
                     <div className="hero-section">
                            <h1 className="main-heading">Find Your Medicine Information</h1>
                            <p className="sub-heading">Get details on effects, side effects, and more instantly.</p>

                            <form onSubmit={searchMedicine} className="search-form">
                                   <input
                                          type="text"
                                          className="search-input"
                                          placeholder="Enter medicine name (e.g. Aspirin)"
                                          value={query}
                                          onChange={(e) => setQuery(e.target.value)}
                                   />
                                   <button type="submit" className="search-button" disabled={loading}>
                                          {loading ? 'Searching...' : 'Search'}
                                   </button>
                            </form>
                     </div>

                     <div className="results-section">
                            {error && <div className="error-message-box">{error}</div>}

                            {medication && (
                                   <div className="medicine-card">
                                          <div className="medicine-header">
                                                 <h2>{medication.openfda?.brand_name?.[0] || query}</h2>
                                                 <span className="generic-name">({medication.openfda?.generic_name?.[0] || 'Generic Name N/A'})</span>
                                          </div>

                                          <div className="medicine-body">
                                                 {medication.purpose && (
                                                        <div className="info-group">
                                                               <h3>Purpose / Effect</h3>
                                                               <p>{medication.purpose[0]}</p>
                                                        </div>
                                                 )}

                                                 {medication.indications_and_usage && (
                                                        <div className="info-group">
                                                               <h3>Indications</h3>
                                                               <p>{medication.indications_and_usage[0]}</p>
                                                        </div>
                                                 )}

                                                 {medication.warnings && (
                                                        <div className="info-group warning-group">
                                                               <h3>⚠️ Warnings & Side Effects</h3>
                                                               <p>{medication.warnings[0]}</p>
                                                        </div>
                                                 )}

                                                 {medication.do_not_use && (
                                                        <div className="info-group danger-group">
                                                               <h3>Do Not Use</h3>
                                                               <p>{medication.do_not_use[0]}</p>
                                                        </div>
                                                 )}
                                          </div>
                                   </div>
                            )}
                     </div>
              </div>
       );
};

export default Home;
