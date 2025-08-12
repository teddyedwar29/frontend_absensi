// src/components/DashboardLayout.jsx

import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation  } from 'react-router-dom';
import Swal from 'sweetalert2';
import { Menu, X, LogOut, TrendingUp, Calendar, Users, MapPin, Bell, Settings, FileText, User } from 'lucide-react';
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
      { to: '/admin/PageIzin', label: 'Cek Pengajuan Izin', icon: Users},
     { to: '#', label: 'Lokasi cabang kantor', icon: MapPin, isComingSoon: true },
    { to: '#', label: 'Laporan keuangan', icon: FileText, isComingSoon: true } // Ganti ikon Bell jadi FileText biar lebih cocok
   );
  } else if (userRole === 'sales') {
    navLinks.push(
      { to: '/sales/dashboard', label: 'Dashboard', icon: TrendingUp },
      { to: '/sales/teams', label: 'Tim Sales', icon: Users },
      { to: '/sales/kunjungan', label: 'Kunjungan', icon: MapPin }
    );
  }

  const getActiveLinkClass = (path) => {
    return window.location.pathname === path ? 'bg-blue-700 text-white border-r-4 border-blue-400' : 'text-blue-100 hover:bg-blue-700 hover:text-white';
  };

  const Sidebar = () => (
    <div className={`fixed inset-y-0 left-0 z-[1000] w-64 bg-gradient-to-b from-blue-900 to-blue-800 text-white transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
      <div className="flex items-center justify-between h-16 px-6 border-b border-blue-700">
        <h1 className="text-xl font-bold">TEKMO 😎</h1>
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
      {sidebarOpen && <div className="fixed inset-0 z-[999] bg-black bg-opacity-25 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <div className="flex-1 flex flex-col overflow-hidden">
             {/* --- MULAI PERBAIKAN DARI SINI --- */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Tombol Menu untuk Mobile */}
                        <div className="flex items-center">
                          <h1>selamat datang bosku 😍</h1>
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="lg:hidden text-gray-500 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                            >
                                <Menu size={24} />
                            </button>
                        </div>
                        
                        {/* Kartu Profil di Kanan */}
                        <div className="flex items-center">
                            <div className="flex items-center space-x-4">
                                <div className="text-right">
                                    <p className="font-semibold text-sm text-gray-800">{userName}</p>
                                    <p className="text-xs text-gray-500 capitalize">{userRole}</p>
                                </div>
                                <Link to="/profile" className="cursor-pointer">
                                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                                        {userName.charAt(0).toUpperCase()}
                                    </div>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </header>
            {/* --- AKHIR PERBAIKAN --- */}

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
