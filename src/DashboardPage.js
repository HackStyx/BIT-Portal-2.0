import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ThumbsUp, Share2, BookOpen, Calendar, Clock, Sun, Moon, User, LogOut, Settings, Mail, Phone, MapPin, Calculator, FileText } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useAvatar } from './contexts/AvatarContext';
import { motion } from 'framer-motion';

// Update these imports to match your project structure
import { Avatar, AvatarFallback, AvatarImage } from "./components/ui/avatar";
import { Input } from "./components/ui/input";

import { ProfileModal } from './components/ProfileModal';
import { SettingsModal } from './components/SettingsModal';
import { useAttendance } from './contexts/AttendanceContext';
import { CGPACalculatorModal } from './components/CGPACalculatorModal';

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
  const { avatar } = useAvatar();
  const { overallAttendance } = useAttendance();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isCGPACalculatorOpen, setIsCGPACalculatorOpen] = useState(false);

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

              {/* Profile Dropdown */}
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button className="group relative flex items-center gap-2 rounded-full transition-all duration-300">
                    <div className="relative h-10 w-10">
                      <Avatar className="h-full w-full rounded-full ring-2 ring-white/20 group-hover:ring-white/40 transition-all duration-300">
                        <AvatarImage 
                          src={avatar} 
                          alt={studentData?.name || 'User'} 
                          className="h-full w-full object-cover"
                        />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-medium">
                          {studentData?.name?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 ring-2 ring-[#111111]" />
                    </div>
                  </button>
                </DropdownMenu.Trigger>

                <DropdownMenu.Portal>
                  <DropdownMenu.Content
                    className="w-[300px] rounded-xl p-2 shadow-xl bg-[#1A1A1A] border border-white/10"
                    align="end"
                    sideOffset={5}
                  >
                    {/* Profile Card */}
                    <div className="px-4 py-3">
                      <div className="flex items-center gap-4 mb-4">
                        <Avatar className="h-16 w-16 rounded-full ring-2 ring-white/20">
                          <AvatarImage 
                            src={avatar} 
                            alt={studentData?.name || 'User'} 
                            className="h-full w-full object-cover"
                          />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-xl font-medium">
                            {studentData?.name?.charAt(0).toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="text-lg font-semibold text-white">
                            {studentData?.name}
                          </h3>
                          <p className="text-sm text-gray-400">
                            {studentData?.usn}
                          </p>
                        </div>
                      </div>

                      {/* Quick Info */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <BookOpen size={14} />
                          <span>{studentData?.department || 'Computer Science'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Mail size={14} />
                          <span>{studentData?.email || 'student@example.com'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <MapPin size={14} />
                          <span>{studentData?.section || 'Section A'}</span>
                        </div>
                      </div>

                      {/* Divider */}
                      <div className="h-px bg-white/10 my-2" />

                      {/* Menu Items */}
                      <div className="space-y-1">
                        <DropdownMenu.Item
                          className="flex items-center gap-2 px-2 py-2 text-sm rounded-lg cursor-pointer hover:bg-white/10 text-gray-200 transition-colors"
                          onClick={() => setIsProfileOpen(true)}
                        >
                          <User size={16} />
                          View Full Profile
                        </DropdownMenu.Item>
                        <DropdownMenu.Item
                          className="flex items-center gap-2 px-2 py-2 text-sm rounded-lg cursor-pointer hover:bg-white/10 text-gray-200 transition-colors"
                          onClick={() => setIsSettingsOpen(true)}
                        >
                          <Settings size={16} />
                          Settings
                        </DropdownMenu.Item>
                        <DropdownMenu.Item
                          className="flex items-center gap-2 px-2 py-2 text-sm rounded-lg cursor-pointer hover:bg-red-500/20 text-red-400 transition-colors"
                          onClick={handleLogout}
                        >
                          <LogOut size={16} />
                          Logout
                        </DropdownMenu.Item>
                      </div>
                    </div>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
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
      />
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
