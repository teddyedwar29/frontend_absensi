// src/pages/Admin/PageIzin.jsx

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { 
    FileText, 
    Check, 
    X, 
    Clock, 
    Search, 
    Filter,
    Calendar,
    User,
    ChevronDown,
    RefreshCw,
    AlertCircle,
    CheckCircle,
    XCircle,
    Eye
} from 'lucide-react';
import Swal from 'sweetalert2';
import { getIzinHistory, updateIzinStatus } from '../../api/izin';

// Komponen Modal untuk detail izin
function DetailModal({ open, onClose, izin }) {
    if (!open || !izin) return null;
    
    return (
        <div onClick={onClose} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-xl shadow-lg w-full max-w-lg relative p-6">
                <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600">
                    <X size={24} />
                </button>
                
                <div className="mb-4">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                        <FileText className="mr-2 text-blue-500" size={24} />
                        Detail Pengajuan Izin
                    </h2>
                </div>
                
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">Nama Karyawan</label>
                            <p className="text-gray-900 font-medium">{izin.name || 'Unknown User'}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">Tanggal Izin</label>
                            <p className="text-gray-900">{new Date(izin.tanggal_izin).toLocaleDateString('id-ID')}</p>
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Keterangan</label>
                        <div className="bg-gray-50 rounded-lg p-3 min-h-[80px]">
                            <p className="text-gray-800">{izin.keterangan || 'Tidak ada keterangan'}</p>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">Status Saat Ini</label>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                izin.status_izin === 'approved' ? 'bg-green-100 text-green-800' :
                                izin.status_izin === 'rejected' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                            }`}>
                                {izin.status_izin === 'approved' ? (
                                    <>
                                        <CheckCircle size={16} className="mr-1" />
                                        Disetujui
                                    </>
                                ) : izin.status_izin === 'rejected' ? (
                                    <>
                                        <XCircle size={16} className="mr-1" />
                                        Ditolak
                                    </>
                                ) : (
                                    <>
                                        <Clock size={16} className="mr-1" />
                                        Pending
                                    </>
                                )}
                            </span>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">Tanggal Pengajuan</label>
                            <p className="text-gray-900">{new Date(izin.created_at).toLocaleDateString('id-ID')}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const PageIzin = () => {
    const [izinList, setIzinList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('');
    const [selectedIzin, setSelectedIzin] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [updating, setUpdating] = useState(null);

    // Fetch data izin
    const fetchIzinData = async () => {
        setLoading(true);
        try {
            const response = await getIzinHistory();
            if (response.success) {
                // Sort by created_at descending (terbaru dulu)
                const sortedData = response.data.sort((a, b) => 
                    new Date(b.created_at) - new Date(a.created_at)
                );
                setIzinList(sortedData);
            } else {
                console.error('Failed to fetch izin data:', response.message);
                Swal.fire('Error', 'Gagal memuat data izin', 'error');
            }
        } catch (error) {
            console.error('Error fetching izin data:', error);
            Swal.fire('Error', 'Terjadi kesalahan saat memuat data', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchIzinData();
    }, []);

    // Handle update status izin
    const handleUpdateStatus = async (izinId, newStatus) => {
        const result = await Swal.fire({
            title: 'Konfirmasi',
            text: `Apakah Anda yakin ingin ${newStatus === 'approved' ? 'menyetujui' : 'menolak'} pengajuan izin ini?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: newStatus === 'approved' ? '#10b981' : '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: newStatus === 'approved' ? 'Ya, Setujui' : 'Ya, Tolak',
            cancelButtonText: 'Batal'
        });

        if (result.isConfirmed) {
            setUpdating(izinId);
            try {
                const response = await updateIzinStatus(izinId, newStatus);
                
                if (response.success) {
                    Swal.fire({
                        title: 'Berhasil!',
                        text: `Pengajuan izin telah ${newStatus === 'approved' ? 'disetujui' : 'ditolak'}`,
                        icon: 'success',
                        confirmButtonColor: '#10b981'
                    });
                    
                    // Refresh data
                    await fetchIzinData();
                } else {
                    Swal.fire('Error', response.message || 'Gagal memperbarui status izin', 'error');
                }
            } catch (error) {
                console.error('Error updating izin status:', error);
                Swal.fire('Error', 'Terjadi kesalahan saat memperbarui status', 'error');
            } finally {
                setUpdating(null);
            }
        }
    };

    // Handle show detail
    const handleShowDetail = (izin) => {
        setSelectedIzin(izin);
        setShowDetailModal(true);
    };

    // Filter data berdasarkan search dan filter
    const filteredIzin = izinList.filter((izin) => {
        const matchesSearch = izin.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            izin.keterangan?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = statusFilter === 'all' || izin.status_izin === statusFilter;
        
        const matchesDate = !dateFilter || 
                          new Date(izin.tanggal_izin).toISOString().split('T')[0] === dateFilter;
        
        return matchesSearch && matchesStatus && matchesDate;
    });

    // Get statistics
    const stats = {
        total: izinList.length,
        pending: izinList.filter(i => i.status_izin === 'pending').length,
        approved: izinList.filter(i => i.status_izin === 'approved').length,
        rejected: izinList.filter(i => i.status_izin === 'rejected').length
    };

    return (
        <DashboardLayout>
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Manajemen Izin</h1>
                <p className="text-gray-600">Kelola persetujuan pengajuan izin karyawan</p>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <FileText className="h-8 w-8 text-blue-500" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Total Pengajuan</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <Clock className="h-8 w-8 text-yellow-500" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Menunggu</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <CheckCircle className="h-8 w-8 text-green-500" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Disetujui</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <XCircle className="h-8 w-8 text-red-500" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Ditolak</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari nama atau keterangan..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    {/* Status Filter */}
                    <div className="relative">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                        >
                            <option value="all">Semua Status</option>
                            <option value="pending">Pending</option>
                            <option value="approved">Disetujui</option>
                            <option value="rejected">Ditolak</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>

                    {/* Date Filter */}
                    <div className="relative">
                        <input
                            type="date"
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    {/* Refresh Button */}
                    <button
                        onClick={fetchIzinData}
                        disabled={loading}
                        className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="text-center py-12">
                            <RefreshCw className="mx-auto animate-spin text-gray-400 mb-4" size={40} />
                            <p className="text-gray-500">Memuat data izin...</p>
                        </div>
                    ) : filteredIzin.length === 0 ? (
                        <div className="text-center py-12">
                            <AlertCircle className="mx-auto text-gray-400 mb-4" size={40} />
                            <p className="text-gray-500">Tidak ada data izin ditemukan</p>
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Karyawan
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Tanggal Izin
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Keterangan
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Tanggal Pengajuan
                                    </th>
                                    <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredIzin.map((izin) => (
                                    <tr key={izin.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0">
                                                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                        <User className="h-5 w-5 text-blue-600" />
                                                    </div>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {izin.name || 'Unknown User'}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        ID_MR: {izin.id_mr}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center text-sm text-gray-900">
                                                <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                                                {new Date(izin.tanggal_izin).toLocaleDateString('id-ID')}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 max-w-xs">
                                            <div className="text-sm text-gray-900 truncate" title={izin.keterangan || 'Tidak ada keterangan'}>
                                                {izin.keterangan || 'Tidak ada keterangan'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                                izin.status_izin === 'approved' ? 'bg-green-100 text-green-800' :
                                                izin.status_izin === 'rejected' ? 'bg-red-100 text-red-800' :
                                                'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {izin.status_izin === 'approved' ? (
                                                    <>
                                                        <CheckCircle size={14} className="mr-1" />
                                                        Disetujui
                                                    </>
                                                ) : izin.status_izin === 'rejected' ? (
                                                    <>
                                                        <XCircle size={14} className="mr-1" />
                                                        Ditolak
                                                    </>
                                                ) : (
                                                    <>
                                                        <Clock size={14} className="mr-1" />
                                                        Pending
                                                    </>
                                                )}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(izin.created_at).toLocaleDateString('id-ID')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <div className="flex items-center justify-center space-x-2">
                                                <button
                                                    onClick={() => handleShowDetail(izin)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Lihat Detail"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                
                                                {izin.status_izin === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleUpdateStatus(izin.id,'approved')}
                                                            disabled={updating === izin.id}
                                                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                                                            title="Setujui"
                                                        >
                                                            {updating === izin.id ? (
                                                                <RefreshCw size={16} className="animate-spin" />
                                                            ) : (
                                                                <Check size={16} />
                                                            )}
                                                        </button>
                                                        <button
                                                            onClick={() => handleUpdateStatus(izin.id,'rejected')}
                                                            disabled={updating === izin.id}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                                            title="Tolak"
                                                        >
                                                            {updating === izin.id ? (
                                                                <RefreshCw size={16} className="animate-spin" />
                                                            ) : (
                                                                <X size={16} />
                                                            )}
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Detail Modal */}
            <DetailModal 
                open={showDetailModal} 
                onClose={() => setShowDetailModal(false)} 
                izin={selectedIzin} 
            />
        </DashboardLayout>
    );
};

export default PageIzin;