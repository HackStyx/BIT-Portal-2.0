import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Moon, Sun, Bell, X } from 'lucide-react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { format } from 'date-fns';
import io from 'socket.io-client';
// Change this line:
import { AdminSidebar } from '../components/AdminSidebar';

function TeachersPage() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const navigate = useNavigate();
  const adminName = localStorage.getItem('adminName') || 'Admin';
  const [showNotifications, setShowNotifications] = useState(false);
  const [lastLogin, setLastLogin] = useState(null);
  const [realTimeStats, setRealTimeStats] = useState({
    activeStudents: 0,
    activeTeachers: 0,
    totalActive: 0
  });
  const notificationRef = useRef(null);

  const baseURL = process.env.REACT_APP_SERVER_PORT 
    ? `http://localhost:${process.env.REACT_APP_SERVER_PORT}/api`
    : 'http://localhost:5000/api';

  const [newTeacher, setNewTeacher] = useState({
    teacherId: '',
    name: '',
    department: '',
    designation: '',
    email: '',
    password: '',
    subjects: []
  });

  const fetchTeachers = useCallback(async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        console.log('No admin token found');
        navigate('/admin/login');
        return;
      }

      console.log('Fetching teachers with token:', token);
      const response = await fetch(`${baseURL}/auth/admin/teachers`, {
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        }
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('adminToken');
          navigate('/admin/login');
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}, message: ${data.message}`);
      }
      
      if (data.success) {
        if (Array.isArray(data.teachers)) {
          setTeachers(data.teachers);
          setError('');
        } else {
          throw new Error('Teachers data is not an array');
        }
      } else {
        throw new Error(data.message || 'Failed to fetch teachers');
      }
    } catch (error) {
      console.error('Error fetching teachers:', error);
      setError(`Failed to fetch teachers: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [baseURL, navigate]);

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const lastLoginTime = localStorage.getItem('adminLastLogin');
    if (lastLoginTime) {
      setLastLogin(new Date(lastLoginTime));
    }
  }, []);

  useEffect(() => {
    const newSocket = io('http://localhost:5000', {
      withCredentials: true
    });

    newSocket.on('connect', () => {
      console.log('Connected to WebSocket server');
      newSocket.emit('userConnected', {
        userType: 'admin',
        userId: localStorage.getItem('adminToken')
      });
    });

    newSocket.on('activeUsers', (data) => {
      setRealTimeStats({
        activeStudents: data.students,
        activeTeachers: data.teachers,
        totalActive: data.total
      });
    });

    return () => {
      if (newSocket) newSocket.disconnect();
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTeacher(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        navigate('/admin/login');
        return;
      }

      const url = isEditing 
        ? `${baseURL}/auth/admin/teachers/update/${newTeacher.teacherId}`
        : `${baseURL}/auth/admin/teachers/register`;

      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newTeacher)
      });

      const data = await response.json();

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
        return;
      }

      if (data.success) {
        setSuccess(isEditing ? 'Teacher updated successfully!' : 'Teacher added successfully!');
        setShowAddForm(false);
        setIsEditing(false);
        setNewTeacher({
          teacherId: '',
          name: '',
          department: '',
          designation: '',
          email: '',
          password: '',
          subjects: []
        });
        await fetchTeachers();
      } else {
        setError(data.message || 'Operation failed');
      }
    } catch (error) {
      console.error('Submit error:', error);
      setError('Operation failed. Please try again.');
    }
  };

  const handleDelete = async (teacherId) => {
    if (!window.confirm('Are you sure you want to delete this teacher?')) return;

    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        navigate('/admin/login');
        return;
      }

      const response = await fetch(`${baseURL}/auth/admin/teachers/delete/${teacherId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
        return;
      }

      if (data.success) {
        setSuccess('Teacher deleted successfully!');
        await fetchTeachers();
      } else {
        setError(data.message || 'Failed to delete teacher');
      }
    } catch (error) {
      console.error('Delete error:', error);
      setError('Failed to delete teacher. Please try again.');
    }
  };

  const filteredTeachers = teachers.filter(teacher => 
    teacher.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.teacherId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#111111] text-white' : 'bg-gray-50 text-gray-800'}`}>
      <div className="flex">
        <AdminSidebar 
          open={sidebarOpen} 
          setOpen={setSidebarOpen}
          adminName={adminName}
          theme={theme}
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
                <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Teacher Management
                </span>
              </motion.div>

              <div className="ml-auto flex items-center gap-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <input
                    className={`rounded-lg border pl-8 pr-4 py-2 text-sm transition-colors ${
                      theme === 'dark'
                        ? 'bg-white/10 border-white/20 text-white placeholder:text-gray-400'
                        : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-500'
                    }`}
                    placeholder="Search teachers..."
                    type="search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {/* Add Teacher Button */}
                <button
                  onClick={() => setShowAddForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Plus className="h-5 w-5" />
                  Add Teacher
                </button>

                {/* Notification Button */}
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

                {/* Theme Toggle */}
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
              </div>
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.main 
            layout
            className="flex-1 p-6"
          >
            {/* Content Header */}
            <div className="mb-6">
              <h1 className={`text-2xl font-bold ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Teacher Records
              </h1>
              <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                Manage and view all teacher information
              </p>
            </div>

            {/* Messages */}
            {error && (
              <div className="mb-4 p-4 bg-red-500/20 text-red-100 rounded-lg">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 p-4 bg-green-500/20 text-green-100 rounded-lg">
                {success}
              </div>
            )}

            {/* Teachers Table */}
            <div className={`rounded-lg border overflow-hidden ${
              theme === 'dark'
                ? 'bg-white/10 border-white/20'
                : 'bg-white border-gray-200'
            }`}>
              <div className="overflow-x-auto">
                <table className={`w-full ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  <thead>
                    <tr className={theme === 'dark' ? 'bg-white/10' : 'bg-gray-50'}>
                      <th className="text-left p-4">Teacher ID</th>
                      <th className="text-left p-4">Name</th>
                      <th className="text-left p-4">Department</th>
                      <th className="text-left p-4">Designation</th>
                      <th className="text-left p-4">Email</th>
                      <th className="text-left p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTeachers.map((teacher) => (
                      <tr 
                        key={teacher.teacherId} 
                        className={`border-t ${
                          theme === 'dark' ? 'border-white/20' : 'border-gray-200'
                        }`}
                      >
                        <td className="p-4">{teacher.teacherId}</td>
                        <td className="p-4">{teacher.name}</td>
                        <td className="p-4">{teacher.department}</td>
                        <td className="p-4">{teacher.designation}</td>
                        <td className="p-4">{teacher.email}</td>
                        <td className="p-4">
                          <button
                            onClick={() => {
                              setIsEditing(true);
                              setShowAddForm(true);
                              setNewTeacher({
                                ...teacher,
                                password: '' // Clear password for security
                              });
                            }}
                            className="mr-2 text-blue-400 hover:text-blue-300"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(teacher.teacherId)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.main>
        </motion.div>

        {/* Add/Edit Form Modal */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className={`w-full max-w-lg rounded-lg p-6 ${
                  theme === 'dark' ? 'bg-[#111111]' : 'bg-white'
                }`}
              >
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">
                      {isEditing ? 'Edit Teacher' : 'Add New Teacher'}
                    </h2>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddForm(false);
                        setIsEditing(false);
                        setNewTeacher({
                          teacherId: '',
                          name: '',
                          department: '',
                          designation: '',
                          email: '',
                          password: '',
                          subjects: []
                        });
                      }}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <input
                      type="text"
                      name="teacherId"
                      value={newTeacher.teacherId}
                      onChange={handleInputChange}
                      placeholder="Teacher ID"
                      disabled={isEditing}
                      className={`w-full p-2 rounded-lg border ${
                        theme === 'dark' 
                          ? 'bg-white/10 border-white/20 text-white' 
                          : 'bg-white border-gray-200'
                      }`}
                      required
                    />
                    <input
                      type="text"
                      name="name"
                      value={newTeacher.name}
                      onChange={handleInputChange}
                      placeholder="Name"
                      className={`w-full p-2 rounded-lg border ${
                        theme === 'dark' 
                          ? 'bg-white/10 border-white/20 text-white' 
                          : 'bg-white border-gray-200'
                      }`}
                      required
                    />
                    <input
                      type="email"
                      name="email"
                      value={newTeacher.email}
                      onChange={handleInputChange}
                      placeholder="Email"
                      className={`w-full p-2 rounded-lg border ${
                        theme === 'dark' 
                          ? 'bg-white/10 border-white/20 text-white' 
                          : 'bg-white border-gray-200'
                      }`}
                      required
                    />
                    <input
                      type="text"
                      name="department"
                      value={newTeacher.department}
                      onChange={handleInputChange}
                      placeholder="Department"
                      className={`w-full p-2 rounded-lg border ${
                        theme === 'dark' 
                          ? 'bg-white/10 border-white/20 text-white' 
                          : 'bg-white border-gray-200'
                      }`}
                      required
                    />
                    <input
                      type="text"
                      name="designation"
                      value={newTeacher.designation}
                      onChange={handleInputChange}
                      placeholder="Designation"
                      className={`w-full p-2 rounded-lg border ${
                        theme === 'dark' 
                          ? 'bg-white/10 border-white/20 text-white' 
                          : 'bg-white border-gray-200'
                      }`}
                      required
                    />
                    <input
                      type="password"
                      name="password"
                      value={newTeacher.password}
                      onChange={handleInputChange}
                      placeholder={isEditing ? "Leave blank to keep current password" : "Password"}
                      className={`w-full p-2 rounded-lg border ${
                        theme === 'dark' 
                          ? 'bg-white/10 border-white/20 text-white' 
                          : 'bg-white border-gray-200'
                      }`}
                      required={!isEditing}
                    />
                    <input
                      type="text"
                      name="subjects"
                      value={Array.isArray(newTeacher.subjects) ? newTeacher.subjects.join(', ') : ''}
                      onChange={(e) => {
                        const subjectsArray = e.target.value
                          .split(',')
                          .map(subject => subject.trim())
                          .filter(subject => subject !== '');
                        setNewTeacher({
                          ...newTeacher,
                          subjects: subjectsArray
                        });
                      }}
                      placeholder="Subjects (comma-separated)"
                      className={`w-full p-2 rounded-lg border ${
                        theme === 'dark' 
                          ? 'bg-white/10 border-white/20 text-white' 
                          : 'bg-white border-gray-200'
                      }`}
                    />
                  </div>

                  <div className="flex justify-end space-x-4">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      {isEditing ? 'Update Teacher' : 'Add Teacher'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default TeachersPage;