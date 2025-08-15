// src/components/DashboardLayout.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { Menu, X, LogOut, TrendingUp, Users, MapPin, FileText, Download, ChevronDown, ChevronRight, Calendar } from 'lucide-react';
import { logout } from '../api/auth';

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [exportOpen, setExportOpen] = useState(false);
  const userName = localStorage.getItem('username') || 'Pengguna';

  useEffect(() => {
    setUserRole(sessionStorage.getItem('userRole'));
  }, []);

  const handleLogout = () => {
    Swal.fire({
      title: 'Yakin logout?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya!',
      cancelButtonText: 'Batal'
    }).then((result) => result.isConfirmed && logout());
  };

  const handleComingSoon = (e) => {
    e.preventDefault();
    Swal.fire('Segera Hadir!', 'Fitur dalam pengembangan.', 'info');
    setSidebarOpen(false);
  };

  const handleExport = async (type) => {
    try {
      Swal.fire({
        title: 'Mengekspor...',
        text: `Menyiapkan ${type}`,
        allowOutsideClick: false,
        showConfirmButton: false,
        willOpen: () => Swal.showLoading()
      });

      const API = (await import('../api/auth')).default;
      const response = await API.get(`/export/${type}`, { responseType: 'blob' });
      
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${type}_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      Swal.fire('Berhasil!', `${type} berhasil diunduh.`, 'success');
      setExportOpen(false);
      setSidebarOpen(false);

    } catch (error) {
      let msg = 'Gagal mengekspor data.';
      if (error.response?.status === 404) msg = 'Endpoint tidak ditemukan.';
      else if (error.response?.status === 403) msg = 'Tidak ada akses.';
      else if (error.response?.data?.message) msg = error.response.data.message;
      
      Swal.fire('Gagal!', msg, 'error');
    }
  };

  const navItems = userRole === 'admin' ? [
    { to: '/admin/dashboard', label: 'Dashboard', icon: TrendingUp },
    { to: '/admin/teams', label: 'Tim Sales', icon: Users },
    { to: '/admin/PageIzin', label: 'Pengajuan Izin', icon: Users },
    { to: '#', label: 'Lokasi Kantor', icon: MapPin, soon: true },
    { to: '#', label: 'Laporan', icon: FileText, soon: true }
  ] : [
    { to: '/sales/dashboard', label: 'Dashboard', icon: TrendingUp },
    { to: '/sales/kunjungan', label: 'Kunjungan', icon: MapPin }
  ];

  const isActive = (path) => window.location.pathname === path;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-[1000] w-64 bg-gradient-to-b from-blue-900 to-blue-800 text-white transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-200 lg:translate-x-0 lg:static`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-blue-700">
          <h1 className="text-xl font-bold">TEKMO 😎</h1>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
            <X size={24} />
          </button>
        </div>
        
        <nav className="mt-8">
          <div className="px-6 py-3">
            <p className="text-blue-200 text-sm font-medium">MENU UTAMA</p>
          </div>
          
          {navItems.map((item) => (
            item.soon ? (
              <button
                key={item.label}
                onClick={handleComingSoon}
                className="flex w-full items-center px-6 py-3 text-blue-100 hover:bg-blue-700 hover:text-white transition-colors"
              >
                <item.icon size={20} className="mr-3" />
                {item.label}
              </button>
            ) : (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center px-6 py-3 transition-colors ${
                  isActive(item.to) 
                    ? 'bg-blue-700 text-white border-r-4 border-blue-400' 
                    : 'text-blue-100 hover:bg-blue-700 hover:text-white'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon size={20} className="mr-3" />
                {item.label}
              </Link>
            )
          ))}

          {/* Export - Admin Only */}
          {userRole === 'admin' && (
            <div className="mt-4">
              <div className="px-6 py-3">
                <p className="text-blue-200 text-sm font-medium">EXPORT</p>
              </div>
              <button
                onClick={() => setExportOpen(!exportOpen)}
                className="flex w-full items-center justify-between px-6 py-3 text-blue-100 hover:bg-blue-700 hover:text-white transition-colors"
              >
                <div className="flex items-center">
                  <Download size={20} className="mr-3" />
                  Excel
                </div>
                {exportOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
              
              {exportOpen && (
                <div className="bg-blue-800 border-t border-blue-700">
                  <button
                    onClick={() => handleExport('absensi')}
                    className="flex w-full items-center px-12 py-3 text-blue-100 hover:bg-blue-700 hover:text-white transition-colors text-sm"
                  >
                    <Calendar size={16} className="mr-3" />
                    Absensi
                  </button>
                  <button
                    onClick={() => handleExport('kunjungan')}
                    className="flex w-full items-center px-12 py-3 text-blue-100 hover:bg-blue-700 hover:text-white transition-colors text-sm"
                  >
                    <MapPin size={16} className="mr-3" />
                    Kunjungan
                  </button>
                </div>
              )}
            </div>
          )}

          <button 
            onClick={handleLogout} 
            className="flex w-full items-center px-6 py-3 text-blue-100 hover:bg-blue-700 hover:text-white transition-colors mt-8"
          >
            <LogOut size={20} className="mr-3" />
            Keluar
          </button>
        </nav>
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-[999] bg-black bg-opacity-25 lg:hidden" 
          onClick={() => setSidebarOpen(false)} 
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden text-gray-500 hover:text-gray-600 mr-3"
                >
                  <Menu size={24} />
                </button>
                <h1 className="text-lg font-medium text-gray-800 hidden sm:block">Selamat datang bosku 😍</h1>
                <h1 className="text-base font-medium text-gray-800 sm:hidden">Dashboard</h1>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="font-semibold text-sm text-gray-800">{userName}</p>
                  <p className="text-xs text-gray-500 capitalize">{userRole}</p>
                </div>
                <Link to="/profile">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                </Link>
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