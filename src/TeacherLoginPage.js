import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

function TeacherLoginPage() {
  const [teacherId, setTeacherId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/teacher/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teacherId,
          password,
        }),
      });

      const data = await response.json();
      console.log('Login response:', data);

      if (data.success) {
        localStorage.setItem('teacherToken', data.token);
        localStorage.setItem('teacherId', data.teacher.teacherId);
        localStorage.setItem('teacherName', data.teacher.name);
        localStorage.setItem('teacherDepartment', data.teacher.department);
        navigate('/teacher/dashboard');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Failed to connect to the server');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center md:justify-start bg-gradient-to-r from-blue-900 via-purple-900 to-indigo-900 relative p-4 sm:p-6 md:p-8">
      <div className="absolute inset-0 bg-grid-white/[0.1] pointer-events-none"></div>
      <div className="relative w-full max-w-xl mx-4 md:ml-16">
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur-xl opacity-30 animate-glow"></div>
        
        <div className="relative bg-white/10 backdrop-blur-xl rounded-2xl p-4 sm:p-6 md:p-8 border border-white/20 shadow-2xl hover:border-white/30 transition-all duration-300">
          <h2 className="mb-6 md:mb-8 text-4xl md:text-5xl font-extrabold text-white text-center sm:text-left">
            Teacher Portal Login
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
            <div>
              <label className="block text-white text-xl font-semibold mb-3" htmlFor="teacherId">
                Teacher ID
              </label>
              <input
                id="teacherId"
                type="text"
                className="w-full px-5 py-4 rounded-lg bg-white/10 backdrop-blur-sm border border-white/10 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-white placeholder-gray-300 transition-all duration-300 text-lg hover:bg-white/20"
                placeholder="Enter your teacher ID"
                value={teacherId}
                onChange={(e) => setTeacherId(e.target.value)}
                required
              />
            </div>
            <div className="relative">
              <label className="block text-white text-xl font-semibold mb-3" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="w-full px-5 py-4 rounded-lg bg-white/10 backdrop-blur-sm border border-white/10 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-white placeholder-gray-300 transition-all duration-300 text-lg hover:bg-white/20"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                disabled={isLoading}
                className="w-48 h-14 relative overflow-hidden rounded-md border border-slate-800 bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] px-6 text-white text-xl font-bold transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50 disabled:opacity-50 disabled:cursor-not-allowed animate-shimmer"
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default TeacherLoginPage;
