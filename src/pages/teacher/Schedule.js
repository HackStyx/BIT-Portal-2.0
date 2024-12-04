import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Calendar, Users, Code, Monitor, Coffee, BookOpen, Database, Terminal, MapPin } from 'lucide-react';
import TeacherLayout from '../../components/layouts/TeacherLayout';

const dayColors = {
  SUN: {
    bg: 'bg-rose-500',
    gradient: 'from-rose-500/10 to-orange-500/10',
    text: 'text-rose-500'
  },
  MON: {
    bg: 'bg-blue-500',
    gradient: 'from-blue-500/10 to-cyan-500/10',
    text: 'text-blue-500'
  },
  TUE: {
    bg: 'bg-purple-500',
    gradient: 'from-purple-500/10 to-pink-500/10',
    text: 'text-purple-500'
  },
  WED: {
    bg: 'bg-green-500',
    gradient: 'from-green-500/10 to-emerald-500/10',
    text: 'text-green-500'
  },
  THU: {
    bg: 'bg-yellow-500',
    gradient: 'from-yellow-500/10 to-amber-500/10',
    text: 'text-yellow-500'
  },
  FRI: {
    bg: 'bg-indigo-500',
    gradient: 'from-indigo-500/10 to-violet-500/10',
    text: 'text-indigo-500'
  },
  SAT: {
    bg: 'bg-gray-500',
    gradient: 'from-gray-500/10 to-slate-500/10',
    text: 'text-gray-500'
  }
};

function Schedule() {
  const [theme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [scheduleData, setScheduleData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchScheduleData = async () => {
      try {
        // Updated schedule data
        const updatedScheduleData = [
          {
            day: "SUN",
            classes: [
              { time: "11:00 AM", subject: "Break", type: "break" },
              { time: "1:30 PM", subject: "Break", type: "break" },
              { time: "2:00 PM", subject: "Teacher's Meeting", location: "Staff Room-505", type: "meeting", icon: <Users className="h-4 w-4" /> },
              { time: "3:00 PM", subject: "Software Engineering", location: "502", type: "engineering", icon: <Code className="h-4 w-4" /> }
            ]
          },
          {
            day: "MON",
            classes: [
              { time: "9:00 AM", subject: "Software Engineering", location: "502", type: "engineering", icon: <Code className="h-4 w-4" /> },
              { time: "10:00 AM", subject: "Electrical Engineering", location: "NMB-301", type: "engineering", icon: <Monitor className="h-4 w-4" /> },
              { time: "11:00 AM", subject: "Break", type: "break" },
              { time: "1:30 PM", subject: "Break", type: "break" },
              { time: "2:00 PM", subject: "Software Engineering", location: "502", type: "engineering", icon: <Code className="h-4 w-4" /> },
              { time: "3:00 PM", subject: "Electrical Engineering", location: "NMB-301", type: "engineering", icon: <Monitor className="h-4 w-4" /> }
            ]
          },
          {
            day: "TUE",
            classes: [
              { time: "9:00 AM", subject: "Operating System Lab", location: "526", type: "lab", icon: <Monitor className="h-4 w-4" /> },
              { time: "11:00 AM", subject: "Break", type: "break" },
              { time: "12:30 PM", subject: "Software Engineering", location: "511", type: "engineering", icon: <Code className="h-4 w-4" /> },
              { time: "1:30 PM", subject: "Break", type: "break" },
              { time: "2:00 PM", subject: "C Programming Lab", location: "518", type: "lab", icon: <Code className="h-4 w-4" /> }
            ]
          },
          {
            day: "WED",
            classes: [
              { time: "9:00 AM", subject: "Coffee Chat", type: "chat", icon: <Coffee className="h-4 w-4" /> },
              { time: "11:00 AM", subject: "Break", type: "break" },
              { time: "1:30 PM", subject: "Break", type: "break" }
            ]
          },
          {
            day: "THU",
            classes: [
              { time: "11:00 AM", subject: "Break", type: "break" },
              { time: "12:30 PM", subject: "Design Review", type: "engineering", icon: <BookOpen className="h-4 w-4" /> },
              { time: "1:30 PM", subject: "Break", type: "break" }
            ]
          },
          {
            day: "FRI",
            classes: [
              { time: "10:00 AM", subject: "Electrical Engineering", location: "NMB-301", type: "engineering", icon: <Monitor className="h-4 w-4" /> },
              { time: "11:00 AM", subject: "Break", type: "break" },
              { time: "12:30 PM", subject: "Data Visualization", location: "511", type: "engineering", icon: <Database className="h-4 w-4" /> },
              { time: "1:30 PM", subject: "Break", type: "break" },
              { time: "2:00 PM", subject: "Teacher's Meeting", location: "Staff Room-505", type: "meeting", icon: <Users className="h-4 w-4" /> },
              { time: "3:00 PM", subject: "Python Lab", location: "518", type: "lab", icon: <Terminal className="h-4 w-4" /> }
            ]
          },
        ];
        setScheduleData(updatedScheduleData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching schedule:', error);
        setLoading(false);
      }
    };

    fetchScheduleData();
  }, []);

  const getTypeStyles = (type, theme) => {
    const styles = {
      break: theme === 'dark' 
        ? 'bg-gray-500/20 text-gray-300' 
        : 'bg-gray-100 text-gray-600',
      meeting: theme === 'dark'
        ? 'bg-purple-500/20 text-purple-300'
        : 'bg-purple-100 text-purple-600',
      engineering: theme === 'dark'
        ? 'bg-green-500/20 text-green-300'
        : 'bg-green-100 text-green-600',
      lab: theme === 'dark'
        ? 'bg-yellow-500/20 text-yellow-300'
        : 'bg-yellow-100 text-yellow-600',
      chat: theme === 'dark'
        ? 'bg-pink-500/20 text-pink-300'
        : 'bg-pink-100 text-pink-600'
    };
    return styles[type] || styles.break;
  };

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
              <div key={day.day} className="mb-8 last:mb-0">
                <div className={`flex items-center gap-4 mb-4`}>
                  <div className={`flex flex-col items-center justify-center w-16 h-16 rounded-2xl ${dayColors[day.day].bg} ${theme === 'dark' ? 'bg-opacity-20' : 'bg-opacity-10'}`}>
                    <span className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : dayColors[day.day].text}`}>
                      {day.day}
                    </span>
                  </div>
                  <div className="h-0.5 flex-1 bg-gradient-to-r opacity-20 rounded-full" 
                       style={{
                         background: `linear-gradient(to right, ${theme === 'dark' ? 'white' : 'black'}, transparent)`
                       }}
                  />
                </div>
                
                <div className="space-y-4">
                  {day.classes.map((classItem, classIndex) => (
                    <motion.div
                      key={classIndex}
                      whileHover={{ scale: 1.01 }}
                      className={`p-5 rounded-xl border ${
                        theme === 'dark' 
                          ? 'bg-white/5 hover:bg-white/10 border-white/10' 
                          : 'bg-white hover:bg-gray-50 border-gray-100'
                      } transition-all duration-300 shadow-lg`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <span className={`px-3 py-1.5 rounded-lg font-medium ${
                              theme === 'dark' 
                                ? 'bg-white/10 text-white' 
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {classItem.time}
                            </span>
                            {classItem.type && (
                              <span className={`text-xs font-medium px-2.5 py-1 rounded-lg ${
                                getTypeStyles(classItem.type, theme)
                              }`}>
                                {classItem.type}
                              </span>
                            )}
                          </div>
                          <h3 className={`text-lg font-semibold mt-3 ${
                            theme === 'dark' ? 'text-white' : 'text-gray-800'
                          }`}>
                            {classItem.subject}
                          </h3>
                          {classItem.location && (
                            <p className={`flex items-center mt-2 ${
                              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              <MapPin className="w-4 h-4 mr-1.5" />
                              {classItem.location}
                            </p>
                          )}
                        </div>
                        {classItem.icon && (
                          <div className={`p-3 rounded-xl ${
                            theme === 'dark' 
                              ? 'bg-white/10' 
                              : 'bg-gray-100'
                          }`}>
                            {classItem.icon}
                          </div>
                        )}
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