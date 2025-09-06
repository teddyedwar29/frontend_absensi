import { useState, useEffect } from "react";
import {
  fetchKomplains,
  createComplain,
  updateComplainStatus,
  deleteComplain,
} from "../../services/complainService";
import Swal from "sweetalert2";
import { X, Users, Edit3, Trash2 ,LogOut, Phone, Package, FileText, Clock, CheckCircle, AlertCircle, Plus, Search, Calendar, Menu } from "lucide-react";
import { logout } from "../../api/auth";
const CSDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [komplains, setKomplains] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null); 
  const [submitLoading, setSubmitLoading] = useState(false);
  const [formData, setFormData] = useState({
    nomor_konsumen: "",
    produk: "",
    keterangan: "",
    nomor_tujuan: "",
    pic_created: "",
  });
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedComplain, setSelectedComplain] = useState(null);
  const [updateForm, setUpdateForm] = useState({
    status_komplain: "",
    pic_updated: "",
    keterangan: "",
  });

  const userName = "Customer Service";
  const userRole = "cs";

  const picOptions = ["Miftah", "Fajar", "Adriand", "Teguh", "Verza", "Sarni", "Hendri"];

  // Fetch komplains on component mount
  useEffect(() => {
    loadKomplains();
  }, []);

  const loadKomplains = async () => {
    setLoading(true);
    try {
     
      const data = await fetchKomplains();
      
      const sorted = data.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
     

      setKomplains(sorted);
    } catch (error) {
      console.error("❌ Gagal memuat komplain:", error);
    } finally {
      setLoading(false);
    }
  };

  
const handleSubmit = async (e) => {
  e.preventDefault();
  
  setSubmitLoading(true);
  try {
    const res = await createComplain(formData);
    
      await loadKomplains(); // refresh list

      setFormData({
        nomor_konsumen: "",
        nomor_tujuan: "",
        produk: "",
        keterangan: "",
        pic_created: "",
      });

      setNotification({ type: "success", message: "Komplain berhasil disimpan!" });
    
  } catch (err) {
   
    setNotification({ type: "error", message: "Gagal membuat komplain" });
  } finally {
    setSubmitLoading(false);
  }
};

// Auto-hide notifikasi 3 detik
useEffect(() => {
  if (notification) {
    const timer = setTimeout(() => setNotification(null), 3000);
    return () => clearTimeout(timer);
  }
}, [notification]);

  const handleOpenUpdateModal = (komplain) => {
  

    setSelectedComplain(komplain);
    setUpdateForm({
      status_komplain:
      komplain.status_komplain === "selesai" ? "belum selesai" : "selesai",
      pic_updated: "",
      keterangan: komplain.keterangan || "",
    });
    setShowUpdateModal(true);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
   

    if (!updateForm.pic_updated) {
      alert("PIC update wajib dipilih!");
      return;
    }

    setSubmitLoading(true);
    try {
      const res = await updateComplainStatus(
        selectedComplain.id,
        updateForm.status_komplain,
        updateForm.pic_updated,
        updateForm.keterangan
      );
     
        await loadKomplains();
        setShowUpdateModal(false);
        setSelectedComplain(null);
        
        setNotification({ type: "success", message: "Komplain berhasil DIupdate!" });
    } catch (err) {
     
       setNotification({ type: "error", message: "Komplain gagal DIupdate!" });
    } finally {
      setSubmitLoading(false);
    }
  };

const handleDelete = async (id) => {
  const result = await Swal.fire({
    title: "Yakin hapus komplain ini?",
    text: "Data yang sudah dihapus tidak bisa dikembalikan!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#6b7280", // abu-abu Tailwind
    confirmButtonText: "Ya, hapus!",
    cancelButtonText: "Batal",
  });

  if (!result.isConfirmed) return;

  setLoading(true);
  

  try {
    const res = await deleteComplain(id);
    

    
      await loadKomplains(); // refresh list otomatis

      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Komplain berhasil dihapus.",
        timer: 1500,
        showConfirmButton: false,
      });
      
  } catch (err) {
    console.error("❌ Error delete:", err);
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Terjadi kesalahan saat menghapus.",
    });
  } finally {
    setLoading(false);
  }
};

  const handleLogout = () => {
     Swal.fire({
       title: 'Yakin logout?',
       icon: 'warning',
       showCancelButton: true,
       confirmButtonText: 'Ya!',
       cancelButtonText: 'Batal'
     }).then((result) => result.isConfirmed && logout());
   };

  const filteredKomplains = komplains.filter((komplain) => {
    const matchesFilter =
      filter === "all" ||
      (filter === "pending" &&
        komplain.status_komplain?.toLowerCase()=== "belum selesai") ||
      (filter === "selesai" &&
        komplain.status_komplain?.toLowerCase() === "selesai");

    const matchesSearch =
      searchTerm === "" ||
      komplain.nomor_konsumen
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      komplain.produk?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      komplain.pic_created?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

 
  const stats = {
    total: komplains.length,
    pending: komplains.filter((k) =>
      k.status_komplain?.toLowerCase() === "belum selesai"
    ).length,
    selesai: komplains.filter((k) =>
      k.status_komplain?.toLowerCase() === "selesai"
    ).length,
  };

  

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  return (
   <div className="flex h-screen bg-gray-50">
    {/* Notification */}
     {notification && (
  <div
    className={`fixed top-5 right-5 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 text-sm z-50
      ${notification.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
  >
    {notification.type === "success" ? (
      <CheckCircle size={18} className="text-green-600" />
    ) : (
      <AlertCircle size={18} className="text-red-600" />
    )}
    <span>{notification.message}</span>
  </div>
      )}

      {/* Update Modal */}
      {showUpdateModal && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-md">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-lg p-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-3 mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Update Status Komplain
          </h3>
          <button
            onClick={() => setShowUpdateModal(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleUpdateSubmit} className="space-y-5">
          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status Baru
            </label>
            <select
              value={updateForm.status_komplain}
              onChange={(e) =>
                setUpdateForm({ ...updateForm, status_komplain: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            >
              <option value="belum selesai">Belum Selesai</option>
              <option value="selesai">Selesai</option>
            </select>
          </div>

          {/* PIC Update */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <Users className="text-purple-600" size={16} />
              PIC yang Mengupdate *
            </label>
            <select
              value={updateForm.pic_updated}
              onChange={(e) =>
                setUpdateForm({ ...updateForm, pic_updated: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            >
              <option value="">Pilih PIC</option>
              {picOptions.map((pic) => (
                <option key={pic} value={pic}>
                  {pic.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          {/* Keterangan */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Update Keterangan (Opsional)
            </label>
            <textarea
              value={updateForm.keterangan}
              onChange={(e) =>
                setUpdateForm({ ...updateForm, keterangan: e.target.value })
              }
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Tambahkan catatan update..."
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowUpdateModal(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:bg-purple-400 flex items-center"
            >
              {submitLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Menyimpan...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2" size={16} />
                  Update Status
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-gradient-to-b from-purple-900 to-purple-800 text-white transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-200 lg:translate-x-0 lg:static`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-purple-700">
          <h1 className="text-xl font-bold">CS TEKMO 🎧</h1>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
            <X size={24} />
          </button>
        </div>
        
        <nav className="mt-8">
          <div className="px-6 py-3">
            <p className="text-purple-200 text-sm font-medium">MENU CS</p>
          </div>
          
          <div className="flex items-center px-6 py-3 bg-purple-700 text-white border-r-4 border-purple-400">
            <FileText size={20} className="mr-3" />
            Dashboard Komplain
          </div>

          <button 
            onClick={handleLogout} 
            className="flex w-full items-center px-6 py-3 text-purple-100 hover:bg-purple-700 hover:text-white transition-colors mt-8"
          >
            <LogOut size={20} className="mr-3" />
            Keluar
          </button>
        </nav>
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black bg-opacity-25 lg:hidden" 
          onClick={() => setSidebarOpen(false)} 
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden text-gray-500 hover:text-gray-600 mr-3"
                >
                  <Menu size={24} />
                </button>
                <h1 className="text-lg font-medium text-gray-800 hidden sm:block">Dashboard Customer Service 💬</h1>
                <h1 className="text-base font-medium text-gray-800 sm:hidden">CS Dashboard</h1>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="font-semibold text-sm text-gray-800">{userName}</p>
                  <p className="text-xs text-gray-500 capitalize">{userRole}</p>
                </div>
                <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {userName.charAt(0).toUpperCase()}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Header Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FileText className="h-8 w-8 text-purple-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Total Komplain</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Belum Selesai</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Selesai</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.selesai}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Input Komplain */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-purple-100">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Plus className="mr-2 text-purple-600" size={20} />
                Input Komplain Baru
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="inline mr-1 text-purple-600" size={16} />
                    Nomor Konsumen *
                  </label>
                  <input
                    type="text"
                    value={formData.nomor_konsumen}
                    onChange={(e) => setFormData({...formData, nomor_konsumen: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Contoh: 081234567890"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="inline mr-1 text-purple-600" size={16} />
                    Nomor tujuan *
                  </label>
                  <input
                    type="text"
                    value={formData.nomor_tujuan}
                    onChange={(e) => setFormData({...formData, nomor_tujuan: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Contoh: 081234567890"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Package className="inline mr-1 text-purple-600" size={16} />
                    Produk *
                  </label>
                  <input
                    type="text"
                    value={formData.produk}
                    onChange={(e) => setFormData({...formData, produk: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Contoh: pulsa telkomsel, paket data, dll"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Users className="inline mr-1 text-purple-600" size={16} />
                    PIC *
                  </label>
                  <select
                    value={formData.pic_created}
                    onChange={(e) => setFormData({...formData, pic_created: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  >
                    <option value="">Pilih PIC</option>
                    {picOptions.map(pic => (
                      <option key={pic} value={pic}>{pic.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FileText className="inline mr-1 text-purple-600" size={16} />
                  Detail Komplain
                </label>
                <textarea
                  value={formData.keterangan}
                  onChange={(e) => setFormData({...formData, keterangan: e.target.value})}
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Jelaskan detail masalah yang dialami konsumen..."
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white px-6 py-2 rounded-md transition-colors flex items-center font-medium shadow-md"
                >
                  {submitLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2" size={16} />
                      Simpan Komplain
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Filter & Search */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Cari nomor konsumen, produk, atau PIC..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-md transition-colors font-medium ${
                    filter === 'all' 
                      ? 'bg-purple-600 text-white shadow-md' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Semua ({stats.total})
                </button>
                <button
                  onClick={() => setFilter('pending')}
                  className={`px-4 py-2 rounded-md transition-colors font-medium ${
                    filter === 'pending' 
                      ? 'bg-yellow-600 text-white shadow-md' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Pending ({stats.pending})
                </button>
                <button
                  onClick={() => setFilter('selesai')}
                  className={`px-4 py-2 rounded-md transition-colors font-medium ${
                    filter === 'selesai' 
                      ? 'bg-green-600 text-white shadow-md' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Selesai ({stats.selesai})
                </button>
              </div>
            </div>
          </div>

          {/* Riwayat Komplain */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-purple-100">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <FileText className="mr-2 text-purple-600" size={20} />
                Riwayat Komplain ({filteredKomplains.length})
              </h2>
            </div>
            
            <div className="p-6">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                  <span className="ml-3 text-gray-600">Memuat data...</span>
                </div>
              ) : filteredKomplains.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500 text-lg">
                    {searchTerm || filter !== 'all' ? 'Tidak ada komplain yang sesuai filter' : 'Belum ada komplain'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredKomplains.map((komplain) => (
                    <div
                      key={komplain.id}
                      className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all duration-200 hover:border-purple-200 bg-gradient-to-r from-white to-gray-50"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <span className="text-sm font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded">#{komplain.id}</span>
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                              komplain.status_komplain?.toLowerCase().includes('selesai')
                                ? 'bg-green-100 text-green-800 border border-green-200'
                                : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                            }`}
                          >
                            {komplain.status_komplain?.toLowerCase().includes('selesai') ? (
                              <CheckCircle className="mr-1" size={12} />
                            ) : (
                              <Clock className="mr-1" size={12} />
                            )}
                            {komplain.status_komplain}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2 mt-3 sm:mt-0">
                          <button
                            onClick={() => handleOpenUpdateModal(komplain)}
                            disabled={loading}
                            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors disabled:bg-gray-400 flex items-center"
                          >
                            <Edit3 className="mr-1" size={14} />
                            Update
                          </button>
                          <button
                            onClick={() => handleDelete(komplain.id)}
                            disabled={loading}
                            className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-medium transition-colors disabled:bg-gray-400 flex items-center"
                          >
                            <Trash2 className="mr-1" size={14} />
                            Hapus
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="flex items-center text-sm">
                            <Phone className="mr-3 text-purple-500" size={16} />
                            <span className="font-medium text-gray-700 w-24">Konsumen:</span>
                            <span className="text-gray-900 font-mono bg-purple-50 px-2 py-1 rounded border border-purple-200">{komplain.nomor_konsumen}</span>
                          </div>
                          
                          <div className="flex items-center text-sm">
                            <Phone className="mr-3 text-green-500" size={16} />
                            <span className="font-medium text-gray-700 w-24">Tujuan:</span>
                            <span className="text-gray-900 font-mono bg-green-50 px-2 py-1 rounded border border-green-200">{komplain.nomor_tujuan}</span>
                          </div>
                          
                          <div className="flex items-center text-sm">
                            <Package className="mr-3 text-blue-500" size={16} />
                            <span className="font-medium text-gray-700 w-24">Produk:</span>
                            <span className="text-gray-900 capitalize bg-blue-50 px-2 py-1 rounded border border-blue-200">{komplain.produk}</span>
                          </div>

                          {komplain.keterangan && (
                            <div className="text-sm">
                              <div className="flex items-start">
                                <FileText className="mr-3 text-purple-500 mt-0.5" size={16} />
                                <div className="flex-1">
                                  <span className="font-medium text-gray-700">Keterangan:</span>
                                  <p className="text-gray-600 mt-1 leading-relaxed bg-gray-50 p-3 rounded-md border-l-4 border-purple-200">{komplain.keterangan}</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="space-y-3">
                          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                            <div className="flex items-center mb-2">
                              <Calendar className="mr-2 text-purple-600" size={16} />
                              <span className="font-semibold text-purple-800">Dibuat:</span>
                            </div>
                            <p className="text-gray-700 font-medium">{formatDate(komplain.created_at)}</p>
                            <p className="text-sm text-purple-600 mt-2 flex items-center">
                              <Users className="mr-1" size={14} />
                              oleh: <span className="capitalize font-semibold ml-1 bg-purple-200 px-2 py-0.5 rounded">{komplain.pic_created}</span>
                            </p>
                          </div>

                          {komplain.pic_updated && komplain.updated_at && (
                            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                              <div className="flex items-center mb-2">
                                <CheckCircle className="mr-2 text-green-600" size={16} />
                                <span className="font-semibold text-green-800">Diupdate:</span>
                              </div>
                              <p className="text-gray-700 font-medium">{formatDate(komplain.updated_at)}</p>
                              <p className="text-sm text-green-600 mt-2 flex items-center">
                                <Users className="mr-1" size={14} />
                                oleh: <span className="capitalize font-semibold ml-1 bg-green-200 px-2 py-0.5 rounded">{komplain.pic_updated}</span>
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CSDashboard;