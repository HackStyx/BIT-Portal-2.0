import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from "date-fns";
import { Moon, Sun, UserCircle, Camera, LogOut, Check } from "lucide-react";
import { Line, LineChart, ResponsiveContainer } from "recharts";
import { Calendar } from "./components/ui/calendar";
import { TeacherSidebar } from './components/TeacherSidebar';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [attendance, setAttendance] = useState({});
  const [punchInTime, setPunchInTime] = useState(null);
  const [currentYear] = useState(new Date().getFullYear());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

  const years = Array.from({ length: 4 }, (_, i) => currentYear - i);
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const calculateStats = (year, month) => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const currentDate = new Date();
    const isCurrentMonth = year === currentDate.getFullYear() && month === currentDate.getMonth();
    const daysToCount = isCurrentMonth ? currentDate.getDate() : daysInMonth;

    let presentDays = 0;
    let onTimeDays = 0;

    for (let day = 1; day <= daysToCount; day++) {
      const dateKey = `${year}-${month + 1}-${day}`;
      if (attendance[dateKey]) {
        presentDays++;
        if (new Date(attendance[dateKey]).getHours() <= 9) {
          onTimeDays++;
        }
      }
    }

    return {
      onTimePercentage: presentDays ? Math.round((onTimeDays / presentDays) * 100) : 0,
      totalWorkingHours: presentDays * 8,
      totalBreakHours: (presentDays * 1) + ((daysToCount - presentDays) * 9)
    };
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

  const stats = calculateStats(selectedYear, selectedMonth);

  useEffect(() => {
    const fetchTeacherData = async () => {
      try {
        const teacherId = localStorage.getItem('teacherId');
        const token = localStorage.getItem('teacherToken');
        console.log('Teacher ID:', teacherId);

        if (!teacherId || !token) {
          console.log('No teacher credentials found, redirecting to login');
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
        console.log('Fetched data:', data);

        if (data.success) {
          setTeacherData(data.teacher);
        } else {
          throw new Error(data.message || 'Failed to fetch teacher data');
        }
      } catch (error) {
        console.error('Error fetching teacher data:', error);
        setError(error.message || 'Failed to fetch teacher data');
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherData();
  }, [navigate]);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('teacherId');
    localStorage.removeItem('teacherToken');
    navigate('/teacher/login');
  };

  // Add this function to get the appropriate greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  // Add this function to handle profile image upload
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Handle image upload logic here
      console.log('Upload image:', file);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Error: {error}</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!teacherData) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">No teacher data available</div>
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
            type: "tween"
          }}
        >
          <motion.div 
            layout
            className={`border-b mt-3 ${
              theme === 'dark' ? 'border-white/20 bg-[#111111]' : 'border-gray-200 bg-white'
            }`}
          >
            <div className="flex h-16 items-center px-4">
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="flex items-center gap-3"
              >
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
              </motion.div>

              <div className="ml-auto flex items-center gap-4">
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
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Insights</h2>
              <div className="flex items-center gap-4">
                <select 
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    theme === 'dark'
                      ? 'bg-gray-800 border-gray-700 text-white'
                      : 'bg-white border-gray-200 text-gray-800'
                  }`}
                >
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
                <select 
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    theme === 'dark'
                      ? 'bg-gray-800 border-gray-700 text-white'
                      : 'bg-white border-gray-200 text-gray-800'
                  }`}
                >
                  {months.map((month, index) => (
                    <option key={month} value={index}>{month}</option>
                  ))}
                </select>
              </div>
            </div>

            <motion.div 
              layout
              className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
              transition={{
                layout: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }
              }}
            >
              <div className={`p-6 rounded-lg shadow-lg border transition-colors ${
                theme === 'dark'
                  ? 'bg-white/10 border-white/20 text-white'
                  : 'bg-white border-gray-200 text-gray-800'
              }`}>
                <h3 className="text-lg font-semibold mb-2">On Time Percentage</h3>
                <p className="text-sm text-muted-foreground">{months[selectedMonth]}</p>
                <div className="mt-4">
                  <div className="text-3xl font-bold">{stats.onTimePercentage}%</div>
                  <div className="h-[80px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={data}>
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke={theme === 'dark' ? '#8884d8' : '#4f46e5'}
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className={`p-6 rounded-lg shadow-lg border transition-colors ${
                theme === 'dark'
                  ? 'bg-white/10 border-white/20 text-white'
                  : 'bg-white border-gray-200 text-gray-800'
              }`}>
                <h3 className="text-lg font-semibold mb-2">Total Break Hours</h3>
                <p className="text-sm text-muted-foreground">{months[selectedMonth]}</p>
                <div className="mt-4 space-y-1">
                  <div className="text-3xl font-bold">{Math.floor(stats.totalBreakHours)} Hours</div>
                  <div>{Math.floor((stats.totalBreakHours % 1) * 60)} Minutes</div>
                </div>
              </div>

              <div className={`p-6 rounded-lg shadow-lg border transition-colors ${
                theme === 'dark'
                  ? 'bg-white/10 border-white/20 text-white'
                  : 'bg-white border-gray-200 text-gray-800'
              }`}>
                <h3 className="text-lg font-semibold mb-2">Total Working Hours</h3>
                <p className="text-sm text-muted-foreground">{months[selectedMonth]}</p>
                <div className="mt-4 space-y-1">
                  <div className="text-3xl font-bold">{Math.floor(stats.totalWorkingHours)} Hours</div>
                  <div>{Math.floor((stats.totalWorkingHours % 1) * 60)} Minutes</div>
                </div>
              </div>
            </motion.div>

            <motion.div 
              layout
              className="mt-6 grid gap-6 lg:grid-cols-2"
              transition={{
                layout: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }
              }}
            >
              <div className={`p-6 rounded-lg border ${
                theme === 'dark' 
                  ? 'bg-white/10 border-white/20' 
                  : 'bg-white border-gray-200'
              }`}>
                <h3 className="text-lg font-semibold mb-4">Attendance Calendar</h3>
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className={theme === 'dark' ? 'dark-calendar' : ''}
                  components={{
                    DayContent: (props) => {
                      if (!props?.date) return null;

                      const currentDate = props.date;
                      const dateKey = format(currentDate, 'yyyy-M-d');
                      const today = format(new Date(), 'yyyy-M-d');
                      const isPunched = attendance[dateKey];
                      const isToday = dateKey === today;

                      let markerColor = '';
                      if (isPunched) {
                        const punchInHour = new Date(attendance[dateKey]).getHours();
                        if (punchInHour <= 9) {
                          markerColor = 'text-green-500'; // On time
                        } else if (punchInHour <= 12) {
                          markerColor = 'text-yellow-500'; // Late
                        } else {
                          markerColor = 'text-red-500'; // Very late
                        }
                      }

                      return (
                        <div className="relative w-full h-full flex items-center justify-center">
                          <div className={`
                            flex items-center justify-center w-8 h-8 rounded-full
                            ${isToday ? 'bg-blue-600 text-white' : ''}
                          `}>
                            {format(currentDate, 'd')}
                          </div>
                          {isPunched && (
                            <div 
                              className={`absolute -top-1 -right-1 ${markerColor}`}
                              title={format(new Date(attendance[dateKey]), 'hh:mm a')}
                            >
                              <Check size={12} />
                            </div>
                          )}
                        </div>
                      );
                    }
                  }}
                  classNames={{
                    months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                    month: "space-y-4",
                    caption: "flex justify-center pt-1 relative items-center",
                    caption_label: `text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`,
                    nav: "space-x-1 flex items-center",
                    nav_button: `h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 ${
                      theme === 'dark' ? 'text-white' : 'text-gray-800'
                    }`,
                    nav_button_previous: "absolute left-1",
                    nav_button_next: "absolute right-1",
                    table: "w-full border-collapse space-y-1",
                    head_row: "flex",
                    head_cell: `text-muted-foreground rounded-md w-9 font-normal text-[0.8rem] ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`,
                    row: "flex w-full mt-2",
                    cell: `text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent focus-within:relative focus-within:z-20 ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`,
                    day: `h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground ${
                      theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-gray-100'
                    }`,
                    day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                    day_hidden: "invisible",
                  }}
                />
              </div>

              <div className={`p-6 rounded-lg border ${
                theme === 'dark' 
                  ? 'bg-white/10 border-white/20' 
                  : 'bg-white border-gray-200'
              }`}>
                <h3 className="text-lg font-semibold mb-4">Current Time</h3>
                <div className="flex flex-col items-center justify-center">
                  <div className="text-4xl font-bold mb-6">
                    {format(time, "hh:mm:ss a")}
                  </div>
                  <button 
                    onClick={handlePunchIn}
                    disabled={punchInTime && 
                      format(punchInTime, 'yyyy-M-d') === format(new Date(), 'yyyy-M-d')}
                    className={`w-full px-4 py-2 rounded-lg transition-colors ${
                      theme === 'dark'
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    } ${punchInTime && 
                      format(punchInTime, 'yyyy-M-d') === format(new Date(), 'yyyy-M-d') 
                      ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {punchInTime && 
                     format(punchInTime, 'yyyy-M-d') === format(new Date(), 'yyyy-M-d') 
                      ? `Punched In at ${format(punchInTime, 'hh:mm a')}` 
                      : 'Punch In'}
                  </button>
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
