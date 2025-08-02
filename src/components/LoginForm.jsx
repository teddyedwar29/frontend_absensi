import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api/auth';
import Swal from 'sweetalert2';

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
      Swal.fire({
        icon: 'success',
        title: 'Login Berhasil',
        showConfirmButton: false,
        timer: 1500,
      }).then(() => {
        navigate('/dashboard');
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Login Gagal',
        text: result.message,
      });
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 sm:p-8 rounded-lg shadow-md w-full max-w-md"
    >
      <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>

      <div className="mb-4">
        <label className="block mb-1 font-medium">Username</label>
        <input
          type="text"
          className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
      </div>

      <div className="mb-6">
        <label className="block mb-1 font-medium">Password</label>
        <input
          type="password"
          className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition-colors duration-200 ${
          loading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
};

export default LoginForm;