import React, { useState, useEffect, useRef } from 'react';
import { AdminSidebar } from '../components/AdminSidebar';
import { Bell, Search, Moon, Sun, UserCircle, Camera, LogOut } from 'lucide-react';
import { Line, LineChart, ResponsiveContainer } from "recharts";
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const data = [
  { name: "Jan", value: 60 },
  { name: "Feb", value: 65 },
  { name: "Mar", value: 58 },
];

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
    totalCourses: 0,
    activeUsers: 0,
    newStudentsThisMonth: 0,
    newTeachersThisMonth: 0
  });

  const adminName = localStorage.getItem('adminName') || 'Admin';
  const baseURL = process.env.REACT_APP_SERVER_PORT 
    ? `http://localhost:${process.env.REACT_APP_SERVER_PORT}/api`
    : 'http://localhost:5000/api';

  // Add the getGreeting function
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

        // Fetch students and teachers data
        const [studentsResponse, teachersResponse] = await Promise.all([
          fetch(`${baseURL}/api/auth/students`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }),
          fetch(`${baseURL}/api/auth/teachers`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })
        ]);

        const studentsData = await studentsResponse.json();
        const teachersData = await teachersResponse.json();

        // Get current month and year
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        // Calculate new students/teachers this month
        const newStudentsThisMonth = studentsData.students?.filter(student => {
          const createdAt = new Date(student.createdAt);
          return createdAt.getMonth() === currentMonth && 
                 createdAt.getFullYear() === currentYear;
        }).length || 0;

        const newTeachersThisMonth = teachersData.teachers?.filter(teacher => {
          const createdAt = new Date(teacher.createdAt);
          return createdAt.getMonth() === currentMonth && 
                 createdAt.getFullYear() === currentYear;
        }).length || 0;

        // Get recent students and teachers (last 5)
        const recentStudents = studentsData.students
          ?.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5) || [];

        const recentTeachers = teachersData.teachers
          ?.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5) || [];

        // Update states
        setStats({
          totalStudents: studentsData.students?.length || 0,
          totalTeachers: teachersData.teachers?.length || 0,
          totalCourses: stats.totalCourses,
          activeUsers: studentsData.students?.length + teachersData.teachers?.length || 0,
          newStudentsThisMonth,
          newTeachersThisMonth
        });

        setRecentStudents(recentStudents);
        setRecentTeachers(recentTeachers);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchDashboardData();
  }, []);

  const fetchRecentTeachers = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        navigate('/admin/login');
        return;
      }

      const response = await fetch(`${baseURL}/auth/admin/getRecentTeachers`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (response.ok) {
        setRecentTeachers(Array.isArray(data.teachers) ? data.teachers : []);
      } else {
        console.error('Failed to fetch recent teachers:', data.message);
      }
    } catch (error) {
      console.error('Error fetching recent teachers:', error);
    }
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

                <button className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                  theme === 'dark' 
                    ? 'text-white hover:bg-white/20'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}>
                  <Bell className="h-5 w-5" />
                </button>

                {/* Profile Menu */}
                <div className="relative" ref={profileRef}>
                  {/* Profile button and menu implementation */}
                  {/* ... (Same as TeacherDashboard) ... */}
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
                change={`+${stats.newStudentsThisMonth}`}
                chart={data}
                theme={theme}
              />
              <StatsCard
                title="Total Teachers"
                value={stats.totalTeachers.toLocaleString()}
                change={`+${stats.newTeachersThisMonth}`}
                chart={data}
                theme={theme}
              />
              <StatsCard
                title="Total Courses"
                value={stats.totalCourses.toString()}
                change="+3"
                chart={data}
                theme={theme}
              />
              <StatsCard
                title="Active Users"
                value={stats.activeUsers.toLocaleString()}
                change="+125"
                chart={data}
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
  return (
    <div className={`p-6 rounded-lg shadow-lg border transition-colors ${
      theme === 'dark'
        ? 'bg-white/10 border-white/20 text-white'
        : 'bg-white border-gray-200 text-gray-800'
    }`}>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <div className="mt-4">
        <div className="text-3xl font-bold">{value}</div>
        <p className="text-sm text-green-500">{change} from last month</p>
        <div className="h-[80px] mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chart}>
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
  );
}

export default AdminDashboard;
