import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import API from '../api/auth';
import Swal from 'sweetalert2';
import { User, Mail, Phone, KeyRound } from 'lucide-react';

const ProfilePage = () => {
    // State untuk data profil yang akan ditampilkan dan diubah
    const [profile, setProfile] = useState({ name: '', username: '', email: '', phone_number: '' });
    
    // State KHUSUS untuk form ganti password
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    // State untuk loading dan error
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // useEffect untuk mengambil data profil saat halaman pertama kali dibuka
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                const response = await API.get('/profile');
                // Pastikan data yang diterima tidak null sebelum dimasukkan ke state
                setProfile({
                    name: response.data.name || '',
                    username: response.data.username || '',
                    email: response.data.email || '',
                    phone_number: response.data.phone_number || ''
                });
            } catch (err) {
                setError("Gagal memuat profil.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []); // Array kosong berarti hanya dijalankan sekali

    // Handler untuk mengubah state profil saat input diubah
    const handleProfileChange = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    // Handler untuk submit form update profil
    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            // Panggil endpoint /profile dengan method PUT
            const response = await API.put('/profile', {
                email: profile.email,
                phone_number: profile.phone_number
            });
            Swal.fire('Berhasil!', response.data.msg, 'success');
        } catch (err) {
            Swal.fire('Gagal!', err.response?.data?.msg || 'Gagal memperbarui profil.', 'error');
        }
    };

    // Handler untuk submit form ganti password
    const handleChangePassword = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            Swal.fire('Gagal!', 'Password baru dan konfirmasi tidak cocok.', 'error');
            return;
        }

        try {
            const response = await API.put('/profile/change-password', {
                old_password: oldPassword,
                new_password: newPassword
            });
            Swal.fire('Berhasil!', response.data.msg, 'success');
            // Kosongkan field password setelah berhasil
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            Swal.fire('Gagal!', err.response?.data?.msg || 'Gagal mengubah password.', 'error');
        }
    };

    if (loading) {
        return <DashboardLayout><p>Memuat profil...</p></DashboardLayout>;
    }
    
    if (error) {
        return <DashboardLayout><p className="text-red-500">{error}</p></DashboardLayout>;
    }

    return (
        <DashboardLayout>
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Profil Saya</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Form Update Profil */}
                <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h3 className="text-lg font-semibold mb-4 text-gray-700">Informasi Akun</h3>
                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-gray-600">Nama</label>
                            <div className="relative mt-1">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input type="text" value={profile.name} className="w-full pl-10 pr-3 py-2 bg-gray-100 border border-gray-200 rounded-lg cursor-not-allowed" readOnly />
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-600">Username</label>
                            <div className="relative mt-1">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input type="text" value={profile.username} className="w-full pl-10 pr-3 py-2 bg-gray-100 border border-gray-200 rounded-lg cursor-not-allowed" readOnly />
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-600">Email</label>
                            <div className="relative mt-1">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input type="email" name="email" value={profile.email} onChange={handleProfileChange} className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-600">Nomor Telepon</label>
                            <div className="relative mt-1">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input type="text" name="phone_number" value={profile.phone_number} onChange={handleProfileChange} className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                        </div>
                        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-semibold transition-colors">Simpan Perubahan</button>
                    </form>
                </div>

                {/* Form Ganti Password */}
                <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h3 className="text-lg font-semibold mb-4 text-gray-700">Ubah Password</h3>
                    <form onSubmit={handleChangePassword} className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-gray-600">Password Lama</label>
                            <div className="relative mt-1">
                                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" required />
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-600">Password Baru</label>
                            <div className="relative mt-1">
                                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" required />
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-600">Konfirmasi Password Baru</label>
                            <div className="relative mt-1">
                                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" required />
                            </div>
                        </div>
                        <button type="submit" className="w-full bg-gray-700 text-white py-2 rounded-lg hover:bg-gray-800 font-semibold transition-colors">Ubah Password</button>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ProfilePage;