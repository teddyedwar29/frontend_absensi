// src/api/absensi.js

import API from './auth';

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
        
        // Mengubah base64 ke file Blob untuk dikirim
        const blob = await fetch(photo).then(res => res.blob());
        formData.append('photo', blob, 'absen_photo.jpeg');

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

// Fungsi untuk mendapatkan status absensi hari ini (diasumsikan dari backend)
export const getTodayAttendanceStatus = async () => {
    try {
        // Endpoint baru untuk mengecek status hari ini
        const response = await API.get('/absensi');
        return { success: true, data: response.data };
    } catch (error) {
        console.error("Gagal mengambil status absensi hari ini:", error.response?.data);
        return {
            success: false,
            message: error.response?.data?.message || "Gagal memuat status absensi."
        }
    }
};
