import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { useNavigate } from 'react-router-dom';
import { Mail, Phone, MapPin, BookOpen, User, Calendar, Users, Edit, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAvatar } from '../../contexts/AvatarContext';
import axios from 'axios';

function AboutPage() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { avatar, setAvatar } = useAvatar();

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const usn = localStorage.getItem('studentUSN');
        if (!usn) {
          navigate('/login');
          return;
        }
        const response = await fetch(`http://localhost:${process.env.REACT_APP_SERVER_PORT}/api/auth/student/${usn}`);
        const data = await response.json();
        if (data.success) {
          setStudentData(data.student);
        }
      } catch (error) {
        console.error('Error fetching student data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [navigate]);

  useEffect(() => {
    const usn = localStorage.getItem('studentUSN');
    const savedAvatar = localStorage.getItem(`avatar_${usn}`) || localStorage.getItem('profileImage');
    if (savedAvatar && !avatar) {
      setAvatar(savedAvatar);
    }
  }, [avatar, setAvatar]);

  const handleLogout = () => {
    localStorage.removeItem('studentUSN');
    localStorage.removeItem('token');
    navigate('/', { replace: true });
  };

  const handleImageUpload = useCallback(async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'student_profiles');

      // Upload to Cloudinary
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
        const usn = localStorage.getItem('studentUSN');
        const imageUrl = response.data.secure_url;

        // Update both User and ProfileImage models
        const updateResponse = await axios.put(
          `http://localhost:${process.env.REACT_APP_SERVER_PORT}/api/profile-image`,
          {
            usn,
            imageUrl
          },
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }
        );

        if (updateResponse.data.success) {
          setAvatar(imageUrl);
          localStorage.setItem(`avatar_${usn}`, imageUrl);
          localStorage.setItem('profileImage', imageUrl);
          
          // Refresh student data
          const refreshResponse = await fetch(`http://localhost:${process.env.REACT_APP_SERVER_PORT}/api/auth/student/${usn}`);
          const refreshData = await refreshResponse.json();
          if (refreshData.success) {
            setStudentData(refreshData.student);
            console.log('Profile picture updated successfully');
          }
        } else {
          alert('Failed to update profile picture in database');
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [setAvatar]);

  // Add debug logs
  useEffect(() => {
    console.log('Current avatar state:', avatar);
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
    if (studentData?.profilePicture) {
      setAvatar(studentData.profilePicture);
    }
  }, [studentData, setAvatar]);

  return (
    <div className={`flex h-screen ${theme === 'dark' ? 'bg-[#111111]' : 'bg-gray-50'}`}>
      <Sidebar 
        open={sidebarOpen} 
        setOpen={setSidebarOpen}
        onLogout={handleLogout}
        theme={theme}
        studentName={studentData?.name}
      />
      
      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* Header Banner */}
        <div className="relative h-32">
          {/* College Banner Image */}
          <div className="absolute inset-0">
            <img
              src="/college-banner.jpg" // Replace with your college banner image
              alt="College Banner"
              className="w-full h-full object-cover"
            />
            {/* Overlay */}
            <div className={`absolute inset-0 ${
              theme === 'dark' 
                ? 'bg-gradient-to-b from-black/60 to-[#111111]' 
                : 'bg-gradient-to-b from-black/40 to-gray-50'
            }`} />
          </div>

          {/* Profile Section */}
          <div className="absolute -bottom-36 w-full">
            <div className="max-w-4xl mx-auto px-4 flex items-end gap-6">
              <div className="relative group">
                <div className="h-40 w-40 rounded-full border-4 border-white shadow-lg overflow-hidden">
                  <img
                    src={avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(studentData?.name || '')}&size=160`}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                </div>
                <label className={`absolute inset-0 flex items-center justify-center rounded-full cursor-pointer
                  opacity-0 group-hover:opacity-100 transition-opacity duration-200
                  bg-black/50 text-white font-medium`}>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                  Change Photo
                </label>
                <span className={`absolute bottom-2 right-2 h-4 w-4 rounded-full border-2 border-white ${
                  theme === 'dark' ? 'bg-green-400' : 'bg-green-500'
                }`} />
              </div>
              
              <div className="flex-1 pb-4">
                <h1 className="text-3xl font-bold text-white">{studentData?.name}</h1>
                <p className="text-gray-200 mt-1">{studentData?.department}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className={`flex-1 px-4 pt-48 pb-12 ${
          theme === 'dark' ? 'bg-[#111111]' : 'bg-gray-50'
        }`}>
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Account Details Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-xl border shadow-sm ${
                theme === 'dark' 
                  ? 'bg-white/5 border-white/10' 
                  : 'bg-white border-gray-200'
              }`}
            >
              <div className="p-6">
                <h2 className={`mb-6 text-xl font-semibold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>Account Details</h2>
                
                <div className="grid gap-6 md:grid-cols-2">
                  {[
                    { 
                      icon: <User size={20} />, 
                      label: 'USN', 
                      value: studentData?.usn 
                    },
                    { 
                      icon: <BookOpen size={20} />, 
                      label: 'Department', 
                      value: studentData?.department 
                    },
                    { 
                      icon: <Mail size={20} />, 
                      label: 'Email', 
                      value: `${studentData?.name?.split(' ')[0].toLowerCase()}@bit.edu` || 'student@bit.edu'
                    },
                    { 
                      icon: <User size={20} />, 
                      label: 'Full Name', 
                      value: studentData?.name 
                    },
                    { 
                      icon: <Calendar size={20} />, 
                      label: 'Year', 
                      value: studentData?.year || '2nd Year'
                    },
                    { 
                      icon: <Users size={20} />, 
                      label: 'Section', 
                      value: studentData?.section 
                    }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                        theme === 'dark' 
                          ? 'bg-blue-500/10 text-blue-400' 
                          : 'bg-blue-100 text-blue-600'
                      }`}>
                        {item.icon}
                      </div>
                      <div>
                        <p className={`text-sm ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`}>{item.label}</p>
                        <p className={`font-medium ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>{item.value || 'N/A'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Social Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-center"
            >
              <h3 className={`mb-4 text-lg font-semibold ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>Follow us on</h3>
              <div className="flex justify-center gap-4">
                {[
                  { Icon: Facebook, url: 'https://www.facebook.com/bitsince1979' },
                  { Icon: Twitter, url: 'https://twitter.com/bitsince1979' },
                  { Icon: Instagram, url: 'https://www.instagram.com/bitsince1979/' },
                  { Icon: Youtube, url: 'https://www.youtube.com/bitsince1979' }
                ].map(({ Icon, url }) => (
                  <a
                    key={url}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`p-3 rounded-full transition-colors ${
                      theme === 'dark'
                        ? 'bg-white/5 hover:bg-white/10 text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                    }`}
                  >
                    <Icon size={20} />
                  </a>
                ))}
              </div>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default AboutPage;