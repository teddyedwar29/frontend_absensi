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
        // Asumsi backend mengembalikan riwayat absensi harian (check-in saja)
        const response = await API.get('/absensi');
        return { success: true, data: response.data };
    } catch (error) {
        console.error("Gagal mengambil riwayat absensi:", error.response?.data);
        return { 
            success: false, 
            message: error.response?.data?.message || "Gagal memuat riwayat absensi." 
        };
    }
};

// Fungsi untuk melakukan Check-In (absensi masuk)
export const checkIn = async (location, photo) => {
    try {
        const formData = new FormData();
        formData.append('latitude', location.latitude);
        formData.append('longitude', location.longitude);
        formData.append('lokasi', location.address); // Menambahkan alamat lokasi
        
        // Mengubah base64 ke file Blob untuk dikirim
        const blob = await fetch(photo).then(res => res.blob());
        formData.append('foto_absen', blob, 'absen_photo.jpeg'); // Pastikan nama field sesuai backend

        // Endpoint yang hanya untuk check-in
        const response = await API.post('/absensi', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return { success: true, data: response.data };
    } catch (error) {
        console.error("Gagal check-in:", error.response?.data);
        return { 
            success: false, 
            message: error.response?.data?.message || "Gagal melakukan absensi." 
        };
    }
};

// Fungsi untuk mendapatkan status absensi hari ini
export const getTodayAttendanceStatus = async () => {
    try {
        // Mengambil seluruh riwayat absensi
        const response = await API.get('/absensi');
        const history = response.data; // Ini adalah array dari record absensi

        const todayDateString = getTodayDateString();

        // Mencari record absensi untuk hari ini
        const todayRecord = history.find(record => {
            // Asumsi record.tanggal_absen adalah string YYYY-MM-DD
            return record.tanggal_absen === todayDateString;
        });

        if (todayRecord) {
            return {
                success: true,
                data: {
                    status_absen: todayRecord.status_absen, // 'Hadir' atau 'Terlambat'
                    waktu_absen: todayRecord.waktu_absen // Waktu check-in
                }
            };
        } else {
            // Jika tidak ada record untuk hari ini
            return {
                success: true,
                data: {
                    status_absen: 'belum_absen',
                    waktu_absen: null
                }
            };
        }
    } catch (error) {
        console.error("Gagal mengambil status absensi hari ini:", error.response?.data);
        return {
            success: false,
            message: error.response?.data?.message || "Gagal memuat status absensi."
        }
    }
};
