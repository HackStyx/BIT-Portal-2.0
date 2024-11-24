import React from 'react';
import { motion } from 'framer-motion';
import { FaHome, FaCalendarAlt, FaBook, FaUserGraduate, FaChalkboardTeacher, FaSignOutAlt } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';

export function TeacherSidebar({ open, setOpen, onLogout, teacherName, theme }) {
  const navigate = useNavigate();
  const location = useLocation();
  
  const links = [
    { label: "Dashboard", icon: <FaHome />, href: "/teacher/dashboard" },
    { label: "Schedule", icon: <FaCalendarAlt />, href: "/teacher/schedule" },
    { label: "Attendance", icon: <FaUserGraduate />, href: "/teacher/attendance" },
    { label: "Marks Entry", icon: <FaBook />, href: "/teacher/marks" },
    { label: "Classes", icon: <FaChalkboardTeacher />, href: "/teacher/classes" },
  ];

  return (
    <motion.div
      animate={{ width: open ? "240px" : "80px" }}
      transition={{ 
        duration: 0.5,
        ease: [0.25, 0.1, 0.25, 1],
        type: "tween"
      }}
      className={`fixed top-0 left-0 h-screen border-r z-50 overflow-hidden ${
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
                {teacherName || 'Teacher Portal'}
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

        <button
          onClick={onLogout}
          className={`flex items-center h-12 px-3 rounded-lg transition-all duration-300 ${
            theme === 'dark'
              ? 'text-red-400 hover:bg-white/10'
              : 'text-red-600 hover:bg-gray-100'
          }`}
        >
          <div className="w-6 flex items-center justify-center">
            <FaSignOutAlt className="text-lg transition-all duration-300" />
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
            Logout
          </motion.span>
        </button>
      </div>
    </motion.div>
  );
}
