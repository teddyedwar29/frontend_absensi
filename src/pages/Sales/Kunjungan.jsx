// src/pages/sales/kunjungan.jsx

import React, { useState, useEffect, useRef } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { MapPin, Camera, Plus, Search, Filter, CheckCircle, X, XCircle, RefreshCw, Eye, Edit3, Trash2, ShieldCheck, ShieldAlert, Building, User, ChevronsRight, FileText, DollarSign, Percent, MessageSquare, Target, TrendingUp, Clock } from 'lucide-react';
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
  const [locationAccuracy, setLocationAccuracy] = useState(null);


   // --- State untuk Autocomplete Outlet ---
  const [allOutlets, setAllOutlets] = useState([]); // Isinya [{id, name}, ...]
  const [outletSuggestions, setOutletSuggestions] = useState([]);
  const [isOutletInputFocused, setIsOutletInputFocused] = useState(false);
  const [locationCoords, setLocationCoords] = useState(null); // State untuk menyimpan koordinat lokasi
  const [isLoadingLocation, setIsLoadingLocation] = useState(false); // State untuk loading lokasi

  const initialFormData = {
        noVisit: '', 
        idOutlet: '', // Simpan ID Outlet di sini
        outletName: '', // Simpan Nama Outlet di sini
        lokasi: '', 
        kegiatan: '',
        kompetitor: '', 
        rataTopUp: '', 
        potensiTopUp: '',
        persentasePemakaian: '', 
        issue: '', 
        foto: null, 
        idMR: ''
    };
  const [formData, setFormData] = useState(initialFormData);

     // Komponen Input Field untuk merapikan form
    const InputField = React.memo(({ icon: Icon, label, name, ...props }) => (
        <div>
            <label className="block text-sm font-medium text-gray-700">{label}</label>
            <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Icon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    name={name}
                     autoComplete="off"
                     onInput={props.onChange} 
                    {...props}
                    className="block w-full rounded-md border-gray-300 pl-10 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
            </div>
        </div>
    ));

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

  // PERUBAHAN: Mengambil username dari localStorage untuk idMR saat komponen dimuat
  useEffect(() => {
    const currentUser = localStorage.getItem('username');
    if (currentUser) {
      setFormData(prev => ({ ...prev, idMR: currentUser }));
    }
    fetchVisits(); // Panggil fetchVisits setelah idMR diatur

     const fetchOutlets = async () => {
        try {
            const response = await API.get('/outlets');
            // Pastikan data yang diterima adalah array, jika bukan, set array kosong
            setAllOutlets(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            console.error("Gagal mengambil daftar outlet:", err);
        }
    };
    fetchOutlets(); // Panggil fungsinya

  }, []);



   const handleInputChange = (e) => {
        const { name, value } = e.target;
        // Gunakan callback `(prev => ...)` untuk memastikan state lama tidak hilang
        setFormData(prev => ({
            ...prev,      // 1. Salin semua nilai yang sudah ada
            [name]: value // 2. Timpa hanya nilai dari input yang sedang diketik
        }));

        if (name === 'outletName') {
            setFormData(prev => ({ ...prev, idOutlet: '' })); 
            if (value) {
                const suggestions = allOutlets.filter(outlet =>
                    outlet.name.toLowerCase().includes(value.toLowerCase()) ||
                    outlet.id.toLowerCase().includes(value.toLowerCase())
                );
                setOutletSuggestions(suggestions);
            } else {
                setOutletSuggestions([]);
            }
        }
        // Untuk field lain (kompetitor, issue, dll.)
         setFormData(prev => ({
        ...prev,
        [name]: value
    }));
    };

const handleSuggestionClick = (outlet) => {
    // Isi ID dan Nama Outlet saat saran diklik
    setFormData(prev => ({
        ...prev,
        idOutlet: outlet.id_outlet, // Simpan ID Outlet
        outletName: outlet.name
    }));
    setOutletSuggestions([]);
    setIsOutletInputFocused(false);
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

  const startCamera = async () => {
        try {
            // Dapatkan daftar semua perangkat video (kamera)
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = devices.filter(device => device.kind === 'videoinput');

            // Cari kamera depan (selfie)
            let selfieCamera = videoDevices.find(device => device.label.toLowerCase().includes('front'));

            // Jika tidak ketemu dengan nama 'front', cari yang bukan 'back' sebagai cadangan
            if (!selfieCamera && videoDevices.length > 1) {
                selfieCamera = videoDevices.find(device => !device.label.toLowerCase().includes('back'));
            }
            
            // Tentukan constraints berdasarkan kamera yang ditemukan
            const constraints = {
                video: {
                    // Jika kamera selfie ditemukan, paksa gunakan deviceId-nya
                    deviceId: selfieCamera ? { exact: selfieCamera.deviceId } : undefined,
                    // Jika tidak, tetap coba minta kamera 'user' sebagai fallback
                    facingMode: 'user'
                }
            };
            
            setShowCameraModal(true);
            setTimeout(async () => {
                const stream = await navigator.mediaDevices.getUserMedia(constraints);
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            }, 100);
            
        } catch (error) {
            console.error('Error mengakses kamera:', error);
            setShowCameraModal(false);
            Swal.fire({ 
                icon: 'error', 
                title: 'Kamera Gagal', 
                text: 'Tidak dapat mengakses kamera selfie. Pastikan izin sudah diberikan dan tidak ada aplikasi lain yang sedang menggunakan kamera.' 
            });
        }
    };

    const takePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const canvas = canvasRef.current;
            const video = videoRef.current;
            const context = canvas.getContext('2d');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            const photoDataUrl = canvas.toDataURL('image/jpeg', 0.8);
            setFormData(prev => ({ ...prev, foto: photoDataUrl }));
            
            const stream = video.srcObject;
            stream.getTracks().forEach(track => track.stop());
            setShowCameraModal(false);
        }
    };

    const handleRemovePhoto = () => {
        setFormData(prev => ({ ...prev, foto: null }));
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };


 
const handleOpenAddForm = () => {
    setShowAddForm(true); // 1. Tampilkan form
    getCurrentLocation(); // 2. Langsung cari lokasi
};

// Ganti seluruh fungsi getCurrentLocation dengan versi ini
const getCurrentLocation = () => {
    setIsLoadingLocation(true);
    setLocationAccuracy(null);
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude, accuracy } = position.coords;
                const coordsString = `${latitude.toFixed(6)},${longitude.toFixed(6)}`;
                setFormData(prev => ({ ...prev, lokasi: coordsString }));
                setLocationAccuracy(accuracy.toFixed(0));
                setIsLoadingLocation(false);
                
                // --- PERUBAHAN DI SINI: Ganti jadi notifikasi kecil ---
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: 'Lokasi berhasil dideteksi!',
                    showConfirmButton: false,
                    timer: 2000
                });
            },
            (error) => {
                console.error('Error lokasi:', error);
                setIsLoadingLocation(false);
                Swal.fire({ icon: 'error', title: 'Gagal', text: 'Gagal mendapatkan lokasi. Pastikan GPS aktif.' });
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
        );
    } else {
        setIsLoadingLocation(false);
        Swal.fire({ icon: 'warning', title: 'Peringatan', text: 'Geolocation tidak didukung.' });
    }
};


  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Cek apakah outlet yang diinput ada di daftar (berdasarkan ID)
    const isExistingOutlet = allOutlets.some(outlet => outlet.id === formData.idOutlet);

    const proceedSubmit = async () => {
        try {
            const submitFormData = new FormData();
            // Kirim semua data termasuk id_outlet dan nama_outlet
            Object.keys(formData).forEach(key => {
                const backendKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
                if (key === 'outletName') submitFormData.append('nama_outlet', formData[key]);
                else if (key === 'idOutlet') submitFormData.append('id_outlet', formData[key]);
                else if (key !== 'foto') submitFormData.append(backendKey, formData[key]);
            });

            if (formData.foto) {
                const response = await fetch(formData.foto);
                const blob = await response.blob();
                submitFormData.append('foto_kunjungan', blob, 'kunjungan_photo.jpeg');
            }
            
            await API.post('/kunjungan', submitFormData, { headers: { 'Content-Type': 'multipart/form-data' } });
            Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Kunjungan berhasil ditambahkan!', timer: 1500 });
            setShowAddForm(false);
            setFormData({ ...initialFormData, idMR: localStorage.getItem('username') || '' });
            fetchVisits();
        } catch(err) {
            Swal.fire({ icon: 'error', title: 'Gagal', text: err.response?.data?.message || 'Gagal.' });
        }
    };

    if (isExistingOutlet || formData.idOutlet) {
        // Jika outlet sudah ada (ID-nya terisi), langsung submit
        await proceedSubmit();
    } else {
        // Jika outlet baru (ID-nya kosong), minta konfirmasi
        const result = await Swal.fire({
            title: 'Konfirmasi Outlet Baru',
            text: `Outlet "${formData.outletName}" tidak ada di daftar. Yakin ingin menambahkannya sebagai outlet baru?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Ya, Tambahkan!',
            cancelButtonText: 'Batal'
        });
        if (result.isConfirmed) {
            await proceedSubmit();
        }
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

const filteredVisits = visits.filter(visit => {
    const visitDate = new Date(visit.tanggal_input);
    const today = new Date();
    // Reset jam, menit, detik untuk perbandingan tanggal yang akurat
    today.setHours(0, 0, 0, 0);
    visitDate.setHours(0, 0, 0, 0);

    const timeDiff = today.getTime() - visitDate.getTime();
    const dayDiff = Math.floor(timeDiff / (1000 * 3600 * 24));

    let dayFilterPassed = false;
    if (selectedDay === 0) dayFilterPassed = dayDiff === 0; // Tepat hari ini
    else if (selectedDay === 1) dayFilterPassed = dayDiff === 1; // Tepat kemarin
    else if (selectedDay === 7) dayFilterPassed = dayDiff < 7; // Dalam 7 hari terakhir
    else dayFilterPassed = true; // Tampilkan semua jika filter 'Semua'

    const searchFilterPassed = visit.nama_outlet.toLowerCase().includes(searchTerm.toLowerCase());
    
    return dayFilterPassed && searchFilterPassed;
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
              onClick={handleOpenAddForm}
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
       <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col sm:flex-row gap-4">
    <div className="relative flex-grow">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input 
            type="text" 
            placeholder="Cari nama outlet..." 
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
        />
    </div>
    <div className="flex items-center gap-2 flex-shrink-0 bg-gray-100 rounded-lg p-1">
        <button onClick={() => setSelectedDay(0)} className={`px-3 py-1 text-sm font-semibold rounded-md ${selectedDay === 0 ? 'bg-white shadow text-blue-600' : 'text-gray-600'}`}>Hari Ini</button>
        <button onClick={() => setSelectedDay(1)} className={`px-3 py-1 text-sm font-semibold rounded-md ${selectedDay === 1 ? 'bg-white shadow text-blue-600' : 'text-gray-600'}`}>Kemarin</button>
        <button onClick={() => setSelectedDay(7)} className={`px-3 py-1 text-sm font-semibold rounded-md ${selectedDay === 7 ? 'bg-white shadow text-blue-600' : 'text-gray-600'}`}>7 Hari</button>
        <button onClick={() => setSelectedDay(30)} className={`px-3 py-1 text-sm font-semibold rounded-md ${selectedDay === 30 ? 'bg-white shadow text-blue-600' : 'text-gray-600'}`}>Semua</button>
    </div>
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
                          {visit.id_outlet} • ID MR: {visit.id_mr} {/* PERUBAHAN: Menampilkan id_mr */}
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
                            <div className="p-6 space-y-6">
                                {/* SEKSI 1: INFORMASI UTAMA */}
                                <div className="border-b pb-6">
                                    <h3 className="text-lg font-medium leading-6 text-gray-900">Informasi Outlet</h3>
                                    <div className="mt-4 grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2">
                                        <div className="sm:col-span-1">
                                            <InputField
                                                icon={User} label="No. Kunjungan" name="noVisit"
                                                type="number" value={formData.noVisit} onChange={handleInputChange}
                                                placeholder="1" required
                                            />
                                        </div>
                                        <div className="sm:col-span-1 relative">
                                            <label className="block text-sm font-medium text-gray-700">Nama / ID Outlet</label>
                                            <div className="relative mt-1">
                                                 <Building className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-gray-400 pl-3" />
                                                 <input
                                                    type="text" name="outletName" value={formData.outletName}
                                                    onChange={handleInputChange} onFocus={() => setIsOutletInputFocused(true)}
                                                    onBlur={() => setTimeout(() => setIsOutletInputFocused(false), 200)}
                                                    className="block w-full rounded-md border-gray-300 pl-10 shadow-sm sm:text-sm"
                                                    placeholder="Ketik untuk mencari..." required autoComplete="off"
                                                />
                                            </div>
                                            {isOutletInputFocused && outletSuggestions.length > 0 && (
                                                <ul className="absolute z-10 w-full bg-white border rounded-lg mt-1 max-h-40 overflow-y-auto shadow-lg">
                                                    {outletSuggestions.map((outlet, index) => (
                                                        <li key={index} className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm" onClick={() => handleSuggestionClick(outlet)}>
                                                            <span className="font-bold">{outlet.id}</span> - <span>{outlet.name}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* SEKSI 2: DETAIL KUNJUNGAN */}
                                <div className="border-b pb-6">
                                     <h3 className="text-lg font-medium leading-6 text-gray-900">Detail Kunjungan</h3>
                                     <div className="mt-4 grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2">
                                        <div className="sm:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700">Lokasi (Koordinat)</label>
                                            <div className="flex items-center gap-2 mt-1">
                                                <input type="text" name="lokasi" value={formData.lokasi} readOnly className="w-full px-3 py-2 border rounded-lg bg-gray-100" placeholder="..." />
                                                <button type="button" onClick={getCurrentLocation} disabled={isLoadingLocation} className="bg-blue-600 text-white p-2.5 rounded-lg disabled:bg-gray-400 flex-shrink-0">
                                                    {isLoadingLocation ? <RefreshCw size={16} className="animate-spin" /> : <MapPin size={16} />}
                                                </button>
                                            </div>
                                            {locationAccuracy && (
                                                <div className={`mt-1 flex items-center text-xs ${locationAccuracy <= 20 ? 'text-green-600' : 'text-yellow-600'}`}>
                                                    {locationAccuracy <= 20 ? <ShieldCheck size={14} className="mr-1" /> : <ShieldAlert size={14} className="mr-1" />}
                                                    Akurasi: ~{locationAccuracy} m
                                                </div>
                                            )}
                                        </div>
                                        <div className="sm:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700">Kegiatan</label>
                                            <select name="kegiatan" value={formData.kegiatan} onChange={handleInputChange} className="mt-1 w-full px-3 py-2 border rounded-lg" required>
                                                <option value="">Pilih Kegiatan</option>
                                                <option value="akuisisi">Akuisisi</option>
                                                <option value="maintenance">Maintenance</option>
                                                <option value="prospek">Prospek</option>
                                            </select>
                                        </div>
                                        <div className="sm:col-span-2">
                                             <InputField
                                                icon={FileText} label="Kompetitor" name="kompetitor"
                                                type="text" value={formData.kompetitor} onChange={handleInputChange}
                                                placeholder="Jika ada"
                                            />
                                        </div>
                                        <InputField
                                            icon={DollarSign} label="Rata-rata Top Up" name="rataTopUp"
                                            type="number" value={formData.rataTopUp} onChange={handleInputChange}
                                            placeholder="cth: 100000"
                                        />
                                        <InputField
                                            icon={DollarSign} label="Potensi Top Up" name="potensiTopUp"
                                            type="number" value={formData.potensiTopUp} onChange={handleInputChange}
                                            placeholder="cth: 5000000"
                                        />
                                        <InputField
                                            icon={Percent} label="% Pemakaian" name="persentasePemakaian"
                                            type="number" value={formData.persentasePemakaian} onChange={handleInputChange}
                                            placeholder="cth: 10"
                                        />
                                        <div className="sm:col-span-2">
                                             <InputField
                                                icon={MessageSquare} label="Issue" name="issue"
                                                type="text" value={formData.issue} onChange={handleInputChange}
                                                placeholder="Catatan atau masalah"
                                            />
                                        </div>
                                     </div>
                                </div>
                                
                                {/* SEKSI 3: FOTO */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Foto Outlet</label>
                                    <div className="mt-2 border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-blue-400" onClick={startCamera}>
                                        {formData.foto ? (
                                            <img src={formData.foto} alt="Preview Outlet" className="max-h-40 w-auto mx-auto" />
                                        ) : (
                                            <div>
                                                <Camera className="w-12 h-12 text-gray-400 mx-auto" />
                                                <p className="mt-2 text-sm text-gray-600">Klik untuk ambil foto</p>
                                            </div>
                                        )}
                                    </div>
                                    <p onClick={() => fileInputRef.current.click()} className="text-center text-xs text-blue-600 hover:underline mt-2 cursor-pointer">atau upload dari galeri</p>
                                    <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
                                </div>
                            </div>
                            
                            <div className="flex justify-end space-x-3 p-6 bg-gray-50 border-t">
                                <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 text-gray-700 bg-white border rounded-lg hover:bg-gray-100">Batal</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Simpan Kunjungan</button>
                            </div>
                        </form>
            </div>
          </div>
        )}

        {/* Modal Kamera */}
            {showCameraModal && (
                <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-[60]">
                    <div className="bg-white rounded-lg p-4 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">Ambil Foto Outlet</h3>
                            <button
                                onClick={() => {
                                    const stream = videoRef.current?.srcObject;
                                    if (stream) stream.getTracks().forEach(track => track.stop());
                                    setShowCameraModal(false);
                                }}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        <div className="relative">
                            <video ref={videoRef} autoPlay playsInline className="w-full h-64 object-cover rounded-lg bg-gray-200" />
                            <button
                                onClick={takePhoto}
                                className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full"
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
