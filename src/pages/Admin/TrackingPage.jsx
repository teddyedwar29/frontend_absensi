// src/pages/Admin/TrackingPage.jsx

import React, { useState, useEffect, useRef } from 'react'; // <-- 1. Impor useRef
import { useParams, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import DashboardLayout from '../../components/DashboardLayout';
import API from '../../api/auth';
import { ArrowLeft, Clock, Building, Activity, AlertTriangle, BanknoteArrowUp, Percent, Banknote  } from 'lucide-react';
import RoutingMachine from '../../components/RoutingMachine';

// Fix untuk ikon marker yang tidak muncul di Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: '/marker-icon-2x.png',
    iconUrl: '/marker-icon.png',
    shadowUrl: '/marker-shadow.png',
});

const getTodayString = () => new Date().toISOString().split('T')[0];

const TrackingPage = () => {
    const { username } = useParams();
    const [date, setDate] = useState(getTodayString());
    const [routeData, setRouteData] = useState([]);
    const [mapCenter, setMapCenter] = useState([-0.947083, 100.352222]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- PERUBAHAN 2: Buat "wadah" untuk peta dan marker ---
    const mapRef = useRef(null);
    const markersRef = useRef({});

    useEffect(() => {
        const fetchTrackingData = async () => {
            if (!username || !date) return;
            setLoading(true);
            setError(null);
            setRouteData([]);
            try {
                const response = await API.get(`/admin/tracking/daily/${username}/${date}`);
                const data = response.data;

                if (data.route && data.route.length > 0) {
                    const processedRoute = data.route
                        .map(point => {
                            if (typeof point.lokasi_koordinat === 'string' && point.lokasi_koordinat.includes(',')) {
                                const coords = point.lokasi_koordinat.split(',').map(coord => Number(coord.trim()));
                                if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
                                    return { ...point, position: [coords[0], coords[1]] };
                                }
                            }
                            return null;
                        }).filter(point => point !== null);

                    setRouteData(processedRoute);
                    if (processedRoute.length > 0) {
                        setMapCenter(processedRoute[0].position);
                    } else {
                        setError("Data kunjungan ada, tapi format koordinat tidak valid.");
                    }
                } else {
                    setError(data.msg || "Tidak ada data kunjungan pada tanggal ini.");
                }
            } catch (err) {
                console.error("Gagal mengambil data tracking:", err);
                setError(err.response?.data?.msg || "Gagal memuat data.");
            } finally {
                setLoading(false);
            }
        };
        fetchTrackingData();
    }, [username, date]);

    const waypointPositions = routeData.map(point => point.position);

    // --- PERUBAHAN 3: Buat fungsi untuk menangani klik ---
    const handleDetailClick = (point) => {
        const map = mapRef.current;
        const marker = markersRef.current[point.id];

        if (map && marker) {
            // Pindahkan peta ke lokasi marker
            map.flyTo(point.position, 15); // Angka 15 adalah level zoom
            
            // Buka popup marker tersebut
            marker.openPopup();
        }
    };

    return (
        <DashboardLayout>
            <div className="flex items-center mb-4">
                <Link to="/admin/teams" className="text-blue-600 hover:underline flex items-center gap-2">
                    <ArrowLeft size={20}/> Kembali ke Tim Sales
                </Link>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Lacak Aktivitas Sales</h2>
            <p className="text-gray-600 mb-4">Menampilkan rute untuk <strong>{username}</strong></p>
            
            <div className="bg-white p-4 rounded-xl shadow-sm mb-6 flex items-center gap-4">
                <label htmlFor="tracking-date" className="font-semibold">Pilih Tanggal:</label>
                <input type="date" id="tracking-date" value={date} onChange={(e) => setDate(e.target.value)} className="border rounded-lg px-3 py-2" />
            </div>

            <div className="bg-white p-1 rounded-xl shadow-sm mb-6">
                {loading ? (
                    <div className="text-center py-20">Memuat peta...</div>
                ) : error ? (
                    <div className="text-center py-20 text-red-500">{error}</div>
                ) : (
                    // --- PERUBAHAN 4: Hubungkan ref ke MapContainer ---
                    <MapContainer ref={mapRef} center={mapCenter} zoom={13} style={{ height: '500px', width: '100%', borderRadius: '0.75rem' }}>
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        
                        {routeData.map((point, index) => (
                            // --- PERUBAHAN 5: Hubungkan ref ke setiap Marker ---
                            <Marker 
                                key={point.id} 
                                position={point.position}
                                ref={(el) => (markersRef.current[point.id] = el)}
                            >
                                <Popup minWidth={300}>
                                    <div className="flex items-start gap-4 font-sans">
                                        {point.foto_kunjungan_path && (
                                            <div className="flex-shrink-0 w-24">
                                                <img src={point.foto_kunjungan_path} alt={`Foto di ${point.nama_outlet}`} className="w-full h-24 object-cover rounded-md" />
                                            </div>
                                        )}
                                        <div className="flex-grow">
                                            <p className="font-bold text-base">{index + 1}. {point.nama_outlet}</p>
                                            <p className="text-sm">Waktu: <span className="font-medium">{point.waktu_kunjungan}</span></p>
                                            <p className="text-sm">Kegiatan: <span className="font-medium capitalize">{point.kegiatan}</span></p>
                                        </div>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}

                        {waypointPositions.length > 1 && <RoutingMachine waypoints={waypointPositions} />}
                    </MapContainer>
                )}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="p-4 sm:p-6 border-b border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800">Detail Rute Kunjungan</h3>
                </div>
                <div className="divide-y divide-gray-200 max-h-[400px] overflow-y-auto">
                    {routeData.length > 0 ? (
                        routeData.map((point, index) => (
                            // --- PERUBAHAN 6: Tambahkan onClick ke setiap baris detail ---
                            <div 
                                key={point.id} 
                                className="p-4 flex items-start gap-4 cursor-pointer hover:bg-gray-100 transition-colors"
                                onClick={() => handleDetailClick(point)}
                            >
                                <span className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white font-bold text-sm rounded-full flex items-center justify-center mt-1">{index + 1}</span>
                                <div className="flex-grow">
                                    <p className="font-semibold text-gray-900">{point.nama_outlet}</p>
                                    <div className="grid grid-cols-4 gap-x-4 gap-y-1 text-sm text-gray-600 mt-1">
                                        <span className="flex items-center gap-1.5"><Clock size={14} />{point.waktu_kunjungan}</span>
                                        <span className="flex items-center gap-1.5 capitalize"><Building size={14} />{point.kegiatan}</span>
                                        <span className="flex items-center gap-1.5"><Activity size={14} />Kompetitor: {point.kompetitor || '-'}</span>
                                        <span className="flex items-center gap-1.5"><AlertTriangle size={14} />Issue: {point.issue || '-'}</span>
                                        <span className="flex items-center gap-1.5"><BanknoteArrowUp  size={14} />potensi topup: {point.potensi_topup || '-'}</span>
                                        <span className="flex items-center gap-1.5"><Percent  size={14} />presentase pemakaian: {point.presentase_pemakaian || '-'}</span>
                                        <span className="flex items-center gap-1.5"><Banknote size={14} />rata-rata topup: {point.rata_rata_topup || '-'}</span>
                                        
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="p-6 text-center text-gray-500">Tidak ada detail kunjungan untuk ditampilkan.</p>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default TrackingPage;