// src/api/auth.js

import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000" // ip backend
});

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
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

    // Simpan semua data yang dibutuhkan
    localStorage.setItem("token", access_token);
    localStorage.setItem("userRole", role);
    localStorage.setItem("username", returnedUsername);

    return { success: true };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.msg || "Login Gagal",
    };
  }
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("userRole");
  localStorage.removeItem("username");
  window.location.href = "/"; 
};

export const isAuthenticated = () => !!localStorage.getItem("token");
export const getUserRole = () => localStorage.getItem("userRole");

export default API;