import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Users, TrendingUp, MapPin, Bell, Settings, LogOut, Menu, X, Camera, CheckCircle, XCircle, AlertCircle, Navigation, History, User } from 'lucide-react';

const AttendancePage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState({ name: 'Ahmad Rizki', role: 'Sales Executive' });
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [location, setLocation] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [attendanceStatus, setAttendanceStatus] = useState('not_checked_in'); // not_checked_in, checked_in, checked_out
  const [showCamera, setShowCamera] = useState(false);
  const [photoTaken, setPhotoTaken] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Mock attendance history
  const attendanceHistory = [
    { date: '2024-01-15', checkIn: '08:10', checkOut: '17:45', status: 'present', location: 'Jakarta Pusat' },
    { date: '2024-01-14', checkIn: '08:25', checkOut: '17:30', status: 'late', location: 'Jakarta Pusat' },
    { date: '2024-01-13', checkIn: '08:05', checkOut: '17:40', status: 'present', location: 'Jakarta Pusat' },
    { date: '2024-01-12', checkIn: '-', checkOut: '-', status: 'absent', location: '-' },
    { date: '2024-01-11', checkIn: '08:15', checkOut: '17:35', status: 'present', location: 'Jakarta Pusat' },
  ];

  // Get current location
  const getCurrentLocation = () => {
    setIsLoadingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
          setIsLoadingLocation(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setIsLoadingLocation(false);
          alert('Tidak dapat mengakses lokasi. Pastikan GPS aktif dan berikan izin lokasi.');
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    } else {
      alert('Geolocation tidak didukung oleh browser ini.');
      setIsLoadingLocation(false);
    }
  };

  // Start camera
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
      console.error('Error accessing camera:', error);
      alert('Tidak dapat mengakses kamera. Pastikan memberikan izin kamera.');
    }
  };

  // Take photo
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
      
      // Stop camera
      const stream = video.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      setShowCamera(false);
    }
  };

  // Handle attendance submission
  const handleAttendanceSubmit = async (type) => {
    if (!location) {
      alert('Lokasi diperlukan untuk absensi. Silakan aktifkan GPS.');
      return;
    }

    if (!photoTaken) {
      alert('Foto selfie diperlukan untuk absensi.');
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      if (type === 'check_in') {
        setAttendanceStatus('checked_in');
        alert('Check-in berhasil!');
      } else {
        setAttendanceStatus('checked_out');
        alert('Check-out berhasil!');
      }
      setIsSubmitting(false);
      setPhotoTaken(null);
    }, 2000);
  };

  // Mock function untuk logout
  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    alert('Logout berhasil! (Demo mode)');
    setShowLogoutModal(false);
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

const Sidebar = ({ sidebarOpen, setSidebarOpen, handleLogout }) => {
  const navigate = useNavigate();

  return (
    <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-blue-900 to-blue-800 text-white transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
      <div className="flex items-center justify-between h-16 px-6 border-b border-blue-700">
        <h1 className="text-xl font-bold">AbsensiPro</h1>
        <button 
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden"
        >
          <X size={24} />
        </button>
      </div>
      
      <nav className="mt-8">
        <div className="px-6 py-3">
          <p className="text-blue-200 text-sm font-medium">MENU UTAMA</p>
        </div>
        
        <button
          onClick={() => navigate('/dashboard')}
          className="flex w-full items-center px-6 py-3 text-blue-100 hover:bg-blue-700 hover:text-white transition-colors cursor-pointer"
        >
          <TrendingUp size={20} className="mr-3" />
          Dashboard
        </button>
        
        <button
          onClick={() => navigate('/absensi')}
          className="flex w-full items-center px-6 py-3 text-white bg-blue-700 border-r-4 border-blue-400"
        >
          <Calendar size={20} className="mr-3" />
          Absensi
        </button>
        
        <button className="flex w-full items-center px-6 py-3 text-blue-100 hover:bg-blue-700 hover:text-white transition-colors">
          <Users size={20} className="mr-3" />
          Tim Sales
        </button>
        
        <button className="flex w-full items-center px-6 py-3 text-blue-100 hover:bg-blue-700 hover:text-white transition-colors">
          <MapPin size={20} className="mr-3" />
          Lokasi
        </button>
        
        <div className="px-6 py-3 mt-8">
          <p className="text-blue-200 text-sm font-medium">PENGATURAN</p>
        </div>
        
        <button className="flex w-full items-center px-6 py-3 text-blue-100 hover:bg-blue-700 hover:text-white transition-colors">
          <Bell size={20} className="mr-3" />
          Notifikasi
        </button>
        
        <button className="flex w-full items-center px-6 py-3 text-blue-100 hover:bg-blue-700 hover:text-white transition-colors">
          <Settings size={20} className="mr-3" />
          Pengaturan
        </button>
        
        <button
          onClick={handleLogout}
          className="flex w-full items-center px-6 py-3 text-blue-100 hover:bg-blue-700 hover:text-white transition-colors mt-8"
        >
          <LogOut size={20} className="mr-3" />
          Keluar
        </button>
      </nav>
    </div>
  );
};

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      {/* Overlay untuk mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-25 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-4 sm:px-6 py-4">
            <div className="flex items-center min-w-0">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden mr-3 sm:mr-4 p-1"
              >
                <Menu size={24} />
              </button>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-800 truncate">Absensi</h1>
                <p className="text-sm sm:text-base text-gray-600 truncate">Kelola kehadiran Anda</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-800">{user.name}</p>
                <p className="text-xs text-gray-600">{user.role}</p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm sm:text-base">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
              </div>
            </div>
          </div>
        </header>
        
        {/* Attendance Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* Current Time & Date */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-4 sm:p-6 text-white mb-6">
            <div className="text-center">
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">{formatTime(currentTime)}</h2>
              <p className="text-blue-100 text-sm sm:text-base">{formatDate(currentTime)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Attendance Form */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-4 sm:p-6 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <Clock className="mr-2" size={20} />
                  Absensi Hari Ini
                </h3>
              </div>
              
              <div className="p-4 sm:p-6">
                {/* Status Badge */}
                <div className="mb-6">
                  <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                    attendanceStatus === 'not_checked_in' 
                      ? 'bg-gray-100 text-gray-800' 
                      : attendanceStatus === 'checked_in'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {attendanceStatus === 'not_checked_in' && 'Belum Absen'}
                    {attendanceStatus === 'checked_in' && 'Sudah Check-in'}
                    {attendanceStatus === 'checked_out' && 'Sudah Check-out'}
                  </div>
                </div>

                {/* Location */}
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
                        ? `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`
                        : 'Lokasi belum didapatkan'
                      }
                    </span>
                  </div>
                </div>

                {/* Photo Section */}
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

                {/* Action Buttons */}
                <div className="space-y-3">
                  {attendanceStatus === 'not_checked_in' && (
                    <button
                      onClick={() => handleAttendanceSubmit('check_in')}
                      disabled={!location || !photoTaken || isSubmitting}
                      className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium transition-colors"
                    >
                      {isSubmitting ? 'Processing...' : 'Check In'}
                    </button>
                  )}
                  
                  {attendanceStatus === 'checked_in' && (
                    <button
                      onClick={() => handleAttendanceSubmit('check_out')}
                      disabled={!location || !photoTaken || isSubmitting}
                      className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium transition-colors"
                    >
                      {isSubmitting ? 'Processing...' : 'Check Out'}
                    </button>
                  )}
                  
                  {attendanceStatus === 'checked_out' && (
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <CheckCircle className="mx-auto text-blue-600 mb-2" size={32} />
                      <p className="text-blue-800 font-medium">Absensi hari ini sudah selesai</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Attendance History */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-4 sm:p-6 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <History className="mr-2" size={20} />
                  Riwayat Absensi
                </h3>
              </div>
              
              <div className="p-4 sm:p-6">
                <div className="space-y-4">
                  {attendanceHistory.map((record, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          record.status === 'present' ? 'bg-green-500' :
                          record.status === 'late' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}></div>
                        <div>
                          <p className="font-medium text-gray-800 text-sm">{record.date}</p>
                          <p className="text-xs text-gray-600">{record.location}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex space-x-2 text-xs">
                          <span className="text-gray-600">
                            In: {record.checkIn}
                          </span>
                          <span className="text-gray-600">
                            Out: {record.checkOut}
                          </span>
                        </div>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full mt-1 ${
                          record.status === 'present' ? 'bg-green-100 text-green-800' :
                          record.status === 'late' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {record.status === 'present' ? 'Hadir' :
                           record.status === 'late' ? 'Terlambat' : 'Tidak Hadir'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <button className="w-full py-2 px-4 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium text-sm">
                    Lihat Semua Riwayat
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Camera Modal */}
      {showCamera && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
          <div className="bg-white rounded-lg p-4 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Ambil Foto Selfie</h3>
              <button
                onClick={() => {
                  const stream = videoRef.current?.srcObject;
                  if (stream) {
                    const tracks = stream.getTracks();
                    tracks.forEach(track => track.stop());
                  }
                  setShowCamera(false);
                }}
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

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 sm:mb-4">Konfirmasi Logout</h3>
            <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">Apakah Anda yakin ingin keluar dari sistem?</p>
            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
              >
                Batal
              </button>
              <button
                onClick={confirmLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm sm:text-base"
              >
                Ya, Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendancePage;