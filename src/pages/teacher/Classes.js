import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, BookOpen, Clock, GraduationCap } from 'lucide-react';
import TeacherLayout from '../../components/layouts/TeacherLayout';

function Classes() {
  const [theme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState('All');

  const mockClasses = [
    {
      id: 1,
      className: 'X-A',
      subject: 'Mathematics',
      students: 30,
      time: '9:00 AM - 10:00 AM',
      room: '101',
      topics: ['Algebra', 'Geometry', 'Trigonometry'],
      progress: 75
    },
    {
      id: 2,
      className: 'XI-B',
      subject: 'Physics',
      students: 25,
      time: '11:00 AM - 12:00 PM',
      room: '203',
      topics: ['Mechanics', 'Thermodynamics', 'Optics'],
      progress: 60
    },
    {
      id: 3,
      className: 'XII-A',
      subject: 'Chemistry',
      students: 28,
      time: '2:00 PM - 3:00 PM',
      room: '301',
      topics: ['Organic Chemistry', 'Physical Chemistry', 'Inorganic Chemistry'],
      progress: 80
    }
  ];

  const content = (
    <motion.div 
      className="flex-1"
      initial={false}
      animate={{ 
        marginLeft: sidebarOpen ? "240px" : "80px"
      }}
      transition={{
        duration: 0.3,
        ease: "easeInOut"
      }}
    >
      <div className="p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            My Classes
          </h1>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className={`p-6 rounded-xl shadow-lg border backdrop-blur-sm ${
              theme === 'dark'
                ? 'bg-white/10 border-white/20 hover:bg-white/15'
                : 'bg-white border-gray-200 hover:bg-gray-50'
            } transition-all duration-300`}
          >
            <BookOpen className={`h-8 w-8 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} mb-3`} />
            <h3 className={`text-xl font-semibold mb-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-800'
            }`}>Total Classes</h3>
            <p className={`text-3xl font-bold ${
              theme === 'dark' ? 'text-gray-200' : 'text-gray-900'
            }`}>{mockClasses.length}</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className={`p-6 rounded-xl shadow-lg border backdrop-blur-sm ${
              theme === 'dark'
                ? 'bg-white/10 border-white/20 hover:bg-white/15'
                : 'bg-white border-gray-200 hover:bg-gray-50'
            } transition-all duration-300`}
          >
            <Users className={`h-8 w-8 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'} mb-3`} />
            <h3 className={`text-xl font-semibold mb-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-800'
            }`}>Total Students</h3>
            <p className={`text-3xl font-bold ${
              theme === 'dark' ? 'text-gray-200' : 'text-gray-900'
            }`}>{mockClasses.reduce((acc, curr) => acc + curr.students, 0)}</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className={`p-6 rounded-xl shadow-lg border backdrop-blur-sm ${
              theme === 'dark'
                ? 'bg-white/10 border-white/20 hover:bg-white/15'
                : 'bg-white border-gray-200 hover:bg-gray-50'
            } transition-all duration-300`}
          >
            <Clock className={`h-8 w-8 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'} mb-3`} />
            <h3 className={`text-xl font-semibold mb-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-800'
            }`}>Hours/Week</h3>
            <p className={`text-3xl font-bold ${
              theme === 'dark' ? 'text-gray-200' : 'text-gray-900'
            }`}>24</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className={`p-6 rounded-xl shadow-lg border backdrop-blur-sm ${
              theme === 'dark'
                ? 'bg-white/10 border-white/20 hover:bg-white/15'
                : 'bg-white border-gray-200 hover:bg-gray-50'
            } transition-all duration-300`}
          >
            <GraduationCap className={`h-8 w-8 ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'} mb-3`} />
            <h3 className={`text-xl font-semibold mb-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-800'
            }`}>Avg Progress</h3>
            <p className={`text-3xl font-bold ${
              theme === 'dark' ? 'text-gray-200' : 'text-gray-900'
            }`}>{Math.round(mockClasses.reduce((acc, curr) => acc + curr.progress, 0) / mockClasses.length)}%</p>
          </motion.div>
        </div>

        {/* Class Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockClasses.map((classItem) => (
            <motion.div
              key={classItem.id}
              whileHover={{ scale: 1.02 }}
              className={`p-6 rounded-xl shadow-lg border backdrop-blur-sm ${
                theme === 'dark'
                  ? 'bg-white/10 border-white/20 hover:bg-white/15'
                  : 'bg-white border-gray-200 hover:bg-gray-50'
              } transition-all duration-300`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className={`text-xl font-bold ${
                    theme === 'dark' ? 'text-white' : 'text-gray-800'
                  }`}>{classItem.className}</h3>
                  <p className={`text-lg font-semibold ${
                    theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                  }`}>{classItem.subject}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  theme === 'dark' ? 'bg-white/10 text-white' : 'bg-blue-100 text-blue-800'
                }`}>
                  Room {classItem.room}
                </span>
              </div>

              <div className={`mb-4 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                <p className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {classItem.time}
                </p>
                <p className="flex items-center gap-2 mt-1">
                  <Users className="h-4 w-4" />
                  {classItem.students} Students
                </p>
              </div>

              <div className="mb-4">
                <h4 className={`text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>Current Topics</h4>
                <div className="flex flex-wrap gap-2">
                  {classItem.topics.map((topic, index) => (
                    <span
                      key={index}
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        theme === 'dark' 
                          ? 'bg-white/5 text-gray-300' 
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className={`text-sm font-medium ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>Course Progress</span>
                  <span className={`text-sm font-medium ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>{classItem.progress}%</span>
                </div>
                <div className={`h-2 rounded-full ${
                  theme === 'dark' ? 'bg-white/10' : 'bg-gray-200'
                }`}>
                  <div
                    className="h-full rounded-full bg-blue-600"
                    style={{ width: `${classItem.progress}%` }}
                  ></div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );

  return (
    <TeacherLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
      {content}
    </TeacherLayout>
  );
}

export default Classes;