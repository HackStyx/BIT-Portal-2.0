import React, { useState, useEffect, useRef } from 'react';
import { AdminSidebar } from '../components/AdminSidebar';
import { Bell, Search, Moon, Sun } from 'lucide-react';
import { Line, LineChart, ResponsiveContainer, XAxis, Tooltip } from "recharts";
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import { format } from 'date-fns';

// Function to generate graph data
const generateGraphData = (total, change, isActiveUsers = false) => {
  const months = 6; // Show last 6 months
  const data = [];
  const today = new Date();
  
  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const monthName = date.toLocaleString('default', { month: 'short' });
    
    if (isActiveUsers) {
      // For active users, show 0 for past months and current total for this month
      if (i === 0) {
        // Current month - use actual total
        data.push({ name: monthName, value: total });
      } else {
        // Previous months - show as 0
        data.push({ name: monthName, value: 0 });
      }
    } else {
      // Original logic for other stats
      let currentValue = total - (change * 3); // Start from a lower value
      const fluctuation = Math.floor((Math.random() - 0.5) * 0.2 * total);
      
      if (i === 0) {
        // Current month - use actual total
        data.push({ name: monthName, value: total });
      } else if (i === 1) {
        // Last month - use total minus change
        data.push({ name: monthName, value: total - change });
      } else {
        // Previous months - show gradual growth/decline with random fluctuations
        currentValue = Math.max(0, currentValue + fluctuation);
        data.push({ name: monthName, value: Math.round(currentValue) });
      }
    }
  }
  
  return data;
};

function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [recentStudents, setRecentStudents] = useState([]);
  const [recentTeachers, setRecentTeachers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [open, setOpen] = useState(false);
  const profileRef = useRef(null);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalCourses: 24,
    activeUsers: 0,
    newStudentsThisMonth: 0,
    newTeachersThisMonth: 0
  });
  const [socket, setSocket] = useState(null);
  const [realTimeStats, setRealTimeStats] = useState({
    activeStudents: 0,
    activeTeachers: 0,
    totalActive: 0
  });
  const [showNotifications, setShowNotifications] = useState(false);
  const [lastLogin, setLastLogin] = useState(null);
  const notificationRef = useRef(null);

  const adminName = localStorage.getItem('adminName') || 'Admin';
  const baseURL = process.env.REACT_APP_SERVER_PORT 
    ? `http://localhost:${process.env.REACT_APP_SERVER_PORT}/api`
    : 'http://localhost:5000/api';

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  // Modified auth check
  useEffect(() => {
    const checkAuth = () => {
      const adminToken = localStorage.getItem('adminToken');
      if (!adminToken) {
        navigate('/admin/login', { 
          replace: true,
          state: { from: 'dashboard' }
        });
      }
    };
    checkAuth();
  }, [navigate]);

  // Click outside handler
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const baseURL = 'http://localhost:5000';

        const [studentsResponse, teachersResponse] = await Promise.all([
          fetch(`${baseURL}/api/auth/students`, {
            headers: {
              'Authorization': token,
              'Content-Type': 'application/json'
            }
          }),
          fetch(`${baseURL}/api/auth/admin/teachers`, {
            headers: {
              'Authorization': token,
              'Content-Type': 'application/json'
            }
          })
        ]);

        let studentsData = await studentsResponse.json();
        let teachersData = await teachersResponse.json();

        console.log('Students Data:', studentsData);
        console.log('Teachers Data:', teachersData);

        const students = studentsData.students || [];
        const teachers = teachersData.teachers || [];

        // Get recent students (last 5)
        const recentStudents = students
          .sort((a, b) => new Date(b.createdAt || new Date()) - new Date(a.createdAt || new Date()))
          .slice(0, 5);

        // Get recent teachers (last 5)
        const recentTeachers = teachers
          .sort((a, b) => new Date(b.createdAt || new Date()) - new Date(a.createdAt || new Date()))
          .slice(0, 5);

        setRecentStudents(recentStudents);
        setRecentTeachers(recentTeachers);
        
        setStats({
          totalStudents: students.length,
          totalTeachers: teachers.length,
          totalCourses: 24,
          activeUsers: students.length + teachers.length,
          newStudentsThisMonth: students.filter(student => {
            const createdAt = new Date(student.createdAt?.$date || student.createdAt);
            const startOfMonth = new Date();
            startOfMonth.setDate(1);
            startOfMonth.setHours(0, 0, 0, 0);
            return createdAt >= startOfMonth;
          }).length,
          newTeachersThisMonth: teachers.filter(teacher => {
            const createdAt = new Date(teacher.createdAt?.$date || teacher.createdAt);
            const startOfMonth = new Date();
            startOfMonth.setDate(1);
            startOfMonth.setHours(0, 0, 0, 0);
            return createdAt >= startOfMonth;
          }).length
        });

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Update Socket.IO connection effect
  useEffect(() => {
    const newSocket = io('http://localhost:5000', {
      withCredentials: true
    });

    newSocket.on('connect', () => {
      console.log('Connected to WebSocket server');
      // Identify as admin
      newSocket.emit('userConnected', {
        userType: 'admin',
        userId: localStorage.getItem('adminToken')
      });
    });

    newSocket.on('activeUsers', (data) => {
      console.log('Received active users update:', data); // Debug log
      setRealTimeStats({
        activeStudents: data.students,
        activeTeachers: data.teachers,
        totalActive: data.total
      });
    });

    setSocket(newSocket);

    return () => {
      if (newSocket) newSocket.disconnect();
    };
  }, []);

  // Add click outside handler for notifications
  useEffect(() => {
    function handleClickOutside(event) {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Update effect to get last login time
  useEffect(() => {
    const lastLoginTime = localStorage.getItem('adminLastLogin');
    if (lastLoginTime) {
      setLastLogin(new Date(lastLoginTime));
    } else {
      // If no last login time exists, set current time
      const currentTime = new Date();
      localStorage.setItem('adminLastLogin', currentTime.toISOString());
      setLastLogin(currentTime);
    }
  }, []);

  const handleLogout = () => {
    // Store current time as last login before logging out
    localStorage.setItem('adminLastLogin', new Date().toISOString());
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminName');
    navigate('/admin/login');
  };

  return (
    <div className={`min-h-screen ${
      theme === 'dark' ? 'bg-[#111111] text-white' : 'bg-gray-50 text-gray-800'
    }`}>
      <div className="flex">
        <AdminSidebar 
          open={open} 
          setOpen={setOpen} 
          adminName={adminName}
          theme={theme}
        />
        
        <motion.div 
          className="flex-1"
          animate={{ 
            marginLeft: open ? "240px" : "80px",
          }}
          transition={{
            duration: 0.5,
            ease: [0.25, 0.1, 0.25, 1],
            type: "tween"
          }}
        >
          {/* Header */}
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
                  {adminName}
                </span>
                <span className={`text-lg ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  👋
                </span>
              </motion.div>

              <div className="ml-auto flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <input
                    className={`rounded-lg border pl-8 pr-4 py-2 text-sm transition-colors ${
                      theme === 'dark'
                        ? 'bg-white/10 border-white/20 text-white placeholder:text-gray-400'
                        : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-500'
                    }`}
                    placeholder="Search..."
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <button
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
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
                  {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                </button>

                <div className="relative" ref={notificationRef}>
                  <button 
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                      theme === 'dark' 
                        ? 'text-white hover:bg-white/20'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                    onClick={() => setShowNotifications(!showNotifications)}
                  >
                    <Bell className="h-5 w-5" />
                  </button>

                  <AnimatePresence>
                    {showNotifications && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className={`absolute right-0 mt-2 w-80 rounded-lg shadow-lg border ${
                          theme === 'dark' 
                            ? 'bg-[#1a1a1a] border-white/20' 
                            : 'bg-white border-gray-200'
                        }`}
                      >
                        <div className="p-4">
                          <h3 className={`text-lg font-semibold mb-3 ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}>
                            Admin Activity
                          </h3>
                          
                          <div className={`space-y-3 ${
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                          }`}>
                            <div className="space-y-1">
                              <div className="text-sm font-medium">Last Login</div>
                              <div className="text-sm">
                                {lastLogin ? (
                                  <>
                                    <div>{format(lastLogin, 'MMMM d, yyyy')}</div>
                                    <div>{format(lastLogin, 'h:mm a')}</div>
                                  </>
                                ) : (
                                  'First login'
                                )}
                              </div>
                            </div>

                            <div className="space-y-1">
                              <div className="text-sm font-medium">Admin Details</div>
                              <div className="text-sm">
                                <div>Name: {adminName}</div>
                                <div>Role: Administrator</div>
                                <div>Session Started: {format(new Date(), 'h:mm a')}</div>
                              </div>
                            </div>

                            <div className={`pt-2 mt-2 border-t ${
                              theme === 'dark' ? 'border-white/10' : 'border-gray-100'
                            }`}>
                              <div className="text-sm">
                                Current Active Users: {realTimeStats.totalActive}
                                <div className="text-xs mt-1">
                                  {realTimeStats.activeStudents} students, {realTimeStats.activeTeachers} teachers
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.main 
            layout
            className="flex-1 p-6"
            transition={{
              layout: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }
            }}
          >
            {/* Stats Cards */}
            <motion.div 
              layout
              className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
              transition={{
                layout: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }
              }}
            >
              <StatsCard
                title="Total Students"
                value={stats.totalStudents.toLocaleString()}
                change={stats.newStudentsThisMonth}
                chart={generateGraphData(stats.totalStudents, stats.newStudentsThisMonth)}
                theme={theme}
              />
              <StatsCard
                title="Total Teachers"
                value={stats.totalTeachers.toLocaleString()}
                change={stats.newTeachersThisMonth}
                chart={generateGraphData(stats.totalTeachers, stats.newTeachersThisMonth)}
                theme={theme}
              />
              <StatsCard
                title="Total Courses"
                value={stats.totalCourses.toString()}
                change={0}
                chart={generateGraphData(stats.totalCourses, 0)}
                theme={theme}
              />
              <StatsCard
                title="Active Users"
                value={realTimeStats.totalActive.toString()}
                change={realTimeStats.totalActive}
                chart={generateGraphData(realTimeStats.totalActive, realTimeStats.totalActive, true)}
                theme={theme}
                details={`${realTimeStats.activeStudents} students, ${realTimeStats.activeTeachers} teachers online`}
              />
            </motion.div>

            {/* Tables Grid */}
            <motion.div 
              layout
              className="mt-6 grid gap-6 lg:grid-cols-2"
              transition={{
                layout: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }
              }}
            >
              {/* Recent Students Table */}
              <div className={`p-6 rounded-lg shadow-lg border ${
                theme === 'dark' 
                  ? 'bg-white/10 border-white/20' 
                  : 'bg-white border-gray-200'
              }`}>
                <h3 className="text-lg font-semibold mb-4">Recent Students</h3>
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left py-2">Name</th>
                      <th className="text-left py-2">USN</th>
                      <th className="text-left py-2">Department</th>
                      <th className="text-left py-2">Year</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentStudents.map((student) => (
                      <tr key={student._id || student.usn}>
                        <td className="py-2">{student.name}</td>
                        <td className="py-2">{student.usn}</td>
                        <td className="py-2">{student.department}</td>
                        <td className="py-2">{student.year}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Recent Teachers Table */}
              <div className={`p-6 rounded-lg shadow-lg border ${
                theme === 'dark' 
                  ? 'bg-white/10 border-white/20' 
                  : 'bg-white border-gray-200'
              }`}>
                <h3 className="text-lg font-semibold mb-4">Recent Teachers</h3>
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left py-2">Name</th>
                      <th className="text-left py-2">Department</th>
                      <th className="text-left py-2">Designation</th>
                      <th className="text-left py-2">Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTeachers.map((teacher) => (
                      <tr key={teacher._id || teacher.teacherId}>
                        <td className="py-2">{teacher.name}</td>
                        <td className="py-2">{teacher.department}</td>
                        <td className="py-2">{teacher.designation}</td>
                        <td className="py-2">{teacher.email}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </motion.main>
        </motion.div>
      </div>
    </div>
  );
}

// Stats Card Component
function StatsCard({ title, value, change, chart, theme, details }) {
  const [graphData, setGraphData] = useState(chart);

  // Update graph data when value or change updates
  useEffect(() => {
    setGraphData(generateGraphData(parseInt(value) || 0, change || 0));
  }, [value, change]);

  const getChangeDisplay = () => {
    // If there's no previous data, show "New data" instead of a change
    if (!value || value === '0') return "No data available";
    if (change === undefined || change === null) return "New data";
    if (change === 0) return "No change from last month";
    return `${change > 0 ? '+' : ''}${change} from last month`;
  };

  const getChangeColor = () => {
    if (!value || value === '0' || change === undefined || change === null) {
      return theme === 'dark' ? 'text-gray-400' : 'text-gray-600';
    }
    if (change === 0) return theme === 'dark' ? 'text-gray-400' : 'text-gray-600';
    return change > 0 ? 'text-green-500' : 'text-red-500';
  };

  return (
    <div className={`p-6 rounded-lg shadow-lg border transition-colors ${
      theme === 'dark'
        ? 'bg-white/10 border-white/20 text-white'
        : 'bg-white border-gray-200 text-gray-800'
    }`}>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <div className="mt-4">
        <div className="text-3xl font-bold">{value || '0'}</div>
        {details && (
          <div className={`text-sm mt-1 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            {details}
          </div>
        )}
        <div className="flex items-center gap-2 mt-1">
          {change !== undefined && change !== null && change !== 0 && (
            <span className={`flex items-center ${getChangeColor()}`}>
              {change > 0 ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              )}
            </span>
          )}
          <p className={`text-sm ${getChangeColor()}`}>
            {getChangeDisplay()}
          </p>
        </div>
        <div className="h-[80px] mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={graphData}>
              <Line
                type="monotone"
                dataKey="value"
                stroke={
                  !value || value === '0' || change === undefined || change === null
                    ? '#6B7280'
                    : change > 0 
                      ? '#10B981' 
                      : change < 0 
                        ? '#EF4444' 
                        : '#6B7280'
                }
                strokeWidth={2}
                dot={false}
              />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 10, fill: theme === 'dark' ? '#9CA3AF' : '#4B5563' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
                  border: 'none',
                  borderRadius: '0.5rem',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
                labelStyle={{ color: theme === 'dark' ? '#FFFFFF' : '#000000' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;

