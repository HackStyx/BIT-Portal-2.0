import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaSearch, FaSun, FaMoon } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { AdminSidebar } from '../components/AdminSidebar';
import { Search, Moon, Sun, Bell } from 'lucide-react';
import { motion } from 'framer-motion';

function StudentsPage() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newStudent, setNewStudent] = useState({
    usn: '',
    name: '',
    department: '',
    year: '',
    section: '',
    password: ''
  });

  // Get admin name from localStorage or use default
  const adminName = localStorage.getItem('adminName') || 'Admin';

  // Filter students based on search term
  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.usn.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('http://localhost:5000/api/auth/students', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setStudents(data.students);
      } else {
        setError('Failed to fetch students');
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      setError('Failed to load students. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setNewStudent({
      ...newStudent,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const url = isEditing 
        ? `http://localhost:${process.env.REACT_APP_SERVER_PORT}/api/auth/admin/update/${newStudent.usn}`
        : `http://localhost:${process.env.REACT_APP_SERVER_PORT}/api/auth/admin/register`;

      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newStudent)
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(isEditing ? 'Student updated successfully!' : 'Student added successfully!');
        setShowAddForm(false);
        setIsEditing(false);
        setNewStudent({
          usn: '',
          name: '',
          department: '',
          year: '',
          section: '',
          password: ''
        });
        fetchStudents();
      } else {
        setError(data.message || 'Operation failed');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Operation failed. Please try again.');
    }
  };

  const handleEdit = (student) => {
    setIsEditing(true);
    setShowAddForm(true);
    setNewStudent({
      ...student,
      password: '' // Clear password field for security
    });
  };

  const handleDelete = async (usn) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:${process.env.REACT_APP_SERVER_PORT}/api/auth/admin/delete/${usn}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();

        if (data.success) {
          setSuccess('Student deleted successfully!');
          fetchStudents();
        } else {
          setError(data.message || 'Failed to delete student');
        }
      } catch (error) {
        console.error('Error:', error);
        setError('Failed to delete student. Please try again.');
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminId');
    localStorage.removeItem('token');
    navigate('/admin/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${
      theme === 'dark' ? 'bg-[#111111] text-white' : 'bg-gray-50 text-gray-800'
    }`}>
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
                  Student Management
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
                    placeholder="Search students..."
                    type="search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
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
            transition={{
              layout: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }
            }}
          >
            {/* Content Header */}
            <div className="mb-6">
              <h1 className={`text-2xl font-bold ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Student Records
              </h1>
              <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                Manage and view all student information
              </p>
            </div>

            {/* Action Button */}
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className={`mb-6 px-4 py-2 rounded-lg transition-colors ${
                theme === 'dark'
                  ? 'bg-purple-600 hover:bg-purple-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {showAddForm ? 'Cancel' : 'Add New Student'}
            </button>

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

            {/* Add/Edit Form */}
            {showAddForm && (
              <div className={`mb-6 p-6 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-white/10 border-white/20'
                  : 'bg-white border-gray-200'
              }`}>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <input
                    type="text"
                    name="usn"
                    value={newStudent.usn}
                    onChange={handleInputChange}
                    placeholder="USN"
                    disabled={isEditing}
                    className={`rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      theme === 'dark' 
                        ? 'bg-white/10 text-white' 
                        : 'bg-gray-100 text-gray-900'
                    }`}
                    required
                  />
                  <input
                    type="text"
                    name="name"
                    value={newStudent.name}
                    onChange={handleInputChange}
                    placeholder="Name"
                    className={`rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      theme === 'dark' 
                        ? 'bg-white/10 text-white' 
                        : 'bg-gray-100 text-gray-900'
                    }`}
                    required
                  />
                  <input
                    type="text"
                    name="department"
                    value={newStudent.department}
                    onChange={handleInputChange}
                    placeholder="Department"
                    className={`rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      theme === 'dark' 
                        ? 'bg-white/10 text-white' 
                        : 'bg-gray-100 text-gray-900'
                    }`}
                    required
                  />
                  <input
                    type="text"
                    name="year"
                    value={newStudent.year}
                    onChange={handleInputChange}
                    placeholder="Year"
                    className={`rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      theme === 'dark' 
                        ? 'bg-white/10 text-white' 
                        : 'bg-gray-100 text-gray-900'
                    }`}
                    required
                  />
                  <input
                    type="text"
                    name="section"
                    value={newStudent.section}
                    onChange={handleInputChange}
                    placeholder="Section"
                    className={`rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      theme === 'dark' 
                        ? 'bg-white/10 text-white' 
                        : 'bg-gray-100 text-gray-900'
                    }`}
                    required
                  />
                  {!isEditing && (
                    <input
                      type="password"
                      name="password"
                      value={newStudent.password}
                      onChange={handleInputChange}
                      placeholder="Password"
                      className={`rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        theme === 'dark' 
                          ? 'bg-white/10 text-white' 
                          : 'bg-gray-100 text-gray-900'
                      }`}
                      required
                    />
                  )}
                  <div className="col-span-2">
                    <button
                      type="submit"
                      className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors duration-200"
                    >
                      {isEditing ? 'Update Student' : 'Add Student'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Students Table */}
            <div className={`rounded-lg border overflow-hidden ${
              theme === 'dark'
                ? 'bg-white/10 border-white/20'
                : 'bg-white border-gray-200'
            }`}>
              <div className="overflow-x-auto">
                <table className={`w-full ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  <thead>
                    <tr className={theme === 'dark' ? 'bg-white/10' : 'bg-gray-100'}>
                      <th className="p-4 text-left">USN</th>
                      <th className="p-4 text-left">Name</th>
                      <th className="p-4 text-left">Department</th>
                      <th className="p-4 text-left">Year</th>
                      <th className="p-4 text-left">Section</th>
                      <th className="p-4 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((student) => (
                      <tr key={student.usn} className={`border-b ${
                        theme === 'dark' 
                          ? 'border-white/10 hover:bg-white/5' 
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}>
                        <td className="p-4">{student.usn}</td>
                        <td className="p-4">{student.name}</td>
                        <td className="p-4">{student.department}</td>
                        <td className="p-4">{student.year}</td>
                        <td className="p-4">{student.section}</td>
                        <td className="p-4">
                          <button
                            onClick={() => handleEdit(student)}
                            className="mr-2 text-blue-400 hover:text-blue-300"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(student.usn)}
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
      </div>
    </div>
  );
}

export default StudentsPage;
