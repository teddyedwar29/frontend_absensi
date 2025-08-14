// src/App.jsx

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Impor semua halaman dan komponen yang dibutuhkan
import AdminTeamPage from './pages/Admin/TimSales.jsx';
import LoginPage from './pages/LoginPage.jsx';
import DashboardAdmin from './pages/Admin/Dashboard.jsx';
import DashboardSales from './pages/Sales/Dashboard.jsx';
import PageIzin from './pages/Admin/PageIzin.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import TrackingPage from "./pages/Admin/TrackingPage";
import KunjunganPage from './pages/Sales/Kunjungan.jsx';
import { isAuthenticated, getUserRole, logout, login } from './api/auth.js';
import ProfilePage from './pages/Profilepage.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import Swal from 'sweetalert2';

// Durasi timeout sesi dalam menit
const SESSION_TIMEOUT_MINUTES = 1;

/**
 * DashboardDispatcher
 */
const DashboardDispatcher = () => {
  const role = getUserRole();

  if (role === 'admin') {
    return <Navigate to="/admin/dashboard" />;
  }
  
  if (role === 'sales') {
    return <Navigate to="/sales/dashboard" />;
  }

  return <Navigate to="/" />; 
};

function App() {
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(isAuthenticated());
  const [userRole, setUserRole] = useState(null);
  const timeoutId = useRef(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const listenersSetup = useRef(false); // Track apakah listeners sudah di-setup

  // Ambil role user dari localStorage saat pertama kali render
  useEffect(() => {
    const role = localStorage.getItem('userRole');
    setUserRole(role);
  }, []);

  // 🔧 FUNGSI LOGOUT YANG PROPER
  const handleAutoLogout = useCallback(async () => {
    if (isLoggingOut) return;
    
    console.log('🔐 Auto logout triggered');
    setIsLoggingOut(true);
    
    try {
      // Clear timer
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
        timeoutId.current = null;
      }

      // Clear listeners flag
      listenersSetup.current = false;

      // Show notification
      await Swal.fire({
        title: 'Sesi Berakhir',
        text: 'Anda tidak aktif selama 1 menit. Sesi akan berakhir.',
        icon: 'warning',
        confirmButtonText: 'OK',
        allowOutsideClick: false,
        allowEscapeKey: false
      });

      // Clear auth data
      logout();
      
      // Update state dengan sedikit delay untuk smooth transition
      setTimeout(() => {
        setIsUserLoggedIn(false);
        setIsLoggingOut(false);
      }, 100);
      
    } catch (error) {
      console.error('Error during auto logout:', error);
      setIsLoggingOut(false);
    }
  }, [isLoggingOut]);

  // 🔧 FUNGSI RESET TIMER DENGAN useCallback
  const resetTimeout = useCallback(() => {
    if (isLoggingOut || !isUserLoggedIn) return;
    
    // Clear existing timer
    if (timeoutId.current) {
      clearTimeout(timeoutId.current);
    }
    
    // Set new timer
    timeoutId.current = setTimeout(() => {
      handleAutoLogout();
    }, SESSION_TIMEOUT_MINUTES * 60 * 1000);
    
    // Only log occasionally to prevent spam
    if (Math.random() < 0.01) { // 1% chance to log
      console.log("Timer reset");
    }
  }, [isLoggingOut, isUserLoggedIn, handleAutoLogout]);

  // 🔧 SETUP EVENT LISTENERS HANYA SEKALI
  useEffect(() => {
    if (!isUserLoggedIn || isLoggingOut || listenersSetup.current) {
      return;
    }

    console.log("Setting up activity listeners...");
    
    // Gunakan passive listeners untuk performa lebih baik
    const events = ['mousedown', 'keydown', 'touchstart', 'scroll'];
    
    events.forEach(event => {
      document.addEventListener(event, resetTimeout, { passive: true });
    });
    
    listenersSetup.current = true;
    
    // Setup initial timer
    resetTimeout();

    // Cleanup function
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

  // 🔧 MONITOR AUTH STATUS CHANGES
  useEffect(() => {
    const checkAuthStatus = () => {
      if (isLoggingOut) return;
      
      const currentAuthStatus = isAuthenticated();
      
      if (currentAuthStatus !== isUserLoggedIn) {
        console.log("Auth status changed:", currentAuthStatus);
        setIsUserLoggedIn(currentAuthStatus);
        
        // Clear timer if logging out
        if (!currentAuthStatus && timeoutId.current) {
          clearTimeout(timeoutId.current);
          timeoutId.current = null;
          listenersSetup.current = false;
        }
      }
    };

    // Check on mount
    checkAuthStatus();

    // Listen for custom auth events
    window.addEventListener('authStatusChanged', checkAuthStatus);

    return () => {
      window.removeEventListener('authStatusChanged', checkAuthStatus);
    };
  }, [isUserLoggedIn, isLoggingOut]);

  // 🔧 CLEANUP ON UNMOUNT
  useEffect(() => {
    return () => {
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
      }
    };
  }, []);

  // Don't render anything while logging out
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

  return (
    <Router>
      <Routes>
        {/* Login Route */}
        <Route 
          path="/" 
          element={
            isUserLoggedIn ? <DashboardDispatcher /> : <LoginPage />
          } 
        />

        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Protected Routes */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardDispatcher />
            </ProtectedRoute>
          } 
        />

        {/* Admin Routes */}
        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedRoute requiredRole="admin">
              <DashboardAdmin />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/admin/tracking/:username" 
          element={
            <ProtectedRoute>
              <TrackingPage />
            </ProtectedRoute>
          } 
        />
        
        <Route
          path="/admin/teams"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminTeamPage />
            </ProtectedRoute>
          }
        />

        <Route 
          path="/admin/PageIzin" 
          element={
            <ProtectedRoute requiredRole="admin">
              <PageIzin />
            </ProtectedRoute>
          }
        />
        
        {/* Sales Routes */}
        <Route 
          path="/sales/dashboard" 
          element={
            <ProtectedRoute requiredRole="sales">
              <DashboardSales />
            </ProtectedRoute>
          } 
        />

        <Route
          path="/sales/kunjungan"
          element={
            <ProtectedRoute requiredRole="sales">
              <KunjunganPage />
            </ProtectedRoute>
          } 
        />

        {/* Profile Route */}
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } 
        />
        
        {/* 404 Route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;

// Setelah login sukses
// localStorage.setItem('userRole', response.data.role);

// Contoh di LoginPage.jsx
// const handleLogin = async () => {
//   const response = await loginAPI(email, password);
//   if (response.success) {
//     localStorage.setItem('userRole', response.data.role); // 'admin' atau 'sales'
//     // ...lanjutkan proses login...
//   }
// };