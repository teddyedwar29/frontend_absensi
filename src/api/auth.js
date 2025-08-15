// src/api/auth.js (Versi yang sudah diperbaiki)
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5050/" // ip backend
   //baseURL: "https://api.jam.teknomobileindonesia.my.id" // ip backend
});

API.interceptors.request.use(
  (config) => {
    // Mengambil token dari sessionStorage
    const token = sessionStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const login = async (username, password) => {
  try {
    const response = await API.post("/login", { username, password });
    const { access_token, role, username: returnedUsername } = response.data;

    // Simpan semua data yang dibutuhkan di sessionStorage
    sessionStorage.setItem("token", access_token);
    sessionStorage.setItem("userRole", role);
    sessionStorage.setItem("username", returnedUsername);

    // console.log('Login berhasil, token dan data tersimpan');

    // Setelah berhasil login dan menyimpan token, kirim custom event
    window.dispatchEvent(new Event('authStatusChanged'));

    return { success: true };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.msg || "Login Gagal",
    };
  }
};

// 🔧 FUNGSI LOGOUT YANG DIPERBAIKI - TIDAK MELAKUKAN REDIRECT PAKSA
export const logout = () => {
  console.log('🔐 hayo ngapain kamu');
  
  // Hapus semua data dari sessionStorage
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("userRole");
  sessionStorage.removeItem("username");
  
  console.log('🔐 cek cek nih ya kamu');
  
  // Setelah logout, kirim custom event
  window.dispatchEvent(new Event('authStatusChanged'));
  
  // console.log('🔐 Auth status changed event dispatched');
  
  // 🔧 PERBAIKAN UTAMA: JANGAN REDIRECT PAKSA DI SINI!
  // Biarkan App.jsx yang menangani redirect
  // window.location.href = "/";  <- DIHAPUS!
};

// Mengambil status autentikasi dari sessionStorage
export const isAuthenticated = () => {
  const token = sessionStorage.getItem("token");
  const hasToken = !!token;
  // console.log('Auth check:', hasToken); // Uncomment untuk debugging
  return hasToken;
};

export const getUserRole = () => sessionStorage.getItem("userRole");
export const getUsername = () => sessionStorage.getItem("username");

export default API;