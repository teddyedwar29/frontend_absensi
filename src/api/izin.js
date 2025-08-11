// src/api/izin.js

import API from './auth';

// Helper function to get today's date string in YYYY-MM-DD format
const getTodayDateString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// Fungsi untuk mengambil semua data izin user
export const getIzinHistory = async () => {
    try {
        const response = await API.get('/izin');
        const data = response.data || [];
        return { success: true, data };
    } catch (err) {
        console.error("Error saat mengambil riwayat izin:", err);
        return { 
            success: false, 
            message: err.response?.data?.msg || "Gagal memuat riwayat izin." 
        };
    }
};

// Fungsi untuk mengajukan izin baru
export const createIzin = async (tanggalIzin, keterangan) => {
    try {
        const payload = {
            tanggal_izin: tanggalIzin,
            keterangan: keterangan || null
        };

        const response = await API.post('/izin', payload);
        return { 
            success: true, 
            data: response.data,
            message: "Izin berhasil diajukan!"
        };
    } catch (error) {
        console.error("Gagal mengajukan izin:", error.response?.data);
        
        const errorMessage = error.response?.data?.msg || error.response?.data?.message;
        
        return { 
            success: false, 
            message: errorMessage || "Gagal mengajukan izin. Silakan coba lagi."
        };
    }
};

// Fungsi untuk cek apakah sudah mengajukan izin pada tanggal tertentu
export const checkIzinExist = async (tanggal) => {
    try {
        const result = await getIzinHistory();
        if (!result.success) return false;
        
        const existingIzin = result.data.find(izin => {
            const izinDate = new Date(izin.tanggal_izin).toISOString().split('T')[0];
            return izinDate === tanggal;
        });
        
        return !!existingIzin;
    } catch (error) {
        console.error("Error checking izin existence:", error);
        return false;
    }
};

// Fungsi untuk cek apakah sudah mengajukan izin hari ini
export const checkTodayIzin = async () => {
    const todayDateString = getTodayDateString();
    return await checkIzinExist(todayDateString);
};

// Fungsi untuk mendapatkan status izin hari ini
export const getTodayIzinStatus = async () => {
    try {
        const result = await getIzinHistory();
        if (!result.success) {
            return {
                success: false,
                message: result.message
            };
        }
        
        const todayDateString = getTodayDateString();
        const todayIzin = result.data.find(izin => {
            const izinDate = new Date(izin.tanggal_izin).toISOString().split('T')[0];
            return izinDate === todayDateString;
        });
        
        if (todayIzin) {
            return {
                success: true,
                data: {
                    status_izin: todayIzin.status_izin,
                    keterangan: todayIzin.keterangan,
                    tanggal_izin: todayIzin.tanggal_izin
                }
            };
        } else {
            return {
                success: true,
                data: {
                    status_izin: 'Belum Ada',
                    keterangan: null,
                    tanggal_izin: null
                }
            };
        }
    } catch (error) {
        console.error("Error getting today izin status:", error);
        return {
            success: false,
            message: "Gagal memuat status izin hari ini"
        };
    }
};