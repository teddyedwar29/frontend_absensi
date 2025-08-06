// src/pages/sales/kunjungan.jsx

import React, { useState, useEffect, useRef } from 'react';
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
  RefreshCw,
  Trash2,
  Navigation
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

  const fileInputRef = useRef(null); // Ref untuk input file
  const videoRef = useRef(null); // Ref untuk video kamera
  const canvasRef = useRef(null); // Ref untuk canvas foto
  const [showCameraModal, setShowCameraModal] = useState(false); // State untuk modal kamera

  const [locationCoords, setLocationCoords] = useState(null); // State untuk menyimpan koordinat lokasi
  const [isLoadingLocation, setIsLoadingLocation] = useState(false); // State untuk loading lokasi

  const [formData, setFormData] = useState({
    noVisit: '',
    outletName: '',
    lokasi: '',
    kegiatan: '',
    kompetitor: '',
    rataTopUp: '',
    potensiTopUp: '',
    persentasePemakaian: '',
    issue: '',
    foto: null,
    idMR: '' // PERUBAHAN: Menambahkan idMR ke formData
  });

  // PERUBAHAN: Mengambil username dari localStorage untuk idMR saat komponen dimuat
  useEffect(() => {
    const currentUser = localStorage.getItem('username');
    if (currentUser) {
      setFormData(prev => ({ ...prev, idMR: currentUser }));
    }
    fetchVisits(); // Panggil fetchVisits setelah idMR diatur
  }, []);

  // Fungsi untuk mengambil data kunjungan dari backend
  const fetchVisits = async () => {
    try {
      setLoading(true);
      const response = await API.get('/kunjungan/personal');
      setVisits(response.data);
      setError(null);
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setVisits([]);
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


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Khusus untuk input number, pastikan nilai tidak kurang dari 0
    if (name === 'rataTopUp' || name === 'potensiTopUp' || name === 'persentasePemakaian' || name === 'noVisit') {
      const numValue = Number(value);
      if (numValue < 0) {
        setFormData(prev => ({ ...prev, [name]: 0 })); // Set ke 0 jika kurang dari 0
      } else {
        setFormData(prev => ({ ...prev, [name]: value }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Handler untuk file input (upload dari galeri)
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, foto: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Fungsi untuk memulai kamera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } }); // Gunakan 'environment' untuk kamera belakang
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setShowCameraModal(true);
    } catch (error) {
      console.error('Error mengakses kamera:', error);
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: 'Tidak dapat mengakses kamera. Pastikan memberikan izin kamera.',
      });
    }
  };

  // Fungsi untuk mengambil foto dari kamera
  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = video.current;
      const context = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height); // Pastikan gambar pas di canvas
      
      const photoDataUrl = canvas.toDataURL('image/jpeg', 0.8); // Kompresi 80%
      setFormData(prev => ({ ...prev, foto: photoDataUrl }));
      
      // Hentikan stream kamera
      const stream = video.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      setShowCameraModal(false);
    }
  };

  // Fungsi untuk menghapus foto
  const handleRemovePhoto = () => {
    setFormData(prev => ({ ...prev, foto: null }));
  };

  // Fungsi untuk mendapatkan lokasi koordinat
  const getCurrentLocation = () => {
    setIsLoadingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const coordsString = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
          setFormData(prev => ({ ...prev, lokasi: coordsString }));
          setLocationCoords({ latitude, longitude }); // Simpan koordinat juga jika diperlukan
          setIsLoadingLocation(false);
          Swal.fire({
            icon: 'success',
            title: 'Lokasi Didapatkan!',
            text: `Koordinat: ${coordsString}`,
            showConfirmButton: false,
            timer: 1500
          });
        },
        (error) => {
          console.error('Error mendapatkan lokasi:', error);
          setIsLoadingLocation(false);
          Swal.fire({
            icon: 'error',
            title: 'Gagal',
            text: 'Tidak dapat mengakses lokasi. Pastikan GPS aktif dan berikan izin lokasi.',
          });
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    } else {
      setIsLoadingLocation(false);
      Swal.fire({
        icon: 'warning',
        title: 'Peringatan',
        text: 'Geolocation tidak didukung oleh browser ini.',
      });
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    // Tampilkan konfirmasi sebelum submit
    const result = await Swal.fire({
      title: 'Konfirmasi Data Kunjungan',
      html: `
        <div class="text-left text-gray-700">
          <p><strong>Nama Outlet:</strong> ${formData.outletName}</p>
          <p><strong>Lokasi:</strong> ${formData.lokasi}</p>
          <p><strong>Kegiatan:</strong> ${formData.kegiatan}</p>
          <p><strong>No. Kunjungan:</strong> ${formData.noVisit}</p>
          <p><strong>ID MR:</strong> ${formData.idMR}</p> {/* PERUBAHAN: Menampilkan ID MR */}
          ${formData.kompetitor ? `<p><strong>Kompetitor:</strong> ${formData.kompetitor}</p>` : ''}
          ${formData.rataTopUp ? `<p><strong>Rata-rata Top Up:</strong> ${formData.rataTopUp}</p>` : ''}
          ${formData.potensiTopUp ? `<p><strong>Potensi Top Up:</strong> ${formData.potensiTopUp}</p>` : ''}
          ${formData.persentasePemakaian ? `<p><strong>% Pemakaian:</strong> ${formData.persentasePemakaian}</p>` : ''}
          ${formData.issue ? `<p><strong>Issue:</strong> ${formData.issue}</p>` : ''}
          ${formData.foto ? '<p><strong>Foto:</strong> <span class="text-green-600">Sudah dilampirkan</span></p>' : '<p><strong>Foto:</strong> <span class="text-red-600">Belum dilampirkan</span></p>'}
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Ya, Simpan Data Ini!',
      cancelButtonText: 'Batal',
      reverseButtons: true,
      customClass: {
        confirmButton: 'px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700',
        cancelButton: 'px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400'
      },
      buttonsStyling: false
    });

    if (result.isConfirmed) {
      try {
        // Validasi lokasi sebelum submit
        if (!formData.lokasi || formData.lokasi.includes('Tidak Ada Lokasi')) {
          Swal.fire({
            icon: 'warning',
            title: 'Lokasi Diperlukan',
            text: 'Silakan dapatkan lokasi Anda sebelum menyimpan kunjungan.',
          });
          return;
        }

        // Siapkan FormData untuk mengirim file dan data lainnya
        const submitFormData = new FormData();
        submitFormData.append('no_visit', Number(formData.noVisit));
        submitFormData.append('nama_outlet', formData.outletName);
        submitFormData.append('lokasi', formData.lokasi);
        submitFormData.append('kegiatan', formData.kegiatan);
        submitFormData.append('kompetitor', formData.kompetitor);
        submitFormData.append('rata_rata_topup', Number(formData.rataTopUp));
        submitFormData.append('potensi_topup', Number(formData.potensiTopUp));
        submitFormData.append('persentase_pemakaian', Number(formData.persentasePemakaian));
        submitFormData.append('issue', formData.issue);
        submitFormData.append('id_mr', formData.idMR); // PERUBAHAN: Mengirim id_mr ke backend

        // Jika ada foto, tambahkan ke FormData
        if (formData.foto) {
          const response = await fetch(formData.foto);
          const blob = await response.blob();
          submitFormData.append('foto_kunjungan', blob, 'kunjungan_photo.jpeg');
        }

        // Endpoint POST tetap '/kunjungan'
        const response = await API.post('/kunjungan', submitFormData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        Swal.fire({
          icon: 'success',
          title: 'Berhasil',
          text: response.data.message || 'Kunjungan baru berhasil ditambahkan!',
          showConfirmButton: false,
          timer: 1500
        });
        setShowAddForm(false);
        setFormData({ // Reset form setelah submit
          noVisit: '',
          outletName: '',
          lokasi: '',
          kegiatan: '',
          kompetitor: '',
          rataTopUp: '',
          potensiTopUp: '',
          persentasePemakaian: '',
          issue: '',
          foto: null,
          idMR: localStorage.getItem('username') || '' // PERUBAHAN: Reset idMR agar tetap sesuai user login
        });
        fetchVisits(); // Muat ulang data setelah submit
      } catch (err) {
        console.error("Gagal submit kunjungan:", err);
        Swal.fire({
          icon: 'error',
          title: 'Gagal',
          text: err.response?.data?.message || 'Gagal menambahkan kunjungan.',
        });
      }
    } else {
      // Jika user membatalkan konfirmasi
      Swal.fire('Dibatalkan', 'Data kunjungan tidak disimpan.', 'info');
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
                <p className="text-2xl font-bold text-orange-600 mt-1">4.8</p>
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
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">No. Kunjungan</p> {/* PERUBAHAN LABEL */}
                        <p className="text-sm font-medium text-gray-900">{visit.no_visit}</p> {/* MENAMPILKAN no_visit */}
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
          <div className="fixed inset-0 bg-black/25 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Tambah Kunjungan Baru</h2>
              </div>
              
              <form onSubmit={handleSubmit}>
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">No. Kunjungan</label> {/* PERUBAHAN LABEL */}
                      <input
                        type="number"
                        name="noVisit"
                        value={formData.noVisit}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                        min="0"
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
                      <div className="flex items-center">
                        <input
                          type="text"
                          name="lokasi"
                          value={formData.lokasi}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                          readOnly
                        />
                        <button
                          type="button"
                          onClick={getCurrentLocation}
                          disabled={isLoadingLocation}
                          className="ml-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                        >
                          {isLoadingLocation ? (
                            <RefreshCw size={16} className="animate-spin" />
                          ) : (
                            <MapPin size={16} />
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {formData.lokasi ? 'Koordinat lokasi Anda saat ini.' : 'Dapatkan lokasi otomatis dengan GPS.'}
                      </p>
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
                        type="number"
                        name="rataTopUp"
                        value={formData.rataTopUp}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="contoh: 100000"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Potensi Top Up Member</label>
                      <input
                        type="number"
                        name="potensiTopUp"
                        value={formData.potensiTopUp}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="contoh: 5000000"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">% Pemakaian TekMo</label>
                      <input
                        type="number"
                        name="persentasePemakaian"
                        value={formData.persentasePemakaian}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="contoh: 10"
                        min="0"
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
                    <div
                      className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
                      onClick={() => fileInputRef.current.click()}
                    >
                      {formData.foto ? (
                        <img src={formData.foto} alt="Preview Outlet" className="max-h-48 w-full object-contain mx-auto mb-2" />
                      ) : (
                        <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      )}
                      <p className="text-sm text-gray-500">
                        {formData.foto ? 'Ganti Foto' : 'Klik untuk upload foto atau ambil foto'}
                      </p>                      
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                      />
                    </div>
                    {formData.foto && (
                      <div className="flex justify-center mt-2 space-x-2">
                        <button
                          type="button"
                          onClick={startCamera}
                          className="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm flex items-center"
                        >
                          <Camera size={16} className="mr-1" /> Ambil Ulang Foto
                        </button>
                        <button
                          type="button"
                          onClick={handleRemovePhoto}
                          className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm flex items-center"
                        >
                          <Trash2 size={16} className="mr-1" /> Hapus Foto
                        </button>
                      </div>
                    )}
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

        {/* Modal Kamera */}
        {showCameraModal && (
          <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-4 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Ambil Foto Outlet</h3>
                <button
                  onClick={() => {
                    const stream = videoRef.current?.srcObject;
                    if (stream) {
                      const tracks = stream.getTracks();
                      tracks.forEach(track => track.stop());
                    }
                    setShowCameraModal(false);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-64 object-cover rounded-lg bg-gray-200"
                />
                <button
                  onClick={takePhoto}
                  className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full"
                >
                  <Camera size={24} />
                </button>
              </div>
              
              <canvas ref={canvasRef} className="hidden" />
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default KunjunganPage;
