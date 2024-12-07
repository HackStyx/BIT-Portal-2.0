import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from './contexts/AdminAuthContext';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

function AdminLoginPage() {
  const [adminPassword, setAdminPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login, isAdminAuthenticated } = useAdminAuth();

  const baseURL = process.env.REACT_APP_SERVER_PORT 
    ? `http://localhost:${process.env.REACT_APP_SERVER_PORT}/api`
    : 'http://localhost:5000/api';

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      navigate('/admin/dashboard');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${baseURL}/auth/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          password: adminPassword
        })
      });

      const data = await response.json();
      console.log('Login response:', data); // Debug log

      if (data.success) {
        // Store token with Bearer prefix
        const token = `Bearer ${data.token}`;
        localStorage.setItem('adminToken', token);
        localStorage.setItem('adminName', data.adminName || 'Admin');
        
        console.log('Stored token:', token); // Debug log
        login();
        navigate('/admin/dashboard');
      } else {
        setError(data.message || 'Invalid admin password');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Login failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center md:justify-start bg-gradient-to-r from-blue-900 via-purple-900 to-indigo-900 relative p-4 sm:p-6 md:p-8">
      <div className="absolute inset-0 bg-grid-white/[0.1] pointer-events-none"></div>
      <div className="relative w-full max-w-xl mx-4 md:ml-16 bg-white/10 backdrop-blur-xl rounded-2xl p-4 sm:p-6 md:p-8 border border-white/10 shadow-2xl">
        <h2 className="mb-6 md:mb-8 text-4xl md:text-5xl font-extrabold text-white text-center sm:text-left">
          Admin Login
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
          <div className="relative">
            <label className="block text-white text-xl font-semibold mb-3" htmlFor="adminPassword">
              Admin Password
            </label>
            <div className="relative">
              <input
                id="adminPassword"
                type={showPassword ? "text" : "password"}
                className="w-full px-5 py-4 rounded-lg bg-white bg-opacity-20 border border-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-white placeholder-gray-300 transition-all duration-300 text-lg"
                placeholder="Enter admin password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
              </button>
            </div>
          </div>
          {error && <p className="text-red-500">{error}</p>}
          <div className="flex justify-center">
            <button
              type="submit"
              className="w-64 h-14 animate-shimmer items-center justify-center rounded-md border border-slate-800 bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] px-6 text-white text-xl font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50"
            >
              Login as Admin
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminLoginPage;
