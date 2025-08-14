import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api/auth';
import Swal from 'sweetalert2';
import { User, KeyRound, LogIn, Briefcase } from 'lucide-react'; // Impor ikon
import { Link } from 'react-router-dom';

const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await login(username, password);
    setLoading(false);

    if (result.success) {
      // Tampilkan notifikasi sukses terlebih dahulu
        Swal.fire({
          icon: 'success',
          title: 'Login Berhasil!',
          text: 'Anda akan diarahkan ke dashboard.',
          timer: 2000, // Notifikasi akan hilang setelah 2 detik
          showConfirmButton: false, // Sembunyikan tombol OK
        }).then(() => {
          // Setelah notifikasi selesai, baru pindah halaman
          navigate('/dashboard');
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Login Gagal',
        text: result.message,
        confirmButtonColor: '#3B82F6', // Warna tombol biru
      });
    }
  };

  return (
    <div className="w-full max-w-sm">
      {/* Header Form */}
      <div className="flex flex-col items-center mb-10">
        <img
          src="/tekmo.svg"
          alt="Tekmo logo in blue and white, centered above login form"
          className="w-16 h-16 mb-4 block md:hidden"
        />
        <h2 className="text-3xl font-bold text-gray-800 text-center">Login Akun</h2>
        <p className="text-gray-500 mt-2 text-center">
          Masukkan kredensial Anda untuk melanjutkan.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* --- Input Username dengan Ikon --- */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Masukkan username Anda"
              required
            />
          </div>
        </div>

        {/* --- Input Password dengan Ikon --- */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <KeyRound className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="password"
              className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        {/* Lupa Password */}
        <div className="flex items-center justify-end">
            <Link to="/forgot-password" className="text-sm text-[#193CB0] hover:text-[#2563eb] font-medium ...">
              Lupa Password?
            </Link>
        </div>

        {/* --- Tombol Login --- */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
              <span>Logging in...</span>
            </>
          ) : (
            <>
              <LogIn className="mr-2" size={20} />
              <span>Login</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default LoginForm;