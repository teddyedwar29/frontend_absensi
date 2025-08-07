// src/pages/Admin/TimSales.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import API from '../../api/auth';
import Swal from 'sweetalert2';
import { Search, Plus, MapPin, Phone, Mail, XCircle, CalendarDays, Clock, User, AtSign, KeyRound, Building } from 'lucide-react';

// Fungsi helper untuk format tanggal
const formatDate = (isoString) => {
    if (!isoString) return 'Belum ada';
    return new Date(isoString).toLocaleDateString('id-ID', {
        day: 'numeric', month: 'long', year: 'numeric'
    });
};

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
        telpon: '',
        lokasi: ''
    });

    const fetchSalesTeam = async () => {
        try {
            setLoading(true);
            const response = await API.get('/admin/get-users');
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
        return name.includes(searchTerm.toLowerCase()) || lokasi.includes(searchTerm.toLowerCase());
    });

    const handleAddSales = async (e) => {
        e.preventDefault();
        try {
            await API.post('/register', { ...newSales, role: 'sales' });
            
            setShowAddModal(false);
            setNewSales({ name: '', username: '', email: '', telpon: '', lokasi: '' });
            
            Swal.fire({ icon: 'success', title: 'Berhasil!', text: `Sales baru ditambahkan dengan password default '12345'.`, timer: 2500 });
            fetchSalesTeam();
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Gagal', text: error.response?.data?.msg || 'Gagal menambah sales.' });
        }
    };

    if (error) {
        return <DashboardLayout><div className="text-red-500 text-center p-10"><XCircle size={48} className="mx-auto mb-2" /><p>{error}</p></div></DashboardLayout>;
    }

    return (
        <DashboardLayout>
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h2 className="text-2xl font-bold text-gray-900">Daftar Tim Sales</h2>
                <div className="w-full sm:w-auto flex gap-2">
                    <div className="relative flex-grow">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input type="text" placeholder="Cari nama atau lokasi..." className="w-full pl-10 pr-4 py-2 border rounded-lg" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 flex-shrink-0" onClick={() => setShowAddModal(true)}>
                        <Plus size={20} /> <span className="hidden sm:inline">Tambah Sales</span>
                    </button>
                </div>
            </div>

            {loading ? (
                <p className="text-center p-10">Memuat data tim sales...</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredSales.map((sales) => (
                        <div key={sales.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow flex flex-col">
                            <div className="p-6 flex-grow">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-lg font-bold">
                                        {sales.name ? sales.name.charAt(0).toUpperCase() : "?"}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{sales.name}</h3>
                                        <p className="text-sm text-gray-500">ID: {sales.username || '-'}</p>
                                    </div>
                                </div>
                                <div className="space-y-2 text-sm text-gray-600">
                                    <div className="flex items-center gap-2"><MapPin size={14} /><span>{sales.lokasi || 'Tidak Ada Lokasi'}</span></div>
                                    <div className="flex items-center gap-2"><Phone size={14} /><span>{sales.telpon || 'Tidak Ada Telepon'}</span></div>
                                    <div className="flex items-center gap-2"><Mail size={14} /><span>{sales.email || 'Tidak Ada Email'}</span></div>
                                    <div className="border-t my-2 pt-2">
                                        <div className="flex items-center gap-2"><CalendarDays size={14} /><span>Bergabung: {formatDate(sales.created_at)}</span></div>
                                        <div className="flex items-center gap-2"><Clock size={14} /><span>Aktif Terakhir: {formatDate(sales.terakhir_aktif)}</span></div>
                                    </div>
                                </div>
                            </div>
                            <div className="border-t border-gray-100 p-4">
                                <Link to={`/admin/tracking/${sales.username}`} className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-semibold transition-colors">
                                    Lacak Aktivitas
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* --- MODAL BARU DENGAN DESAIN LEBIH BAIK --- */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-6 sm:p-8 w-full max-w-md shadow-lg relative">
                        <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-600" onClick={() => setShowAddModal(false)}><XCircle size={24} /></button>
                        <div className="text-center mb-6">
                            <h3 className="text-xl font-bold">Tambah Sales Baru</h3>
                            <p className="text-sm text-gray-500">Password akan diatur default ke '12345'</p>
                        </div>
                        <form onSubmit={handleAddSales} className="space-y-4">
                            {/* Input dengan Label dan Ikon */}
                            <div>
                                <label className="text-sm font-medium text-gray-700">Nama Lengkap</label>
                                <div className="relative mt-1">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input type="text" className="w-full border rounded-lg pl-10 pr-3 py-2" placeholder="Contoh: jefri teguh" value={newSales.name} onChange={e => setNewSales({ ...newSales, name: e.target.value })} required />
                                </div>
                            </div>
                             <div>
                                <label className="text-sm font-medium text-gray-700">ID_MR</label>
                                <div className="relative mt-1">
                                    <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input type="text" className="w-full border rounded-lg pl-10 pr-3 py-2" placeholder="Contoh: 0001" value={newSales.username} onChange={e => setNewSales({ ...newSales, username: e.target.value })} required />
                                </div>
                            </div>
                             <div>
                                <label className="text-sm font-medium text-gray-700">Email</label>
                                <div className="relative mt-1">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input type="email" className="w-full border rounded-lg pl-10 pr-3 py-2" placeholder="Contoh: jefriteguh@email.com" value={newSales.email} onChange={e => setNewSales({ ...newSales, email: e.target.value })} required />
                                </div>
                            </div>
                             <div>
                                <label className="text-sm font-medium text-gray-700">Nomor Telepon</label>
                                <div className="relative mt-1">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input type="text" className="w-full border rounded-lg pl-10 pr-3 py-2" placeholder="Opsional" value={newSales.telpon} onChange={e => setNewSales({ ...newSales, telpon: e.target.value })} />
                                </div>
                            </div>
                             <div>
                                <label className="text-sm font-medium text-gray-700">Lokasi</label>
                                <div className="relative mt-1">
                                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input type="text" className="w-full border rounded-lg pl-10 pr-3 py-2" placeholder="Opsional" value={newSales.lokasi} onChange={e => setNewSales({ ...newSales, lokasi: e.target.value })} />
                                </div>
                            </div>
                            
                            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-semibold transition-colors mt-6">Simpan</button>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default AdminTimSales;