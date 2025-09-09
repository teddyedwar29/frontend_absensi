// src/pages/Admin/Outlets.jsx
import React, { useState, useEffect } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import API from "../../api/auth";
import { 
  Search, 
  XCircle, 
  ChevronLeft, 
  ChevronRight, 
  User, 
  CalendarDays,
  Building2,
  Hash 
} from "lucide-react";

const formatDate = (isoString) => {
  if (!isoString) return "Belum ada";
  try {
    return new Date(isoString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "Invalid Date";
  }
};

const AdminOutlets = () => {
  const [outlets, setOutlets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 12;

  // Setup API interceptor
  useEffect(() => {
    const interceptor = API.interceptors.request.use(
      (config) => {
        const token = sessionStorage.getItem("token");
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
      },
      (error) => Promise.reject(error)
    );

    return () => API.interceptors.request.eject(interceptor);
  }, []);

  const fetchOutlets = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await API.get("/outlets-all-details");
      
      // Remove duplicates berdasarkan id_outlet dan sort by tgl_bergabung
      const rawData = response.data || [];
      const uniqueData = rawData.filter((outlet, index, self) => 
        index === self.findIndex(o => o.id_outlet === outlet.id_outlet)
      );
      
      const sortedData = uniqueData.sort(
        (a, b) => new Date(b.tgl_bergabung) - new Date(a.tgl_bergabung)
      );
      
      console.log('Raw data length:', rawData.length);
      console.log('Unique data length:', uniqueData.length);
      console.log('Duplicates removed:', rawData.length - uniqueData.length);
      
      setOutlets(sortedData);
    } catch (err) {
      console.error("Gagal mengambil data outlet:", err);
      setError("Gagal memuat data outlet. Silakan coba lagi.");
      setOutlets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOutlets();
  }, []);

  // Filter outlets berdasarkan search dan date
  const filteredOutlets = outlets.filter((outlet) => {
    const term = searchTerm.toLowerCase().trim();
    
    // Search filter dengan logic yang lebih ketat
    const matchSearch = !term || (() => {
      const outletName = outlet.nama_outlet?.toLowerCase() || "";
      const mrName = outlet.nama_mr?.toLowerCase() || "";
      const outletId = outlet.id_outlet?.toLowerCase() || "";
      const mrId = outlet.id_mr?.toLowerCase() || "";
      
      // Debug: log untuk melihat apa yang dicari
      console.log('Searching for:', term);
      console.log('Checking outlet:', outletName, 'MR:', mrName);
      
      // Jika pencarian mengandung spasi atau angka, gunakan exact matching yang lebih ketat
      if (term.includes(' ') || /\d/.test(term)) {
        // Untuk pencarian dengan spasi atau angka, harus match persis urutan katanya
        const isExactMatch = outletName.includes(term) || 
                           mrName.includes(term) || 
                           outletId.includes(term) || 
                           mrId.includes(term);
        
        console.log('Exact match result:', isExactMatch);
        return isExactMatch;
      }
      
      // Untuk pencarian kata tunggal tanpa angka, baru bisa partial match
      const isSingleWordMatch = outletName.includes(term) || 
                               mrName.includes(term) || 
                               outletId.includes(term) || 
                               mrId.includes(term);
      
      console.log('Single word match result:', isSingleWordMatch);
      return isSingleWordMatch;
    })();

    // Date filter
    let matchDate = true;
    if (dateFilter && outlet.tgl_bergabung) {
      const outletDate = new Date(outlet.tgl_bergabung);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      switch (dateFilter) {
        case "today":
          matchDate = outletDate.toDateString() === today.toDateString();
          break;
        case "yesterday":
          const yesterday = new Date(today);
          yesterday.setDate(today.getDate() - 1);
          matchDate = outletDate.toDateString() === yesterday.toDateString();
          break;
        case "this_month":
          matchDate = 
            outletDate.getMonth() === today.getMonth() && 
            outletDate.getFullYear() === today.getFullYear();
          break;
        default:
          matchDate = true;
      }
    }

    return matchSearch && matchDate;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredOutlets.length / itemsPerPage);
  const paginatedOutlets = filteredOutlets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset ke halaman pertama
  };

  const handleDateFilterChange = (value) => {
    setDateFilter(value);
    setCurrentPage(1); // Reset ke halaman pertama
  };

  // Filter options
  const dateFilterOptions = [
    { label: "Semua", value: "" },
    { label: "Hari Ini", value: "today" },
    { label: "Kemarin", value: "yesterday" },
    { label: "Bulan Ini", value: "this_month" },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat data outlet...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <XCircle size={64} className="text-red-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Terjadi Kesalahan</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={fetchOutlets}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Daftar Outlet</h1>
          <p className="text-gray-600">
            Kelola dan pantau semua outlet yang terdaftar
          </p>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Cari nama outlet, ID outlet, atau nama MR..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                />
              </div>
            </div>

            {/* Date Filter Buttons */}
            <div className="flex gap-2 flex-wrap">
              {dateFilterOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleDateFilterChange(option.value)}
                  className={`px-4 py-3 rounded-lg font-medium transition-all ${
                    dateFilter === option.value
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Results Info dengan debug info */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-600">
              Menampilkan <span className="font-semibold">{paginatedOutlets.length}</span> dari <span className="font-semibold">{filteredOutlets.length}</span> outlet
              (Halaman {currentPage} dari {totalPages})
              {searchTerm && (
                <span> untuk pencarian "<span className="font-semibold">{searchTerm}</span>"</span>
              )}
              {dateFilter && (
                <span> dengan filter tanggal <span className="font-semibold">
                  {dateFilterOptions.find(opt => opt.value === dateFilter)?.label}
                </span></span>
              )}
            </p>
          </div>
        </div>

        {/* Content */}
        {paginatedOutlets.length > 0 ? (
          <>
            {/* Outlets Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 mb-8">
              {paginatedOutlets.map((outlet) => (
                <div 
                  key={outlet.id_outlet} 
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  {/* Header */}
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0">
                      {outlet.nama_outlet ? outlet.nama_outlet.charAt(0).toUpperCase() : "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-lg mb-1 truncate">
                        {outlet.nama_outlet || "Nama tidak tersedia"}
                      </h3>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Hash size={14} />
                        <span>{outlet.id_outlet}</span>
                      </div>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <User size={16} className="text-gray-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-900 truncate">
                          {outlet.nama_mr || "Belum ada MR"}
                        </p>
                        {outlet.id_mr && (
                          <p className="text-gray-500 text-xs">ID: {outlet.id_mr}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <CalendarDays size={16} className="text-gray-400 flex-shrink-0" />
                      <div>
                        <p className="text-gray-700">Bergabung</p>
                        <p className="text-gray-500 text-xs">
                          {outlet.tgl_bergabung}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={16} />
                  <span className="hidden sm:inline">Sebelumnya</span>
                </button>

                {/* Page Numbers */}
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage > totalPages - 3) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                          currentPage === pageNum
                            ? "bg-blue-600 text-white"
                            : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1 px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <span className="hidden sm:inline">Selanjutnya</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        ) : (
          /* Empty State */
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Building2 size={32} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm || dateFilter ? "Tidak ada outlet ditemukan" : "Belum ada outlet"}
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              {searchTerm || dateFilter
                ? "Coba ubah kata kunci pencarian atau filter tanggal untuk melihat hasil lainnya."
                : "Belum ada outlet yang terdaftar dalam sistem."
              }
            </p>
            {(searchTerm || dateFilter) && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setDateFilter("");
                  setCurrentPage(1);
                }}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Reset Filter
              </button>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminOutlets;