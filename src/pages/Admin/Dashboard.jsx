// src/pages/Admin/Dashboard.jsx

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { CheckCircle, XCircle, AlertCircle, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import API from '../../api/auth';

// --- KODE HELPER & PERBAIKAN ---

// Fix untuk ikon marker yang tidak muncul di Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: '/marker-icon-2x.png',
    iconUrl: '/marker-icon.png',
    shadowUrl: '/shadow.png',
});

// --- KOMPONEN UTAMA ---

const DashboardAdmin = () => {
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];

    // State untuk Laporan & Statistik
    const [selectedPeriod, setSelectedPeriod] = useState('today');
    const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(today.getFullYear());
    const [attendanceData, setAttendanceData] = useState({ present: 0, absent: 0, late: 0, total: 0 });
    const [kunjunganTotal, setKunjunganTotal] = useState(0);
    const [aktivitasSales, setAktivitasSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // State untuk Peta
    const [trackingDate, setTrackingDate] = useState(todayString);
    const [allRoutesData, setAllRoutesData] = useState({});
    const [mapLoading, setMapLoading] = useState(true);
    const [mapError, setMapError] = useState(null);
    const [mapCenter] = useState([-0.947083, 100.352222]); // Default: Padang

    // State untuk Detail Aktivitas Sales
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedSales, setSelectedSales] = useState(null);

    const handleOpenDetail = (sales) => {
        setSelectedSales(sales);
        setShowDetailModal(true);
    };

    const handleCloseDetail = () => {
        setShowDetailModal(false);
        setSelectedSales(null);
    };
 // GANTI SELURUH useEffect fetchAttendance DENGAN INI


useEffect(() => {
    const fetchAttendance = async () => {
        setLoading(true);
        setError(null);
        try {
            let url = '';
            if (selectedPeriod === 'today') {
                url = `/admin/report/daily/all/${todayString}`;
            } else if (selectedPeriod === 'thisMonth') {
                url = `/admin/report/summary/monthly/${selectedYear}/${selectedMonth}`;
            } else if (selectedPeriod === 'thisYear') {
                url = `/admin/report/summary/yearly/${selectedYear}`;
            }

            const response = await API.get(url);
            const summary = response.data.laporan_harian_sales || response.data.summary_per_sales || response.data.summary_tahunan_per_sales || {};
            
            let totalHadir = 0, totalTerlambat = 0, totalAbsen = 0, totalKunjungan = 0;
            const aktivitasArr = [];

            for (const username in summary) {
                const salesData = summary[username];
                let userHadir = 0, userTerlambat = 0, userKunjungan = 0, userAkuisisi = 0, userMaintenance = 0, userProspek = 0, userStatus = "Belum Absen";

                if (selectedPeriod === 'thisYear') {
                    if (salesData.bulan && typeof salesData.bulan === 'object') {
                        for (const month in salesData.bulan) {
                            const monthData = salesData.bulan[month];
                            userHadir += monthData.absensi?.Hadir || 0;
                            userTerlambat += monthData.absensi?.Terlambat || 0;
                            userKunjungan += monthData.kunjungan?.total || 0;
                            userAkuisisi += monthData.kunjungan?.akuisisi || 0;
                            userMaintenance += monthData.kunjungan?.maintenance || 0;
                            userProspek += monthData.kunjungan?.prospek || 0;
                        }
                    }
                } else {
                    if (salesData.absensi?.status) { // Format Harian
                        if (salesData.absensi.status === 'Hadir') userHadir = 1;
                        if (salesData.absensi.status === 'Terlambat') userTerlambat = 1;
                        userStatus = salesData.absensi.status;
                    } else { // Format Bulanan
                        userHadir = salesData.absensi?.Hadir || 0;
                        userTerlambat = salesData.absensi?.Terlambat || 0;
                    }
                    userKunjungan = salesData.kunjungan?.total || 0;
                    userAkuisisi = salesData.kunjungan?.akuisisi || 0;
                    userMaintenance = salesData.kunjungan?.maintenance || 0;
                    userProspek = salesData.kunjungan?.prospek || 0;
                }
                
                aktivitasArr.push({
                    id: username, name: salesData.name || username,
                    hadir: userHadir, terlambat: userTerlambat,
                    kunjungan: userKunjungan, akuisisi: userAkuisisi,
                    maintenance: userMaintenance, prospek: userProspek,
                    status: userStatus,
                    foto_path: salesData.absensi?.foto_path 
                        ? `http://127.0.0.1:5000/static/uploads/${salesData.absensi.foto_path}` 
                        : null
                });
            }

            aktivitasArr.forEach(sales => {
                totalHadir += sales.hadir;
                totalTerlambat += sales.terlambat;
                totalKunjungan += sales.kunjungan;
            });
            
            if(selectedPeriod === 'today') {
                totalAbsen = aktivitasArr.length - (totalHadir + totalTerlambat);
            }
            
            setAttendanceData({ present: totalHadir, late: totalTerlambat, absent: totalAbsen, total: totalHadir + totalTerlambat + totalAbsen });
            setKunjunganTotal(totalKunjungan);
            setAktivitasSales(aktivitasArr);

        } catch (err) {
            console.error("Gagal memuat data laporan:", err);
            setError('Gagal memuat data laporan');
        } finally {
            setLoading(false);
        }
    };
    fetchAttendance();
}, [selectedPeriod, selectedMonth, selectedYear, todayString])

    // useEffect untuk mengambil data Peta
    useEffect(() => {
        const fetchAllTrackingData = async () => {
            setMapLoading(true);
            setMapError(null);
            try {
                const response = await API.get(`/admin/tracking/daily/all/${trackingDate}`);
                const rawDataByUsername = response.data.route_per_sales;
                const processedData = {};
                if (rawDataByUsername && typeof rawDataByUsername === 'object') {
                    for (const username in rawDataByUsername) {
                        const salesData = rawDataByUsername[username];
                        if (Array.isArray(salesData.kunjungan)) {
                            processedData[username] = {
                                name: salesData.name,
                                route: salesData.kunjungan.map(point => {
                                    if (typeof point.lokasi_koordinat === 'string' && point.lokasi_koordinat.includes(',')) {
                                        const coords = point.lokasi_koordinat.split(',').map(Number);
                                        if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
                                            return { ...point, position: [coords[0], coords[1]] };
                                        }
                                    }
                                    return null;
                                }).filter(point => point !== null)
                            };
                        }
                    }
                }
                setAllRoutesData(processedData);
            } catch (err) {
                console.error("Gagal mengambil data tracking:", err);
                setMapError("Gagal memuat data peta.");
            } finally {
                setMapLoading(false);
            }
        };
        fetchAllTrackingData();
    }, [trackingDate]);

    const attendanceRate = attendanceData.total > 0 ? Math.round((attendanceData.present / attendanceData.total) * 100) : 0;
    const monthList = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: new Date(0, i).toLocaleString('id-ID', { month: 'long' }) }));
    const yearList = Array.from({ length: 6 }, (_, i) => today.getFullYear() - i);

    if (loading && !error) return <DashboardLayout><div className="p-8 text-center">Memuat data...</div></DashboardLayout>;
    if (error) return <DashboardLayout><div className="p-8 text-center text-red-500">{error}</div></DashboardLayout>;

    return (
        <DashboardLayout>
            {/* Filter, Periode, dan Stats Cards */}
            <div className="flex flex-wrap gap-2 mb-4 items-center">
                 <div className="flex items-center gap-1">
                     <label className="font-medium text-sm sm:text-base">Bulan:</label>
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
                     <label className="font-medium text-sm sm:text-base">Tahun:</label>
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
                         className={`px-3 py-1 rounded transition-colors text-sm sm:text-base ${selectedPeriod === 'today' ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-blue-100'}`}
                     >Hari Ini</button>
                     <button
                         onClick={() => setSelectedPeriod('thisMonth')}
                         className={`px-3 py-1 rounded transition-colors text-sm sm:text-base ${selectedPeriod === 'thisMonth' ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-blue-100'}`}
                     >Bulan Ini</button>
                     <button
                         onClick={() => setSelectedPeriod('thisYear')}
                         className={`px-3 py-1 rounded transition-colors text-sm sm:text-base ${selectedPeriod === 'thisYear' ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-blue-100'}`}
                     >Tahun Ini</button>
                 </div>
            </div>

            <div className="mb-4 font-semibold text-gray-700">
                Periode Laporan: {selectedPeriod === 'today'
                    ? `Hari Ini (${new Date(todayString).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })})`
                    : selectedPeriod === 'thisMonth'
                        ? `${monthList.find(m => m.value === selectedMonth).label} ${selectedYear}`
                        : `Tahun ${selectedYear}`
                }
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6 mb-6">
                 {/* Card Hadir */}
                 <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                     <p className="text-gray-600 text-sm font-medium">Hadir</p>
                     <p className="text-2xl font-bold text-green-600">{attendanceData.present}</p>
                 </div>
                 {/* Card Terlambat */}
                 <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                     <p className="text-gray-600 text-sm font-medium">Terlambat</p>
                     <p className="text-2xl font-bold text-yellow-600">{attendanceData.late}</p>
                 </div>
                 {/* Card Tidak Hadir */}
                 <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                     <p className="text-gray-600 text-sm font-medium">Tidak Hadir</p>
                     <p className="text-2xl font-bold text-red-600">{attendanceData.absent}</p>
                 </div>
                 {/* Card Tingkat Kehadiran */}
                 <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                     <p className="text-gray-600 text-sm font-medium">Tingkat Kehadiran</p>
                     <p className="text-2xl font-bold text-blue-600">{attendanceRate}%</p>
                 </div>
                 {/* Card Total Kunjungan */}
                 <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                     <p className="text-gray-600 text-sm font-medium">Total Kunjungan</p>
                     <p className="text-2xl font-bold text-indigo-600">{kunjunganTotal}</p>
                 </div>
            </div>
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Grafik Aktivitas Sales */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
                <div className="p-4 sm:p-6 border-b border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800">Grafik Aktivitas Sales</h3>
                </div>
                <div className="p-4 sm:p-6">
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={aktivitasSales} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" fontSize={12} />
                            <YAxis allowDecimals={false} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="hadir" stackId="a" fill="#22c55e" name="Hadir" />
                            <Bar dataKey="terlambat" stackId="a" fill="#eab308" name="Terlambat" />
                            <Bar dataKey="kunjungan" fill="#3b82f6" name="Kunjungan" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
            
            {/* Peta Kunjungan Sales */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
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
                        <MapContainer center={mapCenter} zoom={11} style={{ height: '500px', width: '100%', borderRadius: '0.75rem' }}>
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                            {Object.entries(allRoutesData).map(([username, data], userIndex) => {
                                const colors = [
                                    '#E6194B', '#3cb44b', '#ffe119', '#4363d8', '#f58231', '#911eb4', '#46f0f0',
                                    '#f032e6', '#bcf60c', '#fabebe', '#008080', '#e6beff', '#9a6324', '#800000',
                                    '#aaffc3', '#808000', '#ffd8b1', '#000075', '#808080'
                                ];
                                const color = colors[userIndex % colors.length];
                                const route = data.route;
                                const name = data.name;
                                const positions = route.map(p => p.position);

                                const customIcon = new L.DivIcon({
                                    html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="28px" height="28px"><path d="M12 0C7.589 0 4 3.589 4 8c0 4.411 8 16 8 16s8-11.589 8-16c0-4.411-3.589-8-8-8zm0 12c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/></svg>`,
                                    className: 'custom-div-icon', iconSize: [28, 28], iconAnchor: [14, 28], popupAnchor: [0, -28]
                                });

                                return (
                                    <React.Fragment key={username}>
                                        {positions.length > 1 && <Polyline pathOptions={{ color }} positions={positions} />}
                                        {route.map((point, pointIndex) => (
                                            <Marker key={`${username}-${pointIndex}`} position={point.position} icon={customIcon}>
                                                <Popup><b>{name || username}</b><br />{pointIndex + 1}. {point.nama_outlet}<br />Waktu: {point.waktu_kunjungan}</Popup>
                                            </Marker>
                                        ))}
                                    </React.Fragment>
                                );
                            })}
                        </MapContainer>
                    )}
                </div>
            </div>
            </div>
            {/* --- BAGIAN BARU: TABEL DETAIL AKTIVITAS SALES --- */}
<div className="bg-white rounded-xl shadow-sm border border-gray-100 mt-6">
    <div className="p-4 sm:p-6 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800">Detail Aktivitas Sales</h3>
    </div>
    <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
        <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0">
                <tr>
                    {/* 👇👇 PERUBAHAN DI SINI: Tambah kolom Foto 👇👇 */}
                    <th scope="col" className="px-6 py-3">Foto</th>
                    <th scope="col" className="px-6 py-3">Nama Sales</th>
                    {selectedPeriod === 'today' && <th scope="col" className="px-6 py-3">Status Absensi</th>}
                    {(selectedPeriod === 'thisMonth' || selectedPeriod === 'thisYear') && <th scope="col" className="px-6 py-3">Hadir</th>}
                    {(selectedPeriod === 'thisMonth' || selectedPeriod === 'thisYear') && <th scope="col" className="px-6 py-3">Terlambat</th>}
                    <th scope="col" className="px-6 py-3">Total Kunjungan</th>
                    <th scope="col" className="px-6 py-3">Akuisisi</th>
                    <th scope="col" className="px-6 py-3">Maintenance</th>
                    <th scope="col" className="px-6 py-3">Prospek</th>
                </tr>
            </thead>
            <tbody>
                {aktivitasSales.length > 0 ? (
                    aktivitasSales.map((sales) => (
                        <tr key={sales.id} className="bg-white border-b hover:bg-gray-50">             
                            <td className="px-6 py-4">
                               <button onClick={() => handleOpenDetail(sales)} disabled={!sales.foto_path}></button>
                                {sales.foto_path ? (
                                    <img 
                                        src={sales.foto_path} 
                                        alt={`Foto ${sales.name}`}
                                        className="w-10 h-10 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-gray-200" />
                                )}
                            </td>
                            <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                {sales.name}
                            </th>
                            {selectedPeriod === 'today' && (
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                        sales.status === 'Hadir' ? 'bg-green-100 text-green-800' :
                                        sales.status === 'Terlambat' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                        {sales.status}
                                    </span>
                                </td>
                            )}
                            {(selectedPeriod === 'thisMonth' || selectedPeriod === 'thisYear') && <td className="px-6 py-4">{sales.hadir}</td>}
                            {(selectedPeriod === 'thisMonth' || selectedPeriod === 'thisYear') && <td className="px-6 py-4">{sales.terlambat}</td>}
                            <td className="px-6 py-4 font-bold">{sales.kunjungan}</td>
                            <td className="px-6 py-4">{sales.akuisisi}</td>
                            <td className="px-6 py-4">{sales.maintenance}</td>
                            <td className="px-6 py-4">{sales.prospek}</td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan="9" className="text-center py-10">Tidak ada data untuk ditampilkan.</td>
                    </tr>
                )}
            </tbody>
        </table>
    </div>
</div>
        </DashboardLayout>
    );
};

export default DashboardAdmin;