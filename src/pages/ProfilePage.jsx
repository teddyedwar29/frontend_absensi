// src/pages/ProfilePage.jsx

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import API from '../api/auth';
import Swal from 'sweetalert2';
import { User, Mail, Phone, KeyRound } from 'lucide-react';

const ProfilePage = () => {
    const [profile, setProfile] = useState({ name: '', email: '', phone_number: '' });
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    
    // --- TAMBAHKAN BARIS INI ---
    const [loading, setLoading] = useState(true); // Initialize with 'true' to show loading initially
    const [error, setError] = useState(null); // It's good practice to have an error state too
    const [confirmPassword, setConfirmPassword] = useState(''); 
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                // setLoading(true); // Already true on first load
                const response = await API.get('/profile');
                setProfile(response.data);
            } catch (err) {
                setError("Gagal memuat profil.");
            } finally {
                setLoading(false); // Set to false after fetching is done
            }
        };

        fetchProfile();
    }, []); // Empty dependency array means this runs once on mount

    // Now this 'if' statement will work
    if (loading) {
        return <DashboardLayout><p>Loading profile...</p></DashboardLayout>;
    }
    
    if (error) {
        return <DashboardLayout><p>{error}</p></DashboardLayout>;
    }

    const handleProfileChange = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    const handlePasswordChange = (e) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            const response = await API.put('/profile/update', {
                email: profile.email,
                phone_number: profile.phone_number
            });
            Swal.fire('Berhasil!', response.data.msg, 'success');
        } catch (err) {
            Swal.fire('Gagal!', err.response?.data?.msg || 'Gagal memperbarui profil.', 'error');
        }
    };

    const handleChangePassword = async (event) => {
        event.preventDefault();

        // Assuming you have state for oldPassword and newPassword
        const [oldPassword, setOldPassword] = useState('');
        const [newPassword, setNewPassword] = useState('');

        try {
            const token = localStorage.getItem('token'); // Or however you store your token
            
            const response = await fetch('http://127.0.0.1:5000/profile/change-password', {
            method: 'PUT',
            headers: {
                // This header is crucial for PUT/POST requests with a body
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            // Ensure you are sending a JSON object with the correct keys
            body: JSON.stringify({
                old_password: oldPassword,
                new_password: newPassword
            })
            });

            const data = await response.json();

            if (!response.ok) {
            // Handle backend errors (e.g., "Password lama salah")
            alert(data.msg);
            } else {
            // Handle success
            alert(data.msg);
            }

        } catch (error) {
            console.error("Error changing password:", error);
            alert("An error occurred. Please try again.");
        }
        };

    if (loading) return <DashboardLayout><p>Memuat profil...</p></DashboardLayout>;
    if (error) return <DashboardLayout><p className="text-red-500">{error}</p></DashboardLayout>;

    return (
        <DashboardLayout>
            <h2 className="text-2xl font-bold mb-6">Profil Saya</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Form Update Profil */}
                <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h3 className="text-lg font-semibold mb-4">Informasi Akun</h3>
                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                        <div>
                            <label className="text-sm font-medium">Nama</label>
                            <div className="relative mt-1">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input type="text" value={profile.name} className="w-full pl-10 pr-3 py-2 bg-gray-100 rounded-lg" readOnly />
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium">Username</label>
                            <div className="relative mt-1">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input type="text" value={profile.username} className="w-full pl-10 pr-3 py-2 bg-gray-100 rounded-lg" readOnly />
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium">Email</label>
                            <div className="relative mt-1">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input type="email" name="email" value={profile.email} onChange={handleProfileChange} className="w-full pl-10 pr-3 py-2 border rounded-lg" />
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium">Nomor Telepon</label>
                            <div className="relative mt-1">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input type="text" name="phone_number" value={profile.phone_number} onChange={handleProfileChange} className="w-full pl-10 pr-3 py-2 border rounded-lg" />
                            </div>
                        </div>
                        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">Simpan Perubahan</button>
                    </form>
                </div>

                {/* Form Ganti Password */}
                <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h3 className="text-lg font-semibold mb-4">Ubah Password</h3>
                      <form onSubmit={handleChangePassword}>
            <input 
                type="password" 
                placeholder="Password Lama"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
            />
            <input 
                type="password" 
                placeholder="Password Baru"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
            />
             <input 
                type="password" 
                placeholder="Konfirmasi Password Baru"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <button type="submit">Ubah Password</button>
        </form>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ProfilePage;