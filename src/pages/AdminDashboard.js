import React, { useState, useEffect, useRef } from 'react';
import { AdminSidebar } from '../components/AdminSidebar';
import { Bell, Search, Moon, Sun } from 'lucide-react';
import { Line, LineChart, ResponsiveContainer, XAxis, Tooltip } from "recharts";
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// Function to generate graph data
const generateGraphData = (total, change) => {
  const months = 6; // Show last 6 months
  const data = [];
  const today = new Date();
  let currentValue = total - (change * 3); // Start from a lower value
  
  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const monthName = date.toLocaleString('default', { month: 'short' });
    
    // Generate random fluctuation between -10% and +10% of the total
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
  
  // Ensure the graph shows an overall trend matching the change
  if (change > 0) {
    // For positive change, ensure the first value is lower than the last
    data[0].value = Math.min(data[0].value, total - (change * 2));
  } else if (change < 0) {
    // For negative change, ensure the first value is higher than the last
    data[0].value = Math.max(data[0].value, total + (Math.abs(change) * 2));
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

                <button className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                  theme === 'dark' 
                    ? 'text-white hover:bg-white/20'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}>
                  <Bell className="h-5 w-5" />
                </button>
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
                value={stats.activeUsers.toLocaleString()}
                change={stats.newStudentsThisMonth + stats.newTeachersThisMonth}
                chart={generateGraphData(stats.activeUsers, stats.newStudentsThisMonth + stats.newTeachersThisMonth)}
                theme={theme}
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
function StatsCard({ title, value, change, chart, theme }) {
  const [graphData, setGraphData] = useState(chart);

  // Refresh graph data every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      setGraphData(generateGraphData(parseInt(value), change));
    }, 300000); // 5 minutes in milliseconds

    return () => clearInterval(interval);
  }, [value, change]);

  // Update graph data when value or change updates
  useEffect(() => {
    setGraphData(generateGraphData(parseInt(value), change));
  }, [value, change]);

  const getChangeDisplay = () => {
    if (change === 0) return "No change from last month";
    return `${change > 0 ? '+' : ''}${change} from last month`;
  };

  const getChangeColor = () => {
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
        <div className="text-3xl font-bold">{value}</div>
        <div className="flex items-center gap-2 mt-1">
          {change !== 0 && (
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
                stroke={change > 0 ? '#10B981' : change < 0 ? '#EF4444' : '#6B7280'}
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

