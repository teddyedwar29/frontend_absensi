// src/App.jsx

import React, { useEffect, useRef, useState } from 'react'; // Menambahkan useState
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
import { isAuthenticated, getUserRole, logout } from './api/auth.js';
import ProfilePage from './pages/Profilepage.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

// Durasi timeout sesi dalam menit
const SESSION_TIMEOUT_MINUTES = 1; // Diatur ke 1 menit untuk pengujian

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
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(isAuthenticated()); // State baru untuk melacak status login
  const timeoutId = useRef(null); // Menggunakan useRef untuk menyimpan ID timeout

  // Fungsi untuk mereset timer logout
  const resetTimeout = () => {
    if (timeoutId.current) {
      clearTimeout(timeoutId.current);
    }
    
    if (isUserLoggedIn) { // Menggunakan state isUserLoggedIn
      console.log("Aktivitas terdeteksi, mereset timer...");
      timeoutId.current = setTimeout(() => {
        console.log(`Sesi berakhir setelah ${SESSION_TIMEOUT_MINUTES} menit tidak aktif. Melakukan logout.`);
        logout(); // Panggil fungsi logout jika timer habis
      }, SESSION_TIMEOUT_MINUTES * 60 * 1000);
      console.log(`Timer logout baru diatur untuk ${SESSION_TIMEOUT_MINUTES} menit.`);
    } else {
      console.log("Pengguna tidak terautentikasi, timer logout tidak diatur.");
      // Pastikan tidak ada timer yang berjalan jika tidak terautentikasi
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
      }
    }
  };

  // Fungsi untuk mengatur event listener aktivitas pengguna
  const setupActivityListeners = () => {
    window.addEventListener('mousemove', resetTimeout);
    window.addEventListener('keydown', resetTimeout);
    window.addEventListener('click', resetTimeout);
    window.addEventListener('scroll', resetTimeout);
    console.log("Event listeners aktivitas diatur.");
  };

  // Fungsi untuk membersihkan event listener
  const cleanupActivityListeners = () => {
    window.removeEventListener('mousemove', resetTimeout);
    window.removeEventListener('keydown', resetTimeout);
    window.removeEventListener('click', resetTimeout);
    window.removeEventListener('scroll', resetTimeout);
    console.log("Event listeners aktivitas dibersihkan.");
  };

  // Efek untuk mengelola timer dan event listener saat komponen mount/unmount
  useEffect(() => {
    console.log("App.jsx useEffect running. isUserLoggedIn:", isUserLoggedIn); // Log state baru
    // Initial setup based on current auth status
    if (isUserLoggedIn) { // Menggunakan state isUserLoggedIn
      setupActivityListeners();
      resetTimeout();
    } else {
      // If not authenticated on mount, ensure no listeners are active
      cleanupActivityListeners();
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
      }
    }

    // Cleanup function: membersihkan timer dan event listener saat komponen di-unmount
    return () => {
      console.log("App.jsx unmounted. Membersihkan timer dan listeners.");
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
      }
      cleanupActivityListeners();
    };
  }, [isUserLoggedIn]); // Dependensi pada state isUserLoggedIn

  // Efek untuk memperbarui state isUserLoggedIn setiap kali isAuthenticated() berubah
  useEffect(() => {
    const handleAuthStatusChange = () => { // Fungsi handler untuk custom event
      const currentAuthStatus = isAuthenticated();
      if (currentAuthStatus !== isUserLoggedIn) {
        setIsUserLoggedIn(currentAuthStatus);
        console.log("Auth status changed via custom event, updating isUserLoggedIn state.");
      }
    };

    // Panggil saat mount untuk inisialisasi
    handleAuthStatusChange();

    // Mendengarkan custom event 'authStatusChanged'
    window.addEventListener('authStatusChanged', handleAuthStatusChange);

    return () => {
      window.removeEventListener('authStatusChanged', handleAuthStatusChange);
    };
  }, [isUserLoggedIn]); // Dependensi pada isUserLoggedIn untuk memastikan listener terpasang dengan benar


  return (
    <Router>
      <Routes>
        {/* Rute Halaman Login */}
        {/* Jika user sudah login, langsung alihkan ke "gerbang" dashboard */}
        <Route 
          path="/" 
          element={
            isUserLoggedIn ? <DashboardDispatcher /> : <LoginPage /> // Menggunakan state isUserLoggedIn
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