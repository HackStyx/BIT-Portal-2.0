import React, { useState } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { useNavigate } from 'react-router-dom';
import { Info } from 'lucide-react';

function AboutPage() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme] = useState(() => localStorage.getItem('theme') || 'dark');
  const studentName = localStorage.getItem('studentName');

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
        studentName={studentName}
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
          <div className={`max-w-4xl mx-auto p-6 rounded-lg shadow-lg border ${
            theme === 'dark'
              ? 'bg-white/10 border-white/20'
              : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center mb-6">
              <Info className={`h-8 w-8 ${theme === 'dark' ? 'text-blue-500' : 'text-blue-600'} mr-3`} />
              <h2 className={`text-2xl font-bold ${
                theme === 'dark' ? 'text-white' : 'text-gray-800'
              }`}>
                About BIT Portal
              </h2>
            </div>
            
            <div className={`space-y-4 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              <p>
                The BIT Student Portal is a comprehensive platform designed to enhance the academic experience
                for students at Bangalore Institute of Technology.
              </p>
              <p>
                This portal provides easy access to important academic information including attendance records,
                internal assessment marks, fee details, and more.
              </p>
              <h3 className={`text-xl font-semibold mt-6 mb-2 ${
                theme === 'dark' ? 'text-white' : 'text-gray-800'
              }`}>
                Features
              </h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>Real-time attendance tracking</li>
                <li>Internal Assessment marks viewing</li>
                <li>Fee payment status and history</li>
                <li>Direct feedback submission</li>
                <li>Easy navigation and user-friendly interface</li>
              </ul>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default AboutPage;