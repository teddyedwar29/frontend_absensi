import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, TrendingUp, MapPin, Bell, Settings, LogOut, Menu, X, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { logout } from '../../api/auth';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [user, setUser] = useState({ name: 'Manager Sales' }); // Mock user data
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Mock function untuk simulasi logout
  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    // Di implementasi nyata, panggil logout() dari auth.js
    logout();
    setShowLogoutModal(false);
  };

  // Sample data - dalam implementasi nyata, ini akan dari API
  const attendanceData = {
    today: {
      present: 85,
      absent: 12,
      late: 8,
      total: 105
    },
    thisWeek: {
      present: 420,
      absent: 45,
      late: 35,
      total: 500
    },
    thisMonth: {
      present: 1850,
      absent: 180,
      late: 140,
      total: 2170
    }
  };

  const recentActivity = [
    { id: 1, name: "Ahmad Rizki", action: "Check In", time: "08:15", location: "Jakarta Pusat", status: "ontime" },
    { id: 2, name: "Sari Dewi", action: "Check Out", time: "17:30", location: "Bandung", status: "ontime" },
    { id: 3, name: "Budi Santoso", action: "Check In", time: "08:45", location: "Surabaya", status: "late" },
    { id: 4, name: "Maya Putri", action: "Check In", time: "08:10", location: "Yogyakarta", status: "ontime" },
    { id: 5, name: "Doni Pratama", action: "Absent", time: "-", location: "-", status: "absent" }
  ];

  const topPerformers = [
    { name: "Ahmad Rizki", attendance: "98%", days: 29 },
    { name: "Sari Dewi", attendance: "96%", days: 28 },
    { name: "Maya Putri", attendance: "94%", days: 27 }
  ];

  const currentData = attendanceData[selectedPeriod];
  const attendanceRate = Math.round((currentData.present / currentData.total) * 100);

  const Sidebar = () => (
    <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-blue-900 to-blue-800 text-white transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
      <div className="flex items-center justify-between h-16 px-6 border-b border-blue-700">
        <h1 className="text-xl font-bold">Absensi</h1>
        <button 
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden"
        >
          <X size={24} />
        </button>
      </div>
      
      <nav className="mt-8">
        <div className="px-6 py-3">
          <p className="text-blue-200 text-sm font-medium">MENU UTAMA</p>
        </div>
        
        <a href="/dashboard" className="flex items-center px-6 py-3 text-white bg-blue-700 border-r-4 border-blue-400">
          <TrendingUp size={20} className="mr-3" />
          Dashboard
        </a>
        
        <Link to="/sales/absensi" className="flex items-center px-6 py-3 text-blue-100 hover:bg-blue-700 hover:text-white transition-colors">
          <Calendar size={20} className="mr-3" />
          Absensi
        </Link>
        
        <a href="#" className="flex items-center px-6 py-3 text-blue-100 hover:bg-blue-700 hover:text-white transition-colors">
          <Users size={20} className="mr-3" />
          Tim Sales
        </a>
        
        <a href="#" className="flex items-center px-6 py-3 text-blue-100 hover:bg-blue-700 hover:text-white transition-colors">
          <MapPin size={20} className="mr-3" />
          Lokasi
        </a>
        
        <div className="px-6 py-3 mt-8">
          <p className="text-blue-200 text-sm font-medium">PENGATURAN</p>
        </div>
        
        <a href="#" className="flex items-center px-6 py-3 text-blue-100 hover:bg-blue-700 hover:text-white transition-colors">
          <Bell size={20} className="mr-3" />
          Notifikasi
        </a>
        
        <a href="#" className="flex items-center px-6 py-3 text-blue-100 hover:bg-blue-700 hover:text-white transition-colors">
          <Settings size={20} className="mr-3" />
          Pengaturan
        </a>
        
        <a href="#" onClick={handleLogout} className="flex items-center px-6 py-3 text-blue-100 hover:bg-blue-700 hover:text-white transition-colors mt-8">
          <LogOut size={20} className="mr-3" />
          Keluar
        </a>
      </nav>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      {/* Overlay untuk mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-25 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden mr-4"
              >
                <Menu size={24} />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
                <p className="text-gray-600">Selamat datang kembali, Manager!</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <select 
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="today">Hari Ini</option>
                <option value="thisWeek">Minggu Ini</option>
                <option value="thisMonth">Bulan Ini</option>
              </select>
              
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'M'}
              </div>
            </div>
          </div>
        </header>
        
        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Hadir</p>
                  <p className="text-2xl sm:text-3xl font-bold text-green-600">{currentData.present}</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="text-green-600" size={20} />
                </div>
              </div>
              <div className="mt-3 sm:mt-4">
                <div className="flex items-center text-xs sm:text-sm">
                  <span className="text-green-600 font-medium">+12%</span>
                  <span className="text-gray-600 ml-2 truncate">dari periode sebelumnya</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Tidak Hadir</p>
                  <p className="text-2xl sm:text-3xl font-bold text-red-600">{currentData.absent}</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <XCircle className="text-red-600" size={20} />
                </div>
              </div>
              <div className="mt-3 sm:mt-4">
                <div className="flex items-center text-xs sm:text-sm">
                  <span className="text-red-600 font-medium">-8%</span>
                  <span className="text-gray-600 ml-2 truncate">dari periode sebelumnya</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Terlambat</p>
                  <p className="text-2xl sm:text-3xl font-bold text-yellow-600">{currentData.late}</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <AlertCircle className="text-yellow-600" size={20} />
                </div>
              </div>
              <div className="mt-3 sm:mt-4">
                <div className="flex items-center text-xs sm:text-sm">
                  <span className="text-yellow-600 font-medium">+3%</span>
                  <span className="text-gray-600 ml-2 truncate">dari periode sebelumnya</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Tingkat Kehadiran</p>
                  <p className="text-2xl sm:text-3xl font-bold text-blue-600">{attendanceRate}%</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="text-blue-600" size={20} />
                </div>
              </div>
              <div className="mt-3 sm:mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${attendanceRate}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
            {/* Recent Activity */}
            <div className="xl:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-4 sm:p-6 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800">Aktivitas Terbaru</h3>
              </div>
              <div className="p-4 sm:p-6">
                <div className="space-y-3 sm:space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-semibold flex-shrink-0">
                          {activity.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-800 text-sm sm:text-base truncate">{activity.name}</p>
                          <p className="text-xs sm:text-sm text-gray-600 truncate">{activity.action} • {activity.location}</p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-2">
                        <p className="text-xs sm:text-sm font-medium text-gray-800">{activity.time}</p>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          activity.status === 'ontime' ? 'bg-green-100 text-green-800' :
                          activity.status === 'late' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {activity.status === 'ontime' ? 'Tepat Waktu' :
                           activity.status === 'late' ? 'Terlambat' : 'Tidak Hadir'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Top Performers */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-4 sm:p-6 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800">Performa Terbaik</h3>
              </div>
              <div className="p-4 sm:p-6">
                <div className="space-y-3 sm:space-y-4">
                  {topPerformers.map((performer, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-semibold flex-shrink-0">
                          {index + 1}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-800 text-sm sm:text-base truncate">{performer.name}</p>
                          <p className="text-xs text-gray-600">{performer.days} hari hadir</p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-semibold text-green-600 text-sm sm:text-base">{performer.attendance}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-100">
                  <button className="w-full py-2 px-4 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium text-sm sm:text-base">
                    Lihat Semua Tim
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      
      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 sm:mb-4">Konfirmasi Logout</h3>
            <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">Apakah Anda yakin ingin keluar dari sistem?</p>
            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
              >
                Batal
              </button>
              <button
                onClick={confirmLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm sm:text-base"
              >
                Ya, Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;