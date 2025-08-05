// src/pages/Admin/Dashboard.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardLayout from '../../components/DashboardLayout';
import { CheckCircle, XCircle, AlertCircle, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import API from '../../api/auth'; // Pastikan API diimpor
import iconMarker2x from 'leaflet/dist/images/marker-icon-2x.png';
import iconMarker from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import RoutingMachine from '../../components/RoutingMachine'; // <-- 1. Impor komponen baru


// Fix untuk ikon marker yang tidak muncul di React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: iconMarker2x,
    iconUrl: iconMarker,
    shadowUrl: iconShadow,
});
// stringToColor
const stringToColor = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    // Menghasilkan HUE (warna dasar) antara 0 dan 360
    const h = hash % 360;
    // Menggunakan HSL (Hue, Saturation, Lightness) untuk warna yang cerah & konsisten
    // Saturation 70% dan Lightness 50% menghasilkan warna yang bagus di peta
    return `hsl(${h}, 70%, 50%)`;
  }


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
   const [trackingDate, setTrackingDate] = useState(new Date().toISOString().split('T')[0]);
  const [allRoutesData, setAllRoutesData] = useState({});

   const [mapLoading, setMapLoading] = useState(true);
  const [mapError, setMapError] = useState(null);
  const [mapCenter] = useState([-0.947083, 100.352222]); // Default: Padang
 

  // Dummy untuk Top Performers
  const topPerformers = [
    { name: "Ahmad Rizki", attendance: "98%", days: 29 },
    { name: "Sari Dewi", attendance: "96%", days: 28 },
    { name: "Maya Putri", attendance: "94%", days: 27 }
  ];

  useEffect(() => {
    const fetchAllTrackingData = async () => {
        setMapLoading(true);
        setMapError(null);

try {
    const response = await API.get(`/admin/tracking/daily/all/${trackingDate}`);
    console.log("DATA PETA MENTAH DARI BACKEND:", response.data);

    // Ambil objek 'route_per_sales' dari data yang diterima
    const rawDataByUsername = response.data.route_per_sales;
    const processedData = {};

    // Pastikan rawDataByUsername adalah objek yang valid
    if (rawDataByUsername && typeof rawDataByUsername === 'object') {
        // Loop melalui setiap 'username' sebagai kunci
        for (const username in rawDataByUsername) {
            const salesData = rawDataByUsername[username]; // { kunjungan: [...], name: "..." }
            const routeArray = salesData.kunjungan;
            const salesName = salesData.name;

            // Pastikan array kunjungan itu valid
            if (Array.isArray(routeArray)) {
                // Simpan nama dan rute yang sudah diproses
                processedData[username] = {
                    name: salesName,
                    route: routeArray
                        .map(point => {
                            if (typeof point.lokasi_koordinat === 'string' && point.lokasi_koordinat.includes(',')) {
                                const coords = point.lokasi_koordinat.split(',').map(Number);
                                if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
                                    return { ...point, position: [coords[0], coords[1]] };
                                }
                            }
                            return null;
                        })
                        .filter(point => point !== null)
                };
            }
        }
    }
    
    setAllRoutesData(processedData);

} catch (err) {
    console.error("Gagal mengambil data tracking semua sales:", err);
    setMapError("Gagal memuat data peta.");
} finally {
    setMapLoading(false);
}
    }

    fetchAllTrackingData();
}, [trackingDate]); // Jalan lagi kalau tanggal diganti


  useEffect(() => {
    const fetchAttendance = async () => {
      setLoading(true);
      setError(null);
      try {
        let url = '';
        if (selectedPeriod === 'today') {
          // Gunakan trackingDate agar sesuai tanggal yang dipilih user
          url = `http://localhost:5000/admin/report/daily/all/${trackingDate}`;
        } else if (selectedPeriod === 'thisMonth') {
          url = `http://localhost:5000/admin/report/summary/monthly/${selectedYear}/${selectedMonth}`;
        } else if (selectedPeriod === 'thisYear') {
          url = `http://localhost:5000/admin/report/summary/yearly/${selectedYear}`;
        }
        const token = localStorage.getItem('token');
        const response = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` }
        });

        // --- Tambahkan log di sini ---
        if (selectedPeriod === 'today') {
          console.log('RESPONSE DAILY:', response.data);
        }

        if (selectedPeriod === 'today' && response.data.laporan_harian_sales) {
          const summary = response.data.laporan_harian_sales;
          console.log('laporan_harian_sales:', summary);

          let hadir = 0, terlambat = 0, belumAbsen = 0, total = 0, totalKunjungan = 0;
          const aktivitasArr = Object.entries(summary).map(([id, data]) => {
            let hadirVal = 0, terlambatVal = 0, absenVal = 0;
            if (data.absensi?.status === "Hadir") hadirVal = 1;
            else if (data.absensi?.status === "Terlambat") terlambatVal = 1;
            else absenVal = 1;
            hadir += hadirVal;
            terlambat += terlambatVal;
            belumAbsen += absenVal;
            total += 1;
            const kunjungan = data.kunjungan?.total || 0;
            totalKunjungan += kunjungan;
            return {
              id,
              name: data.name,
              hadir: hadirVal,
              terlambat: terlambatVal,
              belumAbsen: absenVal,
              kunjungan,
              akuisisi: data.kunjungan?.akuisisi || 0,
              maintenance: data.kunjungan?.maintenance || 0,
              prospek: data.kunjungan?.prospek || 0,
              status: data.absensi?.status || "-",
            };
          });
          console.log('aktivitasArr:', aktivitasArr);
          setAktivitasSales(aktivitasArr);
          setKunjunganTotal(totalKunjungan);
          setAttendanceData({
            present: hadir,
            late: terlambat,
            absent: belumAbsen,
            total,
          });
        } else if (selectedPeriod === 'thisYear' && response.data.summary_tahunan_per_sales) {
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
      {/* --- BAGIAN BARU: PETA TRACKING SEMUA SALES --- */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mt-6">
          <div className="p-4 sm:p-6 border-b border-gray-100 flex flex-wrap justify-between items-center gap-4">
              <h3 className="text-lg font-semibold text-gray-800">Peta Kunjungan Sales</h3>
              <div className="flex items-center gap-2">
                <label htmlFor="map-date" className="font-medium">Tanggal:</label>
                <input 
                    type="date"
                    id="map-date" 
                    value={trackingDate}
                    onChange={(e) => setTrackingDate(e.target.value)}
                    className="border rounded-lg px-3 py-2"
                />
              </div>
          </div>
          <div className="p-1">
              {mapLoading ? (
                  <div className="text-center py-20">Memuat peta...</div>
              ) : mapError ? (
                  <div className="text-center py-20 text-red-500">{mapError}</div>
              ) : Object.keys(allRoutesData).length === 0 ? (
                  <div className="text-center py-20 text-gray-500">Tidak ada data kunjungan pada tanggal ini.</div>
              ) : (
             <MapContainer center={mapCenter} zoom={12} style={{ height: '500px', width: '100%', borderRadius: '0.75rem' }}>
    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
    
    {Object.entries(allRoutesData).map(([username, data], userIndex) => {
        // --- PERUBAHAN DI SINI ---
        // 1. Definisikan palet warna yang besar dan jelas berbeda
        const colors = [
            '#E6194B', '#3cb44b', '#ffe119', '#4363d8', '#f58231', 
            '#911eb4', '#46f0f0', '#f032e6', '#bcf60c', '#fabebe',
            '#008080', '#e6beff', '#9a6324', '#fffac8', '#800000', 
            '#aaffc3', '#808000', '#ffd8b1', '#000075', '#808080'
        ];
        // 2. Kembali gunakan userIndex untuk memilih warna secara berurutan
        const color = colors[userIndex % colors.length];
        // --- AKHIR PERUBAHAN ---

        const route = data.route;
        const name = data.name;
        const positions = route.map(p => p.position);

        const customIcon = new L.DivIcon({
            html: `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="28px" height="28px">
                    <path d="M12 0C7.589 0 4 3.589 4 8c0 4.411 8 16 8 16s8-11.589 8-16c0-4.411-3.589-8-8-8zm0 12c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/>
                </svg>`,
            className: 'custom-div-icon',
            iconSize: [28, 28],
            iconAnchor: [14, 28],
            popupAnchor: [0, -28]
        });

        return (
            <React.Fragment key={username}>
                {positions.length > 1 && <Polyline pathOptions={{ color }} positions={positions} />}
                
                {route.map((point, pointIndex) => (
                    <Marker 
                        key={`${username}-${pointIndex}`} 
                        position={point.position}
                        icon={customIcon}
                    >
                        <Popup>
                            <b>{name || username}</b><br />
                            {pointIndex + 1}. {point.nama_outlet}<br />
                            Waktu: {point.waktu_kunjungan}
                        </Popup>
                    </Marker>
                ))}
            </React.Fragment>
        );
    })}
</MapContainer>
              )}
          </div>
      </div>
      
    </DashboardLayout>
  );
};

export default DashboardAdmin;