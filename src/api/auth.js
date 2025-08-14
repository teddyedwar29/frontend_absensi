// src/api/auth.js (Perubahan pada file ini)
import axios from "axios";

const API = axios.create({
  //baseURL: "http://127.0.0.1:5000" // ip backend
   baseURL: "https://api.jam.teknomobileindonesia.my.id" // ip backend
});

API.interceptors.request.use(
  (config) => {
    // Mengambil token dari sessionStorage
    const token = sessionStorage.getItem("token"); // PERUBAHAN: dari localStorage ke sessionStorage
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
    sessionStorage.setItem("token", access_token); // PERUBAHAN: dari localStorage ke sessionStorage
    sessionStorage.setItem("userRole", role);     // PERUBAHAN: dari localStorage ke sessionStorage
    sessionStorage.setItem("username", returnedUsername); // PERUBAHAN: dari localStorage ke sessionStorage

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

export const logout = () => {
  // Hapus semua data dari sessionStorage
  sessionStorage.removeItem("token");      // PERUBAHAN: dari localStorage ke sessionStorage
  sessionStorage.removeItem("userRole");  // PERUBAHAN: dari localStorage ke sessionStorage
  sessionStorage.removeItem("username");  // PERUBAHAN: dari localStorage ke sessionStorage
  
  // Setelah logout, kirim custom event juga
  window.dispatchEvent(new Event('authStatusChanged'));
  
  window.location.href = "/"; 
};

// Mengambil status autentikasi dari sessionStorage
export const isAuthenticated = () => !!sessionStorage.getItem("token"); // PERUBAHAN: dari localStorage ke sessionStorage
export const getUserRole = () => sessionStorage.getItem("userRole");     // PERUBAHAN: dari localStorage ke sessionStorage

export default API;
