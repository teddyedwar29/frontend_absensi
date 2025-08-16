import React, { useEffect, useRef, useState, useCallback, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoadingSpinner from './components/LoadingSpinner';
import { isAuthenticated, getUserRole, logout } from './api/auth.js';
import Swal from 'sweetalert2';
import ProtectedRoute from './components/ProtectedRoute.jsx';

// Lazy load semua halaman
const AdminTeamPage = lazy(() => import('./pages/Admin/TimSales.jsx'));
const LoginPage = lazy(() => import('./pages/LoginPage.jsx'));
const DashboardAdmin = lazy(() => import('./pages/Admin/Dashboard.jsx'));
const DashboardSales = lazy(() => import('./pages/Sales/Dashboard.jsx'));
const PageIzin = lazy(() => import('./pages/Admin/PageIzin.jsx'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage.jsx'));
const TrackingPage = lazy(() => import('./pages/Admin/TrackingPage.jsx'));
const KunjunganPage = lazy(() => import('./pages/Sales/Kunjungan.jsx'));
const ProfilePage = lazy(() => import('./pages/Profilepage.jsx'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage.jsx'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage.jsx'));

// Durasi timeout sesi dalam menit
const SESSION_TIMEOUT_MINUTES = 10;

const DashboardDispatcher = () => {
  const role = getUserRole();

  if (role === 'admin') return <Navigate to="/admin/dashboard" />;
  if (role === 'sales') return <Navigate to="/sales/dashboard" />;
  return <Navigate to="/" />;
};

function App() {
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(isAuthenticated());
  const [userRole, setUserRole] = useState(null);
  const timeoutId = useRef(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const listenersSetup = useRef(false);

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    setUserRole(role);
  }, []);

  const handleAutoLogout = useCallback(async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);

    if (timeoutId.current) {
      clearTimeout(timeoutId.current);
      timeoutId.current = null;
    }
    listenersSetup.current = false;

    await Swal.fire({
      title: 'Sesi Berakhir',
      text: 'Anda tidak aktif selama 10 menit. Sesi akan berakhir.',
      icon: 'warning',
      confirmButtonText: 'OK',
      allowOutsideClick: false,
      allowEscapeKey: false
    });

    logout();
    setTimeout(() => {
      setIsUserLoggedIn(false);
      setIsLoggingOut(false);
    }, 100); //waktu timer menunggu berapa lama dia di dalam website sebelum logout
  }, [isLoggingOut]);

  const resetTimeout = useCallback(() => {
    if (isLoggingOut || !isUserLoggedIn) return;
    if (timeoutId.current) clearTimeout(timeoutId.current);
    timeoutId.current = setTimeout(() => {
      handleAutoLogout();
    }, SESSION_TIMEOUT_MINUTES * 60 * 1000);
  }, [isLoggingOut, isUserLoggedIn, handleAutoLogout]);

  useEffect(() => {
    if (!isUserLoggedIn || isLoggingOut || listenersSetup.current) return;
    const events = ['mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach(event => {
      document.addEventListener(event, resetTimeout, { passive: true });
    });
    listenersSetup.current = true;
    resetTimeout();

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, resetTimeout);
      });
      if (timeoutId.current) clearTimeout(timeoutId.current);
      listenersSetup.current = false;
    };
  }, [isUserLoggedIn, isLoggingOut, resetTimeout]);

  useEffect(() => {
    const checkAuthStatus = () => {
      if (isLoggingOut) return;
      const currentAuthStatus = isAuthenticated();
      if (currentAuthStatus !== isUserLoggedIn) {
        setIsUserLoggedIn(currentAuthStatus);
        if (!currentAuthStatus && timeoutId.current) {
          clearTimeout(timeoutId.current);
          timeoutId.current = null;
          listenersSetup.current = false;
        }
      }
    };
    checkAuthStatus();
    window.addEventListener('authStatusChanged', checkAuthStatus);
    return () => {
      window.removeEventListener('authStatusChanged', checkAuthStatus);
    };
  }, [isUserLoggedIn, isLoggingOut]);

  useEffect(() => {
    return () => {
      if (timeoutId.current) clearTimeout(timeoutId.current);
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

  return (
    <Router>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/" element={isUserLoggedIn ? <DashboardDispatcher /> : <LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardDispatcher /></ProtectedRoute>} />
          <Route path="/admin/dashboard" element={<ProtectedRoute requiredRole="admin"><DashboardAdmin /></ProtectedRoute>} />
          <Route path="/admin/tracking/:username" element={<ProtectedRoute><TrackingPage /></ProtectedRoute>} />
          <Route path="/admin/teams" element={<ProtectedRoute requiredRole="admin"><AdminTeamPage /></ProtectedRoute>} />
          <Route path="/admin/PageIzin" element={<ProtectedRoute requiredRole="admin"><PageIzin /></ProtectedRoute>} />
          <Route path="/sales/dashboard" element={<ProtectedRoute requiredRole="sales"><DashboardSales /></ProtectedRoute>} />
          <Route path="/sales/kunjungan" element={<ProtectedRoute requiredRole="sales"><KunjunganPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;