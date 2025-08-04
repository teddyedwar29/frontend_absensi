// src/pages/Sales/Dashboard.jsx

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout'; // Import komponen layout
import { Clock, MapPin, Calendar, CheckCircle, XCircle, AlertTriangle, TrendingUp, LogIn, LogOut } from 'lucide-react';
import Swal from 'sweetalert2';

const SalesDashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isCheckedIn, setIsCheckedIn] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCheckIn = () => {
    // Di implementasi nyata, ini akan memanggil API
    setIsCheckedIn(true);
    Swal.fire({
      icon: 'success',
      title: 'Check-in Berhasil',
      text: 'Selamat bekerja!',
      showConfirmButton: false,
      timer: 1500
    });
  };

  const handleCheckOut = () => {
    // Di implementasi nyata, ini akan memanggil API
    setIsCheckedIn(false);
    Swal.fire({
      icon: 'success',
      title: 'Check-out Berhasil',
      text: 'Sampai jumpa besok!',
      showConfirmButton: false,
      timer: 1500
    });
  };

  return (
    <DashboardLayout>
      {/* Semua konten unik untuk dashboard sales ada di sini */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Status Hari Ini</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {isCheckedIn ? 'Hadir' : 'Belum Absen'}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              {isCheckedIn ? 
                <CheckCircle className="w-6 h-6 text-green-600" /> :
                <Clock className="w-6 h-6 text-gray-400" />
              }
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Jam Kerja Hari Ini</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                {isCheckedIn ? '4.5 Jam' : '0 Jam'}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Kehadiran Bulan Ini</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">22/24</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <Calendar className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tingkat Kehadiran</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">92%</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            {!isCheckedIn ? (
              <button 
                onClick={handleCheckIn}
                className="w-full flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <LogIn className="w-5 h-5 mr-2" />
                Check In Sekarang
              </button>
            ) : (
              <button 
                onClick={handleCheckOut}
                className="w-full flex items-center justify-center px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <LogOut className="w-5 h-5 mr-2" />
                Check Out Sekarang
              </button>
            )}
            <button className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Calendar className="w-5 h-5 mr-2" />
              Ajukan Izin
            </button>
            <button className="w-full flex items-center justify-center px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Koreksi Absensi
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Absensi Hari Ini</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <span className="text-sm font-medium text-gray-700">Check In</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">
                  {isCheckedIn ? '08:15' : '--:--'}
                </p>
                <p className="text-xs text-gray-500">
                  {isCheckedIn ? 'Jakarta Pusat' : 'Belum check in'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gray-400 rounded-full mr-3"></div>
                <span className="text-sm font-medium text-gray-700">Check Out</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">--:--</p>
                <p className="text-xs text-gray-500">Belum check out</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Riwayat Absensi 7 Hari Terakhir</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Tanggal</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Check In</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Check Out</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Jam Kerja</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="py-3 px-4 text-gray-900">Hari Ini</td>
                <td className="py-3 px-4 text-gray-900">{isCheckedIn ? '08:15' : '--:--'}</td>
                <td className="py-3 px-4 text-gray-900">--:--</td>
                <td className="py-3 px-4 text-gray-900">{isCheckedIn ? '4.5 Jam' : '0 Jam'}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    isCheckedIn ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {isCheckedIn ? 'Hadir' : 'Belum Absen'}
                  </span>
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-gray-900">2 Agu 2025</td>
                <td className="py-3 px-4 text-gray-900">08:12</td>
                <td className="py-3 px-4 text-gray-900">17:30</td>
                <td className="py-3 px-4 text-gray-900">9.3 Jam</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                    Tepat Waktu
                  </span>
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-gray-900">1 Agu 2025</td>
                <td className="py-3 px-4 text-gray-900">08:45</td>
                <td className="py-3 px-4 text-gray-900">17:15</td>
                <td className="py-3 px-4 text-gray-900">8.5 Jam</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                    Terlambat
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SalesDashboard;
