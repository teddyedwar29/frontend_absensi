// src/pages/sales/Absensi.jsx

import React, { useState, useEffect, useRef } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { Camera, CheckCircle, XCircle, AlertCircle, Navigation, History, Clock, X } from 'lucide-react';
import Swal from 'sweetalert2';
import { isAuthenticated } from '../../api/auth';
import { getAttendanceHistory, checkIn, getTodayAttendanceStatus } from '../../api/absensi';

const AbsensiPage = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState('');
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [attendanceStatus, setAttendanceStatus] = useState('belum_absen'); // awalnya 'belum_absen'
  const [showCamera, setShowCamera] = useState(false);
  const [photoTaken, setPhotoTaken] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Memperbarui waktu saat ini setiap detik
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Mengambil riwayat absensi dan status hari ini dari API
  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated()) {
        setHistoryError("Anda tidak terautentikasi.");
        setHistoryLoading(false);
        return;
      }
      try {
        const historyResponse = await getAttendanceHistory();
        if (historyResponse.success) {
          setAttendanceHistory(historyResponse.data);
          setHistoryError(null);
        } else {
          setHistoryError(historyResponse.message);
        }

        const statusResponse = await getTodayAttendanceStatus();
        // Perbaikan di sini
        if (statusResponse.success && statusResponse.data) {
          setAttendanceStatus(statusResponse.data.status_absen); // "Hadir" atau "Terlambat"
        } else {
          setAttendanceStatus("belum_absen"); // Jika belum absen hari ini
        }
      } catch (err) {
        setHistoryError("Gagal memuat data.");
      } finally {
        setHistoryLoading(false);
      }
    };
    fetchData();
  }, []);

  const getCurrentLocation = async () => {
    setIsLoadingLocation(true);

    // Cek status izin lokasi
    if (navigator.permissions) {
      try {
        const permissionStatus = await navigator.permissions.query({ name: 'geolocation' });
        if (permissionStatus.state === 'denied') {
          Swal.fire({
            icon: 'error',
            title: 'Izin Lokasi Ditolak',
            text: 'Aplikasi tidak mendapat izin lokasi. Silakan aktifkan izin lokasi di pengaturan browser.',
          });
          setIsLoadingLocation(false);
          return;
        }
        // Jika granted atau prompt, lanjutkan ambil lokasi
      } catch (err) {
        // Jika gagal cek permission, lanjutkan ambil lokasi seperti biasa
      }
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          setLocation({ latitude, longitude, accuracy });
          // Reverse geocoding
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
            );
            const data = await res.json();
            setAddress(data.display_name || `${latitude}, ${longitude}`);
          } catch (err) {
            setAddress(`${latitude}, ${longitude}`);
          }
          setIsLoadingLocation(false);
        },
        (error) => {
          console.error('Error mendapatkan lokasi:', error);
          setIsLoadingLocation(false);
          let errorMsg = '';
          if (error.code === 1) errorMsg = 'Izin lokasi ditolak oleh user.';
          else if (error.code === 2) errorMsg = 'Lokasi tidak tersedia. Pastikan GPS aktif dan device mendukung.';
          else if (error.code === 3) errorMsg = 'Timeout mendapatkan lokasi.';
          else errorMsg = 'Terjadi kesalahan saat mengambil lokasi.';
          Swal.fire({
            icon: 'error',
            title: 'Gagal',
            text: errorMsg,
          });
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Peringatan',
        text: 'Geolocation tidak didukung oleh browser ini.',
      });
      setIsLoadingLocation(false);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setShowCamera(true);
    } catch (error) {
      console.error('Error mengakses kamera:', error);
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: 'Tidak dapat mengakses kamera. Pastikan memberikan izin kamera.',
      });
    }
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0);
      const photoDataUrl = canvas.toDataURL('image/jpeg');
      setPhotoTaken(photoDataUrl);
      setShowCamera(false); // Tutup modal, tapi jangan stop stream di sini!
    }
  };

  // Logika absensi hanya untuk Check-In
  const handleAttendanceSubmit = async () => {
    if (!location) {
      Swal.fire({
        icon: 'warning',
        title: 'Peringatan',
        text: 'Lokasi diperlukan untuk absensi. Silakan aktifkan GPS.',
      });
      return;
    }
    if (!photoTaken) {
      Swal.fire({
        icon: 'warning',
        title: 'Peringatan',
        text: 'Foto selfie diperlukan untuk absensi.',
      });
      return;
    }

    setIsSubmitting(true);

    // Convert base64 photo to Blob
    const blob = await (await fetch(photoTaken)).blob();

    const formData = new FormData();
    formData.append('lokasi', address); // alamat hasil reverse geocoding
    formData.append('foto_absen', blob, 'selfie.jpg');

    // Kirim ke backend
    const response = await fetch('/api/absensi', {
      method: 'POST',
      headers: {
        // Jangan set Content-Type, biar browser otomatis multipart/form-data
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: formData,
    });

    const result = await response.json();

    if (response.status === 201) {
      setAttendanceStatus(result.status_absen === 'Hadir' ? 'on_time' : 'late');
      Swal.fire({
        icon: 'success',
        title: 'Absensi Berhasil!',
        text: 'Data absensi berhasil dikirim.',
        showConfirmButton: false,
        timer: 2000,
      });
      // Refresh riwayat absensi
      const updatedHistory = await getAttendanceHistory();
      if (updatedHistory.success) {
        setAttendanceHistory(updatedHistory.data);
      }
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: result.message || 'Gagal absen.',
      });
    }
    setIsSubmitting(false);
    setPhotoTaken(null);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('id-ID', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('id-ID', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const handleCloseCamera = () => {
    const stream = videoRef.current?.srcObject;
    if (stream) {
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
    }
    setShowCamera(false);
  };

  return (
    <DashboardLayout>
      {/* Konten Absensi */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        {/* Waktu dan Tanggal Saat Ini */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-4 sm:p-6 text-white mb-6">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">{formatTime(currentTime)}</h2>
            <p className="text-blue-100 text-sm sm:text-base">{formatDate(currentTime)}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Formulir Absensi */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-4 sm:p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <Clock className="mr-2" size={20} />
                Absensi Hari Ini
              </h3>
            </div>
            
            <div className="p-4 sm:p-6">
              {/* Badge Status */}
              <div className="mb-6">
                <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                  attendanceStatus === 'belum_absen'
                    ? 'bg-gray-100 text-gray-800'
                    : attendanceStatus === 'Hadir'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800' // 'Terlambat'
                }`}>
                  {attendanceStatus === 'belum_absen' && 'Belum Absen'}
                  {attendanceStatus === 'Hadir' && 'Sudah Absen (Tepat Waktu)'}
                  {attendanceStatus === 'Terlambat' && 'Sudah Absen (Terlambat)'}
                </div>
              </div>

              {/* Lokasi */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-700">Lokasi</label>
                  <button
                    onClick={getCurrentLocation}
                    disabled={isLoadingLocation}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium disabled:opacity-50"
                  >
                    {isLoadingLocation ? 'Mencari...' : 'Dapatkan Lokasi'}
                  </button>
                </div>
                
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <Navigation size={16} className="text-gray-500 mr-2" />
                  <span className="text-sm text-gray-600">
                    {location
                      ? address // tampilkan alamat dari reverse geocoding
                      : 'Lokasi belum didapatkan'
                    }
                  </span>
                </div>
              </div>

              {/* Bagian Foto */}
              <div className="mb-6">
                <label className="text-sm font-medium text-gray-700 mb-3 block">Foto Selfie</label>
                
                {photoTaken ? (
                  <div className="relative">
                    <img 
                      src={photoTaken} 
                      alt="Selfie" 
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => setPhotoTaken(null)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                    >
                      <X size={16} />
                    </button>
                    <button
                      onClick={() => {
                        setPhotoTaken(null);
                        startCamera();
                      }}
                      className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition-colors"
                    >
                      Foto Ulang
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={startCamera}
                    className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-blue-400 hover:bg-blue-50 transition-colors"
                  >
                    <Camera size={32} className="text-gray-400 mb-2" />
                    <span className="text-gray-600 text-sm">Ambil Foto Selfie</span>
                  </button>
                )}
              </div>

              {/* Tombol Aksi */}
              <div className="space-y-3">
                {attendanceStatus === 'belum_absen' && (
                  <button
                    onClick={handleAttendanceSubmit}
                    disabled={!location || !photoTaken || isSubmitting}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium transition-colors"
                  >
                    {isSubmitting ? 'Memproses...' : 'Check In Sekarang'}
                  </button>
                )}
                
                {attendanceStatus !== 'belum_absen' && (
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <CheckCircle className="mx-auto text-blue-600 mb-2" size={32} />
                    <p className="text-blue-800 font-medium">Absensi hari ini sudah selesai</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Riwayat Absensi */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-4 sm:p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <History className="mr-2" size={20} />
                Riwayat Absensi
              </h3>
            </div>
            
            <div className="p-4 sm:p-6">
              {historyLoading ? (
                <div className="text-center text-gray-500">Memuat riwayat...</div>
              ) : historyError ? (
                <div className="text-center text-red-500">{historyError}</div>
              ) : attendanceHistory.length > 0 ? (
                <div className="space-y-4">
                  {attendanceHistory.map((record, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-800 text-sm">
                          {record.tanggal ? record.tanggal : '-'} {/* Tanggal */}
                        </span>
                        <span className="text-xs text-gray-600">
                          {record.waktu_absen ? record.waktu_absen : '-'} {/* Waktu Absen */}
                        </span>
                        <span className="text-xs text-gray-600">
                          {record.lokasi ? record.lokasi : '-'} {/* Lokasi */}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full mt-1 ${
                          record.status_absen === 'Hadir' ? 'bg-green-100 text-green-800' :
                          record.status_absen === 'Terlambat' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {record.status_absen ? record.status_absen : '-'} {/* Status Absen */}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500">Tidak ada riwayat absensi.</div>
              )}
              
              <div className="mt-6 pt-6 border-t border-gray-100">
                <button className="w-full py-2 px-4 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium text-sm">
                  Lihat Semua Riwayat
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Kamera */}
      {showCamera && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
          <div className="bg-white rounded-lg p-4 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Ambil Foto Selfie</h3>
              <button
                onClick={handleCloseCamera}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-64 object-cover rounded-lg bg-gray-200"
              />
              <button
                onClick={takePhoto}
                className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full"
              >
                <Camera size={24} />
              </button>
            </div>
            
            <canvas ref={canvasRef} className="hidden" />
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AbsensiPage;
