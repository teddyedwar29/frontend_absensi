// src/pages/Sales/Dashboard.jsx

import React, { useState, useEffect, useRef } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { Clock, MapPin, Calendar, CheckCircle, XCircle, TrendingUp, LogIn, Camera, Image, RefreshCw, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { checkIn, getTodayAttendanceStatus, getAttendanceHistory } from '../../api/absensi'; // Import API absensi dan getAttendanceHistory

const SalesDashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isCheckedIn, setIsCheckedIn] = useState(false); // Status absensi hari ini (sudah check-in atau belum)
  const [checkInTime, setCheckInTime] = useState(null); // Waktu check-in (dari API atau setelah absen berhasil)
  const [checkOutTime, setCheckOutTime] = useState(null); // Waktu check-out

  // State untuk modal absensi kustom
  const [showAbsensiModal, setShowAbsensiModal] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationData, setLocationData] = useState({ latitude: null, longitude: null, address: '' });
  const [photoData, setPhotoData] = useState(null); // Menyimpan base64/URL foto
  const [showCameraStream, setShowCameraStream] = useState(false); // Untuk menampilkan stream kamera di modal
  const [absensiMessage, setAbsensiMessage] = useState({ type: '', text: '' }); // Untuk pesan sukses/gagal di modal

  const videoRef = useRef(null); // Ref untuk elemen video kamera
  const canvasRef = useRef(null); // Ref untuk elemen canvas foto

  const navigate = useNavigate();

  // State untuk riwayat absensi
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState(null);


  // Memperbarui waktu saat ini setiap detik
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Mengambil status absensi hari ini dan riwayat dari API saat komponen dimuat
  useEffect(() => {
    const fetchData = async () => {
      // Fetch status absensi hari ini
      const statusResponse = await getTodayAttendanceStatus();
      if (statusResponse.success && statusResponse.data && statusResponse.data.status_absen !== 'belum_absen') {
        setIsCheckedIn(true);
        if (statusResponse.data.waktu_absen) {
          const today = new Date();
          const [hours, minutes, seconds] = statusResponse.data.waktu_absen.split(':').map(Number);
          today.setHours(hours, minutes, seconds, 0);
          setCheckInTime(today);
        }
      } else {
        setIsCheckedIn(false);
      }

      // Fetch riwayat absensi
      setHistoryLoading(true);
      const historyResponse = await getAttendanceHistory();
      if (historyResponse.success) {
        // Sortir riwayat berdasarkan tanggal terbaru dan ambil 7 hari terakhir
        const sortedHistory = historyResponse.data.sort((a, b) => new Date(b.tanggal_absen) - new Date(a.tanggal_absen));
        setAttendanceHistory(sortedHistory.slice(0, 7)); // Ambil 7 record terbaru
        setHistoryError(null);
      } else {
        setHistoryError(historyResponse.message);
      }
      setHistoryLoading(false);
    };
    fetchData();
  }, []); // Jalankan hanya sekali saat komponen dimuat

  // Fungsi untuk mendapatkan lokasi pengguna
  const getCurrentLocation = async () => {
    setIsLoadingLocation(true);
    setAbsensiMessage({ type: '', text: '' }); // Clear previous messages
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          let address = `Lat: ${latitude.toFixed(6)}, Long: ${longitude.toFixed(6)}`; // Default jika reverse geocoding gagal
          try {
            // Reverse geocoding menggunakan Nominatim OpenStreetMap
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
            );
            const data = await res.json();
            address = data.display_name || address; // Simpan alamat lengkap untuk backend
            setAbsensiMessage({ type: 'success', text: 'Lokasi berhasil didapatkan!' });
          } catch (err) {
            console.error("Error reverse geocoding:", err);
            setAbsensiMessage({ type: 'warning', text: 'Gagal mendapatkan alamat, menggunakan koordinat.' });
          }
          setLocationData({ latitude, longitude, address: address }); // Simpan alamat lengkap di 'address'
          setIsLoadingLocation(false);
        },
        (error) => {
          console.error('Error mendapatkan lokasi:', error);
          setIsLoadingLocation(false);
          setLocationData({ latitude: null, longitude: null, address: 'Gagal mendapatkan lokasi.' });
          let errorMsg = '';
          if (error.code === 1) errorMsg = 'Izin lokasi ditolak. Aktifkan di pengaturan browser.';
          else if (error.code === 2) errorMsg = 'Lokasi tidak tersedia. Pastikan GPS aktif.';
          else if (error.code === 3) errorMsg = 'Timeout mendapatkan lokasi.';
          else errorMsg = 'Terjadi kesalahan saat mengambil lokasi.';
          setAbsensiMessage({ type: 'error', text: errorMsg });
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    } else {
      setIsLoadingLocation(false);
      setLocationData({ latitude: null, longitude: null, address: 'Geolocation tidak didukung oleh browser ini.' });
      setAbsensiMessage({ type: 'error', text: 'Geolocation tidak didukung oleh browser ini.' });
    }
  };

  // Fungsi untuk memulai kamera
  const startCamera = async () => {
    setAbsensiMessage({ type: '', text: '' }); // Clear previous messages
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } }); // Menggunakan kamera depan
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play(); // Pastikan video mulai diputar
      }
      setPhotoData(null); // Clear previous photo data when starting camera
      setShowCameraStream(true);
    } catch (error) {
      console.error('Error mengakses kamera:', error);
      setAbsensiMessage({ type: 'error', text: 'Tidak dapat mengakses kamera. Berikan izin kamera.' });
      setShowCameraStream(false);
    }
  };

  // Fungsi untuk mengambil foto dari kamera
  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');
      
      // Pastikan dimensi video valid, jika tidak, gunakan fallback atau dimensi elemen video
      const videoWidth = video.videoWidth > 0 ? video.videoWidth : video.clientWidth;
      const videoHeight = video.videoHeight > 0 ? video.videoHeight : video.clientHeight;

      canvas.width = videoWidth;
      canvas.height = videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const photoDataUrl = canvas.toDataURL('image/jpeg', 0.8); // Kompresi 80%
      setPhotoData(photoDataUrl);
      setShowCameraStream(false); // Sembunyikan stream kamera setelah foto diambil
      setAbsensiMessage({ type: 'success', text: 'Foto berhasil diambil!' });
      
      // Hentikan stream kamera setelah foto diambil
      const stream = video.srcObject;
      if (stream) {
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
        video.srcObject = null; // Penting: hapus referensi stream dari video elemen
      }
    }
  };

  // Handler untuk memilih foto dari galeri
  const handleFileChange = (e) => {
    setAbsensiMessage({ type: '', text: '' }); // Clear previous messages
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoData(reader.result);
        setShowCameraStream(false); // Pastikan stream kamera mati jika ada
        setAbsensiMessage({ type: 'success', text: 'Foto berhasil dipilih dari galeri!' });
      };
      reader.readAsDataURL(file);
    } else {
      setAbsensiMessage({ type: 'warning', text: 'Tidak ada foto yang dipilih.' });
    }
  };

  // Fungsi untuk menutup modal kamera/absensi dan mereset state terkait
  const closeAbsensiModal = () => {
    setShowAbsensiModal(false);
    setShowCameraStream(false);
    setLocationData({ latitude: null, longitude: null, address: '' });
    setPhotoData(null);
    setAbsensiMessage({ type: '', text: '' }); // Clear messages on close
    // Hentikan stream kamera jika masih aktif
    const stream = videoRef.current?.srcObject;
    if (stream) {
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null; // Penting: hapus referensi stream dari video elemen
    }
  };

  // Handler submit absensi dari modal kustom
  const handleSubmitAbsensi = async () => {
    setAbsensiMessage({ type: '', text: '' }); // Clear previous messages

    if (!locationData.latitude || !locationData.longitude) {
      setAbsensiMessage({ type: 'error', text: 'Lokasi diperlukan. Silakan dapatkan lokasi Anda.' });
      return;
    }
    if (!photoData) {
      setAbsensiMessage({ type: 'error', text: 'Foto diperlukan. Silakan ambil atau pilih foto.' });
      return;
    }

    setAbsensiMessage({ type: 'info', text: 'Mengirim absensi...' });

    try {
      const response = await checkIn(
        { latitude: locationData.latitude, longitude: locationData.longitude, address: locationData.address },
        photoData
      );

      if (response.success) {
        const now = new Date();
        setIsCheckedIn(true);
        setCheckInTime(now);
        setAbsensiMessage({ type: 'success', text: 'Absensi berhasil dikirim!' });
        // Refresh riwayat absensi setelah berhasil submit
        const updatedHistoryResponse = await getAttendanceHistory();
        if (updatedHistoryResponse.success) {
          const sortedHistory = updatedHistoryResponse.data.sort((a, b) => new Date(b.tanggal_absen) - new Date(a.tanggal_absen));
          setAttendanceHistory(sortedHistory.slice(0, 7));
        }
        // Optionally close modal after a short delay for user to see success message
        setTimeout(() => {
          closeAbsensiModal();
        }, 1500);
      } else {
        setAbsensiMessage({ type: 'error', text: response.message || 'Terjadi kesalahan saat mengirim absensi.' });
      }
    } catch (error) {
      console.error("Error submitting attendance:", error);
      setAbsensiMessage({ type: 'error', text: 'Error jaringan. Tidak dapat terhubung ke server.' });
    }
  };

  // Fungsi untuk menghitung durasi kerja dari waktu check-in dan check-out
  const calculateDuration = (checkInStr, checkOutStr) => {
    if (!checkInStr || !checkOutStr) return '0 Jam';

    try {
      const [inHours, inMinutes, inSeconds] = checkInStr.split(':').map(Number);
      const [outHours, outMinutes, outSeconds] = checkOutStr.split(':').map(Number);

      const checkInDate = new Date();
      checkInDate.setHours(inHours, inMinutes, inSeconds, 0);

      const checkOutDate = new Date();
      checkOutDate.setHours(outHours, outMinutes, outSeconds, 0);

      // Handle case where checkout is on the next day (e.g., check-in 23:00, check-out 01:00)
      if (checkOutDate < checkInDate) {
        checkOutDate.setDate(checkOutDate.getDate() + 1);
      }

      const diffMs = checkOutDate.getTime() - checkInDate.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);
      return `${diffHours.toFixed(1)} Jam`;
    } catch (e) {
      console.error("Error calculating duration:", e);
      return 'N/A';
    }
  };

  // Fungsi untuk memformat tanggal agar mudah dibaca
  const formatDisplayDate = (isoDateString) => {
    if (!isoDateString) return '-';
    const date = new Date(isoDateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Hari Ini';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Kemarin';
    } else {
      return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    }
  };


  const handleTambahkanKunjungan = () => {
    navigate('/sales/kunjungan');
  };

  return (
    <DashboardLayout>
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
                {/* Menampilkan jam kerja hari ini dari checkInTime jika sudah absen */}
                {isCheckedIn && checkInTime ? calculateDuration(checkInTime.toLocaleTimeString('en-US', { hour12: false }), new Date().toLocaleTimeString('en-US', { hour12: false })) : '0 Jam'}
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
            <button
              onClick={() => setShowAbsensiModal(true)} // Membuka modal kustom
              className={`w-full flex items-center justify-center px-4 py-3 rounded-lg transition-colors
                          ${
                            isCheckedIn
                              ? 'bg-gray-400 cursor-not-allowed'
                              : 'bg-green-600 hover:bg-green-700'
                          }
                          text-white`}
              disabled={isCheckedIn}
            >
              {isCheckedIn ? (
                <>
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Sudah Absen
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5 mr-2" />
                  Absen Sekarang
                </>
              )}
            </button>
            <button
              onClick={handleTambahkanKunjungan}
              className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Calendar className="w-5 h-5 mr-2" />
              Tambahkan Kunjungan
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
              <div className="text-right flex items-center">
                <p className="text-sm font-semibold text-gray-900 mr-2">
                  {checkInTime ? checkInTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                </p>
                {/* Tombol MapPin di sini hanya untuk display, tidak memicu absen */}
                <button
                  onClick={getCurrentLocation} // Ini hanya untuk demo menampilkan lokasi, tidak bagian dari alur absen
                  className="p-1 bg-blue-200 text-blue-800 rounded-full hover:bg-blue-300 transition-colors"
                  title="Dapatkan Lokasi Saat Ini"
                >
                  <MapPin className="w-4 h-4" />
                </button>
                <p className="text-xs text-gray-500 ml-2">
                  {locationData.address || 'Lokasi belum didapatkan'}
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

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Riwayat Absensi 7 Hari Terakhir</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-3">Tanggal</th>
                  <th scope="col" className="px-4 py-3">Absen pada jam</th> {/* Mengubah label kolom */}
                  <th scope="col" className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {historyLoading ? (
                  <tr>
                    <td colSpan="3" className="px-4 py-4 text-center text-gray-500">Memuat riwayat absensi...</td>
                  </tr>
                ) : historyError ? (
                  <tr>
                    <td colSpan="3" className="px-4 py-4 text-center text-red-500">{historyError}</td>
                  </tr>
                ) : attendanceHistory.length > 0 ? (
                  attendanceHistory.map((record, index) => (
                    <tr key={index} className="bg-white hover:bg-gray-50">
                      <td className="px-4 py-4 font-medium text-gray-900 whitespace-nowrap">
                        {formatDisplayDate(record.tanggal_absen)}
                      </td>
                      <td className="px-4 py-4">{record.waktu_absen || '--:--'}</td>
                      <td className="px-4 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          record.status_absen === 'Hadir' ? 'bg-green-100 text-green-800' :
                          record.status_absen === 'Terlambat' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800' // Untuk status lain atau belum absen
                        }`}>
                          {record.status_absen || 'N/A'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="px-4 py-4 text-center text-gray-500">Tidak ada riwayat absensi.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Custom Modal Absensi */}
      {showAbsensiModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md relative p-6">
            <button
              onClick={closeAbsensiModal}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
            <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">Absensi Check-In</h2>

            <div className="space-y-5">
              {/* Bagian Lokasi */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Lokasi Anda</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    // Tampilkan Lat dan Long di input
                    value={
                      locationData.latitude !== null && locationData.longitude !== null
                        ? `Lat: ${locationData.latitude.toFixed(6)}, Long: ${locationData.longitude.toFixed(6)}`
                        : 'Lokasi belum didapatkan'
                    }
                    readOnly
                    className="flex-grow px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                  />
                  <button
                    onClick={getCurrentLocation}
                    disabled={isLoadingLocation}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                  >
                    {isLoadingLocation ? (
                      <RefreshCw size={16} className="animate-spin" />
                    ) : (
                      <>
                        <MapPin size={16} className="mr-2" /> Dapatkan Lokasi
                      </>
                    )}
                  </button>
                </div>
                {/* Hapus tag <p> yang menampilkan lat/long terpisah */}
              </div>

              {/* Bagian Foto */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Foto Selfie</label>
                {photoData ? (
                  <div className="relative mb-3">
                    {/* Menggunakan elemen img untuk menampilkan foto */}
                    <img src={photoData} alt="Selfie Absen" className="w-full h-48 object-cover rounded-lg" />
                    <button
                      onClick={() => setPhotoData(null)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center">
                    {showCameraStream ? (
                      <div className="relative w-full h-full flex items-center justify-center">
                        {/* Video feed kamera */}
                        <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover rounded-lg" />
                        <button
                          onClick={takePhoto}
                          className="absolute bottom-4 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg"
                        >
                          <Camera size={24} />
                        </button>
                        {/* Canvas tersembunyi untuk mengambil frame video */}
                        <canvas ref={canvasRef} className="hidden" />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center space-y-3">
                        <button
                          onClick={startCamera}
                          className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          <Camera size={20} className="mr-2" /> Ambil Foto Langsung
                        </button>
                        <span className="text-gray-500 text-sm">atau</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                          id="gallery-upload"
                        />
                        <label
                          htmlFor="gallery-upload"
                          className="flex items-center px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors cursor-pointer"
                        >
                          <Image size={20} className="mr-2" /> Pilih dari Galeri
                        </label>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Message Box */}
              {absensiMessage.text && (
                <div className={`p-3 rounded-lg text-sm ${
                  absensiMessage.type === 'success' ? 'bg-green-100 text-green-800' :
                  absensiMessage.type === 'error' ? 'bg-red-100 text-red-800' :
                  'bg-blue-100 text-blue-800' // For 'info' or 'warning'
                }`}>
                  {absensiMessage.text}
                </div>
              )}

              {/* Tombol Aksi */}
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={closeAbsensiModal}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSubmitAbsensi}
                  disabled={!locationData.latitude || !photoData}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Kirim Absensi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default SalesDashboard;
