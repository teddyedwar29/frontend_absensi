// src/pages/Admin/Dashboard.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardLayout from '../../components/DashboardLayout';
import { CheckCircle, XCircle, AlertCircle, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

const DashboardAdmin = () => {
  const today = new Date();

  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [attendanceData, setAttendanceData] = useState({
    present: 0,
    absent: 0,
    late: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [kunjunganTotal, setKunjunganTotal] = useState(0);
  const [aktivitasSales, setAktivitasSales] = useState([]);

  // Dummy untuk Top Performers
  const topPerformers = [
    { name: "Ahmad Rizki", attendance: "98%", days: 29 },
    { name: "Sari Dewi", attendance: "96%", days: 28 },
    { name: "Maya Putri", attendance: "94%", days: 27 }
  ];

  useEffect(() => {
    const fetchAttendance = async () => {
      setLoading(true);
      setError(null);
      try {
        let url = '';
        if (selectedPeriod === 'today') {
          url = 'http://localhost:5000/report/daily';
        } else if (selectedPeriod === 'thisMonth') {
          url = `http://localhost:5000/admin/report/summary/monthly/${selectedYear}/${selectedMonth}`;
        } else if (selectedPeriod === 'thisYear') {
          url = `http://localhost:5000/admin/report/summary/yearly/${selectedYear}`;
        }
        const token = localStorage.getItem('token');
        const response = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (selectedPeriod === 'thisYear' && response.data.summary_tahunan_per_sales) {
          // --- PARSING DATA TAHUNAN ---
          const summary = response.data.summary_tahunan_per_sales;
          // Buat array aktivitasSales: [{ id, bulan, hadir, terlambat, kunjungan }]
          let aktivitasArr = [];
          let totalKunjungan = 0;
          Object.entries(summary).forEach(([salesId, bulanObj]) => {
            Object.entries(bulanObj).forEach(([bulan, data]) => {
              aktivitasArr.push({
                id: salesId,
                bulan: Number(bulan),
                hadir: data.absensi?.Hadir || 0,
                terlambat: data.absensi?.Terlambat || 0,
                kunjungan: data.kunjungan?.total || 0,
                akuisisi: data.kunjungan?.akuisisi || 0,
                maintenance: data.kunjungan?.maintenance || 0,
                prospek: data.kunjungan?.prospek || 0,
              });
              totalKunjungan += data.kunjungan?.total || 0;
            });
          });
          setAktivitasSales(aktivitasArr);
          setKunjunganTotal(totalKunjungan);

          // Untuk card summary, bisa diakumulasi dari aktivitasArr
          const present = aktivitasArr.reduce((a, b) => a + b.hadir, 0);
          const late = aktivitasArr.reduce((a, b) => a + b.terlambat, 0);
          const total = present + late;
          setAttendanceData({
            present,
            late,
            absent: 0,
            total
          });
        } else {
          // --- PARSING DATA BULANAN/HARIAN ---
          const summary = response.data.summary_per_sales || {};
          const totalKunjungan = Object.values(summary).reduce((acc, curr) => acc + (curr.kunjungan || 0), 0);
          setKunjunganTotal(totalKunjungan);

          const aktivitasArr = Object.entries(summary).map(([id, data]) => ({
            id,
            hadir: data.absensi?.Hadir || 0,
            terlambat: data.absensi?.Terlambat || 0,
            kunjungan: data.kunjungan || 0
          }));
          setAktivitasSales(aktivitasArr);

          if (response.data.data) {
            setAttendanceData(response.data.data);
          } else {
            let present = 0, late = 0, total = 0;
            Object.values(summary).forEach(s => {
              present += s.absensi?.Hadir || 0;
              late += s.absensi?.Terlambat || 0;
              total += (s.absensi?.Hadir || 0) + (s.absensi?.Terlambat || 0);
            });
            setAttendanceData({
              present,
              late,
              absent: 0,
              total
            });
          }
        }
      } catch (err) {
        console.error(err);
        setError('Gagal memuat data absensi');
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, [selectedPeriod, selectedMonth, selectedYear]);

  const attendanceRate = attendanceData.total > 0
    ? Math.round((attendanceData.present / attendanceData.total) * 100)
    : 0;

  // Dropdown bulan & tahun yang lebih rapi
  const monthList = [
    { value: 1, label: 'Januari' },
    { value: 2, label: 'Februari' },
    { value: 3, label: 'Maret' },
    { value: 4, label: 'April' },
    { value: 5, label: 'Mei' },
    { value: 6, label: 'Juni' },
    { value: 7, label: 'Juli' },
    { value: 8, label: 'Agustus' },
    { value: 9, label: 'September' },
    { value: 10, label: 'Oktober' },
    { value: 11, label: 'November' },
    { value: 12, label: 'Desember' },
  ];
  const yearList = [];
  for (let y = today.getFullYear(); y >= today.getFullYear() - 5; y--) {
    yearList.push(y);
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center">Memuat data...</div>
      </DashboardLayout>
    );
  }
  if (error) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center text-red-500">{error}</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Filter Bulan & Tahun */}
      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <div className="flex items-center gap-1">
          <label className="font-medium">Bulan:</label>
          <select
            value={selectedMonth}
            onChange={e => { setSelectedMonth(Number(e.target.value)); setSelectedPeriod('thisMonth'); }}
            className="border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            {monthList.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-1">
          <label className="font-medium">Tahun:</label>
          <select
            value={selectedYear}
            onChange={e => { setSelectedYear(Number(e.target.value)); setSelectedPeriod('thisMonth'); }}
            className="border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            {yearList.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setSelectedPeriod('today')}
            className={`px-3 py-1 rounded transition-colors ${selectedPeriod === 'today' ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-blue-100'}`}
          >Hari Ini</button>
          <button
            onClick={() => setSelectedPeriod('thisMonth')}
            className={`px-3 py-1 rounded transition-colors ${selectedPeriod === 'thisMonth' ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-blue-100'}`}
          >Bulan Ini</button>
          <button
            onClick={() => setSelectedPeriod('thisYear')}
            className={`px-3 py-1 rounded transition-colors ${selectedPeriod === 'thisYear' ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-blue-100'}`}
          >Tahun Ini</button>
        </div>
      </div>

      {/* Menampilkan periode yang dipilih */}
      <div className="mb-2 font-semibold">
        Periode: {selectedPeriod === 'today'
          ? 'Hari Ini'
          : selectedPeriod === 'thisMonth'
            ? `${monthList[selectedMonth - 1].label} ${selectedYear}`
            : selectedYear}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Hadir</p>
              <p className="text-2xl sm:text-3xl font-bold text-green-600">{attendanceData.present}</p>
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
              <p className="text-2xl sm:text-3xl font-bold text-red-600">{attendanceData.absent}</p>
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
              <p className="text-2xl sm:text-3xl font-bold text-yellow-600">{attendanceData.late}</p>
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
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Kunjungan</p>
              <p className="text-2xl sm:text-3xl font-bold text-blue-600">{kunjunganTotal}</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="text-blue-600" size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Grafik Aktivitas Terbaru */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
        <div className="p-4 sm:p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800">Grafik Aktivitas Sales</h3>
        </div>
        <div className="p-4 sm:p-6">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={aktivitasSales}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="id" label={{ value: "ID Sales", position: "insideBottom", offset: -5 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="hadir" fill="#22c55e" name="Hadir" />
              <Bar dataKey="terlambat" fill="#eab308" name="Terlambat" />
              <Bar dataKey="kunjungan" fill="#3b82f6" name="Kunjungan" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Performers */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 xl:col-span-2">
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

      {/* Aktivitas Sales Detail */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mt-6">
        <div className="p-4 sm:p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800">Aktivitas Sales (Detail)</h3>
        </div>
        <div className="p-4 sm:p-6">
          {/* Tambahkan max-h-[400px] dan overflow-y-auto agar bisa scroll */}
          <div className="space-y-3 sm:space-y-4 max-h-[400px] overflow-y-auto">
            {aktivitasSales.map((sales) => (
              <div key={sales.id} className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-semibold flex-shrink-0">
                    {sales.id}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-gray-800 text-sm sm:text-base truncate">Sales {sales.id}</p>
                    <p className="text-xs sm:text-sm text-gray-600 truncate">
                      Hadir: {sales.hadir} | Terlambat: {sales.terlambat} | Kunjungan: {sales.kunjungan}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardAdmin;