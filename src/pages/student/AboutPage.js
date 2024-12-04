import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { useNavigate } from 'react-router-dom';
import { Mail, Phone, MapPin, BookOpen, User, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

function AboutPage() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);

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

  const handleLogout = () => {
    localStorage.removeItem('studentUSN');
    localStorage.removeItem('token');
    navigate('/', { replace: true });
  };

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
        <header className={`flex items-center justify-between p-4 border-b ${
          theme === 'dark' 
            ? 'bg-[#111111] border-white/20' 
            : 'bg-white border-gray-300'
        }`}>
          <h1 className={`text-2xl font-bold ${
            theme === 'dark' ? 'text-white' : 'text-gray-800'
          }`}>
            About
          </h1>
        </header>

        <main className={`flex-1 overflow-x-hidden overflow-y-auto p-6 ${
          theme === 'dark' ? 'bg-[#111111]' : 'bg-gray-50'
        }`}>
          <div className="max-w-4xl mx-auto mt-8">
            {/* Personal Details Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-xl overflow-hidden border shadow-sm ${
                theme === 'dark' 
                  ? 'bg-white/5 border-white/10' 
                  : 'bg-white border-gray-200'
              }`}
            >
              <div className={`px-6 py-4 border-b ${
                theme === 'dark' ? 'border-white/10' : 'border-gray-200'
              }`}>
                <div className="flex items-center gap-3">
                  <User className={`h-6 w-6 ${
                    theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                  }`} />
                  <h3 className={`text-xl font-semibold ${
                    theme === 'dark' ? 'text-white' : 'text-gray-800'
                  }`}>Personal Details</h3>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { icon: <User size={18} />, label: 'Full Name', value: studentData?.name || 'John Doe' },
                    { icon: <BookOpen size={18} />, label: 'USN', value: studentData?.usn || '1BI18CS001' },
                    { icon: <MapPin size={18} />, label: 'Branch', value: studentData?.department || 'Computer Science' },
                    { icon: <Calendar size={18} />, label: 'Section', value: studentData?.section || 'A' },
                    { icon: <Mail size={18} />, label: 'Email', value: studentData?.email || '1BI2XCSXXX@gmail.com' },
                    { icon: <Phone size={18} />, label: 'Phone', value: studentData?.phone || '+91 9876543210' }
                  ].map((item, index) => (
                    <div key={index} className={`p-4 rounded-lg border ${
                      theme === 'dark' 
                        ? 'bg-white/5 border-white/10' 
                        : 'bg-gray-50 border-gray-200'
                    }`}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                          {item.icon}
                        </span>
                        <label className={`text-sm font-medium ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {item.label}
                        </label>
                      </div>
                      <div className={`text-base font-medium ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        {item.value || 'N/A'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default AboutPage;