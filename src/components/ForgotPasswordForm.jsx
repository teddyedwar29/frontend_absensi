import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // Gunakan Link untuk navigasi
import Swal from 'sweetalert2';
import { Mail, Send, ArrowLeft } from 'lucide-react';
import { lupaPassword } from '../api/lupaPassword'; // Impor fungsi lupaPassword dari API

const ForgotPasswordForm = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await lupaPassword(email);
        setLoading(false);
        Swal.fire({
            icon: 'success',
            title: 'Terkirim!',
            text: `Link untuk reset password telah dikirim ke ${email}. Silakan periksa inbox Anda.`,
            confirmButtonColor: '#2563eb',
            });

    } catch (error) {
        setLoading(false);
        Swal.fire({
            icon: 'error',
            title: 'Gagal!',
            text: error.message || 'Terjadi kesalahan saat mengirim link reset password.',
            confirmButtonColor: '#eb2525ff',
        });
    }

  };

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Lupa Password</h1>
        <p className="text-gray-600">Masukkan email Anda untuk menerima link reset password.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-semibold text-gray-700">Email</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#193CB0] focus:border-[#193CB0] transition duration-200 bg-gray-50 hover:bg-white focus:bg-white"
              placeholder="contoh@email.com"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-[#193CB0] to-[#2563eb] text-white py-3 px-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              <span>Mengirim...</span>
            </>
          ) : (
            <>
              <Send size={18} className="mr-2" />
              <span>Kirim Link Reset</span>
            </>
          )}
        </button>
      </form>

      <div className="mt-8 text-center">
        <Link to="/" className="text-sm text-[#193CB0] hover:text-[#2563eb] font-medium transition duration-200 hover:underline flex items-center justify-center gap-2">
          <ArrowLeft size={16} />
          Kembali ke Login
        </Link>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;
