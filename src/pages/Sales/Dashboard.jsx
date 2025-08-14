// src/pages/Sales/Absensi.jsx

import React, { useState, useEffect, useRef } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { Clock, CheckCircle, LogIn, Camera, MapPin, RefreshCw, X, FileText, Calendar } from 'lucide-react';
import Swal from 'sweetalert2';
import { checkIn, isCheckedIn, getTodayAttendanceStatus, getAttendanceHistory } from '../../api/absensi';
import { createIzin, getTodayIzinStatus, getIzinHistory } from '../../api/izin';

// Komponen Modal
function Modal({ open, onClose, children }) {
    if (!open) return null;
    return (
        <div onClick={onClose} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-xl shadow-lg w-full max-w-md relative p-6">
                <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 z-10"><X size={24} /></button>
                {children}
            </div>
        </div>
    );
}

const AbsensiPage = () => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [attendanceStatus, setAttendanceStatus] = useState({ loading: true, status: 'Memuat...' });
    const [izinStatus, setIzinStatus] = useState({ loading: true, status: 'Memuat...' });
    
    // State untuk alur absensi
    const [flowState, setFlowState] = useState('idle');
    const [location, setLocation] = useState(null);
    const [address, setAddress] = useState('');
    const [photo, setPhoto] = useState(null);
    const [showAbsensiModal, setShowAbsensiModal] = useState(false);
    
    // State untuk izin
    const [showIzinModal, setShowIzinModal] = useState(false);
    const [izinDate, setIzinDate] = useState('');
    const [izinKeterangan, setIzinKeterangan] = useState('');
    const [izinSubmitting, setIzinSubmitting] = useState(false);

    // State untuk riwayat
    const [attendanceHistory, setAttendanceHistory] = useState([]);
    const [izinHistory, setIzinHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('absensi');

    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    // Fungsi untuk memuat semua data awal
    const fetchInitialData = async () => {
        setHistoryLoading(true);
        try {
            // Fetch attendance status
            const statusResponse = await getTodayAttendanceStatus();
            // console.log('Status response:', statusResponse);
            
            if (statusResponse.success && statusResponse.data) {
                if (statusResponse.data.status_absen && statusResponse.data.status_absen !== 'Belum Absen') {
                    setAttendanceStatus({ loading: false, status: statusResponse.data.status_absen });
                } else {
                    setAttendanceStatus({ loading: false, status: 'Belum Absen' });
                }
            } else {
                setAttendanceStatus({ loading: false, status: 'Belum Absen' });
            }
            
            // Fetch izin status
            const izinStatusResponse = await getTodayIzinStatus();
            if (izinStatusResponse.success && izinStatusResponse.data) {
                setIzinStatus({ loading: false, status: izinStatusResponse.data.status_izin });
            } else {
                setIzinStatus({ loading: false, status: 'Belum Ada' });
            }
            
            // Fetch histories
            const historyResponse = await getAttendanceHistory();
            if (historyResponse.success) {
                const sorted = historyResponse.data.sort((a, b) => new Date(b.tanggal_absen) - new Date(a.tanggal_absen));
                setAttendanceHistory(sorted);
            }
            
            const izinHistoryResponse = await getIzinHistory();
            if (izinHistoryResponse.success) {
                const sortedIzin = izinHistoryResponse.data.sort((a, b) => new Date(b.tanggal_izin) - new Date(a.tanggal_izin));
                setIzinHistory(sortedIzin);
            }
            
        } catch (error) {
            console.error('Error fetching data:', error);
            setAttendanceStatus({ loading: false, status: 'Belum Absen' });
            setIzinStatus({ loading: false, status: 'Belum Ada' });
        }
        setHistoryLoading(false);
    };

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        fetchInitialData();
        return () => clearInterval(timer);
    }, []);

    // Fungsi format waktu
    const formatTime = (date) => date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const formatDate = (date) => date.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const formatDisplayDate = (iso) => new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    const formatTimeString = (timeStr) => {
        if (!timeStr) return '--:--';
        const [hours, minutes] = timeStr.split(':');
        return `${hours}:${minutes}`;
    };
    
    // ALUR ABSENSI - PERBAIKAN UTAMA
    const handleStartAttendance = async () => {
        // Tampilkan loading sementara saat pengecekan
        Swal.fire({
            title: 'Mengecek Status...',
            text: 'Memverifikasi status absensi Anda',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });
        
        try {
            // Cek status absensi terkini sebelum memulai proses
            const currentStatus = await getTodayAttendanceStatus();
            console.log('Fresh status check:', 'cie ngapain kamu tu'); // Debug log
            
            if (currentStatus.success && currentStatus.data && 
                currentStatus.data.status_absen && 
                currentStatus.data.status_absen !== 'Belum Absen') {
                
                Swal.fire({
                    title: 'Rajin Banget, Bos! 👏',
                    html: `
                        <div class="text-center">
                            <p class="mb-3">Anda sudah absen hari ini dengan status:</p>
                            <span class="inline-block px-4 py-2 bg-green-100 text-green-800 rounded-full font-semibold">
                                ${currentStatus.data.status_absen}
                            </span>
                            ${currentStatus.data.waktu_absen ? `<p class="mt-3 text-sm text-gray-600">Waktu absen: ${formatTimeString(currentStatus.data.waktu_absen)}</p>` : ''}
                            <p class="mt-3 text-gray-500">Sampai jumpa besok!</p>
                        </div>
                    `,
                    icon: 'success',
                    confirmButtonColor: '#10b981',
                    confirmButtonText: 'OK'
                });
                
                // Update state untuk sinkronisasi UI
                setAttendanceStatus({ loading: false, status: currentStatus.data.status_absen });
                return;
            }

            // Tutup loading dan lanjutkan proses absensi
            Swal.close();
            
            // Jika belum absen, lanjutkan proses
            setShowAbsensiModal(true);
            setFlowState('locating');
            
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    async (position) => {
                        const { latitude, longitude } = position.coords;
                        setLocation({ latitude, longitude });
                        try {
                            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`);
                            const data = await res.json();
                            setAddress(data.display_name || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
                        } catch (err) {
                            setAddress(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
                        }
                        startCamera();
                    },
                    (error) => {
                        console.error('Geolocation error:', error);
                        Swal.fire('Gagal', 'Tidak dapat mengakses lokasi. Pastikan GPS dan izin lokasi aktif.', 'error');
                        handleCancel();
                    },
                    { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
                );
            } else {
                Swal.fire('Peringatan', 'Geolocation tidak didukung.', 'warning');
                setFlowState('idle');
            }
        } catch (error) {
            console.error('Error checking attendance status:', error);
            Swal.fire('Error', 'Terjadi kesalahan saat mengecek status absensi.', 'error');
        }
    };

    const startCamera = async () => {
        setFlowState('capturing');
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
            if (videoRef.current) videoRef.current.srcObject = stream;
        } catch (error) {
            console.error('Camera error:', error);
            Swal.fire('Gagal', 'Tidak dapat mengakses kamera.', 'error');
            handleCancel();
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
            setPhoto(photoDataUrl);
            const stream = video.srcObject;
            stream.getTracks().forEach(track => track.stop());
            setFlowState('previewing');
        }
    };

    const handleSubmitAbsensi = async () => {
        setFlowState('submitting');
        try {
            const result = await checkIn(location, photo);
            
            if (result.success) {
                Swal.fire({
                    title: 'Berhasil! 🎉',
                    text: 'Absensi berhasil dikirim.',
                    icon: 'success',
                    confirmButtonColor: '#10b981'
                });
                // Refresh data setelah berhasil absen
                await fetchInitialData();
            } else {
                // Handle error dari backend
                if (result.isAlreadyCheckedIn) {
                    // Jika sudah absen (backend validation)
                    Swal.fire({
                        title: 'Ups! 😅',
                        text: result.message,
                        icon: 'warning',
                        confirmButtonColor: '#f59e0b'
                    });
                    // Refresh data untuk update UI
                    await fetchInitialData();
                } else {
                    // Error lainnya
                    Swal.fire({
                        title: 'Gagal!',
                        text: result.message || 'Terjadi kesalahan saat mengirim absensi.',
                        icon: 'error',
                        confirmButtonColor: '#ef4444'
                    });
                }
            }
        } catch (error) {
            console.error('Submit error:', error);
            Swal.fire({
                title: 'Error!',
                text: 'Terjadi kesalahan jaringan. Silakan coba lagi.',
                icon: 'error',
                confirmButtonColor: '#ef4444'
            });
        }
        handleCancel();
    };

    // FUNGSI IZIN
    const handleOpenIzinModal = () => {
        // Set default date to today
        const today = new Date().toISOString().split('T')[0];
        setIzinDate(today);
        setIzinKeterangan('');
        setShowIzinModal(true);
    };

    const handleSubmitIzin = async () => {
        if (!izinDate) {
            Swal.fire('Error', 'Tanggal izin harus diisi!', 'error');
            return;
        }

        setIzinSubmitting(true);
        try {
            const result = await createIzin(izinDate, izinKeterangan);
            
            if (result.success) {
                Swal.fire({
                    title: 'Berhasil! 📝',
                    text: 'Izin berhasil diajukan dan menunggu persetujuan.',
                    icon: 'success',
                    confirmButtonColor: '#10b981'
                });
                
                // Refresh data
                await fetchInitialData();
                setShowIzinModal(false);
            } else {
                Swal.fire('Gagal!', result.message, 'error');
            }
        } catch (error) {
            console.error('Error submitting izin:', error);
            Swal.fire('Error!', 'Terjadi kesalahan saat mengajukan izin.', 'error');
        }
        setIzinSubmitting(false);
    };

    const handleCancelIzin = () => {
        setShowIzinModal(false);
        setIzinDate('');
        setIzinKeterangan('');
    };

    const handleCancel = () => {
        setFlowState('idle');
        setPhoto(null);
        setLocation(null);
        setAddress('');
        setShowAbsensiModal(false);
        const stream = videoRef.current?.srcObject;
        if (stream) stream.getTracks().forEach(track => track.stop());
    };

    const renderMainContent = () => {
        if (attendanceStatus.loading || izinStatus.loading) {
            return (
                <div className="text-center py-10">
                    <RefreshCw className="mx-auto animate-spin text-gray-400 mb-4" size={40} />
                    <p className="text-gray-500">Memuat status...</p>
                </div>
            );
        }
        
        // Jika sudah absen atau sudah izin
        if (attendanceStatus.status !== 'Belum Absen' || 
            (izinStatus.status !== 'Belum Ada' && izinStatus.status !== 'rejected')) {
            return (
                <div className="text-center py-10">
                    <CheckCircle className="mx-auto text-green-500 mb-4" size={48} />
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Status Hari Ini</h3>
                    
                    {attendanceStatus.status !== 'Belum Absen' && (
                        <div className="mb-3">
                            <p className="text-gray-600">Absensi: 
                                <strong className="text-green-600 ml-2">{attendanceStatus.status}</strong>
                            </p>
                        </div>
                    )}
                    
                    {izinStatus.status !== 'Belum Ada' && izinStatus.status !== 'rejected' && (
                        <div className="mb-3">
                            <p className="text-gray-600">Izin: 
                                <strong className={`ml-2 ${
                                    izinStatus.status === 'approved' ? 'text-green-600' :
                                    izinStatus.status === 'pending' ? 'text-yellow-600' : 
                                    'text-red-600'
                                }`}>
                                    {izinStatus.status === 'approved' ? 'Disetujui' :
                                     izinStatus.status === 'pending' ? 'Menunggu Persetujuan' :
                                     'Ditolak'}
                                </strong>
                            </p>
                        </div>
                    )}
                    
                    <p className="text-sm text-gray-400 mt-4">
                        {attendanceStatus.status !== 'Belum Absen' ? 
                            'Terima kasih telah hadir hari ini!' : 
                            'Izin Anda sedang diproses'}
                    </p>
                </div>
            );
        }
        
        // Jika belum absen dan belum izin
        return (
            <div className="text-center py-10">
                <Clock className="mx-auto text-blue-500 mb-4" size={48} />
                <h3 className="text-xl font-semibold mb-2">Pilih Aksi Hari Ini</h3>
                <p className="text-gray-600 mb-6">Lakukan absensi atau ajukan izin sesuai kebutuhan Anda.</p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto">
                    <button 
                        onClick={handleStartAttendance} 
                        className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg transition-all duration-200 hover:scale-105 shadow-lg"
                    >
                        <div className="flex items-center justify-center gap-2">
                            <LogIn size={20} />
                            Absen Sekarang
                        </div>
                    </button>
                    
                    <div className="text-gray-400 font-medium">atau</div>
                    
                    <button 
                        onClick={handleOpenIzinModal} 
                        className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-6 rounded-lg transition-all duration-200 hover:scale-105 shadow-lg"
                    >
                        <div className="flex items-center justify-center gap-2">
                            <FileText size={20} />
                            Ajukan Izin
                        </div>
                    </button>
                </div>
            </div>
        );
    };

    return (
        <DashboardLayout>
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white mb-6 text-center">
                <h2 className="text-4xl font-bold">{formatTime(currentTime)}</h2>
                <p className="text-blue-100">{formatDate(currentTime)}</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                {renderMainContent()}
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Riwayat Terakhir</h3>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setActiveTab('absensi')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                activeTab === 'absensi' 
                                    ? 'bg-blue-500 text-white' 
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            Absensi
                        </button>
                        <button 
                            onClick={() => setActiveTab('izin')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                activeTab === 'izin' 
                                    ? 'bg-orange-500 text-white' 
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            Izin
                        </button>
                    </div>
                </div>
                
                <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
                    {activeTab === 'absensi' ? (
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0">
                                <tr>
                                    <th scope="col" className="px-4 py-3">Tanggal</th>
                                    <th scope="col" className="px-4 py-3">Jam Absen</th>
                                    <th scope="col" className="px-4 py-3">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {historyLoading ? (
                                    <tr>
                                        <td colSpan="3" className="text-center py-6">
                                            <RefreshCw className="mx-auto animate-spin text-gray-400 mb-2" size={24} />
                                            <p>Memuat riwayat...</p>
                                        </td>
                                    </tr>
                                ) : attendanceHistory.length > 0 ? (
                                    attendanceHistory.slice(0, 10).map((record) => (
                                        <tr key={record.id} className="bg-white border-b hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-4 font-medium text-gray-900">{formatDisplayDate(record.tanggal)}</td>
                                            <td className="px-4 py-4">{formatTimeString(record.waktu_absen)}</td>
                                            <td className="px-4 py-4">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                    record.status_absen === 'Hadir' ? 'bg-green-100 text-green-800' :
                                                    record.status_absen === 'Terlambat' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                    {record.status_absen}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="3" className="text-center py-6 text-gray-500">
                                            Tidak ada riwayat absensi.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    ) : (
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0">
                                <tr>
                                    <th scope="col" className="px-4 py-3">Tanggal Izin</th>
                                    <th scope="col" className="px-4 py-3">Keterangan</th>
                                    <th scope="col" className="px-4 py-3">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {historyLoading ? (
                                    <tr>
                                        <td colSpan="3" className="text-center py-6">
                                            <RefreshCw className="mx-auto animate-spin text-gray-400 mb-2" size={24} />
                                            <p>Memuat riwayat...</p>
                                        </td>
                                    </tr>
                                ) : izinHistory.length > 0 ? (
                                    izinHistory.slice(0, 10).map((record) => (
                                        <tr key={record.id} className="bg-white border-b hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-4 font-medium text-gray-900">{formatDisplayDate(record.tanggal_izin)}</td>
                                            <td className="px-4 py-4 max-w-xs">
                                                <div className="truncate" title={record.keterangan || 'Tidak ada keterangan'}>
                                                    {record.keterangan || 'Tidak ada keterangan'}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                    record.status_izin === 'approved' ? 'bg-green-100 text-green-800' :
                                                    record.status_izin === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                    {record.status_izin === 'approved' ? 'Disetujui' :
                                                    record.status_izin === 'pending' ? 'Pending' :
                                                    'Ditolak'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="3" className="text-center py-6 text-gray-500">
                                            Tidak ada riwayat izin.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Modal Absensi */}
            <Modal open={showAbsensiModal} onClose={handleCancel}>
                <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">Absensi Check-In</h2>
                
                {flowState === 'locating' && (
                    <div className="text-center py-10">
                        <RefreshCw size={40} className="mx-auto animate-spin text-blue-500 mb-4" />
                        <p className="font-semibold text-gray-700">Mendapatkan Lokasi...</p>
                        <p className="text-sm text-gray-500 mt-2">Pastikan GPS Anda aktif</p>
                    </div>
                )}
                
                {flowState === 'capturing' && (
                    <div className="text-center">
                        <h3 className="text-lg font-semibold mb-4">Ambil Foto Selfie</h3>
                        <div className="relative">
                            <video ref={videoRef} autoPlay playsInline className="w-full h-64 object-cover rounded-lg bg-gray-200" />
                            <canvas ref={canvasRef} className="hidden" />
                            <button 
                                onClick={takePhoto} 
                                className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-blue-600 hover:bg-blue-700 p-3 rounded-full shadow-lg transition-colors"
                            >
                                <Camera size={24} className="text-white" />
                            </button>
                        </div>
                        <p className="text-sm text-gray-500 mt-3">Pastikan wajah Anda terlihat jelas</p>
                    </div>
                )}
                
                {flowState === 'previewing' && (
                    <div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center mb-6">
                            {photo && <img src={photo} alt="Preview" className="w-full rounded-lg object-cover shadow-sm" />}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="flex items-center mb-2">
                                    <MapPin size={16} className="text-gray-500 mr-2" />
                                    <p className="font-semibold text-gray-700">Lokasi Anda:</p>
                                </div>
                                <p className="text-sm text-gray-600 break-words">{address}</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <button 
                                onClick={handleCancel} 
                                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-lg font-medium transition-colors"
                            >
                                Ulangi
                            </button>
                            <button 
                                onClick={handleSubmitAbsensi} 
                                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium transition-colors"
                            >
                                Kirim Absen
                            </button>
                        </div>
                    </div>
                )}
                
                {flowState === 'submitting' && (
                    <div className="text-center py-10">
                        <RefreshCw size={40} className="mx-auto animate-spin text-green-500 mb-4" />
                        <p className="font-semibold text-gray-700">Mengirim Absensi...</p>
                        <p className="text-sm text-gray-500 mt-2">Mohon tunggu sebentar</p>
                    </div>
                )}
            </Modal>

            {/* Modal Izin */}
            <Modal open={showIzinModal} onClose={handleCancelIzin}>
                <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">Ajukan Izin</h2>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Calendar size={16} className="inline mr-2" />
                            Tanggal Izin
                        </label>
                        <input
                            type="date"
                            value={izinDate}
                            onChange={(e) => setIzinDate(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <FileText size={16} className="inline mr-2" />
                            Keterangan (wajib)
                        </label>
                        <textarea
                            value={izinKeterangan}
                            onChange={(e) => setIzinKeterangan(e.target.value)}
                            placeholder="Masukkan alasan izin..."
                            rows={4}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
                        />
                    </div>
                    
                    <div className="flex gap-4 mt-6">
                        <button 
                            onClick={handleCancelIzin}
                            disabled={izinSubmitting}
                            className="w-full bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-700 py-3 rounded-lg font-medium transition-colors"
                        >
                            Batal
                        </button>
                        <button 
                            onClick={handleSubmitIzin}
                            disabled={izinSubmitting || !izinDate}
                            className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
                        >
                            {izinSubmitting ? (
                                <>
                                    <RefreshCw size={16} className="animate-spin mr-2" />
                                    Mengirim...
                                </>
                            ) : (
                                'Ajukan Izin'
                            )}
                        </button>
                    </div>
                </div>
            </Modal>
        </DashboardLayout>
    );
};

export default AbsensiPage;