import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Calendar, Users } from 'lucide-react';
import TeacherLayout from '../../components/layouts/TeacherLayout';

function Schedule() {
  const [theme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [scheduleData, setScheduleData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchScheduleData = async () => {
      try {
        // Mock data - replace with actual API call
        const mockData = [
          {
            day: 'Monday',
            classes: [
              { time: '9:00 AM - 10:00 AM', subject: 'Mathematics', class: 'X-A', room: '101' },
              { time: '11:00 AM - 12:00 PM', subject: 'Physics', class: 'XI-B', room: '203' },
            ]
          },
          {
            day: 'Tuesday',
            classes: [
              { time: '10:00 AM - 11:00 AM', subject: 'Chemistry', class: 'XII-A', room: '301' },
              { time: '2:00 PM - 3:00 PM', subject: 'Mathematics', class: 'XI-A', room: '102' },
            ]
          },
          {
            day: 'Wednesday',
            classes: [
              { time: '9:00 AM - 10:00 AM', subject: 'Physics', class: 'X-B', room: '201' },
              { time: '11:00 AM - 12:00 PM', subject: 'Mathematics', class: 'XII-B', room: '103' },
            ]
          }
        ];
        setScheduleData(mockData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching schedule:', error);
        setLoading(false);
      }
    };

    fetchScheduleData();
  }, []);

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
        {/* Enhanced Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent tracking-tight">
            Class Schedule
          </h1>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className={`p-6 rounded-xl shadow-lg border backdrop-blur-sm ${
              theme === 'dark'
                ? 'bg-white/10 border-white/20 hover:bg-white/15'
                : 'bg-white border-gray-200 hover:bg-gray-50'
            } transition-all duration-300`}
          >
            <Clock className={`h-8 w-8 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} mb-3`} />
            <h3 className={`text-xl font-semibold mb-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-800'
            }`}>Today's Classes</h3>
            <p className={`text-3xl font-bold ${
              theme === 'dark' ? 'text-gray-200' : 'text-gray-900'
            }`}>4</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className={`p-6 rounded-xl shadow-lg border backdrop-blur-sm ${
              theme === 'dark'
                ? 'bg-white/10 border-white/20 hover:bg-white/15'
                : 'bg-white border-gray-200 hover:bg-gray-50'
            } transition-all duration-300`}
          >
            <Calendar className={`h-8 w-8 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'} mb-3`} />
            <h3 className={`text-xl font-semibold mb-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-800'
            }`}>Weekly Hours</h3>
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
            <Users className={`h-8 w-8 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'} mb-3`} />
            <h3 className={`text-xl font-semibold mb-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-800'
            }`}>Total Classes</h3>
            <p className={`text-3xl font-bold ${
              theme === 'dark' ? 'text-gray-200' : 'text-gray-900'
            }`}>6</p>
          </motion.div>
        </div>

        {/* Enhanced Schedule Table */}
        <div className="overflow-x-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`rounded-xl border backdrop-blur-sm ${
              theme === 'dark'
                ? 'bg-white/10 border-white/20'
                : 'bg-white border-gray-200'
            }`}
          >
            {scheduleData.map((day, index) => (
              <div key={day.day} className={`${
                index !== 0 ? 'border-t border-white/10' : ''
              }`}>
                <div className={`p-4 ${
                  theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'
                }`}>
                  <h2 className={`text-xl font-bold ${
                    theme === 'dark' ? 'text-white' : 'text-gray-800'
                  }`}>{day.day}</h2>
                </div>
                <div className="p-4 space-y-4">
                  {day.classes.map((classItem, classIndex) => (
                    <motion.div
                      key={classIndex}
                      whileHover={{ scale: 1.01 }}
                      className={`p-5 rounded-xl ${
                        theme === 'dark' 
                          ? 'bg-white/5 hover:bg-white/10' 
                          : 'bg-gray-50 hover:bg-gray-100'
                      } transition-all duration-300`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className={`text-base font-medium ${
                            theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                          }`}>{classItem.time}</p>
                          <h3 className={`text-xl font-bold mt-2 ${
                            theme === 'dark' ? 'text-white' : 'text-gray-800'
                          }`}>{classItem.subject}</h3>
                          <p className={`text-base mt-1 ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            Class {classItem.class} • Room {classItem.room}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <TeacherLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </TeacherLayout>
    );
  }

  return (
    <TeacherLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
      {content}
    </TeacherLayout>
  );
}

export default Schedule; 