import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, isSameDay, parseISO } from "date-fns";
import { Moon, Sun, UserCircle, Camera, LogOut, Check } from "lucide-react";
import { Line, LineChart, ResponsiveContainer } from "recharts";
import { CustomCalendar } from './components/ui/calendar';
import { motion, AnimatePresence } from 'framer-motion';
import { TeacherSidebar } from './components/TeacherSidebar';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const data = [
  { name: "Jan", value: 60 },
  { name: "Feb", value: 65 },
  { name: "Mar", value: 58 },
];

function TeacherDashboard() {
  const [teacherData, setTeacherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileRef = useRef(null);
  const [currentYear] = useState(new Date().getFullYear());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [stats, setStats] = useState({
    onTimePercentage: 0,
    totalWorkingHours: 0,
    totalBreakHours: 0,
  });
  const [attendance, setAttendance] = useState([]);
  const [punchInTime, setPunchInTime] = useState(null);

  const years = Array.from({ length: 4 }, (_, i) => currentYear - i);
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  useEffect(() => {
    const fetchStats = async () => {
      const newStats = await calculateStats(selectedYear, selectedMonth);
      setStats(newStats);
    };

    fetchStats();
  }, [selectedYear, selectedMonth]);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchTeacherData = async () => {
      try {
        const teacherId = localStorage.getItem('teacherId');
        const token = localStorage.getItem('teacherToken');

        if (!teacherId || !token) {
          navigate('/teacher/login');
          return;
        }

        const response = await fetch(`http://localhost:${process.env.REACT_APP_SERVER_PORT}/api/auth/teacher/data/${teacherId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();

        if (data.success) {
          setTeacherData(data.teacher);
          setAttendance(data.teacher.attendance || []);
        } else {
          throw new Error(data.message || 'Failed to fetch teacher data');
        }
      } catch (error) {
        setError(error.message || 'Failed to fetch teacher data');
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherData();
  }, []);

  const calculateStats = async (year, month) => {
    try {
      const teacherId = localStorage.getItem('teacherId');
      const token = localStorage.getItem('teacherToken');

      if (!teacherId || !token) {
        return { onTimePercentage: 0, totalWorkingHours: 0, totalBreakHours: 0 };
      }

      const response = await fetch(
        `http://localhost:${process.env.REACT_APP_SERVER_PORT}/api/teacher/attendance/${teacherId}?month=${month + 1}&year=${year}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setAttendanceHistory(data.attendance);
        return {
          onTimePercentage: parseFloat(data.stats.onTimePercentage),
          totalWorkingHours: data.stats.totalWorkingHours,
          totalBreakHours: data.stats.totalBreakHours,
        };
      }

      return { onTimePercentage: 0, totalWorkingHours: 0, totalBreakHours: 0 };
    } catch {
      return { onTimePercentage: 0, totalWorkingHours: 0, totalBreakHours: 0 };
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('teacherId');
    localStorage.removeItem('teacherToken');
    navigate('/teacher/login');
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const handlePunchIn = () => {
    const now = new Date();
    const dateKey = format(now, 'yyyy-M-d');
    
    if (!attendance[dateKey]) {
      setAttendance(prev => ({
        ...prev,
        [dateKey]: now
      }));
      setPunchInTime(now);
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log('Upload image:', file);
    }
  };

  const AttendanceHistorySection = () => (
    <div className={`p-6 rounded-lg border ${
      theme === 'dark' ? 'bg-white/10 border-white/20' : 'bg-gray-50 border-gray-100'
    }`}>
      <h3 className="text-lg font-semibold mb-4">Recent Attendance History</h3>
      <div className="space-y-3">
        {attendanceHistory.map((record, index) => (
          <div
            key={record._id || index}
            className={`p-4 rounded-lg border transition-all hover:scale-[1.02] ${
              theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-100'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`w-2 h-2 rounded-full ${
                  record.status === 'present' ? 'bg-green-500' :
                  record.status === 'late' ? 'bg-yellow-500' : 'bg-red-500'
                }`} />
                <div>
                  <div className="font-medium">
                    {new Date(record.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                  <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {record.status === 'absent' ? 'Absent' : `${record.checkIn} - ${record.checkOut}`}
                  </div>
                </div>
              </div>
              {record.status !== 'absent' && (
                <div className="text-right">
                  <div className="font-medium">
                    {record.workingHours.toFixed(1)} hrs
                  </div>
                  <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {record.breakTime} hr break
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${
      theme === 'dark' ? 'bg-[#111111] text-white' : 'bg-gray-50 text-gray-800'
    }`}>
      <div className="flex">
        <TeacherSidebar
          open={sidebarOpen}
          setOpen={setSidebarOpen}
          onLogout={handleLogout}
          theme={theme}
          teacherName={teacherData?.name}
        />

        <motion.div
          className="flex-1"
          animate={{
            marginLeft: sidebarOpen ? "240px" : "80px",
          }}
          transition={{
            duration: 0.5,
            ease: [0.25, 0.1, 0.25, 1],
            type: "tween",
          }}
        >
          <motion.div
            layout
            className={`border-b mt-3 ${
              theme === 'dark' ? 'border-white/20 bg-[#111111]' : 'border-gray-200 bg-white'
            }`}
          >
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <span className={`text-3xl ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {getGreeting()},
                </span>
                <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {teacherData?.name?.split(' ')[0]}
                </span>
                <span className={`text-lg ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  👋
                </span>
              </div>

              <div className="flex items-center gap-4">
                <button
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                    theme === 'dark' 
                      ? 'text-white hover:bg-white/20'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  onClick={() => {
                    const newTheme = theme === "light" ? "dark" : "light";
                    setTheme(newTheme);
                    localStorage.setItem('theme', newTheme);
                  }}
                >
                  {theme === "light" ? <Moon className="h-6 w-6" /> : <Sun className="h-6 w-6" />}
                </button>

                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                      theme === 'dark' 
                        ? 'bg-white/10 text-white hover:bg-white/20'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {teacherData?.profileImage ? (
                      <img 
                        src={teacherData.profileImage} 
                        alt="Profile"
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <UserCircle className="h-7 w-7" />
                    )}
                  </button>

                  <AnimatePresence>
                    {showProfileMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className={`absolute right-0 mt-2 w-72 rounded-lg shadow-lg border ${
                          theme === 'dark' 
                            ? 'bg-[#1a1a1a] border-white/20' 
                            : 'bg-white border-gray-200'
                        }`}
                      >
                        <div className="p-4">
                          <div className="flex flex-col items-center">
                            <div className="relative group">
                              {teacherData?.profileImage ? (
                                <img 
                                  src={teacherData.profileImage} 
                                  alt="Profile"
                                  className="w-20 h-20 rounded-full object-cover border-2 border-blue-500"
                                />
                              ) : (
                                <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
                                  theme === 'dark' ? 'bg-white/10' : 'bg-gray-100'
                                }`}>
                                  <UserCircle className="h-12 w-12" />
                                </div>
                              )}
                              
                              {/* Camera Icon Overlay */}
                              <label className={`absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer ${
                                theme === 'dark' ? 'bg-white/20 hover:bg-white/30' : 'bg-gray-100 hover:bg-gray-200'
                              }`}>
                                <Camera className="h-4 w-4" />
                                <input 
                                  type="file" 
                                  className="hidden" 
                                  accept="image/*"
                                  onChange={handleImageUpload}
                                />
                              </label>
                            </div>

                            <h3 className={`mt-4 text-lg font-semibold ${
                              theme === 'dark' ? 'text-white' : 'text-gray-900'
                            }`}>
                              {teacherData?.name}
                            </h3>
                            <p className={`text-sm ${
                              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              {teacherData?.email}
                            </p>
                          </div>

                          <div className={`mt-4 pt-4 border-t ${
                            theme === 'dark' ? 'border-white/10' : 'border-gray-100'
                          }`}>
                            <div className="space-y-1">
                              <div className={`px-3 py-2 text-sm ${
                                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                              }`}>
                                <div>Department: {teacherData?.department || 'N/A'}</div>
                                <div>Employee ID: {teacherData?.employeeId || 'N/A'}</div>
                                <div>Contact: {teacherData?.phone || 'N/A'}</div>
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={handleLogout}
                            className={`mt-4 w-full px-3 py-2 text-sm rounded-md flex items-center gap-2 transition-colors ${
                              theme === 'dark'
                                ? 'text-red-400 hover:bg-white/10'
                                : 'text-red-600 hover:bg-gray-100'
                            }`}
                          >
                            <LogOut className="h-4 w-4" />
                            <span>Sign out</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.main
            layout
            className="flex-1 p-6"
            transition={{
              layout: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }
            }}
          >
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div className={`p-6 rounded-lg shadow-lg border ${
                theme === 'dark' ? 'bg-white/10 border-white/20 text-white' : 'bg-white border-gray-200 text-gray-800'
              }`}>
                <h3 className="text-lg font-semibold mb-2">On Time Percentage</h3>
                <div className="text-3xl font-bold">{stats.onTimePercentage}%</div>
              </div>

              <div className={`p-6 rounded-lg shadow-lg border ${
                theme === 'dark' ? 'bg-white/10 border-white/20 text-white' : 'bg-white border-gray-200 text-gray-800'
              }`}>
                <h3 className="text-lg font-semibold mb-2">Total Working Hours</h3>
                <div className="text-3xl font-bold">{Math.floor(stats.totalWorkingHours)} hrs</div>
              </div>

              <div className={`p-6 rounded-lg shadow-lg border ${
                theme === 'dark' ? 'bg-white/10 border-white/20 text-white' : 'bg-white border-gray-200 text-gray-800'
              }`}>
                <h3 className="text-lg font-semibold mb-2">Total Break Hours</h3>
                <div className="text-3xl font-bold">{Math.floor(stats.totalBreakHours)} hrs</div>
              </div>
            </div>

            <motion.div
              layout
              className="mt-6 flex"
              transition={{
                layout: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }
              }}
            >
              <div className="flex-1">
                <AttendanceHistorySection />
              </div>
              <div className="w-1/3 p-6">
                <div className={`p-6 rounded-lg shadow-lg border ${
                  theme === 'dark' ? 'bg-white/10 border-white/20 text-white' : 'bg-white border-gray-200 text-gray-800'
                }`}>
                  <h3 className="text-lg font-semibold mb-4">Current Time</h3>
                  <div className="text-4xl font-bold mb-2">
                    {format(time, "hh:mm:ss a")}
                  </div>
                  <div className="text-lg">
                    {format(time, "EEEE, MMMM d, yyyy")}
                  </div>
                </div>
                <div className={`mt-6 p-6 rounded-lg shadow-lg border ${
                  theme === 'dark' ? 'bg-white/10 border-white/20 text-white' : 'bg-white border-gray-200 text-gray-800'
                }`}>
                  <h3 className="text-lg font-semibold mb-4">Calendar</h3>
                  <CustomCalendar date={date} setDate={setDate} theme={theme} />
                </div>
              </div>
            </motion.div>
          </motion.main>
        </motion.div>
      </div>
    </div>
  );
}

export default TeacherDashboard;
