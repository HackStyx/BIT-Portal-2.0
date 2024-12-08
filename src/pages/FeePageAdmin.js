import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AdminSidebar } from '../components/AdminSidebar';
import { Search, Moon, Sun, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import io from 'socket.io-client';

function FeePageAdmin() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [searchTerm, setSearchTerm] = useState('');
  const [feeRecords, setFeeRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newFeeRecord, setNewFeeRecord] = useState({
    studentId: '',
    amount: '',
    dueDate: '',
    status: 'pending',
    semester: '',
    academicYear: ''
  });
  const [showNotifications, setShowNotifications] = useState(false);
  const [lastLogin, setLastLogin] = useState(null);
  const [realTimeStats, setRealTimeStats] = useState({
    activeStudents: 0,
    activeTeachers: 0,
    totalActive: 0
  });
  const notificationRef = useRef(null);

  const adminName = localStorage.getItem('adminName') || 'Admin';

  const fetchFeeRecords = useCallback(async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        navigate('/admin/login');
        return;
      }

      const response = await fetch(`http://localhost:${process.env.REACT_APP_SERVER_PORT}/api/fee/all`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      console.log('Fee records response:', data);

      if (data.success) {
        setFeeRecords(data.feeRecords);
      } else {
        setError(data.message || 'Failed to fetch fee records');
      }
    } catch (error) {
      console.error('Error fetching fee records:', error);
      setError('Failed to load fee records');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    console.log('FeePage mounted');
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }
  }, [navigate]);

  useEffect(() => {
    fetchFeeRecords();
  }, [fetchFeeRecords]);

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
    setNewFeeRecord({
      ...newFeeRecord,
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
        ? `http://localhost:5000/api/fee/update/${newFeeRecord._id}`
        : 'http://localhost:5000/api/fee/create';

      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newFeeRecord)
      });

      const data = await response.json();
      console.log('Response data:', data);

      if (data.success) {
        setSuccess(isEditing ? 'Fee record updated!' : 'Fee record added!');
        setShowAddForm(false);
        setIsEditing(false);
        setNewFeeRecord({
          studentId: '',
          amount: '',
          dueDate: '',
          status: 'pending',
          semester: '',
          academicYear: ''
        });
        await fetchFeeRecords();
      } else {
        setError(data.message || 'Operation failed');
      }
    } catch (error) {
      console.error('Submit error:', error);
      setError('Operation failed. Please try again.');
    }
  };

  const handleDelete = async (recordId) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        const token = localStorage.getItem('adminToken');
        if (!token) {
          navigate('/admin/login');
          return;
        }

        const response = await fetch(`http://localhost:5000/api/fee/delete/${recordId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();

        if (data.success) {
          setSuccess('Fee record deleted successfully!');
          await fetchFeeRecords();
        } else {
          setError(data.message || 'Failed to delete fee record');
        }
      } catch (error) {
        console.error('Delete error:', error);
        setError('Failed to delete fee record. Please try again.');
      }
    }
  };

  const filteredRecords = feeRecords.filter(record => 
    record.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.semester.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.academicYear.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.amount.toString().includes(searchTerm)
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
            className={`border-b mt-3 ${theme === 'dark' ? 'border-white/20 bg-[#111111]' : 'border-gray-200 bg-white'}`}
          >
            <div className="flex h-16 items-center px-4">
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="flex items-center gap-3"
              >
                <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Fee Management
                </span>
              </motion.div>

              {/* Header Controls */}
              <div className="ml-auto flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <input
                    className={`rounded-lg border pl-8 pr-4 py-2 text-sm transition-colors ${
                      theme === 'dark'
                        ? 'bg-white/10 border-white/20 text-white placeholder:text-gray-400'
                        : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-500'
                    }`}
                    placeholder="Search records..."
                    type="search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
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
          >
            {/* Content Header */}
            <div className="mb-6">
              <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Fee Records
              </h1>
              <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                Manage student fee records and payments
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
              {showAddForm ? 'Cancel' : 'Add New Record'}
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
                    name="studentId"
                    value={newFeeRecord.studentId}
                    onChange={handleInputChange}
                    placeholder="Student ID"
                    className={`rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      theme === 'dark' 
                        ? 'bg-white/10 text-white' 
                        : 'bg-gray-100 text-gray-900'
                    }`}
                    required
                  />
                  <input
                    type="number"
                    name="amount"
                    value={newFeeRecord.amount}
                    onChange={handleInputChange}
                    placeholder="Amount"
                    className={`rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      theme === 'dark' 
                        ? 'bg-white/10 text-white' 
                        : 'bg-gray-100 text-gray-900'
                    }`}
                    required
                  />
                  <input
                    type="date"
                    name="dueDate"
                    value={newFeeRecord.dueDate}
                    onChange={handleInputChange}
                    className={`rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      theme === 'dark' 
                        ? 'bg-white/10 text-white' 
                        : 'bg-gray-100 text-gray-900'
                    }`}
                    required
                  />
                  <select
                    name="status"
                    value={newFeeRecord.status}
                    onChange={handleInputChange}
                    className={`rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      theme === 'dark' 
                        ? 'bg-white/10 text-white' 
                        : 'bg-gray-100 text-gray-900'
                    }`}
                    required
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="overdue">Overdue</option>
                  </select>
                  <input
                    type="text"
                    name="semester"
                    value={newFeeRecord.semester}
                    onChange={handleInputChange}
                    placeholder="Semester"
                    className={`rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      theme === 'dark' 
                        ? 'bg-white/10 text-white' 
                        : 'bg-gray-100 text-gray-900'
                    }`}
                    required
                  />
                  <input
                    type="text"
                    name="academicYear"
                    value={newFeeRecord.academicYear}
                    onChange={handleInputChange}
                    placeholder="Academic Year"
                    className={`rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      theme === 'dark' 
                        ? 'bg-white/10 text-white' 
                        : 'bg-gray-100 text-gray-900'
                    }`}
                    required
                  />
                  <div className="col-span-2">
                    <button
                      type="submit"
                      className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors duration-200"
                    >
                      {isEditing ? 'Update Record' : 'Add Record'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Fee Records Table */}
            <div className={`rounded-lg border overflow-hidden ${
              theme === 'dark'
                ? 'bg-white/10 border-white/20'
                : 'bg-white border-gray-200'
            }`}>
              <div className="overflow-x-auto">
                <table className={`w-full ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  <thead>
                    <tr className={theme === 'dark' ? 'bg-white/10' : 'bg-gray-100'}>
                      <th className="p-4 text-left">Student ID</th>
                      <th className="p-4 text-left">Amount</th>
                      <th className="p-4 text-left">Due Date</th>
                      <th className="p-4 text-left">Status</th>
                      <th className="p-4 text-left">Semester</th>
                      <th className="p-4 text-left">Academic Year</th>
                      <th className="p-4 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecords.map((record) => (
                      <tr key={record._id} className={`border-b ${
                        theme === 'dark' 
                          ? 'border-white/10 hover:bg-white/5' 
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}>
                        <td className="p-4">{record.studentId}</td>
                        <td className="p-4">₹{record.amount}</td>
                        <td className="p-4">{new Date(record.dueDate).toLocaleDateString()}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            record.status === 'paid' 
                              ? 'bg-green-500/20 text-green-300'
                              : record.status === 'overdue'
                              ? 'bg-red-500/20 text-red-300'
                              : 'bg-yellow-500/20 text-yellow-300'
                          }`}>
                            {record.status}
                          </span>
                        </td>
                        <td className="p-4">{record.semester}</td>
                        <td className="p-4">{record.academicYear}</td>
                        <td className="p-4">
                          <button
                            onClick={() => {
                              setIsEditing(true);
                              setShowAddForm(true);
                              setNewFeeRecord(record);
                            }}
                            className="mr-2 text-blue-400 hover:text-blue-300"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(record._id)}
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

export default FeePageAdmin;
