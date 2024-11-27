import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TeacherSidebar } from '../TeacherSidebar';

function TeacherLayout({ children, sidebarOpen, setSidebarOpen }) {
  const [theme] = useState(() => localStorage.getItem('theme') || 'dark');
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('teacherToken');
    navigate('/teacher/login');
  };

  return (
    <div className={`min-h-screen ${
      theme === 'dark' ? 'bg-[#111111] text-white' : 'bg-gray-50 text-gray-800'
    }`}>
      <TeacherSidebar 
        open={sidebarOpen} 
        setOpen={setSidebarOpen}
        onLogout={handleLogout}
        theme={theme}
        teacherName={localStorage.getItem('teacherName')}
      />
      
      <main className="flex-1 transition-all duration-300 ease-in-out">
        {children}
      </main>
    </div>
  );
}

export default TeacherLayout; 