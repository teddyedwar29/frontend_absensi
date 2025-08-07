// src/components/Modal.jsx

import React from 'react';
import { XCircle } from 'lucide-react';

/**
 * Komponen Modal yang reusable.
 * Menerima `open` (boolean) untuk mengontrol visibilitas,
 * `onClose` (fungsi) untuk menutup modal, dan `children` (konten modal).
 */
const Modal = ({ open, onClose, children }) => {
  if (!open) return null;

  return (
    <div
      onClick={onClose} // Menutup modal saat klik di luar konten
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()} // Mencegah event klik menyebar ke overlay
        className="bg-white rounded-xl shadow-lg max-w-4xl w-full relative p-4 sm:p-6 max-h-[90vh] overflow-y-auto" // Tambah max-h dan overflow-y
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 z-10"
          aria-label="Tutup"
        >
          <XCircle size={28} />
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;
