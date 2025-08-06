// src/pages/sales/kunjungan.jsx

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import {
  MapPin,
  Camera,
  Plus,
  Edit3,
  Eye,
  Clock,
  Target,
  TrendingUp,
  Calendar,
  CheckCircle,
  AlertCircle,
  Search,
  Filter,
  XCircle,
  RefreshCw
} from 'lucide-react';
import Swal from 'sweetalert2';
import API from '../../api/auth'; // Menggunakan instance API yang sudah terkonfigurasi

const KunjunganPage = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDay, setSelectedDay] = useState(0); // State untuk hari yang dipilih (0 = Hari Ini, 1 = Kemarin, dst.)

  const [formData, setFormData] = useState({
    outletId: '',
    outletName: '',
    lokasi: '',
    kegiatan: '',
    kompetitor: '',
    rataTopUp: '',
    potensiTopUp: '',
    persentasePemakaian: '',
    issue: '',
    foto: null
  });

  // Fungsi untuk mengambil data kunjungan dari backend
  const fetchVisits = async () => {
    try {
      setLoading(true);
      // PERBAHAN PENTING DI SINI: Mengubah endpoint GET menjadi '/kunjungan/personal'
      // Asumsi backend akan memfilter data berdasarkan user yang sedang login
      const response = await API.get('/kunjungan/personal');
      setVisits(response.data);
      setError(null);
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setVisits([]); // Set ke array kosong jika tidak ada data
        setError(null);
      } else {
        console.error("Gagal mengambil data kunjungan:", err);
        setError("Gagal memuat data kunjungan.");
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Gagal memuat data kunjungan dari API.',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisits();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Endpoint POST tetap '/kunjungan'
      // Catatan: idMR dan noVisit harusnya didapatkan dari backend atau user yang login
      const response = await API.post('/kunjungan', formData);
      Swal.fire({
        icon: 'success',
        title: 'Berhasil',
        text: response.data.message || 'Kunjungan baru berhasil ditambahkan!',
        showConfirmButton: false,
        timer: 1500
      });
      setShowAddForm(false);
      fetchVisits(); // Muat ulang data setelah submit
    } catch (err) {
      console.error("Gagal submit kunjungan:", err);
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: err.response?.data?.message || 'Gagal menambahkan kunjungan.',
      });
    }
  };
  
  // Fungsi untuk mendapatkan string tanggal berdasarkan berapa hari yang lalu
  const getDateString = (daysAgo) => {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date.toISOString().slice(0, 10);
  };

  // Filter kunjungan berdasarkan hari yang dipilih
  const filteredVisitsByDay = visits.filter(visit => {
    const visitDate = visit.tanggal_input ? visit.tanggal_input.slice(0, 10) : '';
    return visitDate === getDateString(selectedDay);
  });

  // Filter hasil berdasarkan search term
  const finalFilteredVisits = filteredVisitsByDay.filter(visit => {
    const outletName = visit.nama_outlet ? visit.nama_outlet.toLowerCase() : '';
    const kegiatan = visit.kegiatan ? visit.kegiatan.toLowerCase() : '';
    const lokasi = visit.lokasi ? visit.lokasi.toLowerCase() : '';
    const matchesSearch = outletName.includes(searchTerm.toLowerCase()) ||
                          kegiatan.includes(searchTerm.toLowerCase()) ||
                          lokasi.includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Statistik sekarang berdasarkan finalFilteredVisits
  const completedToday = finalFilteredVisits.length; // Menggunakan finalFilteredVisits
  const targetDaily = 5;
  const progressPercentage = (completedToday / targetDaily) * 100;

  // Mendapatkan label hari untuk kartu statistik
  const getDayLabel = (daysAgo) => {
    if (daysAgo === 0) return 'Hari Ini';
    if (daysAgo === 1) return 'Kemarin';
    return `${daysAgo} Hari Lalu`;
  };

  // Menghitung kunjungan bulan ini secara dinamis
  const getTotalVisitsThisMonth = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    return visits.filter(visit => {
      const visitDate = new Date(visit.tanggal_input);
      return visitDate.getMonth() === currentMonth && visitDate.getFullYear() === currentYear;
    }).length;
  };

  const totalVisitsThisMonth = getTotalVisitsThisMonth(); // Panggil fungsi untuk mendapatkan total kunjungan bulan ini


  const dayOptions = [
    { value: 0, label: 'Hari Ini' },
    { value: 1, label: 'Kemarin' },
    { value: 2, label: '2 Hari Lalu' },
    { value: 3, label: '3 Hari Lalu' },
    { value: 4, label: '4 Hari Lalu' },
    { value: 5, label: '5 Hari Lalu' },
    { value: 6, label: '6 Hari Lalu' },
    { value: 7, label: '7 Hari Lalu' },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <p>Memuat data kunjungan...</p>
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
          <button onClick={fetchVisits} className="mt-4 px-4 py-2 bg-red-100 text-red-600 rounded-lg">Coba Lagi</button>
        </div>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout>
      {/* Konten Utama Halaman Kunjungan */}
      <div className="flex-1 p-8">
        {/* Header dan Tombol Tambah */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Kunjungan Outlet</h1>
            <p className="text-gray-600 mt-1">Kelola kunjungan harian ke outlet</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
            >
              <Plus className="w-5 h-5 mr-2" />
              Tambah Kunjungan
            </button>
          </div>
        </div>

        {/* Kartu Statistik */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Target {getDayLabel(selectedDay)}</p> {/* TEKS DINAMIS */}
                <p className="text-2xl font-bold text-blue-600 mt-1">{completedToday}/{targetDaily}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">{Math.round(progressPercentage)}% tercapai</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Kunjungan Bulan Ini</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{totalVisitsThisMonth}</p> {/* ANGKA DINAMIS */}
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <MapPin className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rata-rata Harian</p>
                <p className="text-2xl font-bold text-orange-600 mt-1">Coming Soon</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Status {getDayLabel(selectedDay)}</p> {/* TEKS DINAMIS */}
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {/* PERUBAHAN DI SINI: Mengubah teks berdasarkan progressPercentage */}
                  {progressPercentage >= 100 ? 'Selesai' : 'Progress'}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                {/* PERUBAHAN DI SINI: Mengubah ikon berdasarkan progressPercentage */}
                {progressPercentage >= 100 ?
                  <CheckCircle className="w-6 h-6 text-green-600" /> :
                  <Clock className="w-6 h-6 text-orange-600" />
                }
              </div>
            </div>
          </div>
        </div>

        {/* Filter & Search */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari outlet..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Filter className="w-5 h-5 mr-2" />
              Filter
            </button>
          </div>
        </div>

        {/* Dropdown Filter Tanggal */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Filter Hari</label>
          <select
            value={selectedDay}
            onChange={e => setSelectedDay(Number(e.target.value))}
            className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {dayOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Tombol Filter Tanggal */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {dayOptions.map(opt => (
            <button
              key={opt.value}
              className={`px-4 py-2 rounded-lg ${selectedDay === opt.value ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
              onClick={() => setSelectedDay(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Kartu Kunjungan */}
        <div className="space-y-6">
          {finalFilteredVisits.length > 0 ? ( // Menggunakan finalFilteredVisits
            finalFilteredVisits.map((visit) => (
              <div key={visit.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                        <Camera className="w-6 h-6 text-gray-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{visit.nama_outlet}</h3>
                        {/* TAMPILKAN TANGGAL DI SINI */}
                        <p className="text-xs text-gray-500">
                          {visit.tanggal_input
                            ? new Date(visit.tanggal_input).toLocaleDateString('id-ID', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })
                            : '-'}
                        </p>
                        <p className="text-sm text-gray-500">
                          No Visit: {visit.no_visit} • {new Date(visit.tanggal_input).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="px-3 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                        Selesai
                      </span>
                      <button className="p-2 text-gray-400 hover:text-blue-600">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-blue-600">
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">ID MR</p>
                        <p className="text-sm font-medium text-gray-900">{visit.id_mr}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">ID Outlet</p>
                        <p className="text-sm font-medium text-gray-900">{visit.id_outlet}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Lokasi</p>
                        <p className="text-sm font-medium text-gray-900">{visit.lokasi}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Kegiatan</p>
                        <p className="text-sm font-medium text-gray-900">{visit.kegiatan}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Kompetitor</p>
                        <p className="text-sm font-medium text-gray-900">{visit.kompetitor || '-'}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Rata-rata Top Up</p>
                        <p className="text-sm font-medium text-gray-900">{visit.rata_rata_topup}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Potensi Top Up</p>
                        <p className="text-sm font-medium text-gray-900">{visit.potensi_topup}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">% Pemakaian TekMo</p>
                        <p className="text-sm font-medium text-gray-900">{visit.persentase_pemakaian || '-'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Issue</p>
                    <p className="text-sm text-gray-700">{visit.issue || '-'}</p>
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
              <p className="text-gray-600">Coba ubah kata kunci pencarian atau pilih tanggal lain</p>
            </div>
          )}
        </div>

        {/* Modal Tambah Kunjungan */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Tambah Kunjungan Baru</h2>
              </div>
              
              <form onSubmit={handleSubmit}>
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">ID Outlet</label>
                      <input
                        type="text"
                        name="outletId"
                        value={formData.outletId}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nama Outlet</label>
                      <input
                        type="text"
                        name="outletName"
                        value={formData.outletName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Lokasi</label>
                      <input
                        type="text"
                        name="lokasi"
                        value={formData.lokasi}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Kegiatan</label>
                      <select
                        name="kegiatan"
                        value={formData.kegiatan}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value="">Pilih Kegiatan</option>
                        <option value="Akuisisi">Akuisisi</option>
                        <option value="Follow Up">Follow Up</option>
                        <option value="Maintenance">Maintenance</option>
                        <option value="Training">Training</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Kompetitor</label>
                      <input
                        type="text"
                        name="kompetitor"
                        value={formData.kompetitor}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Rata-rata Top Up TekMo</label>
                      <input
                        type="text"
                        name="rataTopUp"
                        value={formData.rataTopUp}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="contoh: 100k"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Potensi Top Up Member</label>
                      <input
                        type="text"
                        name="potensiTopUp"
                        value={formData.potensiTopUp}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="contoh: 5jt"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">% Pemakaian TekMo</label>
                      <input
                        type="text"
                        name="persentasePemakaian"
                        value={formData.persentasePemakaian}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="contoh: 10%"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Issue</label>
                    <textarea
                      name="issue"
                      value={formData.issue}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Jelaskan issue atau catatan..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Foto Outlet</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Klik untuk upload foto atau ambil foto</p>
                      <input type="file" accept="image/*" className="hidden" />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Simpan Kunjungan
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default KunjunganPage;
