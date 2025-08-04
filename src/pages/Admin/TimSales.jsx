// src/pages/Admin/TimSales.jsx

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { Search, Plus, MoreVertical, Map, Phone, Mail, XCircle } from 'lucide-react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { isAuthenticated, getUserRole } from '../../api/auth';
import { Link } from 'react-router-dom';

// Pindahkan instance Axios ke sini agar bisa digunakan di semua fungsi
const API = axios.create({
  baseURL: "http://localhost:5000"
});

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


const AdminTimSales = () => {
  const [salesTeam, setSalesTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSales, setNewSales] = useState({
    name: '',
    username: '',
    email: '',
    phone_number: '', // Ganti dari telpon
    lokasi: '',
    password: '' // Tambahkan password
  });

  const fetchSalesTeam = async () => {
    if (!isAuthenticated() || getUserRole() !== 'admin') {
      setError("Anda tidak memiliki akses ke halaman ini.");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const response = await API.get('/admin/get-users'); // Gunakan instance API
      setSalesTeam(Array.isArray(response.data) ? response.data : []);
      setError(null);
    } catch (err) {
      console.error("Gagal mengambil data tim sales:", err);
      setError("Gagal memuat data. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesTeam();
  }, []);

  const filteredSales = salesTeam.filter(sales => {
    const name = sales.name ? sales.name.toLowerCase() : '';
    const lokasi = sales.lokasi ? sales.lokasi.toLowerCase() : '';
    const matchesSearch = name.includes(searchTerm.toLowerCase()) ||
                          lokasi.includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleAddSales = async (e) => {
    e.preventDefault();
    try {
      // Kirim data yang benar ke backend
      await API.post('/register', {
        name: newSales.name,
        username: newSales.username,
        email: newSales.email,
        phone_number: newSales.phone_number,
        lokasi: newSales.lokasi,
        role: 'sales',
        password: newSales.password,
      });

      setShowAddModal(false);
      setNewSales({ name: '', username: '', email: '', phone_number: '', lokasi: '', password: '' });

      Swal.fire({
        icon: 'success',
        title: 'Berhasil',
        text: 'Sales berhasil ditambahkan!',
      });

      fetchSalesTeam();

    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: error.response?.data?.msg || 'Gagal menambah sales.',
      });
    }
  };

  if (loading) {
    return <DashboardLayout><p>Memuat data tim sales...</p></DashboardLayout>;
  }

  if (error) {
    return <DashboardLayout><div className="text-red-500"><XCircle size={48} /> <p>{error}</p></div></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Daftar Tim Sales</h2>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          onClick={() => setShowAddModal(true)}
        >
          <Plus size={20} /> Tambah Sales
        </button>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 w-full max-w-md shadow-lg relative">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
              onClick={() => setShowAddModal(false)}
            >
              <XCircle size={24} />
            </button>
            <h3 className="text-xl font-bold mb-4">Tambah Sales Baru</h3>
            <form onSubmit={handleAddSales} className="space-y-4">
              <input type="text" className="w-full border rounded-lg px-3 py-2" placeholder="Nama Lengkap" value={newSales.name} onChange={e => setNewSales({ ...newSales, name: e.target.value })} required />
              <input type="text" className="w-full border rounded-lg px-3 py-2" placeholder="Username (ID MR)" value={newSales.username} onChange={e => setNewSales({ ...newSales, username: e.target.value })} required />
              <input type="email" className="w-full border rounded-lg px-3 py-2" placeholder="Email" value={newSales.email} onChange={e => setNewSales({ ...newSales, email: e.target.value })} required />
              <input type="text" className="w-full border rounded-lg px-3 py-2" placeholder="Nomor Telepon" value={newSales.phone_number} onChange={e => setNewSales({ ...newSales, phone_number: e.target.value })} />
              <input type="text" className="w-full border rounded-lg px-3 py-2" placeholder="Lokasi" value={newSales.lokasi} onChange={e => setNewSales({ ...newSales, lokasi: e.target.value })} />
              <input type="password" className="w-full border rounded-lg px-3 py-2" placeholder="Password Awal" value={newSales.password} onChange={e => setNewSales({ ...newSales, password: e.target.value })} required />
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold">Simpan</button>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input type="text" placeholder="Cari nama atau lokasi..." className="w-full pl-10 pr-4 py-2 border rounded-lg" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredSales.length > 0 ? (
          filteredSales.map((sales) => (
            <div key={sales.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {sales.name ? sales.name.charAt(0).toUpperCase() : "?"}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{sales.name}</h3>
                    <p className="text-sm text-gray-500">{sales.username || '-'}</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2"><Map size={14} /><span>{sales.lokasi || 'Tidak Ada Lokasi'}</span></div>
                  <div className="flex items-center gap-2"><Phone size={14} /><span>{sales.phone_number || 'Tidak Ada Telepon'}</span></div>
                  <div className="flex items-center gap-2"><Mail size={14} /><span>{sales.email || 'Tidak Ada Email'}</span></div>
                </div>
              </div>
               <div className="border-t border-gray-200 p-4">
                <Link 
                  to={`/admin/tracking/${sales.username}`} 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-semibold"
                >
                  <Map size={16} />
                  Lacak Aktivitas
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full bg-white rounded-xl p-12 text-center"><p>Tidak ada data ditemukan</p></div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminTimSales;