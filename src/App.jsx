// src/App.jsx

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminTeamPage from './pages/Admin/TimSales.jsx';

// Impor semua halaman dan komponen yang dibutuhkan
import LoginPage from './pages/LoginPage.jsx';
import DashboardAdmin from './pages/Admin/Dashboard.jsx';
import DashboardSales from './pages/Sales/Dashboard.jsx';
import PageIzin from './pages/Admin/PageIzin.jsx'; // Impor halaman Izin

import NotFoundPage from './pages/NotFoundPage.jsx'; // Nanti kita buat file ini
import TrackingPage from "./pages/Admin/TrackingPage";
import KunjunganPage from './pages/Sales/Kunjungan.jsx';
import { isAuthenticated, getUserRole, logout } from './api/auth.js';
import ProfilePage from './pages/Profilepage.jsx'; // Impor halaman profil
// Impor ProtectedRoute yang lebih canggih untuk role-based access
import ProtectedRoute from './components/ProtectedRoute.jsx';
import ForgotPasswordPage from './pages/ForgotPasswordPage'; // Impor halaman baru
import ResetPasswordPage from './pages/ResetPasswordPage';


/**
 * DashboardDispatcher
 * Komponen ini berfungsi sebagai 'gerbang' utama setelah login.
 * Tugasnya adalah memeriksa role pengguna dan mengarahkan ke dashboard yang sesuai.
 */
const DashboardDispatcher = () => {
  const role = getUserRole();

  if (role === 'admin') {
    return <Navigate to="/admin/dashboard" />;
  }
  
  if (role === 'sales') {
    return <Navigate to="/sales/dashboard" />;
  }

  // Jika tidak ada role atau role tidak dikenal, kembalikan ke login
  return <Navigate to="/" />; 
};


function App() {
  return (
    <Router>
      <Routes>
        {/* Rute Halaman Login */}
        {/* Jika user sudah login, langsung alihkan ke "gerbang" dashboard */}
        <Route 
          path="/" 
          element={
            isAuthenticated() ? <DashboardDispatcher /> : <LoginPage />
          } 
        />

        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* --- Rute yang Dilindungi (Protected Routes) --- */}

        {/* Gerbang Utama: Meneruskan user ke dashboard yang sesuai berdasarkan role */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardDispatcher />
            </ProtectedRoute>
          } 
        />

        {/* Rute untuk Admin */}
        <Route 
          path="/admin/dashboard" 
          element={
            // ProtectedRoute kini memeriksa token DAN role yang diperlukan
            <ProtectedRoute requiredRole="admin">
              <DashboardAdmin />
            </ProtectedRoute>
          } 
        />
          {/* DAFTARKAN RUTE BARU DI SINI */}
              <Route 
              path="/admin/tracking/:username" 
              element={
              <ProtectedRoute>
              <TrackingPage />
              </ProtectedRoute>
            } />
        {/* Rute baru untuk Tim Sales (khusus Admin) */}
        <Route
          path="/admin/teams"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminTeamPage />
            </ProtectedRoute>
          }
        />

        {/* Rute untuk halaman Izin */}
        <Route 
          path="/admin/PageIzin" 
          element={
            <ProtectedRoute requiredRole="admin">
              <PageIzin />
            </ProtectedRoute>
          }
        />
        
        {/* Rute untuk Sales */}
        <Route 
          path="/sales/dashboard" 
          element={
            // ProtectedRoute kini memeriksa token DAN role yang diperlukan
            <ProtectedRoute requiredRole="sales">
              <DashboardSales />
            </ProtectedRoute>
          } 
        />


     {/* rute untuk halaman Profil */}
      <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } 
        />

        {/* Rute Kunjungan untuk Sales */}
        <Route
          path="/sales/kunjungan"
          element={
            <ProtectedRoute requiredRole="sales">
              <KunjunganPage />
            </ProtectedRoute>
          } 
        />
     
        
        {/* Rute lain bisa ditambahkan di sini, misalnya halaman untuk Tim Sales atau Kunjungan */}
        
        {/* Catch-all Route: Menampilkan halaman 404 Not Found untuk rute yang tidak ada */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;
