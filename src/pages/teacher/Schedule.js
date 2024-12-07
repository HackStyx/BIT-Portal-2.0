import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Calendar, Users, Code, Monitor, Coffee, BookOpen, Database, Terminal, MapPin } from 'lucide-react';
import TeacherLayout from '../../components/layouts/TeacherLayout';

const dayColors = {
  SUN: {
    bg: 'bg-rose-900/50',
    gradient: 'from-rose-900/30 to-rose-800/20',
    text: 'text-rose-300'
  },
  MON: {
    bg: 'bg-blue-900/50',
    gradient: 'from-blue-900/30 to-blue-800/20',
    text: 'text-blue-300'
  },
  TUE: {
    bg: 'bg-purple-900/50',
    gradient: 'from-purple-900/30 to-purple-800/20',
    text: 'text-purple-300'
  },
  WED: {
    bg: 'bg-green-900/50',
    gradient: 'from-green-900/30 to-green-800/20',
    text: 'text-green-300'
  },
  THU: {
    bg: 'bg-yellow-900/50',
    gradient: 'from-yellow-900/30 to-yellow-800/20',
    text: 'text-yellow-300'
  },
  FRI: {
    bg: 'bg-indigo-900/50',
    gradient: 'from-indigo-900/30 to-indigo-800/20',
    text: 'text-indigo-300'
  },
  SAT: {
    bg: 'bg-gray-900/50',
    gradient: 'from-gray-900/30 to-gray-800/20',
    text: 'text-gray-300'
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
        const updatedScheduleData = [
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
          {
            day: "SAT",
            classes: [
              { time: "11:00 AM", subject: "Break", type: "break" },
              { time: "1:30 PM", subject: "Break", type: "break" },
              { time: "2:00 PM", subject: "Teacher's Meeting", location: "Staff Room-505", type: "meeting", icon: <Users className="h-4 w-4" /> },
              { time: "3:00 PM", subject: "Software Engineering", location: "502", type: "engineering", icon: <Code className="h-4 w-4" /> }
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

  const getTypeStyles = (type) => {
    const styles = {
      break: theme === 'dark' 
        ? 'bg-gray-900/60 text-gray-300 border border-gray-800/70'
        : 'bg-gray-100 text-gray-600 border border-gray-200',
      meeting: theme === 'dark'
        ? 'bg-purple-900/60 text-purple-300 border border-purple-800/70'
        : 'bg-purple-100 text-purple-600 border border-purple-200',
      engineering: theme === 'dark'
        ? 'bg-green-900/60 text-green-300 border border-green-800/70'
        : 'bg-green-100 text-green-600 border border-green-200',
      lab: theme === 'dark'
        ? 'bg-yellow-900/60 text-yellow-300 border border-yellow-800/70'
        : 'bg-yellow-100 text-yellow-600 border border-yellow-200',
      chat: theme === 'dark'
        ? 'bg-pink-900/60 text-pink-300 border border-pink-800/70'
        : 'bg-pink-100 text-pink-600 border border-pink-200'
    };
    return styles[type] || styles.break;
  };

  const renderTable = () => (
    <div className={`w-full overflow-x-auto rounded-lg shadow-2xl border ${
      theme === 'dark' 
        ? 'bg-gray-900 border-gray-800' 
        : 'bg-white border-gray-200'
    }`}>
      <table className={`w-full min-w-[800px] divide-y ${
        theme === 'dark' ? 'divide-gray-800' : 'divide-gray-200'
      } bg-transparent transition-colors duration-200`}>
        <thead>
          <tr>
            {scheduleData.map((day) => (
              <th 
                key={day.day} 
                className={`sticky top-0 py-4 px-6 text-sm font-semibold tracking-wider
                  ${dayColors[day.day].bg} ${dayColors[day.day].gradient} 
                  ${theme === 'dark' ? dayColors[day.day].text : 'text-gray-800'}
                  transition-all duration-200 ease-in-out
                `}
              >
                <div className="flex items-center justify-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {day.day}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 8 }).map((_, rowIndex) => (
            <tr 
              key={rowIndex} 
              className={`hover:bg-gray-800/50 transition-colors duration-150 ${
                theme === 'dark' ? 'hover:bg-gray-800/50' : 'hover:bg-gray-50'
              }`}
            >
              {scheduleData.map((day) => (
                <td 
                  key={day.day} 
                  className={`py-3 px-4 transition-all duration-200 ${
                    theme === 'dark' ? 'bg-gray-900' : 'bg-white'
                  }`}
                >
                  {day.classes[rowIndex] ? (
                    <div 
                      className={`
                        p-3 rounded-lg shadow-md
                        ${getTypeStyles(day.classes[rowIndex].type)}
                        transform hover:scale-105 transition-all duration-200
                        hover:shadow-xl
                      `}
                    >
                      <div className="flex items-center justify-center gap-2 font-semibold mb-1">
                        <Clock className="h-4 w-4" />
                        {day.classes[rowIndex].time}
                      </div>
                      <div className="font-medium text-center">
                        {day.classes[rowIndex].subject}
                      </div>
                      {day.classes[rowIndex].location && (
                        <div className="flex items-center justify-center gap-1 mt-1 text-sm text-gray-400">
                          <MapPin className="h-3 w-3" />
                          {day.classes[rowIndex].location}
                        </div>
                      )}
                      {day.classes[rowIndex].icon && (
                        <div className="mt-2 flex justify-center text-gray-500">
                          {day.classes[rowIndex].icon}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className={`text-center ${
                      theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
                    }`}>-</div>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <TeacherLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
      <div className={`
        min-h-screen
        transition-all duration-300 ease-in-out
        p-4 md:p-6 lg:p-8
        ${sidebarOpen ? 'ml-64' : 'ml-16'}
        ${sidebarOpen ? 'w-[calc(100%-16rem)]' : 'w-[calc(100%-4rem)]'}
        ${theme === 'dark' ? 'bg-[#111111]' : 'bg-gray-50'}
      `}>
        <h1 className={`text-2xl md:text-3xl font-bold mb-6 ${
          theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
        }`}>
          Class Schedule
        </h1>
        <div className={`rounded-xl shadow-2xl p-4 
          transition-all duration-200 overflow-hidden border
          ${theme === 'dark' 
            ? 'bg-gray-900 border-gray-800' 
            : 'bg-white border-gray-200'
          }`}>
          {loading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="max-w-full overflow-x-auto">
              {renderTable()}
            </div>
          )}
        </div>
      </div>
    </TeacherLayout>
  );
}

export default Schedule;