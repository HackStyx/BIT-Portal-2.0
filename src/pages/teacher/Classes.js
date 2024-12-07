import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, BookOpen, Clock, Code, Monitor, Coffee, Database, Terminal, MapPin } from 'lucide-react';
import TeacherLayout from '../../components/layouts/TeacherLayout';

function Classes() {
  const [theme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentDayClasses, setCurrentDayClasses] = useState([]);

  const schedule = {
    SAT: [
      { time: "11:00 AM", title: "Break", type: "break" },
      { time: "1:30 PM", title: "Break", type: "break" },
      { time: "2:00 PM", title: "Teacher's Meeting", location: "Staff Room-505", type: "meeting", icon: <Users className="h-4 w-4" />, topics: ["Weekly Planning", "Student Progress Review"] },
      { time: "3:00 PM", title: "Software Engineering", location: "502", type: "engineering", icon: <Code className="h-4 w-4" />, topics: ["Design Patterns", "SOLID Principles", "Clean Code"] }
    ],
    MON: [
      { time: "9:00 AM", title: "Software Engineering", location: "502", type: "engineering", icon: <Code className="h-4 w-4" />, topics: ["Object-Oriented Design", "UML Diagrams", "Code Review"] },
      { time: "10:00 AM", title: "Electrical Engineering", location: "NMB-301", type: "engineering", icon: <Monitor className="h-4 w-4" />, topics: ["Circuit Analysis", "Digital Logic", "Power Systems"] },
      { time: "11:00 AM", title: "Break", type: "break" },
      { time: "1:30 PM", title: "Break", type: "break" },
      { time: "2:00 PM", title: "Software Engineering", location: "502", type: "engineering", icon: <Code className="h-4 w-4" />, topics: ["Agile Methodologies", "Scrum Practices"] },
      { time: "3:00 PM", title: "Electrical Engineering", location: "NMB-301", type: "engineering", icon: <Monitor className="h-4 w-4" />, topics: ["Signal Processing", "Microcontrollers"] }
    ],
    TUE: [
      { time: "9:00 AM", title: "Operating System Lab", location: "526", type: "lab", icon: <Monitor className="h-4 w-4" />, topics: ["Process Management", "Memory Allocation"] },
      { time: "11:00 AM", title: "Break", type: "break" },
      { time: "12:30 PM", title: "Software Engineering", location: "511", type: "engineering", icon: <Code className="h-4 w-4" />, topics: ["Version Control", "Git Workflows"] },
      { time: "1:30 PM", title: "Break", type: "break" },
      { time: "2:00 PM", title: "C Programming Lab", location: "518", type: "lab", icon: <Code className="h-4 w-4" />, topics: ["Pointers", "Data Structures"] }
    ],
    WED: [
      { time: "9:00 AM", title: "Coffee Chat", type: "chat", icon: <Coffee className="h-4 w-4" />, topics: ["Networking", "Team Building"] },
      { time: "11:00 AM", title: "Break", type: "break" },
      { time: "1:30 PM", title: "Break", type: "break" }
    ],
    THU: [
      { time: "11:00 AM", title: "Break", type: "break" },
      { time: "12:30 PM", title: "Design Review", type: "engineering", icon: <BookOpen className="h-4 w-4" />, topics: ["UI/UX Principles", "User Feedback"] },
      { time: "1:30 PM", title: "Break", type: "break" }
    ],
    FRI: [
      { time: "10:00 AM", title: "Electrical Engineering", location: "NMB-301", type: "engineering", icon: <Monitor className="h-4 w-4" />, topics: ["Electromagnetism", "Control Systems"] },
      { time: "11:00 AM", title: "Break", type: "break" },
      { time: "12:30 PM", title: "Data Visualization", location: "511", type: "engineering", icon: <Database className="h-4 w-4" />, topics: ["Charts", "Graphs", "Dashboards"] },
      { time: "1:30 PM", title: "Break", type: "break" },
      { time: "2:00 PM", title: "Teacher's Meeting", location: "Staff Room-505", type: "meeting", icon: <Users className="h-4 w-4" />, topics: ["Curriculum Updates", "Student Issues"] },
      { time: "3:00 PM", title: "Python Lab", location: "518", type: "lab", icon: <Terminal className="h-4 w-4" />, topics: ["Data Analysis", "Machine Learning"] }
    ],
    SUN: []
  };

  useEffect(() => {
    const currentDay = new Date().toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
    setCurrentDayClasses(schedule[currentDay] || []);
  }, []);

  const content = (
    <motion.div 
      className="flex-1 p-8"
      initial={false}
      animate={{ marginLeft: sidebarOpen ? "240px" : "80px" }}
      transition={{ duration: 0.3 }}
    >
      {/* Today's Schedule Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
          Today's Classes
        </h1>
        <p className={`mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Class Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentDayClasses.map((classItem, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.05 }}
            className={`p-4 rounded-lg border shadow-md ${
              theme === 'dark'
                ? 'bg-white/10 border-white/20 hover:bg-white/20'
                : 'bg-white border-gray-200 hover:bg-gray-100'
            } transition-all duration-300 flex flex-col`}
          >
            {/* Time Badge */}
            <div className="flex items-center justify-between mb-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                theme === 'dark' ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-600'
              }`}>
                {classItem.time}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                getTypeColor(classItem.type, theme)
              }`}>
                {classItem.type}
              </span>
            </div>

            {/* Class Title and Icon */}
            <div className="flex items-start justify-between mb-2">
              <h3 className={`text-lg font-bold ${
                theme === 'dark' ? 'text-white' : 'text-gray-800'
              }`}>
                {classItem.title}
              </h3>
              {classItem.icon && (
                <div className={`p-2 rounded-full ${
                  theme === 'dark' ? 'bg-white/10' : 'bg-gray-100'
                }`}>
                  {classItem.icon}
                </div>
              )}
            </div>

            {/* Location */}
            {classItem.location && (
              <p className={`flex items-center mb-2 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                <MapPin className="w-4 h-4 mr-1" />
                {classItem.location}
              </p>
            )}

            {/* Topics */}
            {classItem.topics && (
              <div className="mt-auto">
                <h4 className={`text-xs font-medium mb-1 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Today's Topics
                </h4>
                <div className="flex flex-wrap gap-1">
                  {classItem.topics.map((topic, idx) => (
                    <span
                      key={idx}
                      className={`px-2 py-1 rounded-full text-xs ${
                        theme === 'dark'
                          ? 'bg-white/5 text-gray-300'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );

  return (
    <TeacherLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
      {content}
    </TeacherLayout>
  );
}

// Helper function for type colors
const getTypeColor = (type, theme) => {
  const colors = {
    meeting: theme === 'dark' ? 'bg-purple-500/20 text-purple-300' : 'bg-purple-100 text-purple-600',
    engineering: theme === 'dark' ? 'bg-green-500/20 text-green-300' : 'bg-green-100 text-green-600',
    lab: theme === 'dark' ? 'bg-yellow-500/20 text-yellow-300' : 'bg-yellow-100 text-yellow-600',
    break: theme === 'dark' ? 'bg-gray-500/20 text-gray-300' : 'bg-gray-100 text-gray-600',
    chat: theme === 'dark' ? 'bg-pink-500/20 text-pink-300' : 'bg-pink-100 text-pink-600'
  };
  return colors[type] || colors.break;
};

export default Classes;