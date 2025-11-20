// frontend/src/index.js

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AuthProvider } from './context/AuthContext'; // <-- VITAL IMPORT

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* <<< The FIX is making sure AuthProvider wraps App >>> */}
    <AuthProvider> 
      <App />
    </AuthProvider>
  </React.StrictMode>
);