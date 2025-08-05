// src/api/auth.js

import axios from "axios";

// base url backend
const API = axios.create({
  baseURL: "http://localhost:5050" // ip backend
});

// Add token to requests if available
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- PERUBAHAN DI SINI ---
// Hapus logika redirect dari interceptor
// Interceptor seharusnya hanya mengelola request/response, bukan navigasi.
API.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);

// login function
export const login = async (username, password) => {
  try {
    const response = await API.post("/login", {
      username,
      password,
    });

    const { access_token, role, username: returnedUsername } = response.data;
    localStorage.setItem("token", access_token);
    localStorage.setItem("userRole", role);
    localStorage.setItem("username", returnedUsername);

    return { success: true, token: access_token };
  } catch (error) {
    console.log(error.response?.data); // buat debug
    return {
      success: false,
      message: error.response ? error.response.data.message : "Login Gagal",
    };
  }
};

// logout function
export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("userRole");
  localStorage.removeItem("username");
  // Navigasi ke halaman login akan ditangani oleh komponen yang memanggil ini
  window.location.href = "/"; 
};

// check if user is authenticated
export const isAuthenticated = () => {
  const token = localStorage.getItem("token");
  return !!token;
};

// get user role
export const getUserRole = () => {
  return localStorage.getItem("userRole");
};

// validate token (optional)
export const validateToken = async () => {
  try {
    const response = await API.get("/validate-token");
    return { success: true, user: response.data.user };
  } catch (error) {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("username");
    return { success: false };
  }
};

// get user profile
export const getUserProfile = async () => {
  try {
    const response = await API.get("/profile");
    return { success: true, user: response.data };
  } catch (error) {
   return {
    success: false,
    message: error.response ? error.response.data.message : "Gagal mengambil data user",
    };
  }
};

export default API; // Ekspor instance API
