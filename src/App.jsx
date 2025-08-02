import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/loginPage.jsx';
import Dashboard from './components/Dashboard.jsx'; // Assuming you have a Dashboard component
import ProtectedRoute from  './components/ProtectedRoute.jsx';
import { isAuthenticated } from './api/auth'; // Assuming you have an auth API for checking authentication
import Absensi from './pages/Absensi.jsx'; // Assuming you have an Absensi component
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          {/* Redirect to dashboard if already logged in */}
          <Route 
            path="/" 
            element={
              isAuthenticated() ? <Navigate to="/LoginForm" replace /> : <LoginPage />
            } 
          />
          
          {/* Protected dashboard route */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />

          <Route
            path="/absensi" 
            element={
              <ProtectedRoute>
                <Absensi />
              </ProtectedRoute>
            }
          />
          
          {/* Catch all route - redirect to login */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;