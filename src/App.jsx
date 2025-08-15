// src/App.jsx (Setelah diperbaiki)

import React, { useEffect, useRef, useState, useCallback } from 'react'; // 💡 Hapus Suspense dari sini
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { isAuthenticated, getUserRole, logout } from './api/auth.js';
import Swal from 'sweetalert2';

// Import komponen lazy loading seperti biasa
const AdminTeamPage = React.lazy(() => import('./pages/Admin/TimSales.jsx'));
const LoginPage = React.lazy(() => import('./pages/LoginPage.jsx'));
const DashboardAdmin = React.lazy(() => import('./pages/Admin/Dashboard.jsx'));
const DashboardSales = React.lazy(() => import('./pages/Sales/Dashboard.jsx'));
const PageIzin = React.lazy(() => import('./pages/Admin/PageIzin.jsx'));
const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage.jsx'));
const TrackingPage = React.lazy(() => import('./pages/Admin/TrackingPage'));
const KunjunganPage = React.lazy(() => import('./pages/Sales/Kunjungan.jsx'));
const ProfilePage = React.lazy(() => import('./pages/Profilepage.jsx'));
const ForgotPasswordPage = React.lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = React.lazy(() => import('./pages/ResetPasswordPage'));
import ProtectedRoute from './components/ProtectedRoute.jsx'; // Import statis

// ... (kode DashboardDispatcher, handleAutoLogout, dan lainnya tetap sama)

function App() {
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(isAuthenticated());
  const [userRole, setUserRole] = useState(null);
  const timeoutId = useRef(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const listenersSetup = useRef(false);

  useEffect(() => {
    const role = sessionStorage.getItem('userRole');
    setUserRole(role);
  }, []);

  const handleAutoLogout = useCallback(async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    
    try {
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
        timeoutId.current = null;
      }
      listenersSetup.current = false;
      await Swal.fire({
        title: 'Sesi Berakhir',
        text: 'Anda tidak aktif selama 1 menit. Sesi akan berakhir.',
        icon: 'warning',
        confirmButtonText: 'OK',
        allowOutsideClick: false,
        allowEscapeKey: false
      });
      logout();
      setTimeout(() => {
        setIsUserLoggedIn(false);
        setIsLoggingOut(false);
      }, 100);
    } catch (error) {
      console.error('Error during auto logout:', error);
      setIsLoggingOut(false);
    }
  }, [isLoggingOut]);

  const resetTimeout = useCallback(() => {
    if (isLoggingOut || !isUserLoggedIn) return;
    if (timeoutId.current) {
      clearTimeout(timeoutId.current);
    }
    timeoutId.current = setTimeout(() => {
      handleAutoLogout();
    }, 1 * 60 * 1000);
    if (Math.random() < 0.01) {
      console.log("Timer reset");
    }
  }, [isLoggingOut, isUserLoggedIn, handleAutoLogout]);

  useEffect(() => {
    if (!isUserLoggedIn || isLoggingOut || listenersSetup.current) {
      return;
    }
    console.log("Setting up activity listeners...");
    const events = ['mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach(event => {
      document.addEventListener(event, resetTimeout, { passive: true });
    });
    listenersSetup.current = true;
    resetTimeout();
    return () => {
      console.log("Cleaning up activity listeners...");
      events.forEach(event => {
        document.removeEventListener(event, resetTimeout);
      });
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
        timeoutId.current = null;
      }
      listenersSetup.current = false;
    };
  }, [isUserLoggedIn, isLoggingOut, resetTimeout]);

  useEffect(() => {
    return () => {
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
      }
    };
  }, []);

  if (isLoggingOut) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        backgroundColor: '#f5f5f5'
      }}>
        <div>
          <div>Sedang logout...</div>
          <div style={{ fontSize: '14px', marginTop: '10px', opacity: 0.7 }}>
            Mohon tunggu sebentar
          </div>
        </div>
      </div>
    );
  }

  const DashboardDispatcher = () => {
    const role = getUserRole();
    if (role === 'admin') return <Navigate to="/admin/dashboard" />;
    if (role === 'sales') return <Navigate to="/sales/dashboard" />;
    return <Navigate to="/" />;
  };

  return (
    <Router>
      {/* 💡 Hapus Suspense di sini */}
      <Routes>
        {/* Login Route (tidak perlu ProtectedRoute atau Suspense di sini) */}
        <Route path="/" element={isUserLoggedIn ? <DashboardDispatcher /> : <LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        
        {/* Protected Routes - Mengoper Component sebagai prop */}
        <Route 
          path="/dashboard" 
          element={<ProtectedRoute Component={DashboardDispatcher} />} 
        />
        <Route 
          path="/admin/dashboard" 
          element={<ProtectedRoute requiredRole="admin" Component={DashboardAdmin} />} 
        />
        <Route 
          path="/admin/teams" 
          element={<ProtectedRoute requiredRole="admin" Component={AdminTeamPage} />}
        />
        <Route 
          path="/admin/PageIzin" 
          element={<ProtectedRoute requiredRole="admin" Component={PageIzin} />}
        />
        <Route 
          path="/admin/tracking/:username" 
          element={<ProtectedRoute Component={TrackingPage} />} 
        />
        <Route 
          path="/sales/dashboard" 
          element={<ProtectedRoute requiredRole="sales" Component={DashboardSales} />} 
        />
        <Route
          path="/sales/kunjungan"
          element={<ProtectedRoute requiredRole="sales" Component={KunjunganPage} />} 
        />
        <Route 
          path="/profile" 
          element={<ProtectedRoute Component={ProfilePage} />} 
        />
        
        {/* 404 Route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;