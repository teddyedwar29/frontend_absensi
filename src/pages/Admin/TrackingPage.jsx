import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import DashboardLayout from '../../components/DashboardLayout';
import API from '../../api/auth'; // Impor instance Axios Anda
import { ArrowLeft } from 'lucide-react';
// 👇👇 TAMBAHKAN 3 BARIS INI 👇👇
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

// Fungsi untuk mendapatkan tanggal hari ini dalam format YYYY-MM-DD
const getTodayString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const TrackingPage = () => {
  const { username } = useParams(); // Ambil username dari URL
  const [date, setDate] = useState(getTodayString());
  const [routeData, setRouteData] = useState([]);
  const [mapCenter, setMapCenter] = useState([-0.947083, 100.352222]); // Default: Padang
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const waypointPositions = routeData.map(point => point.position);

  useEffect(() => {
    const fetchTrackingData = async () => {
      if (!username || !date) return;

      setLoading(true);
      setError(null);
      setRouteData([]); // Kosongkan data rute sebelum fetch baru

      try {
        const response = await API.get(`/admin/tracking/daily/${username}/${date}`);
        const data = response.data;

        // Proses data koordinat, pastikan tidak error jika lokasi_koordinat null
        const processedRoute = data.route
          .filter(point => point.lokasi_koordinat) // Hanya proses yang ada koordinat
          .map(point => {
            const coords = point.lokasi_koordinat.split(',').map(Number);
            return { ...point, position: [coords[0], coords[1]] };
          });

        setRouteData(processedRoute);

        if (processedRoute.length > 0) {
          setMapCenter(processedRoute[0].position);
        } else {
            // Jika tidak ada data, tampilkan pesan
            setError(data.msg || "Tidak ada data kunjungan pada tanggal ini.");
        }

      } catch (err) {
        console.error("Gagal mengambil data tracking:", err);
        setError(err.response?.data?.msg || "Gagal memuat data. Pastikan format koordinat benar.");
      } finally {
        setLoading(false);
      }
    };

    fetchTrackingData();
  }, [username, date]); // Effect ini akan berjalan lagi jika username atau date berubah

  const polylinePositions = routeData.map(point => point.position);

  return (
    <DashboardLayout>
      <div className="flex items-center mb-4">
        <Link to="/admin/teams" className="text-blue-600 hover:underline flex items-center gap-2">
            <ArrowLeft size={20}/>
            Kembali ke Tim Sales
        </Link>
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Lacak Aktivitas Sales</h2>
      <p className="text-gray-600 mb-4">Menampilkan rute untuk <strong>{username}</strong></p>
      
      <div className="bg-white p-4 rounded-xl shadow-sm mb-6 flex items-center gap-4">
        <label htmlFor="tracking-date" className="font-semibold">Pilih Tanggal:</label>
        <input 
            type="date" 
            id="tracking-date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border rounded-lg px-3 py-2"
        />
      </div>

      <div className="bg-white p-1 rounded-xl shadow-sm">
        {loading ? (
            <p className="text-center py-20">Memuat peta...</p>
        ) : error && routeData.length === 0 ? (
            <p className="text-center py-20 text-red-500">{error}</p>
        ) : (
            <MapContainer center={mapCenter} zoom={13} style={{ height: '600px', width: '100%', borderRadius: '0.75rem' }}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {routeData.map((point, index) => (
                    <Marker key={index} position={point.position}>
                    <Popup>
                        <b>{index + 1}. {point.nama_outlet}</b><br />
                        Waktu: {point.waktu_kunjungan}<br />
                        Kegiatan: {point.kegiatan}
                    </Popup>
                    </Marker>
                ))}
                 {waypointPositions.length > 1 && (
                <RoutingMachine waypoints={waypointPositions} />
              )}
            </MapContainer>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TrackingPage;