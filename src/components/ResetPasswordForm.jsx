import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { resetPassword } from '../api/lupaPassword';
import { KeyRound, CheckCircle, Eye, EyeOff } from 'lucide-react';

const ResetPasswordForm = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const params = new URLSearchParams(location.search);
  const token = params.get('token');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Efek untuk mengecek token saat komponen pertama kali dimuat
  useEffect(() => {
    if (!token) {
      Swal.fire({
        icon: 'error',
        title: 'Token Tidak Valid',
        text: 'Token untuk reset password tidak ditemukan di URL. Silakan coba lagi dari link email Anda.',
        confirmButtonColor: '#eb2525ff',
      }).then(() => {
        navigate('/'); // Arahkan kembali ke login jika token tidak ada
      });
    }
  }, [token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validasi dasar
    if (password !== confirmPassword) {
      Swal.fire('Gagal!', 'Password dan konfirmasi password tidak cocok.', 'error');
      return;
    }
    if (password.length < 6) {
      Swal.fire('Gagal!', 'Password harus minimal 6 karakter.', 'error');
      return;
    }

    setLoading(true);
    try {
      // Panggil API dengan token dan password baru
      await resetPassword(token, password);
      
      setLoading(false);
      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Password Anda telah berhasil diubah. Silakan login kembali.',
        confirmButtonColor: '#2563eb',
      }).then(() => {
        navigate('/'); // Arahkan ke halaman login setelah sukses
      });

    } catch (error) {
      setLoading(false);
      Swal.fire({
        icon: 'error',
        title: 'Gagal!',
        // Menampilkan pesan error dari backend jika ada, jika tidak, tampilkan pesan umum
        text: error.response?.data?.message || 'Terjadi kesalahan saat mengubah password.',
        confirmButtonColor: '#eb2525ff',
      });
    }
  };

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Reset Password</h1>
        <p className="text-gray-600">Masukkan password baru Anda.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Input Password Baru */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">Password Baru</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <KeyRound className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#193CB0]"
              placeholder="••••••••"
            />
            <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
            </button>
          </div>
        </div>

        {/* Input Konfirmasi Password Baru */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">Konfirmasi Password Baru</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <KeyRound className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type={showConfirmPassword ? "text" : "password"}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#193CB0]"
              placeholder="••••••••"
            />
             <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
              {showConfirmPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !token} // Tombol disable jika loading atau tidak ada token
          className="w-full bg-gradient-to-r from-[#193CB0] to-[#2563eb] text-white py-3 px-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition duration-200 disabled:opacity-70 flex items-center justify-center"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              <span>Menyimpan...</span>
            </>
          ) : (
            <>
              <CheckCircle size={18} className="mr-2" />
              <span>Simpan Password Baru</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default ResetPasswordForm;
