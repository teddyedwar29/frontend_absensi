// src/pages/Sales/Dashboard.jsx

import React, { useState, useEffect, useRef } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { Clock, MapPin, Calendar, CheckCircle, XCircle, AlertTriangle, TrendingUp, LogIn, LogOut, Camera, Image } from 'lucide-react';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

const SalesDashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState(null);
  const [checkOutTime, setCheckOutTime] = useState(null);

  // State untuk lokasi dan foto
  const [userLocation, setUserLocation] = useState('Lokasi tidak diketahui');
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [capturedPhoto, setCapturedPhoto] = useState(null); // Menyimpan Base64/URL foto yang diambil

  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fungsi untuk mendapatkan lokasi pengguna
  const getUserLocation = async () => {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            setLatitude(lat);
            setLongitude(lon);
            const locationString = `Lat: ${lat.toFixed(6)}, Long: ${lon.toFixed(6)}`;
            setUserLocation(locationString);
            resolve({ latitude: lat, longitude: lon, locationString: locationString });
          },
          (error) => {
            console.error("Error getting location:", error);
            const errorLocationString = 'Gagal mendapatkan lokasi.';
            setUserLocation(errorLocationString);
            Swal.fire({
                icon: 'error',
                title: 'Gagal Mendapatkan Lokasi',
                text: 'Pastikan Anda mengizinkan akses lokasi untuk aplikasi ini.',
            });
            reject(error);
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      } else {
        const notSupportedString = 'Geolocation tidak didukung oleh browser Anda.';
        setUserLocation(notSupportedString);
        Swal.fire({
            icon: 'error',
            title: 'Browser Tidak Mendukung Geolocation',
            text: 'Silakan gunakan browser yang mendukung fitur lokasi.',
        });
        reject(new Error("Geolocation not supported"));
      }
    });
  };

  // Fungsi untuk mengambil foto dari kamera (dipanggil dari dalam SweetAlert)
  const capturePhotoFromCamera = async () => {
    let stream = null; // Inisialisasi stream di luar try-catch
    let capturedData = null; // Variabel lokal untuk menyimpan data foto

    try {
      const { value: photoConfirmed } = await Swal.fire({
        title: 'Ambil Foto',
        html: `
          <div class="flex flex-col items-center">
            <video id="camera-feed" class="w-full max-w-xs rounded-lg mb-2"></video>
            <canvas id="photo-canvas" class="hidden"></canvas>
            <img id="photo-preview" class="w-full max-w-xs rounded-lg hidden mb-2" src=""/>
            <div class="flex space-x-2 mt-2">
              <button id="take-photo-button" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-camera inline-block mr-1"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3.5Z"/><circle cx="12" cy="13" r="3"/></svg>
                Ambil
              </button>
              <button id="retake-photo-button" class="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors hidden">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-rotate-ccw inline-block mr-1"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                Ulangi
              </button>
            </div>
          </div>
        `,
        showConfirmButton: true,
        confirmButtonText: 'Gunakan Foto Ini',
        confirmButtonColor: '#10B981',
        allowOutsideClick: false,
        didOpen: (popup) => {
          const videoElement = popup.querySelector('#camera-feed');
          const canvasElement = popup.querySelector('#photo-canvas');
          const takePhotoBtn = popup.querySelector('#take-photo-button');
          const retakePhotoBtn = popup.querySelector('#retake-photo-button');
          const photoPreview = popup.querySelector('#photo-preview');
          const context = canvasElement.getContext('2d');

          navigator.mediaDevices.getUserMedia({ video: true })
            .then(camStream => {
              stream = camStream; // Assign to outer stream variable
              if (videoElement) {
                videoElement.srcObject = stream;
                videoElement.play();
              }
            })
            .catch(err => {
              console.error("Error accessing camera: ", err);
              Swal.showValidationMessage(`Gagal mengakses kamera: ${err.message}. Pastikan izin kamera diberikan.`);
              Swal.disableButtons(); // Disable "Gunakan Foto Ini" button
            });

          takePhotoBtn.onclick = () => {
            if (videoElement && canvasElement) {
                canvasElement.width = videoElement.videoWidth;
                canvasElement.height = videoElement.videoHeight;
                context.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
                const imageData = canvasElement.toDataURL('image/png');
                capturedData = imageData; // Update lokal variabel
                setCapturedPhoto(imageData); // Update React state
                photoPreview.src = imageData;
                photoPreview.classList.remove('hidden');
                videoElement.classList.add('hidden');
                takePhotoBtn.classList.add('hidden');
                retakePhotoBtn.classList.remove('hidden');
                Swal.enableButtons(); // Enable "Gunakan Foto Ini" button
            }
          };

          retakePhotoBtn.onclick = () => {
            photoPreview.classList.add('hidden');
            videoElement.classList.remove('hidden');
            takePhotoBtn.classList.remove('hidden');
            retakePhotoBtn.classList.add('hidden');
            capturedData = null; // Reset lokal variabel
            setCapturedPhoto(null); // Reset captured photo state
            Swal.disableButtons(); // Disable "Gunakan Foto Ini" button
          };
          Swal.disableButtons(); // Initially disable "Gunakan Foto Ini" until photo is taken
        },
        willClose: () => {
          if (stream) {
            stream.getTracks().forEach(track => track.stop()); // Stop camera stream when modal closes
          }
        },
        preConfirm: () => {
          if (!capturedData) { // Cek variabel lokal
            Swal.showValidationMessage('Silakan ambil foto terlebih dahulu.');
            return false;
          }
          return capturedData; // Kembalikan data foto
        }
      });
      return capturedData; // Mengembalikan data foto yang dikonfirmasi
    } catch (err) {
      console.error("Error accessing camera or taking photo: ", err);
      Swal.fire({
        icon: 'error',
        title: 'Gagal Mengakses Kamera',
        text: `Pastikan izin kamera diberikan: ${err.message}`,
      });
      setCapturedPhoto(null);
      return null; // Mengembalikan null jika gagal
    } finally {
        if (stream) {
            stream.getTracks().forEach(track => track.stop()); // Pastikan stream dihentikan
        }
    }
  };

  // Fungsi untuk memilih foto dari galeri (dipanggil dari dalam SweetAlert)
  const selectPhotoFromGallery = async () => {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (event) => {
        const file = event.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const imageData = e.target.result;
            setCapturedPhoto(imageData); // Update React state
            resolve(imageData); // Resolve dengan data foto
          };
          reader.onerror = (e) => {
            console.error("Error reading file: ", e);
            Swal.showValidationMessage('Gagal membaca file gambar.');
            reject(e);
          };
          reader.readAsDataURL(file);
        } else {
          reject(new Error('Tidak ada file yang dipilih.'));
        }
      };
      input.click(); // Trigger the file input click
    });
  };

  // --- PERUBAHAN BARU: Fungsi untuk menampilkan SweetAlert pilihan foto ---
  const showPhotoSelectionSwal = async () => {
      return new Promise(async (resolve) => {
          const { isDismissed } = await Swal.fire({
              title: 'Pilih Sumber Foto',
              html: `
                <div class="flex flex-col items-center justify-center space-y-4">
                  <button id="camera-option" class="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-camera mr-2"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3.5Z"/><circle cx="12" cy="13" r="3"/></svg>
                    Ambil Foto Langsung
                  </button>
                  <button id="gallery-option" class="w-full flex items-center justify-center px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-image mr-2"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                    Pilih dari Galeri
                  </button>
                </div>
              `,
              showCancelButton: true,
              showConfirmButton: false, // Tidak ada tombol OK/Confirm di sini
              cancelButtonText: 'Batal Absensi',
              allowOutsideClick: false,
              didOpen: (popup) => {
                document.getElementById('camera-option').addEventListener('click', async () => {
                  const photo = await capturePhotoFromCamera(); // Panggil fungsi kamera
                  Swal.close(); // Tutup SweetAlert pilihan foto
                  resolve(photo); // Resolve outer promise with photo data
                });

                document.getElementById('gallery-option').addEventListener('click', async () => {
                  try {
                    const photo = await selectPhotoFromGallery(); // Panggil fungsi galeri
                    Swal.close(); // Tutup SweetAlert pilihan foto
                    resolve(photo); // Resolve outer promise with photo data
                  } catch (err) {
                    console.error("Error selecting photo:", err);
                    Swal.fire({
                      icon: 'error',
                      title: 'Gagal Memilih Foto',
                      text: err.message || 'Terjadi kesalahan saat memilih foto dari galeri.',
                    });
                    resolve(null); // Resolve with null on error
                  }
                });
              }
          });
          if (isDismissed) {
              resolve(null); // Resolve with null if user dismissed photo selection
          }
      });
  };
  // --- AKHIR PERUBAHAN BARU ---


  const handleCheckIn = async () => {
    // Reset location and photo state for a fresh attempt
    setUserLocation('Mengambil lokasi...');
    setLatitude(null);
    setLongitude(null);
    setCapturedPhoto(null); // Reset captured photo

    // Tampilkan loading SweetAlert segera
    Swal.fire({
      title: 'Memproses Absensi...',
      html: 'Sedang mengambil lokasi dan menyiapkan data. Mohon tunggu...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    let confirmedLocationString = 'Lokasi tidak tersedia.';
    let finalPhotoData = null; // Untuk menyimpan data foto akhir

    try {
        const locationCoords = await getUserLocation();
        confirmedLocationString = locationCoords.locationString;

        await new Promise(resolve => setTimeout(resolve, 1500));

        Swal.close(); // Tutup SweetAlert loading awal

        // --- PERUBAHAN BARU: Panggil showPhotoSelectionSwal dan tunggu hasilnya ---
        finalPhotoData = await showPhotoSelectionSwal();
        // --- AKHIR PERUBAHAN BARU ---

        if (!finalPhotoData) { // Jika user membatalkan atau tidak ada foto yang dipilih
            Swal.fire({
                icon: 'error',
                title: 'Absensi Dibatalkan',
                text: 'Foto belum diambil atau dipilih, absensi dibatalkan.',
                showConfirmButton: false,
                timer: 2000
            });
            return; // Hentikan proses
        }

        // Sekarang tampilkan SweetAlert konfirmasi akhir dengan foto yang sudah didapat
        const { isConfirmed: finalConfirmed } = await Swal.fire({
            title: 'Konfirmasi Absensi',
            html: `
              <div class="text-center p-4">
                <p class="text-lg font-semibold mb-2">Lokasi Anda:</p>
                <p class="text-md text-gray-700 mb-4">${confirmedLocationString}</p>
                <p class="text-lg font-semibold mb-2">Foto Anda:</p>
                <img src="${finalPhotoData}" alt="Foto Absen" class="mx-auto rounded-lg shadow-md w-36 h-36 object-cover mb-4"/>
                <p class="text-sm text-gray-600">Pastikan lokasi dan foto sudah benar.</p>
              </div>
            `,
            icon: 'info',
            showCancelButton: true,
            confirmButtonColor: '#10B981',
            cancelButtonColor: '#EF4444',
            confirmButtonText: 'OK, Absen!',
            cancelButtonText: 'Batal',
            customClass: {
              popup: 'rounded-xl shadow-lg',
              confirmButton: 'px-6 py-2 rounded-lg text-white font-semibold',
              cancelButton: 'px-6 py-2 rounded-lg text-white font-semibold',
            },
            preConfirm: () => {
                // Foto sudah divalidasi di langkah sebelumnya, jadi di sini selalu true
                return true;
            }
        });

        if (finalConfirmed) {
          const now = new Date();
          setIsCheckedIn(true);
          setCheckInTime(now);
          Swal.fire({
            icon: 'success',
            title: 'Check-in Berhasil',
            text: `Selamat bekerja! Anda absen pada ${now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`,
            showConfirmButton: false,
            timer: 1500
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Absensi Dibatalkan',
            text: 'Anda membatalkan proses absensi.',
            showConfirmButton: false,
            timer: 1500
          });
        }
    } catch (error) {
        Swal.close();
        Swal.fire({
            icon: 'error',
            title: 'Absensi Dibatalkan',
            text: 'Gagal mendapatkan lokasi atau memproses foto, absensi dibatalkan.',
            showConfirmButton: false,
            timer: 2000
        });
    }
  };

  const handleCheckOut = () => {
    const now = new Date();
    setCheckOutTime(now);
    Swal.fire({
      icon: 'info',
      title: 'Check-out Berhasil',
      text: `Terima kasih! Anda selesai bekerja pada ${now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`,
      showConfirmButton: false,
      timer: 1500
    });
  };

  const calculateWorkDuration = () => {
    if (checkInTime && checkOutTime) {
      const diffMs = checkOutTime.getTime() - checkInTime.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);
      return diffHours.toFixed(1);
    } else if (checkInTime) {
      const diffMs = new Date().getTime() - checkInTime.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);
      return diffHours.toFixed(1);
    }
    return '0';
  };

  const handleTambahkanKunjungan = () => {
    navigate('/sales/kunjungan');
  };

  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Status Hari Ini</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {isCheckedIn ? 'Hadir' : 'Belum Absen'}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              {isCheckedIn ?
                <CheckCircle className="w-6 h-6 text-green-600" /> :
                <Clock className="w-6 h-6 text-gray-400" />
              }
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Jam Kerja Hari Ini</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                {calculateWorkDuration()} Jam
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Kehadiran Bulan Ini</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">22/24</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <Calendar className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tingkat Kehadiran</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">92%</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            {/* Hanya tampilkan tombol Absen Sekarang atau Sudah Absen */}
            <button
              onClick={handleCheckIn}
              className={`w-full flex items-center justify-center px-4 py-3 rounded-lg transition-colors
                          ${
                            isCheckedIn && checkInTime
                              ? 'bg-gray-400 cursor-not-allowed'
                              : 'bg-green-600 hover:bg-green-700'
                          }
                          text-white`}
              disabled={isCheckedIn && checkInTime}
            >
              {isCheckedIn && checkInTime ? (
                <>
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Sudah Absen
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5 mr-2" />
                  Absen Sekarang
                </>
              )}
            </button>
            <button
              onClick={handleTambahkanKunjungan}
              className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Calendar className="w-5 h-5 mr-2" />
              Tambahkan Kunjungan
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Absensi Hari Ini</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <span className="text-sm font-medium text-gray-700">Check In</span>
              </div>
              <div className="text-right flex items-center">
                <p className="text-sm font-semibold text-gray-900 mr-2">
                  {checkInTime ? checkInTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                </p>
                <button
                  onClick={getUserLocation}
                  className="p-1 bg-blue-200 text-blue-800 rounded-full hover:bg-blue-300 transition-colors"
                  title="Dapatkan Lokasi Saat Ini"
                >
                  <MapPin className="w-4 h-4" />
                </button>
                <p className="text-xs text-gray-500 ml-2">
                  {latitude !== null && longitude !== null ? `Lat: ${latitude.toFixed(6)}, Long: ${longitude.toFixed(6)}` : userLocation}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gray-400 rounded-full mr-3"></div>
                <span className="text-sm font-medium text-gray-700">Check Out</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">--:--</p>
                <p className="text-xs text-gray-500">Belum check out</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Riwayat Absensi 7 Hari Terakhir</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Tanggal</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Check In</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Check Out</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Jam Kerja</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="py-3 px-4 text-gray-900">Hari Ini</td>
                  <td className="py-3 px-4 text-gray-900">{checkInTime ? checkInTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '--:--'}</td>
                  <td className="py-3 px-4 text-gray-900">{checkOutTime ? checkOutTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '--:--'}</td>
                  <td className="py-3 px-4 text-gray-900">{calculateWorkDuration()} Jam</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      isCheckedIn ? (checkOutTime ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800') : 'bg-gray-100 text-gray-800'
                    }`}>
                      {isCheckedIn ? (checkOutTime ? 'Selesai' : 'Hadir (On-going)') : 'Belum Absen'}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-gray-900">2 Agu 2025</td>
                  <td className="py-3 px-4 text-gray-900">08:12</td>
                  <td className="py-3 px-4 text-gray-900">17:30</td>
                  <td className="py-3 px-4 text-gray-900">9.3 Jam</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                      Tepat Waktu
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-gray-900">1 Agu 2025</td>
                  <td className="py-3 px-4 text-gray-900">08:45</td>
                  <td className="py-3 px-4 text-gray-900">17:15</td>
                  <td className="py-3 px-4 text-gray-900">8.5 Jam</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                      Terlambat
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      </DashboardLayout>
    );
  };

  export default SalesDashboard;
