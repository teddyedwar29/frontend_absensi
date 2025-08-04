// src/pages/Admin/TimSales.jsx

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout'; // Import komponen layout
import { Search, Plus, MoreVertical, MapPin, Phone, Mail, TrendingUp, Users, RefreshCw, XCircle } from 'lucide-react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { isAuthenticated, getUserRole } from '../../api/auth'; // Tambahkan import ini

const AdminTimSales = () => {
  const [salesTeam, setSalesTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSales, setNewSales] = useState({
    name: '',
    username: '', // tambahkan username
    email: '',
    telpon: '',
    lokasi: '',
  });

// Add token to requests if available
axios.interceptors.request.use(
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

// 1. Pindahkan fetchSalesTeam ke luar useEffect
  const fetchSalesTeam = async () => {
    if (!isAuthenticated() || getUserRole() !== 'admin') {
      setError("Anda tidak memiliki akses ke halaman ini.");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/admin/get-users');
      setSalesTeam(Array.isArray(response.data) ? response.data : response.data.data);
      setError(null);
    } catch (err) {
      console.error("Gagal mengambil data tim sales:", err);
      if (err.response && err.response.status === 401) {
        setError("Sesi Anda berakhir. Silakan login kembali.");
      } else {
        setError("Gagal memuat data. Silakan coba lagi.");
      }
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Gagal memuat data tim sales dari API.',
      });
    } finally {
      setLoading(false);
    }
  };

  // 2. useEffect hanya panggil fetchSalesTeam saat mount
  useEffect(() => {
    fetchSalesTeam();
  }, []); // Dependensi kosong agar hanya berjalan sekali saat mount

  const filteredSales = salesTeam.filter(sales => {
    const name = sales.name ? sales.name.toLowerCase() : '';
    const lokasi = sales.lokasi ? sales.lokasi.toLowerCase() : '';
    const matchesSearch = name.includes(searchTerm.toLowerCase()) ||
                          lokasi.includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // 3. Setelah POST berhasil, panggil fetchSalesTeam()
  const handleAddSales = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      await axios.post('http://localhost:5000/register', {
        name: newSales.name,
        username: newSales.username,
        email: newSales.email,
        telpon: newSales.telpon,
        lokasi: newSales.lokasi,
        role: 'sales',
        password: 'default123',
      });

      setShowAddModal(false);
      setNewSales({ name: '', username: '', email: '', telpon: '', lokasi: '' });

      Swal.fire({
        icon: 'success',
        title: 'Berhasil',
        text: 'Sales berhasil ditambahkan!',
      });

      // Auto reload data
      fetchSalesTeam();

    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: error.response?.data?.message || 'Gagal menambah sales.',
      });
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <p>Memuat data tim sales...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-screen text-red-500">
          <XCircle size={48} className="mb-4" />
          <p>{error}</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="admin">
      {/* Header Halaman */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Daftar Tim Sales</h2>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          onClick={() => setShowAddModal(true)}
        >
          <Plus size={20} />
          Tambah Sales
        </button>
      </div>

      {/* Modal Tambah Sales */}
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
              <input
                type="text"
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Nama"
                value={newSales.name}
                onChange={e => setNewSales({ ...newSales, name: e.target.value })}
                required
              />
              <input
                type="text"
                className="w-full border rounded-lg px-3 py-2"
                placeholder="id_mr"
                value={newSales.username}
                onChange={e => setNewSales({ ...newSales, username: e.target.value })}
                required
              />
              <input
                type="email"
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Email"
                value={newSales.email}
                onChange={e => setNewSales({ ...newSales, email: e.target.value })}
                required
              />
              <input
                type="text"
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Telepon"
                value={newSales.telpon}
                onChange={e => setNewSales({ ...newSales, telpon: e.target.value })}
              />
              <input
                type="text"
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Lokasi"
                value={newSales.lokasi}
                onChange={e => setNewSales({ ...newSales, lokasi: e.target.value })}
              />
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold"
              >
                Simpan
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Pencarian */}
      <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Cari nama atau lokasi..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Grid Tim Sales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredSales.length > 0 ? (
          filteredSales.map((sales) => (
            <div key={sales.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
              {/* Card Header */}
              <div className="p-6 pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {sales.name ? sales.name.charAt(0).toUpperCase() : "?"}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{sales.name}</h3>
                      {/* Tampilkan username di bawah nama */}
                      <p className="text-sm text-gray-500">{sales.username || '-'}</p>
                      <p className="text-sm text-gray-600">{sales.role}</p>
                    </div>
                  </div>
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <MoreVertical size={16} className="text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Contact Info */}
              <div className="px-6 pb-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin size={14} />
                  <span>{sales.lokasi || 'Tidak Ada Lokasi'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone size={14} />
                  <span>{sales.telpon || 'Tidak Ada Telepon'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail size={14} />
                  <span>{sales.email || 'Tidak Ada Email'}</span>
                </div>
              </div>

              {/* Stats (Dihapus karena data tidak ada di API, bisa ditambahkan di lain waktu) */}
              <div className="px-6 py-4 bg-gray-50 rounded-b-xl">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Bergabung: {sales.created_at ? new Date(sales.created_at).toLocaleDateString() : '-'}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search size={24} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Tidak ada data ditemukan</h3>
            <p className="text-gray-600">Coba ubah kata kunci pencarian</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminTimSales;