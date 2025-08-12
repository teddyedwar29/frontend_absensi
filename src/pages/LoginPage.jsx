import React from 'react';
import LoginForm from '../components/loginForm.jsx';
import { Briefcase } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 w-full max-w-5xl bg-white shadow-2xl rounded-2xl overflow-hidden">
        
        {/* Kolom Kiri: Branding & Ilustrasi (Hanya tampil di layar besar) */}
        <div className="hidden lg:flex flex-col items-center justify-center bg-gradient-to-br from-blue-600 to-blue-800 p-12 text-white text-center">
          <Briefcase size={80} className="mb-6" />
          <h1 className="text-4xl font-bold mb-3">Selamat Datang di Techmo</h1>
          <p className="text-blue-200">Platform Absensi dan Manajemen Sales Terbaik untuk Tim Anda.</p>
        </div>

        {/* Kolom Kanan: Form Login */}
        <div className="flex flex-col items-center justify-center p-8 sm:p-12">
          <LoginForm />
        </div>

      </div>
    </div>
  );
}