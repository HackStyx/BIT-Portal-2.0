import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ThumbsUp, Share2, BookOpen } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { User, Settings } from 'lucide-react';
import { useAvatar } from './contexts/AvatarContext';

// Update these imports to match your project structure
import { Avatar, AvatarFallback, AvatarImage } from "./components/ui/avatar";
import { Input } from "./components/ui/input";

import { ProfileModal } from './components/ProfileModal';
import { SettingsModal } from './components/SettingsModal';

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
        <header className={`flex items-center justify-between p-4 border-b ${
          theme === 'dark' 
            ? 'bg-[#111111] border-white/20' 
            : 'bg-white border-gray-300'
        }`}>
          <div className="flex items-center">
            <h1 className={`text-xl font-semibold ${
              theme === 'dark' ? 'text-white' : 'text-gray-800'
            }`}>
              Hello, {studentData?.name?.split(' ')[0] || 'Student'}! 👋
            </h1>
          </div>
          <div className="flex items-center">
            <div className="relative mr-4">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`} />
              <Input 
                type="search" 
                placeholder="Search here..." 
                className={`pl-10 pr-4 py-2 w-64 rounded-full transition-colors ${
                  theme === 'dark' 
                    ? 'bg-white/10 text-white border-white/20 hover:border-white/30' 
                    : 'bg-gray-100 text-gray-900 border-gray-300 hover:border-gray-400'
                }`}
              />
            </div>
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <div className="cursor-pointer">
                  <Avatar className="w-10 h-10">
                    <AvatarImage 
                      src={avatar}
                      alt={studentData?.name || 'User'} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.log('Avatar image error:', e);
                        e.target.style.display = 'none';
                      }}
                    />
                    <AvatarFallback>
                      {studentData?.name?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </DropdownMenu.Trigger>

              <DropdownMenu.Portal>
                <DropdownMenu.Content 
                  className="min-w-[220px] bg-[#1A1A1A] rounded-md p-1 shadow-lg border border-white/20"
                  sideOffset={5}
                  align="end"
                >
                  <DropdownMenu.Item 
                    className="flex items-center px-3 py-2 text-sm text-gray-200 hover:bg-white/10 rounded-md cursor-pointer outline-none"
                    onClick={() => setIsProfileOpen(true)}
                  >
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </DropdownMenu.Item>
                  <DropdownMenu.Item 
                    className="flex items-center px-3 py-2 text-sm text-gray-200 hover:bg-white/10 rounded-md cursor-pointer outline-none"
                    onClick={() => setIsSettingsOpen(true)}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </div>
        </header>

        {/* Main content */}
        <main className={`flex-1 overflow-x-hidden overflow-y-auto p-6 ${
          theme === 'dark' ? 'bg-[#111111]' : 'bg-gray-50'
        }`}>
          <h2 className={`text-2xl font-semibold mb-6 ${
            theme === 'dark' ? 'text-white' : 'text-gray-800'
          }`}>
            Dashboard
          </h2>
          
          {studentData && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className={`p-6 rounded-lg shadow-lg border transition-colors ${
                  theme === 'dark'
                    ? 'bg-white/10 border-white/20 hover:bg-white/15'
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}>
                  <ThumbsUp className={`h-8 w-8 ${theme === 'dark' ? 'text-blue-500' : 'text-blue-600'} mb-2`} />
                  <h3 className={`text-xl font-semibold mb-2 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-800'
                  }`}>Attendance</h3>
                  <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Status</p>
                </div>
                <div className={`p-6 rounded-lg shadow-lg border transition-colors ${
                  theme === 'dark'
                    ? 'bg-white/10 border-white/20 hover:bg-white/15'
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}>
                  <BookOpen className={`h-8 w-8 ${theme === 'dark' ? 'text-yellow-500' : 'text-yellow-600'} mb-2`} />
                  <h3 className={`text-xl font-semibold mb-2 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-800'
                  }`}>Academic Info</h3>
                  <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>{studentData.department}</p>
                </div>
                <div className={`p-6 rounded-lg shadow-lg border transition-colors ${
                  theme === 'dark'
                    ? 'bg-white/10 border-white/20 hover:bg-white/15'
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}>
                  <Share2 className={`h-8 w-8 ${theme === 'dark' ? 'text-purple-500' : 'text-purple-600'} mb-2`} />
                  <h3 className={`text-xl font-semibold mb-2 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-800'
                  }`}>{studentData.year} Year</h3>
                  <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Section {studentData.section}</p>
                </div>
              </div>

              <h3 className={`text-xl font-semibold mb-4 ${
                theme === 'dark' ? 'text-white' : 'text-gray-800'
              }`}>Personal Details</h3>
              <div className={`shadow-lg rounded-lg overflow-hidden border ${
                theme === 'dark' 
                  ? 'bg-white/10 border-white/20' 
                  : 'bg-white border-gray-200'
              }`}>
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Full Name
                      </label>
                      <div className={`w-full rounded-md px-3 py-2 ${
                        theme === 'dark' 
                          ? 'bg-white/5 border border-white/10 text-white' 
                          : 'bg-gray-100 border border-gray-200 text-gray-900'
                      }`}>
                        {studentData?.name || 'N/A'}
                      </div>
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        USN
                      </label>
                      <div className={`w-full rounded-md px-3 py-2 ${
                        theme === 'dark' 
                          ? 'bg-white/5 border border-white/10 text-white' 
                          : 'bg-gray-100 border border-gray-200 text-gray-900'
                      }`}>
                        {studentData?.usn || 'N/A'}
                      </div>
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-1 ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Branch
                      </label>
                      <div className={`w-full rounded-md px-3 py-2 ${
                        theme === 'dark' 
                          ? 'bg-white/5 border border-white/10 text-white' 
                          : 'bg-gray-100 border border-gray-200 text-gray-900'
                      }`}>
                        {studentData?.department || 'N/A'}
                      </div>
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-1 ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Section
                      </label>
                      <div className={`w-full rounded-md px-3 py-2 ${
                        theme === 'dark' 
                          ? 'bg-white/5 border border-white/10 text-white' 
                          : 'bg-gray-100 border border-gray-200 text-gray-900'
                      }`}>
                        {studentData?.section || 'N/A'}
                      </div>
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-1 ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Year
                      </label>
                      <div className={`w-full rounded-md px-3 py-2 ${
                        theme === 'dark' 
                          ? 'bg-white/5 border border-white/10 text-white' 
                          : 'bg-gray-100 border border-gray-200 text-gray-900'
                      }`}>
                        {studentData?.year ? `${studentData.year}${getYearSuffix(studentData.year)} Year` : 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
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
    </div>
  );
}

export default DashboardPage;
