import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix untuk ikon marker yang tidak muncul di React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/shadow.png'),
});


const TrackingMap = ({ username, date }) => {
  const [routeData, setRouteData] = useState([]);
  const [mapCenter, setMapCenter] = useState([-0.947083, 100.352222]); // Default: Padang
  const [error, setError] = useState(null);

  useEffect(() => {
    // Pastikan username dan date ada sebelum fetch data
    if (!username || !date) return;

    const fetchTrackingData = async () => {
      try {
        // Ambil token dari local storage (sesuaikan dengan cara Anda menyimpan token)
        const token = localStorage.getItem('accessToken');
        if (!token) {
          setError("Anda harus login terlebih dahulu.");
          return;
        }

        const response = await fetch(
          `http://127.0.0.1:5000/admin/tracking/daily/${username}/${date}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        if (!response.ok) {
          throw new Error('Gagal mengambil data tracking.');
        }

        const data = await response.json();

        // Proses data koordinat
        const processedRoute = data.route.map(point => {
            const [lat, lon] = point.lokasi_koordinat.split(',').map(Number);
            return { ...point, position: [lat, lon] };
        });

        setRouteData(processedRoute);

        // Atur pusat peta ke lokasi kunjungan pertama
        if (processedRoute.length > 0) {
          setMapCenter(processedRoute[0].position);
        }

      } catch (err) {
        setError(err.message);
      }
    };

    fetchTrackingData();
  }, [username, date]); // Effect ini akan berjalan lagi jika username atau date berubah

  // Siapkan posisi untuk garis Polyline
  const polylinePositions = routeData.map(point => point.position);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <MapContainer center={mapCenter} zoom={13} style={{ height: '600px', width: '100%' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {/* Gambar semua titik lokasi kunjungan */}
      {routeData.map((point, index) => (
        <Marker key={index} position={point.position}>
          <Popup>
            <b>{index + 1}. {point.nama_outlet}</b><br />
            Waktu: {point.waktu_kunjungan}<br />
            Kegiatan: {point.kegiatan}
          </Popup>
        </Marker>
      ))}

      {/* Gambar garis yang menghubungkan semua titik */}
      {polylinePositions.length > 1 && (
        <Polyline pathOptions={{ color: 'blue' }} positions={polylinePositions} />
      )}
    </MapContainer>
  );
};

export default TrackingMap;