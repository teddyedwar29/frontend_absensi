// src/components/LoadingSpinner.jsx
import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ 
  size = 'default', 
  text = 'Memuat...', 
  fullScreen = true,
  showLogo = true 
}) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    default: 'w-8 h-8',
    large: 'w-12 h-12',
    xlarge: 'w-16 h-16'
  };

  const textSizeClasses = {
    small: 'text-sm',
    default: 'text-base',
    large: 'text-lg',
    xlarge: 'text-xl'
  };

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-50">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 opacity-60"></div>
        
        {/* Loading Content */}
        <div className="relative flex flex-col items-center space-y-6">
          {showLogo && (
            <div className="flex flex-col items-center space-y-4">
              {/* Logo atau Brand */}
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
               {/* <img src="../tekmo.svg" alt="Tekmo Logo" className="w-24 h-24 mb-6" />  */}
                <span className="text-2xl font-bold text-white">T</span>
              </div>
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-800">Tekmo</h3>
                <p className="text-sm text-gray-500">Jurney Activity Marketing</p>
              </div>
            </div>
          )}
          
          {/* Loading Animation */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              {/* Outer spinning ring */}
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
              {/* Inner pulsing dot */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
              </div>
            </div>
            
            <div className="text-center space-y-2">
              <p className={`font-medium text-gray-700 ${textSizeClasses[size]}`}>
                {text}
              </p>
              <div className="flex items-center justify-center space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom hint */}
        <div className="absolute bottom-8 text-center">
          <p className="text-xs text-gray-400">
            Menyiapkan halaman untuk Anda...
          </p>
        </div>
      </div>
    );
  }

  // Inline/smaller loading spinner
  return (
    <div className="flex items-center justify-center space-x-3 p-4">
      <Loader2 className={`${sizeClasses[size]} animate-spin text-blue-500`} />
      <span className={`${textSizeClasses[size]} text-gray-600 font-medium`}>
        {text}
      </span>
    </div>
  );
};

// Loading skeleton untuk komponen spesifik
export const CardSkeleton = () => (
  <div className="animate-pulse">
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center space-x-4 mb-4">
        <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-gray-200 rounded w-full"></div>
        <div className="h-3 bg-gray-200 rounded w-4/5"></div>
        <div className="h-3 bg-gray-200 rounded w-3/5"></div>
      </div>
    </div>
  </div>
);

// Loading untuk dashboard cards
export const DashboardCardSkeleton = () => (
  <div className="animate-pulse">
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
      </div>
    </div>
  </div>
);

// Loading untuk table
export const TableSkeleton = ({ rows = 5, cols = 4 }) => (
  <div className="animate-pulse">
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
      </div>
      <div className="divide-y divide-gray-200">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="px-6 py-4 flex items-center space-x-4">
            {Array.from({ length: cols }).map((_, colIndex) => (
              <div key={colIndex} className="flex-1">
                <div className="h-3 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default LoadingSpinner;