import React from 'react';
import { motion } from 'framer-motion';
import { FaHome, FaCalendar, FaDollarSign, FaBook, FaComments, FaInfoCircle, FaSignOutAlt } from 'react-icons/fa';

export function Sidebar({ open, setOpen, onLogout, studentName, theme }) {
  const links = [
    { label: "Dashboard", icon: <FaHome />, href: "/dashboard" },
    { label: "Attendance", icon: <FaCalendar />, href: "#" },
    { label: "Fee Section", icon: <FaDollarSign />, href: "#" },
    { label: "IA Marks", icon: <FaBook />, href: "#" },
    { label: "Feedback", icon: <FaComments />, href: "#" },
    { label: "About", icon: <FaInfoCircle />, href: "#" },
  ];

  return (
    <motion.div
      animate={{ width: open ? "240px" : "80px" }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={`relative h-screen border-r ${
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
            alt="BIT Logo"
            className={`h-10 w-10 rounded-lg flex-shrink-0 object-contain p-1 ${
              theme === 'dark' ? 'bg-white/10' : 'bg-gray-200'
            }`}
          />
          <motion.div
            animate={{ opacity: open ? 1 : 0, x: open ? 0 : -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="ml-3 overflow-hidden"
          >
            {open && (
              <span className={`text-xl font-bold whitespace-nowrap ${
                theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
              }`}>
                {studentName || 'Student Portal'}
              </span>
            )}
          </motion.div>
        </div>

        <nav className="flex-1 space-y-2">
          {links.map((link, idx) => (
            <motion.a
              key={idx}
              href={link.href}
              className={`flex items-center h-12 px-3 rounded-lg transition-colors ${
                theme === 'dark'
                  ? 'text-gray-300 hover:bg-white/10'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <div className="w-6 flex items-center justify-center">
                <span className={`text-lg ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {link.icon}
                </span>
              </div>
              <motion.span
                animate={{ opacity: open ? 1 : 0, x: open ? 0 : -10 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="ml-3 whitespace-nowrap overflow-hidden"
              >
                {link.label}
              </motion.span>
            </motion.a>
          ))}
        </nav>

        <button
          onClick={onLogout}
          className={`flex items-center h-12 px-3 rounded-lg transition-colors ${
            theme === 'dark'
              ? 'text-red-400 hover:bg-white/10'
              : 'text-red-600 hover:bg-gray-100'
          }`}
        >
          <div className="w-6 flex items-center justify-center">
            <FaSignOutAlt className="text-lg" />
          </div>
          <motion.span
            animate={{ opacity: open ? 1 : 0, x: open ? 0 : -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="ml-3 whitespace-nowrap overflow-hidden"
          >
            Logout
          </motion.span>
        </button>
      </div>
    </motion.div>
  );
}
