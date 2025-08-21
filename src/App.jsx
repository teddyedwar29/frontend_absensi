import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoadingSpinner from './components/LoadingSpinner';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import { getUserRole } from './api/auth.js';
import { useSessionTimeout } from './hooks/useSessionTimeout'; // Import hook baru

// Lazy load semua halaman
const AdminTeamPage = lazy(() => import('./pages/Admin/TimSales.jsx'));
const LoginPage = lazy(() => import('./pages/LoginPage.jsx'));
const DashboardAdmin = lazy(() => import('./pages/Admin/Dashboard.jsx'));
const DashboardSales = lazy(() => import('./pages/Sales/Dashboard.jsx'));
const PageIzin = lazy(() => import('./pages/Admin/PageIzin.jsx'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage.jsx'));
const TrackingPage = lazy(() => import('./pages/Admin/TrackingPage.jsx'));
const KunjunganPage = lazy(() => import('./pages/Sales/Kunjungan.jsx'));
const ProfilePage = lazy(() => import('./pages/ProfilePage.jsx'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage.jsx'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage.jsx'));

const DashboardDispatcher = () => {
  const role = getUserRole();
  if (role === 'admin') return <Navigate to="/admin/dashboard" />;
  if (role === 'sales') return <Navigate to="/sales/dashboard" />;
  return <Navigate to="/" />; // Fallback jika role tidak terdefinisi
};

function App() {
  const { isUserLoggedIn, isLoggingOut } = useSessionTimeout();

  if (isLoggingOut) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Sedang logout...</div>
      </div>
    );
  }

  return (
    <Router>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          {/* Rute Publik */}
          <Route path="/" element={isUserLoggedIn ? <DashboardDispatcher /> : <LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          
          {/* Rute yang dilindungi (semua role) */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardDispatcher /></ProtectedRoute>} />
          <Route path="/admin/tracking/:username" element={<ProtectedRoute><TrackingPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

          {/* Rute khusus Admin */}
          <Route path="/admin/dashboard" element={<ProtectedRoute requiredRole="admin"><DashboardAdmin /></ProtectedRoute>} />
          <Route path="/admin/teams" element={<ProtectedRoute requiredRole="admin"><AdminTeamPage /></ProtectedRoute>} />
          <Route path="/admin/PageIzin" element={<ProtectedRoute requiredRole="admin"><PageIzin /></ProtectedRoute>} />
          
          {/* Rute khusus Sales */}
          <Route path="/sales/dashboard" element={<ProtectedRoute requiredRole="sales"><DashboardSales /></ProtectedRoute>} />
          <Route path="/sales/kunjungan" element={<ProtectedRoute requiredRole="sales"><KunjunganPage /></ProtectedRoute>} />
          
          {/* Rute Not Found */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;