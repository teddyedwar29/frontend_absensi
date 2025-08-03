// src/pages/Admin/TimSales.jsx

import React, { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout'; // Import komponen layout
import { Search, Plus, MoreVertical, MapPin, Phone, Mail, Star, TrendingUp, Users } from 'lucide-react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
//import { useQueryClient } from '@tanstack/react-query';
import AddSalesForm from '../../components/AddSalesForm'; // Komponen modal untuk menambah sales 


const AdminTeamPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('Semua');
//  const queryClient = useQueryClient();
  const MySwal = withReactContent(Swal);


  const handleAddSales = () => {
    let formData = {};
    MySwal.fire({
      title: 'Tambah Tim Sales Baru',
      showCancelButton: true,
      confirmButtonText: 'Simpan',
      html: <AddSalesForm onFormSubmit={data => formData = data} />,
      showLoaderOnConfirm: true, // Tampilkan loader saat tombol 'Simpan' ditekan
      preConfirm: () => {
        // Validasi data
        if (!formData.nama || !formData.jabatan || !formData.email) {
          Swal.showValidationMessage('Semua kolom wajib diisi!');
          return false;
        }

        // Kirim data ke API
        return fetch('https://api.anda.com/sales', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })
          .then(response => {
            // Cek apakah request berhasil (status 200-299)
            if (!response.ok) {
              // Jika gagal, baca pesan error dari server jika ada
              return response.json().then(error => {
                throw new Error(error.message || 'Terjadi kesalahan saat menyimpan data.');
              });
            }
            return response.json();
          })
          .catch(error => {
            // Tangkap error jika fetch gagal atau server merespons error
            Swal.showValidationMessage(`Request gagal: ${error.message}`);
          });
      },
      allowOutsideClick: () => !Swal.isLoading(),
    }).then(result => {
      // Logic ini dijalankan setelah preConfirm berhasil dan modal ditutup
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Berhasil!',
          text: 'Tim Sales baru telah ditambahkan.',
          icon: 'success',
          confirmButtonText: 'OK'
        });

        // Opsional: Muat ulang atau perbarui daftar sales
        // Ini adalah praktik terbaik agar data di UI langsung ter-update
       // queryClient.invalidateQueries(['sales-list']);
      }
    });
  };
  // Mock data tim sales
  const salesTeam = [
    {
      id: 1,
      name: 'Ahmad Rizki',
      position: 'Sales Executive',
      location: 'Jakarta Pusat',
      phone: '+62 812-3456-7890',
      email: 'ahmad.rizki@company.com',
      status: 'Aktif',
      performance: 98,
      joinDate: '2024-01-15',
      totalSales: 'Rp 250M',
      avatar: 'AR',
      rating: 4.9,
      lastActive: '2 jam yang lalu'
    },
    {
      id: 2,
      name: 'Sari Dewi',
      position: 'Senior Sales',
      location: 'Bandung',
      phone: '+62 813-2345-6789',
      email: 'sari.dewi@company.com',
      status: 'Aktif',
      performance: 96,
      joinDate: '2023-11-20',
      totalSales: 'Rp 340M',
      avatar: 'SD',
      rating: 4.8,
      lastActive: '1 jam yang lalu'
    },
    {
      id: 3,
      name: 'Budi Santoso',
      position: 'Sales Representative',
      location: 'Surabaya',
      phone: '+62 814-3456-7890',
      email: 'budi.santoso@company.com',
      status: 'Cuti',
      performance: 94,
      joinDate: '2024-02-10',
      totalSales: 'Rp 180M',
      avatar: 'BS',
      rating: 4.7,
      lastActive: '1 hari yang lalu'
    },
    {
      id: 4,
      name: 'Maya Putri',
      position: 'Sales Manager',
      location: 'Jakarta Selatan',
      phone: '+62 815-4567-8901',
      email: 'maya.putri@company.com',
      status: 'Aktif',
      performance: 99,
      joinDate: '2023-08-05',
      totalSales: 'Rp 450M',
      avatar: 'MP',
      rating: 5.0,
      lastActive: '30 menit yang lalu'
    },
    {
      id: 5,
      name: 'Rendi Pratama',
      position: 'Junior Sales',
      location: 'Medan',
      phone: '+62 816-5678-9012',
      email: 'rendi.pratama@company.com',
      status: 'Aktif',
      performance: 87,
      joinDate: '2024-03-01',
      totalSales: 'Rp 120M',
      avatar: 'RP',
      rating: 4.5,
      lastActive: '4 jam yang lalu'
    },
    {
      id: 6,
      name: 'Lia Anggraini',
      position: 'Sales Executive',
      location: 'Yogyakarta',
      phone: '+62 817-6789-0123',
      email: 'lia.anggraini@company.com',
      status: 'Tidak Aktif',
      performance: 92,
      joinDate: '2023-12-12',
      totalSales: 'Rp 200M',
      avatar: 'LA',
      rating: 4.6,
      lastActive: '3 hari yang lalu'
    }
  ];

  const filters = ['Semua', 'Aktif', 'Cuti', 'Tidak Aktif'];

  const filteredSales = salesTeam.filter(sales => {
    const matchesSearch = sales.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          sales.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          sales.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'Semua' || sales.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Aktif': return 'bg-green-100 text-green-800';
      case 'Cuti': return 'bg-yellow-100 text-yellow-800';
      case 'Tidak Aktif': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPerformanceColor = (performance) => {
    if (performance >= 95) return 'text-green-600';
    if (performance >= 90) return 'text-blue-600';
    if (performance >= 85) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <DashboardLayout>
      {/* Konten unik halaman Tim Sales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        {/* Stats Cards */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <TrendingUp className="text-blue-600" size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Sales</p>
              <p className="text-2xl font-bold text-gray-900">6</p>
              <p className="text-xs text-green-600">+2 bulan ini</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <Star className="text-green-600" size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Rata-rata Performa</p>
              <p className="text-2xl font-bold text-gray-900">94.3%</p>
              <p className="text-xs text-green-600">+1.2% dari bulan lalu</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Users className="text-yellow-600" size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Sales Aktif</p>
              <p className="text-2xl font-bold text-gray-900">4</p>
              <p className="text-xs text-gray-600">dari 6 total</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <MapPin className="text-purple-600" size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Lokasi</p>
              <p className="text-2xl font-bold text-gray-900">6</p>
              <p className="text-xs text-gray-600">kota berbeda</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Daftar Tim Sales</h2>
        <button 
        onClick={handleAddSales}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
          <Plus size={20} 
          
          />
          Tambah Sales
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Cari nama, posisi, atau lokasi..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`px-4 py-2 rounded-lg transition-colors text-sm ${
                  selectedFilter === filter
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredSales.map((sales) => (
          <div key={sales.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="p-6 pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {sales.avatar}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{sales.name}</h3>
                    <p className="text-sm text-gray-600">{sales.position}</p>
                  </div>
                </div>
                <button className="p-1 hover:bg-gray-100 rounded">
                  <MoreVertical size={16} className="text-gray-400" />
                </button>
              </div>
            </div>

            <div className="px-6 pb-4">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(sales.status)}`}>
                {sales.status}
              </span>
            </div>

            <div className="px-6 pb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Performa</span>
                <span className={`text-sm font-semibold ${getPerformanceColor(sales.performance)}`}>
                  {sales.performance}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    sales.performance >= 95 ? 'bg-green-500' :
                    sales.performance >= 90 ? 'bg-blue-500' :
                    sales.performance >= 85 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${sales.performance}%` }}
                ></div>
              </div>
            </div>

            <div className="px-6 pb-4 space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin size={14} />
                <span>{sales.location}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone size={14} />
                <span>{sales.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail size={14} />
                <span>{sales.email}</span>
              </div>
            </div>

            <div className="px-6 pb-4">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-sm text-gray-600">Total Penjualan</p>
                  <p className="font-semibold text-gray-900">{sales.totalSales}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Rating</p>
                  <div className="flex items-center justify-center gap-1">
                    <Star size={14} className="text-yellow-400 fill-current" />
                    <span className="font-semibold text-gray-900">{sales.rating}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 rounded-b-xl">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Bergabung {sales.joinDate}</span>
                <span>Aktif {sales.lastActive}</span>
              </div>
            </div>
          </div>
        ))}
          
        {filteredSales.length === 0 && (
          <div className="col-span-full bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search size={24} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Tidak ada data ditemukan</h3>
            <p className="text-gray-600">Coba ubah kata kunci pencarian atau filter yang dipilih</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminTeamPage;
