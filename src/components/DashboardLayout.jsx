// src/components/DashboardLayout.jsx

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { Menu, X, LogOut, TrendingUp, Calendar, Users, MapPin, Bell, Settings, FileText } from 'lucide-react';
import { logout } from '../api/auth';

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();
  const userName = localStorage.getItem('username') || 'Pengguna';

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    setUserRole(role);
  }, []);

  const handleLogout = () => {
    Swal.fire({
      title: 'Apakah kamu yakin ingin logout?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, Logout!',
      cancelButtonText: 'Batal'
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
      }
    });
  };

  const handleComingSoon = (e) => {
    e.preventDefault(); // Mencegah link berpindah halaman
    Swal.fire({
        title: 'Segera Hadir!',
        text: 'Fitur ini sedang dalam pengembangan.',
        icon: 'info',
        confirmButtonText: 'Mengerti'
    });
    setSidebarOpen(false); // Menutup sidebar di mobile setelah diklik
  };

  const navLinks = [];

  if (userRole === 'admin') {
    navLinks.push(
      { to: '/admin/dashboard', label: 'Dashboard', icon: TrendingUp },
      { to: '/admin/teams', label: 'Tim Sales', icon: Users },
     { to: '#', label: 'Lokasi cabang kantor', icon: MapPin, isComingSoon: true },
    { to: '#', label: 'Laporan keuangan', icon: FileText, isComingSoon: true } // Ganti ikon Bell jadi FileText biar lebih cocok
   );
  } else if (userRole === 'sales') {
    navLinks.push(
      { to: '/sales/dashboard', label: 'Dashboard', icon: TrendingUp },
      { to: '/sales/absensi', label: 'Absensi', icon: Calendar },
      { to: '/sales/teams', label: 'Tim Sales', icon: Users },
      { to: '/sales/kunjungan', label: 'Kunjungan', icon: MapPin }
    );
  }

  const getActiveLinkClass = (path) => {
    return window.location.pathname === path ? 'bg-blue-700 text-white border-r-4 border-blue-400' : 'text-blue-100 hover:bg-blue-700 hover:text-white';
  };

  const Sidebar = () => (
    <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-blue-900 to-blue-800 text-white transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
      <div className="flex items-center justify-between h-16 px-6 border-b border-blue-700">
        <h1 className="text-xl font-bold">AbsensiPro</h1>
        <button onClick={() => setSidebarOpen(false)} className="lg:hidden"><X size={24} /></button>
      </div>
      <nav className="mt-8">
        <div className="px-6 py-3"><p className="text-blue-200 text-sm font-medium">MENU UTAMA</p></div>
      {navLinks.map((link) => {
    // Jika link ditandai sebagai 'isComingSoon'
    if (link.isComingSoon) {
        return (
            <button
                key={link.label}
                onClick={handleComingSoon}
                className={`flex w-full items-center px-6 py-3 transition-colors text-blue-100 hover:bg-blue-700 hover:text-white`}
            >
                <link.icon size={20} className="mr-3" /> {link.label}
            </button>
        );
    }
    // Jika tidak, tampilkan <Link> seperti biasa
    return (
        <Link
            key={link.to}
            to={link.to}
            className={`flex items-center px-6 py-3 transition-colors ${getActiveLinkClass(link.to)}`}
            onClick={() => setSidebarOpen(false)}
        >
            <link.icon size={20} className="mr-3" /> {link.label}
        </Link>
    );
})}

        <button onClick={handleLogout} className="flex w-full items-center px-6 py-3 text-blue-100 hover:bg-blue-700 hover:text-white transition-colors mt-8 cursor-pointer">
          <LogOut size={20} className="mr-3" /> Keluar
        </button>
      </nav>
    </div> 
  );

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black bg-opacity-25 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden mr-4"><Menu size={24} /></button>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
                <p className="text-gray-600">Selamat datang kembali, {userName}!</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                {userName.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
