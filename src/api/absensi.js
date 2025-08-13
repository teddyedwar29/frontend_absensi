// src/api/absensi.js

import API from './auth';

// Helper function to get today's date string in YYYY-MM-DD format
const getTodayDateString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// Fungsi untuk mengambil riwayat absensi sales
export const getAttendanceHistory = async () => {
    try {
        const response = await API.get('/absensi/personal');
        // Pastikan response formatnya sesuai
        const data = response.data?.data || response.data;
        return { success: true, data };
    } catch (err) {
        console.error("Error saat mengambil riwayat absensi:", err);
        return { success: false, message: err.response?.data?.msg || "Gagal memuat riwayat." };
    }
};

// Fungsi untuk melakukan Check-In (absensi masuk) - DIPERBAIKI
export const checkIn = async (location, photo) => {
    try {
        const formData = new FormData();
        formData.append('latitude', location.latitude);
        formData.append('longitude', location.longitude);

        // Mengubah base64 ke file Blob untuk dikirim
        const blob = await fetch(photo).then(res => res.blob());
        formData.append('foto_absen', blob, 'absen_photo.jpeg');

        const response = await API.post('/absensi', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        
        return { 
            success: true, 
            data: response.data,
            message: "Absensi berhasil dikirim!"
        };
    } catch (error) {
        console.error("Gagal check-in:", error.response?.data);
        
        // Handle specific error dari backend
        const errorMessage = error.response?.data?.msg || error.response?.data?.message;
        
        // Jika error karena sudah absen hari ini
        if (errorMessage && errorMessage.includes('sudah melakukan absensi')) {
            return { 
                success: false, 
                message: "Anda sudah melakukan absensi hari ini!",
                isAlreadyCheckedIn: true
            };
        }
        
        return { 
            success: false, 
            message: errorMessage || "Gagal melakukan absensi. Silakan coba lagi.",
            isAlreadyCheckedIn: false
        };
    }
};

// Fungsi untuk mendapatkan status absensi hari ini - DITINGKATKAN
export const getTodayAttendanceStatus = async () => {
    try {
        const response = await API.get('/absensi/personal');
        const history = response.data?.data || response.data;

        if (!Array.isArray(history)) {
            console.warn('History data bukan array:', history);
            return {
                success: true,
                data: { status_absen: 'Belum Absen', waktu_absen: null }
            };
        }

        const todayDateString = getTodayDateString();
        console.log('Mencari data untuk tanggal:', todayDateString);

        const todayRecord = history.find(record => {
            // Handle berbagai format tanggal yang mungkin dari backend
            let recordDate;
            
            if (record.tanggal_absen) {
                // Jika format ISO string atau datetime
                recordDate = record.tanggal_absen.split('T')[0];
            } else if (record.tanggal) {
                // Jika hanya tanggal
                recordDate = typeof record.tanggal === 'string' ? 
                    record.tanggal.split('T')[0] : 
                    record.tanggal;
            }
            
            console.log(`Comparing: ${recordDate} === ${todayDateString}`);
            return recordDate === todayDateString;
        });

        console.log('Today record found:', todayRecord);

        if (todayRecord) {
            return {
                success: true,
                data: {
                    status_absen: todayRecord.status_absen, // 'Hadir' atau 'Terlambat'
                    waktu_absen: todayRecord.waktu_absen || null,
                    tanggal: todayRecord.tanggal_absen || todayRecord.tanggal
                }
            };
        } else {
            return {
                success: true,
                data: {
                    status_absen: 'Belum Absen',
                    waktu_absen: null
                }
            };
        }
    } catch (error) {
        console.error("Gagal mengambil status absensi hari ini:", error);
        return {
            success: false,
            message: error.response?.data?.message || "Gagal memuat status absensi.",
            data: { status_absen: 'Belum Absen', waktu_absen: null }
        };
    }
};

// Fungsi untuk cek apakah sudah check-in hari ini - DISEDERHANAKAN
export const isCheckedIn = async () => {
    try {
        const statusResult = await getTodayAttendanceStatus();
        return statusResult.success && 
               statusResult.data && 
               statusResult.data.status_absen !== 'Belum Absen';
    } catch (error) {
        console.error("Gagal memeriksa status check-in:", error);
        return false;
    }
};

// Fungsi helper untuk format response error
export const handleApiError = (error) => {
    if (error.response?.data?.msg) {
        return error.response.data.msg;
    }
    if (error.response?.data?.message) {
        return error.response.data.message;
    }
    if (error.message) {
        return error.message;
    }
    return "Terjadi kesalahan yang tidak diketahui";
};