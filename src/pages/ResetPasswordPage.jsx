import React from 'react';
import ResetPasswordForm from '../components/ResetPasswordForm'; // Komponen form yang akan kita buat

const ResetPasswordPage = () => {
  return (
    // Menggunakan layout yang sama persis dengan LoginPage untuk konsistensi
    <div className="min-h-screen bg-gradient-to-br from-[#193CB0] via-[#2563eb] to-[#7c3aed] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background pattern SVG */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width=%2260%22%20height=%2260%22%20viewBox=%220%200%2060%2060%22%20xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg%20fill=%22none%22%20fill-rule=%22evenodd%22%3E%3Cg%20fill=%22%23ffffff%22%20fill-opacity=%220.05%22%3E%3Ccircle%20cx=%2230%22%20cy=%2230%22%20r=%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
      
      {/* Efek blur dekoratif */}
      <div className="absolute -top-4 -left-4 w-32 h-32 md:w-48 md:h-48 bg-white/10 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute -bottom-4 -right-4 w-32 h-32 md:w-48 md:h-48 bg-white/10 rounded-full blur-xl animate-pulse delay-500"></div>

      {/* Konten utama yang berisi ResetPasswordForm */}
      <div className="relative w-full max-w-md">
        <ResetPasswordForm />
      </div>
    </div>
  );
};

export default ResetPasswordPage;
