import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ThumbsUp, Share2, BookOpen, Calendar, Clock, Sun, Moon, User, LogOut, Settings, Mail, Phone, MapPin, Calculator, FileText } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useAvatar } from './contexts/AvatarContext';
import { motion } from 'framer-motion';
import io from 'socket.io-client';
import axios from 'axios';

// Update these imports to match your project structure
import { Avatar, AvatarFallback, AvatarImage } from "./components/ui/avatar";
import { Input } from "./components/ui/input";

import { ProfileModal } from './components/ProfileModal';
import { SettingsModal } from './components/SettingsModal';
import { useAttendance } from './contexts/AttendanceContext';
import { CGPACalculatorModal } from './components/CGPACalculatorModal';
import { Loader } from "lucide-react";

const getYearSuffix = (year) => {
  const yearNum = parseInt(year);
  switch (yearNum) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    case 4: return 'th';
    default: return '';
  }
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1
  }
};

function DashboardPage() {
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { avatar, setAvatar, loading: avatarLoading } = useAvatar();
  const { overallAttendance } = useAttendance();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isCGPACalculatorOpen, setIsCGPACalculatorOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  useEffect(() => {
    const usn = localStorage.getItem('studentUSN');
    const savedAvatar = usn ? localStorage.getItem(`avatar_${usn}`) : null;
    if (savedAvatar && !avatar) {
      setAvatar(savedAvatar);
    }
  }, [avatar, setAvatar]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const checkAuth = () => {
      const usn = localStorage.getItem('studentUSN');
      if (!usn) {
        navigate('/login');
      }
    };

    checkAuth();
    const fetchStudentData = async () => {
      try {
        // Get the USN from localStorage that was saved during login
        const usn = localStorage.getItem('studentUSN');
        
        if (!usn) {
          navigate('/login');
          return;
        }

        const response = await fetch(`http://localhost:${process.env.REACT_APP_SERVER_PORT}/api/auth/student/${usn}`);
        const data = await response.json();

        if (data.success) {
          setStudentData(data.student);
        } else {
          setError('Failed to fetch student data');
        }
      } catch (error) {
        console.error('Error fetching student data:', error);
        setError('Failed to load student information');
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [navigate]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Cleanup interval on component unmount
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    try {
      // Clear all auth data from localStorage
      localStorage.removeItem('studentUSN');
      localStorage.removeItem('token');
      // Redirect to login page
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      // Even if there's an error, still try to logout
      localStorage.clear();
      navigate('/', { replace: true });
    }
  };

  useEffect(() => {
    console.log('Avatar state:', avatar);
    console.log('Student data:', studentData);
  }, [avatar, studentData]);

  useEffect(() => {
    const socket = io('http://localhost:5000', {
      withCredentials: true
    });
    
    socket.emit('userConnected', {
      userType: 'students',
      userId: localStorage.getItem('studentUSN')
    });
    
    return () => socket.disconnect();
  }, []);

  const handleImageUpload = useCallback(async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      setUploadError('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image size should be less than 5MB');
      return;
    }

    setIsUploading(true);
    setUploadError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'student_profiles');

      const response = await axios.post(
        'https://api.cloudinary.com/v1_1/dpgsv7n88/image/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            console.log('Upload progress:', percentCompleted + '%');
          },
        }
      );

      if (response.data.secure_url) {
        // Update profile picture in backend
        const updateResponse = await fetch(`http://localhost:${process.env.REACT_APP_SERVER_PORT}/api/auth/update-profile-picture`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            usn: localStorage.getItem('studentUSN'),
            profilePicture: response.data.secure_url
          }),
        });

        const data = await updateResponse.json();
        if (data.success) {
          const imageUrl = response.data.secure_url;
          setAvatar(imageUrl);
          localStorage.setItem('profileImage', imageUrl);
          console.log('Profile picture updated successfully');
        } else {
          setUploadError('Failed to update profile picture');
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError(
        error.response?.data?.error?.message ||
        'Failed to upload image. Please try again.'
      );
    } finally {
      setIsUploading(false);
    }
  }, [setAvatar]);

  // Add debug logs
  useEffect(() => {
    console.log('Current avatar state:', avatar);
  }, [avatar]);

  // Add debug logs
  useEffect(() => {
    console.log('Avatar in header:', avatar);
  }, [avatar]);

  useEffect(() => {
    if (avatar) {
      console.log('Avatar URL:', avatar);
      // Test if the image can be loaded
      const img = new Image();
      img.onload = () => console.log('Image loaded successfully');
      img.onerror = (e) => console.error('Image failed to load:', e);
      img.src = avatar;
    }
  }, [avatar]);

  useEffect(() => {
    console.log('Header Avatar State:', { avatar, loading: avatarLoading });
  }, [avatar, avatarLoading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-blue-900 via-purple-900 to-indigo-900 relative p-4 sm:p-6 md:p-8 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-blue-900 via-purple-900 to-indigo-900 relative p-4 sm:p-6 md:p-8">
        <div className="text-red-400 text-center">{error}</div>
      </div>
    );
  }

  return (
    <div className={`flex h-screen ${theme === 'dark' ? 'bg-[#111111]' : 'bg-gray-50'}`}>
      <Sidebar 
        open={sidebarOpen} 
        setOpen={setSidebarOpen}
        onLogout={handleLogout}
        theme={theme}
        studentName={studentData?.name}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className={`sticky top-0 z-50 w-full ${
          theme === 'dark' 
            ? 'bg-[#111111]/80 border-white/10' 
            : 'bg-white/80 border-gray-200'
        } border-b backdrop-blur-sm`}>
          <div className="flex h-16 items-center justify-between px-6">
            {/* Left side - Logo & Title */}
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Student Portal
              </div>
            </div>

            {/* Right side - Theme Toggle & Profile */}
            <div className="flex items-center gap-4">
              {/* Theme Toggle */}
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className={`group relative flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 ${
                  theme === 'dark'
                    ? 'bg-white/10 hover:bg-white/20'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {theme === 'dark' ? (
                  <Sun size={22} className="text-yellow-400" />
                ) : (
                  <Moon size={22} className="text-blue-600" />
                )}
              </button>

              {/* Profile Avatar - Updated */}
              <button 
                onClick={() => setIsProfileOpen(true)} 
                className="focus:outline-none relative w-10 h-10"
              >
                <div className={`h-full w-full rounded-full flex items-center justify-center transition-all duration-200 hover:ring-2 hover:ring-offset-2 ${
                  theme === 'dark' 
                    ? 'bg-gray-800 hover:bg-gray-700 hover:ring-purple-500 hover:ring-offset-gray-900' 
                    : 'bg-gray-200 hover:bg-gray-300 hover:ring-purple-500 hover:ring-offset-white'
                }`}>
                  <User className={`h-5 w-5 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`} />
                </div>
              </button>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className={`flex-1 overflow-x-hidden overflow-y-auto p-6 ${
          theme === 'dark' ? 'bg-[#111111]' : 'bg-gray-50'
        }`}>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-7xl mx-auto"
          >
            {/* Welcome Section */}
            <motion.div 
              variants={itemVariants}
              className={`p-6 rounded-xl mb-6 ${
                theme === 'dark' 
                  ? 'bg-gradient-to-r from-blue-900/40 to-purple-900/40 border border-white/10' 
                  : 'bg-gradient-to-r from-blue-50 to-purple-50 border border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h1 className={`text-3xl font-bold mb-2 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-800'
                  }`}>
                    Welcome back, {studentData?.name?.split(' ')[0] || 'Student'}! 👋
                  </h1>
                  <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {new Date().toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
                <div className={`p-4 rounded-lg ${
                  theme === 'dark' ? 'bg-white/10' : 'bg-white'
                }`}>
                  <span className={`text-xl font-semibold ${
                    theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                  }`}>
                    {currentTime.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit',
                      hour12: true 
                    })}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Academic Info Cards */}
            <motion.div 
              variants={itemVariants}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6"
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                className={`p-6 rounded-xl border ${
                  theme === 'dark'
                    ? 'bg-gradient-to-br from-blue-900/20 to-blue-800/20 border-white/10'
                    : 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200'
                }`}
              >
                <ThumbsUp className={`h-8 w-8 ${
                  overallAttendance.percentage >= 85
                    ? theme === 'dark' ? 'text-green-400' : 'text-green-600'
                    : overallAttendance.percentage >= 75
                    ? theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                    : overallAttendance.percentage >= 65
                    ? theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'
                    : overallAttendance.percentage >= 55
                    ? theme === 'dark' ? 'text-orange-400' : 'text-orange-600'
                    : theme === 'dark' ? 'text-red-400' : 'text-red-600'
                } mb-4`} />
                <h3 className={`text-xl font-semibold mb-2 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-800'
                }`}>Attendance</h3>
                <div className="flex items-center">
                  <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`absolute top-0 left-0 h-full rounded-full ${
                        overallAttendance.percentage >= 85
                          ? 'bg-green-500'
                          : overallAttendance.percentage >= 75
                          ? 'bg-blue-500'
                          : overallAttendance.percentage >= 65
                          ? 'bg-yellow-500'
                          : overallAttendance.percentage >= 55
                          ? 'bg-orange-500'
                          : 'bg-red-500'
                      }`} 
                      style={{ width: `${overallAttendance.percentage}%` }}
                    ></div>
                  </div>
                  <span className={`ml-3 font-semibold ${
                    theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                  }`}>{overallAttendance.percentage}%</span>
                </div>
                <div className={`mt-2 text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Present: {overallAttendance.presentClasses} / {overallAttendance.totalClasses} classes
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className={`p-6 rounded-xl border ${
                  theme === 'dark'
                    ? 'bg-gradient-to-br from-purple-900/20 to-purple-800/20 border-white/10'
                    : 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200'
                }`}
              >
                <Calculator className={`h-8 w-8 ${
                  theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
                } mb-4`} />
                <h3 className={`text-xl font-semibold mb-2 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-800'
                }`}>CGPA Calculator</h3>
                <div className="space-y-2">
                  <div className={`flex items-center justify-between text-sm ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    <span>Current CGPA</span>
                    <span className={`font-semibold ${
                      theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
                    }`}></span>
                  </div>
                  <button 
                    onClick={() => setIsCGPACalculatorOpen(true)}
                    className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${
                      theme === 'dark'
                        ? 'bg-purple-500/20 text-purple-300 hover:bg-purple-500/30'
                        : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                    }`}
                  >
                    Calculate CGPA
                  </button>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className={`p-6 rounded-xl border ${
                  theme === 'dark'
                    ? 'bg-gradient-to-br from-green-900/20 to-green-800/20 border-white/10'
                    : 'bg-gradient-to-br from-green-50 to-green-100 border-green-200'
                }`}
              >
                <FileText className={`h-8 w-8 ${
                  theme === 'dark' ? 'text-green-400' : 'text-green-600'
                } mb-4`} />
                <h3 className={`text-xl font-semibold mb-2 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-800'
                }`}>Syllabus & Notes</h3>
                <div className="space-y-2">
                  <div className={`flex items-center justify-between text-sm ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    <span>Recent Updates</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      theme === 'dark'
                        ? 'bg-green-500/20 text-green-300'
                        : 'bg-green-100 text-green-700'
                    }`}>New</span>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => window.open('https://drive.google.com/drive/folders/1KCNrUMH6DwkVqQdNI4lvMMonoFJdFKaw', '_blank')}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                        theme === 'dark'
                          ? 'bg-green-500/20 text-green-300 hover:bg-green-500/30'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      Syllabus
                    </button>
                    <button 
                      onClick={() => window.open('https://drive.google.com/drive/folders/1hop2gCA4v0KHyHQ57_VD1JC1iiwYVVdz', '_blank')}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                        theme === 'dark'
                          ? 'bg-green-500/20 text-green-300 hover:bg-green-500/30'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      Notes
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Events & Announcements Section */}
            <motion.div 
              variants={itemVariants}
              className="mt-6"
            >
              <h3 className={`text-xl font-semibold mb-4 ${
                theme === 'dark' ? 'text-white' : 'text-gray-800'
              }`}>Events & Announcements</h3>
              <div className={`rounded-xl border ${
                theme === 'dark' 
                  ? 'bg-white/5 border-white/10' 
                  : 'bg-white border-gray-200'
              } p-4`}>
                <ul className="space-y-4">
                  <li className={`p-4 rounded-lg ${
                    theme === 'dark' ? 'bg-white/10' : 'bg-gray-50'
                  }`}>
                    <h4 className={`text-lg font-semibold ${
                      theme === 'dark' ? 'text-white' : 'text-gray-800'
                    }`}>Hackathon 2023</h4>
                    <p className={`text-sm ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>Join us for a 24-hour coding marathon on March 15th. Register by March 10th.</p>
                  </li>
                  <li className={`p-4 rounded-lg ${
                    theme === 'dark' ? 'bg-white/10' : 'bg-gray-50'
                  }`}>
                    <h4 className={`text-lg font-semibold ${
                      theme === 'dark' ? 'text-white' : 'text-gray-800'
                    }`}>Guest Lecture: AI in Healthcare</h4>
                    <p className={`text-sm ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>Dr. Smith will discuss the latest advancements in AI applications in healthcare on March 20th.</p>
                  </li>
                  <li className={`p-4 rounded-lg ${
                    theme === 'dark' ? 'bg-white/10' : 'bg-gray-50'
                  }`}>
                    <h4 className={`text-lg font-semibold ${
                      theme === 'dark' ? 'text-white' : 'text-gray-800'
                    }`}>Annual Sports Meet</h4>
                    <p className={`text-sm ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>Participate in various sports events from March 25th to March 27th. Register by March 18th.</p>
                  </li>
                </ul>
              </div>
            </motion.div>
          </motion.div>
        </main>
      </div>
      <ProfileModal 
        isOpen={isProfileOpen} 
        onClose={() => setIsProfileOpen(false)}
        studentData={studentData}
        theme={theme}
      >
        <div className="relative p-[3px] rounded-2xl bg-gradient-to-r from-purple-600 via-violet-600 to-purple-600">
          <div className={`relative p-8 rounded-2xl backdrop-blur-xl overflow-hidden ${
            theme === 'dark' 
              ? 'bg-gradient-to-br from-gray-900/95 to-gray-800/95' 
              : 'bg-white/95'
          }`}>
            {/* Background Glow Effects */}
            <div className="absolute top-0 left-0 w-full h-full">
              <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
              <div className="absolute top-0 -right-4 w-72 h-72 bg-violet-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
              <div className="absolute -bottom-8 left-20 w-72 h-72 bg-fuchsia-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
            </div>

            <div className="relative flex flex-col items-center text-center space-y-8">
              {/* Profile Header with Enhanced Glow Effect */}
              <div className="relative">
                <div className="absolute -inset-2 bg-gradient-to-r from-violet-600 to-purple-600 rounded-full blur-lg opacity-75 animate-pulse"></div>
                <Avatar className="relative h-32 w-32 rounded-full ring-4 ring-purple-500 ring-offset-4 ring-offset-background">
                  <AvatarImage 
                    src={avatar} 
                    alt={studentData?.name || 'User'} 
                    className="object-cover rounded-full"
                  />
                  <AvatarFallback className="bg-gradient-to-br from-violet-600 to-purple-600 text-3xl font-semibold text-white">
                    {studentData?.name?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Name and USN with Enhanced Typography */}
              <div className="space-y-2">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
                  {studentData?.name}
                </h2>
                <p className={`text-sm font-medium ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {studentData?.usn}
                </p>
              </div>

              {/* Info Cards with Purple Theme */}
              <div className="w-full space-y-4">
                <div className={`group flex items-center gap-4 p-4 rounded-xl transition-all duration-300 border border-purple-500/20 ${
                  theme === 'dark' 
                    ? 'bg-purple-900/20 hover:bg-purple-900/30 hover:border-purple-500/30' 
                    : 'bg-purple-50 hover:bg-purple-100 hover:border-purple-500/30'
                }`}>
                  <div className={`p-3 rounded-lg ${
                    theme === 'dark' ? 'bg-purple-500/20' : 'bg-purple-500/10'
                  }`}>
                    <BookOpen className="h-6 w-6 text-purple-400" />
                  </div>
                  <div className="flex flex-col">
                    <span className={`text-xs font-medium ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}>Department</span>
                    <span className={`font-medium ${
                      theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      {studentData?.department || 'Computer Science'}
                    </span>
                  </div>
                </div>

                <div className={`group flex items-center gap-4 p-4 rounded-xl transition-all duration-300 border border-purple-500/20 ${
                  theme === 'dark' 
                    ? 'bg-purple-900/20 hover:bg-purple-900/30 hover:border-purple-500/30' 
                    : 'bg-purple-50 hover:bg-purple-100 hover:border-purple-500/30'
                }`}>
                  <div className={`p-3 rounded-lg ${
                    theme === 'dark' ? 'bg-purple-500/20' : 'bg-purple-500/10'
                  }`}>
                    <Mail className="h-6 w-6 text-purple-400" />
                  </div>
                  <div className="flex flex-col">
                    <span className={`text-xs font-medium ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}>Email</span>
                    <span className={`font-medium ${
                      theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      {studentData?.email}
                    </span>
                  </div>
                </div>

                <div className={`group flex items-center gap-4 p-4 rounded-xl transition-all duration-300 border border-purple-500/20 ${
                  theme === 'dark' 
                    ? 'bg-purple-900/20 hover:bg-purple-900/30 hover:border-purple-500/30' 
                    : 'bg-purple-50 hover:bg-purple-100 hover:border-purple-500/30'
                }`}>
                  <div className={`p-3 rounded-lg ${
                    theme === 'dark' ? 'bg-purple-500/20' : 'bg-purple-500/10'
                  }`}>
                    <MapPin className="h-6 w-6 text-purple-400" />
                  </div>
                  <div className="flex flex-col">
                    <span className={`text-xs font-medium ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}>Section</span>
                    <span className={`font-medium ${
                      theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      Section {studentData?.section}
                    </span>
                  </div>
                </div>
              </div>

              {/* Enhanced Close Button */}
              <button 
                onClick={() => setIsProfileOpen(false)}
                className="w-full py-4 rounded-xl font-medium text-white transition-all duration-300
                  bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700
                  shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30
                  transform hover:scale-[1.02] border border-purple-500/20"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      </ProfileModal>
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        theme={theme}
        setTheme={setTheme}
      />
      <CGPACalculatorModal 
        isOpen={isCGPACalculatorOpen}
        onClose={() => setIsCGPACalculatorOpen(false)}
        theme={theme}
      />
    </div>
  );
}

export default DashboardPage;
