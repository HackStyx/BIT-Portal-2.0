import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaHome, FaUserGraduate, FaChalkboardTeacher, FaMoneyBill, FaClipboard, FaCog, FaSignOutAlt } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut } from 'lucide-react';

export function AdminSidebar({ open, setOpen, adminName, theme }) {
  const navigate = useNavigate();
  const location = useLocation();

  const links = [
    { label: "Dashboard", icon: <FaHome />, href: "/admin/dashboard" },
    { label: "Students", icon: <FaUserGraduate />, href: "/admin/students" },
    { label: "Teachers", icon: <FaChalkboardTeacher />, href: "/admin/teachers" },
    { label: "Fee", icon: <FaMoneyBill />, href: "/admin/fee" },
    { label: "Exam", icon: <FaClipboard />, href: "/admin/exam" },
    { label: "Settings", icon: <FaCog />, href: "/admin/settings" },
  ];

  const handleLogout = (e) => {
    e.preventDefault();
    try {
      localStorage.removeItem('adminToken');
      navigate('/admin/login', { 
        replace: true,
        state: { from: 'logout' }
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <motion.div
      animate={{ width: open ? "240px" : "80px" }}
      transition={{ 
        duration: 0.5,
        ease: [0.25, 0.1, 0.25, 1],
        type: "tween"
      }}
      className={`fixed top-0 left-0 h-screen border-r z-[1000] overflow-hidden ${
        theme === 'dark'
          ? 'bg-[#111111] border-white/20'
          : 'bg-white border-gray-300'
      }`}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <div className="flex flex-col h-full p-4">
        <div className="flex items-center h-16 mb-8">
          <img 
            src="/bit-logo.png" 
            alt="College Logo"
            className={`h-10 w-10 rounded-lg flex-shrink-0 object-contain p-1 ${
              theme === 'dark' ? 'bg-white/10' : 'bg-gray-200'
            }`}
          />
          <motion.div
            animate={{ opacity: open ? 1 : 0, x: open ? 0 : -8 }}
            transition={{ 
              duration: 0.4,
              ease: "easeOut",
              delay: open ? 0.1 : 0
            }}
            className="ml-3 overflow-hidden"
          >
            {open && (
              <span className={`text-xl font-bold whitespace-nowrap ${
                theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
              }`}>
                {adminName || 'Admin Portal'}
              </span>
            )}
          </motion.div>
        </div>

        <nav className="flex-1 space-y-2">
          {links.map((link, idx) => (
            <motion.a
              key={idx}
              href={link.href}
              onClick={(e) => {
                e.preventDefault();
                navigate(link.href);
              }}
              className={`flex items-center h-12 px-3 rounded-lg transition-colors ${
                location.pathname === link.href
                  ? theme === 'dark'
                    ? 'bg-white/10 text-white'
                    : 'bg-blue-600 text-white'
                  : theme === 'dark'
                  ? 'text-gray-300 hover:bg-white/10'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <div className="w-6 flex items-center justify-center">
                <span className={`text-lg transition-all duration-300 ${
                  location.pathname === link.href
                    ? theme === 'dark'
                      ? 'text-white'
                      : 'text-white'
                    : theme === 'dark'
                    ? 'text-gray-300'
                    : 'text-gray-700'
                }`}>
                  {link.icon}
                </span>
              </div>
              <motion.span
                animate={{ 
                  opacity: open ? 1 : 0, 
                  x: open ? 0 : -8,
                  display: open ? "block" : "none"
                }}
                transition={{ 
                  duration: 0.4,
                  ease: "easeOut",
                  delay: open ? 0.2 : 0,
                  display: { delay: open ? 0 : 0.4 }
                }}
                className="ml-3 whitespace-nowrap overflow-hidden"
              >
                {link.label}
              </motion.span>
            </motion.a>
          ))}
        </nav>

        <div className="absolute bottom-4 w-full px-3">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              theme === 'dark'
                ? 'hover:bg-white/10 text-white'
                : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            <LogOut className="h-5 w-5" />
            {open && <span>Logout</span>}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
