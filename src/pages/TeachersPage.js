import React, { useState, useEffect, useCallback } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { AdminSidebar } from '../components/AdminSidebar';
import { Search, Moon, Sun, Bell, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function TeachersPage() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newTeacher, setNewTeacher] = useState({
    teacherId: '',
    name: '',
    department: '',
    designation: '',
    email: '',
    password: '',
    subjects: []
  });

  const adminName = localStorage.getItem('adminName') || 'Admin';
  const baseURL = process.env.REACT_APP_SERVER_PORT 
    ? `http://localhost:${process.env.REACT_APP_SERVER_PORT}/api`
    : 'http://localhost:5000/api';

  const fetchTeachers = useCallback(async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        navigate('/admin/login');
        return;
      }

      const response = await fetch(`${baseURL}/auth/admin/teachers`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Teachers data:', data);
      
      if (data.success) {
        setTeachers(data.teachers);
        setError('');
      } else {
        throw new Error(data.message || 'Failed to fetch teachers');
      }
    } catch (error) {
      console.error('Error fetching teachers:', error);
      setError(error.message || 'Failed to load teachers. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [baseURL, navigate]);

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  const handleInputChange = (e) => {
    setNewTeacher({
      ...newTeacher,
      [e.target.name]: e.target.value
    });
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
        ? `${baseURL}/auth/admin/update/${newTeacher.teacherId}`
        : `${baseURL}/auth/admin/register`;

      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newTeacher)
      });

      const data = await response.json();

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
      const response = await fetch(`${baseURL}/auth/admin/delete/${teacherId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
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

                {/* Notifications */}
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
                        key={teacher._id} 
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
                    {!isEditing && (
                      <input
                        type="password"
                        name="password"
                        value={newTeacher.password}
                        onChange={handleInputChange}
                        placeholder="Password"
                        className={`w-full p-2 rounded-lg border ${
                          theme === 'dark' 
                            ? 'bg-white/10 border-white/20 text-white' 
                            : 'bg-white border-gray-200'
                        }`}
                        required
                      />
                    )}
                  </div>

                  <div className="flex justify-end gap-4 mt-6">
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
                      className={`px-4 py-2 rounded-lg ${
                        theme === 'dark'
                          ? 'bg-white/10 hover:bg-white/20'
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      {isEditing ? 'Update' : 'Add'} Teacher
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
