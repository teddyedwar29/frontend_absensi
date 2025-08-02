import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AbsensiPage from './pages/Sales/Absensi.jsx'; 

// 1. Impor semua halaman dan komponen yang dibutuhkan
import LoginPage from './pages/LoginPage.jsx';
import AdminDashboard from './pages/Admin/Dashboard.jsx'; // Dashboard untuk Admin/Manager
import SalesDashboard from './pages/Sales/Dashboard.jsx'; // Dashboard untuk Sales
import ProtectedRoute from './components/ProtectedRoute.jsx';

// 2. Impor fungsi-fungsi penting dari auth.js
import { isAuthenticated, getUserRole, logout } from './api/auth.js';

// Komponen kecil untuk mengarahkan berdasarkan role
const DashboardDispatcher = () => {
  const role = getUserRole();

  // PENTING: Sesuaikan 'manager' dan 'sales' dengan nama role dari backend Anda
  if (role === 'admin') {
    return <Navigate to="/admin/dashboard" />;
  }
  
  if (role === 'sales') {
    return <Navigate to="/sales/dashboard" />;
  }

  // Jika role tidak dikenali, kembalikan ke login untuk mencegah error
  // Ini juga akan menangani logout, karena role akan menjadi null
  return <Navigate to="/" />; 
};


function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Rute Halaman Login */}
          <Route 
            path="/" 
            element={
              // Jika sudah login, langsung lempar ke "gerbang" dashboard
              isAuthenticated() ? <Navigate to="/dashboard" /> : <LoginPage />
            } 
          />
          
          {/* Rute "Gerbang" atau Pengecekan Role */}
          {/* Rute ini hanya bisa diakses jika sudah login */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardDispatcher />
              </ProtectedRoute>
            } 
          />

          {/* Rute Spesifik untuk Admin */}
          <Route 
            path="/admin/dashboard" 
            element={
              // ProtectedRoute akan mengecek token DAN role 'manager'
              <ProtectedRoute role="admin">
                <AdminDashboard onLogout={logout} />
              </ProtectedRoute>
            } 
          />

          {/* Rute Spesifik untuk Sales */}
          <Route 
            path="/sales/dashboard" 
            element={
              // ProtectedRoute akan mengecek token DAN role 'sales'
              <ProtectedRoute role="sales">
                <SalesDashboard onLogout={logout} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/sales/absensi" 
            element={
              <ProtectedRoute role="sales">
                <AbsensiPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Catch all route - redirect ke gerbang utama jika sudah login, atau ke login jika belum */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;