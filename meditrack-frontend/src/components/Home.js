import React, { useState } from 'react';
import apiService from '../services/apiService';
import './Home.css';
import medicalImg from '../assets/medical.jpg';
import doctorImg from '../assets/images.jpeg';
import healthImg from '../assets/HealthCare.avif';

const Home = () => {
       const [query, setQuery] = useState('');
       const [medication, setMedication] = useState(null);
       const [loading, setLoading] = useState(false);
       const [error, setError] = useState(null);

       const searchMedicine = async (e) => {
              e.preventDefault();
              if (!query.trim()) return;

              setLoading(true);
              setError(null);
              setMedication(null);

              try {
                     const data = await apiService.searchMedicine(query);

                     if (data.results && data.results.length > 0) {
                            setMedication(data.results[0]);
                     } else {
                            setError('No results found.');
                     }
              } catch (err) {
                     console.error("Search error:", err);
                     setError(err.message || 'An error occurred while fetching data. Please try again later.');
              } finally {
                     setLoading(false);
              }
       };


       return (
              <div className="home-container-wrapper">
                     <div className="hero-section" style={{ backgroundImage: `linear-gradient(rgba(16, 132, 126, 0.55), rgba(16, 132, 126, 0.35)), url(${medicalImg})` }}>
                            <div className="hero-content">
                                   <h1 className="main-heading">Expert Medicine Information</h1>
                                   <p className="sub-heading">Get verified details on effects, side effects, and more instantly.</p>

                                   <form onSubmit={searchMedicine} className="search-form">
                                          <input
                                                 type="text"
                                                 className="search-input"
                                                 placeholder="Search medicine (e.g. Aspirin)"
                                                 value={query}
                                                 onChange={(e) => setQuery(e.target.value)}
                                          />
                                          <button type="submit" className="search-button" disabled={loading}>
                                                 {loading ? 'Searching...' : 'Search'}
                                          </button>
                                   </form>
                            </div>
                     </div>

                     <div className="services-overview">
                            <div className="service-card">
                                   <div className="service-img-container">
                                          <img src={doctorImg} alt="Health Expert" className="service-img" />
                                   </div>
                                   <div className="service-text">
                                          <h3>Professional Insights</h3>
                                          <p>Access pharmaceutical data verified by international standards for your safety.</p>
                                   </div>
                            </div>
                            <div className="service-card">
                                   <div className="service-img-container">
                                          <img src={healthImg} alt="Healthcare Technology" className="service-img" />
                                   </div>
                                   <div className="service-text">
                                          <h3>Health Monitoring</h3>
                                          <p>Advanced tracking for your vitals, BMI, and prescriptions in one place.</p>
                                   </div>
                            </div>
                     </div>

                     <div className="home-container">
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
              </div>
       );
};

export default Home;
