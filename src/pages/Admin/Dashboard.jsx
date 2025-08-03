// src/pages/Admin/Dashboard.jsx

import React, { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout'; // Import komponen layout baru
import { CheckCircle, XCircle, AlertCircle, TrendingUp } from 'lucide-react';

const DashboardAdmin = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('today');

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

  return (
    <DashboardLayout>
      {/* Konten dashboard khusus admin */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {/* Stats Cards */}
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
    </DashboardLayout>
  );
};

export default DashboardAdmin;