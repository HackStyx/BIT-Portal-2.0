import React, { useState, useEffect, useCallback } from 'react';
import { AdminSidebar } from '../components/AdminSidebar';
import { Search, Moon, Sun, Bell } from 'lucide-react';
import { motion } from 'framer-motion';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

function ExamPage() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [searchTerm, setSearchTerm] = useState('');
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newExam, setNewExam] = useState({
    examName: '',
    subject: '',
    date: '',
    startTime: '',
    duration: '',
    totalMarks: '',
    department: '',
    semester: ''
  });

  const adminName = localStorage.getItem('adminName') || 'Admin';

  const fetchExams = useCallback(async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        navigate('/admin/login');
        return;
      }

      console.log('Fetching exams...');
      const response = await fetch('http://localhost:5000/api/exam/all', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Exams response status:', response.status);
      const data = await response.json();
      console.log('Exams data:', data);

      if (data.success) {
        setExams(data.exams || []);
      } else {
        setError(data.message || 'Failed to fetch exams');
      }
    } catch (error) {
      console.error('Error fetching exams:', error);
      setError('Failed to load exams');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    console.log('ExamPage mounted');
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }
  }, [navigate]);

  useEffect(() => {
    fetchExams();
  }, [fetchExams]);

  const handleInputChange = (e) => {
    setNewExam({
      ...newExam,
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
        ? `http://localhost:5000/api/exam/${newExam._id}`
        : 'http://localhost:5000/api/exam';

      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newExam)
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(isEditing ? 'Exam updated!' : 'Exam added!');
        setShowAddForm(false);
        setIsEditing(false);
        setNewExam({
          examName: '',
          subject: '',
          date: '',
          startTime: '',
          duration: '',
          totalMarks: '',
          department: '',
          semester: ''
        });
        await fetchExams();
      } else {
        setError(data.message || 'Operation failed');
      }
    } catch (error) {
      console.error('Submit error:', error);
      setError('Operation failed. Please try again.');
    }
  };

  const filteredExams = exams.filter(exam => 
    exam.examName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exam.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exam.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (examId) => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        navigate('/admin/login');
        return;
      }

      const response = await fetch(`http://localhost:5000/api/exam/${examId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Exam deleted successfully!');
        await fetchExams();
      } else {
        setError(data.message || 'Failed to delete exam');
      }
    } catch (error) {
      console.error('Delete error:', error);
      setError('Failed to delete exam. Please try again.');
    }
  };

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
                  Exam Management
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
                    placeholder="Search exams..."
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
              <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Exam Schedule
              </h1>
              <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                Manage examination schedules and details
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
              {showAddForm ? 'Cancel' : 'Schedule New Exam'}
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
                    name="examName"
                    value={newExam.examName}
                    onChange={handleInputChange}
                    placeholder="Exam Name"
                    className={`rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      theme === 'dark' 
                        ? 'bg-white/10 text-white' 
                        : 'bg-gray-100 text-gray-900'
                    }`}
                    required
                  />
                  <input
                    type="text"
                    name="subject"
                    value={newExam.subject}
                    onChange={handleInputChange}
                    placeholder="Subject"
                    className={`rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      theme === 'dark' 
                        ? 'bg-white/10 text-white' 
                        : 'bg-gray-100 text-gray-900'
                    }`}
                    required
                  />
                  <input
                    type="date"
                    name="date"
                    value={newExam.date}
                    onChange={handleInputChange}
                    className={`rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      theme === 'dark' 
                        ? 'bg-white/10 text-white' 
                        : 'bg-gray-100 text-gray-900'
                    }`}
                    required
                  />
                  <input
                    type="time"
                    name="startTime"
                    value={newExam.startTime}
                    onChange={handleInputChange}
                    className={`rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      theme === 'dark' 
                        ? 'bg-white/10 text-white' 
                        : 'bg-gray-100 text-gray-900'
                    }`}
                    required
                  />
                  <input
                    type="number"
                    name="duration"
                    value={newExam.duration}
                    onChange={handleInputChange}
                    placeholder="Duration (minutes)"
                    className={`rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      theme === 'dark' 
                        ? 'bg-white/10 text-white' 
                        : 'bg-gray-100 text-gray-900'
                    }`}
                    required
                  />
                  <input
                    type="number"
                    name="totalMarks"
                    value={newExam.totalMarks}
                    onChange={handleInputChange}
                    placeholder="Total Marks"
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
                    value={newExam.department}
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
                    name="semester"
                    value={newExam.semester}
                    onChange={handleInputChange}
                    placeholder="Semester"
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
                      {isEditing ? 'Update Exam' : 'Add Exam'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Exam Records Table */}
            <div className={`rounded-lg border overflow-hidden ${
              theme === 'dark'
                ? 'bg-white/10 border-white/20'
                : 'bg-white border-gray-200'
            }`}>
              <div className="overflow-x-auto">
                <table className={`w-full ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  <thead>
                    <tr className={theme === 'dark' ? 'bg-white/10' : 'bg-gray-100'}>
                      <th className="p-4 text-left">Exam Name</th>
                      <th className="p-4 text-left">Subject</th>
                      <th className="p-4 text-left">Date</th>
                      <th className="p-4 text-left">Start Time</th>
                      <th className="p-4 text-left">Duration</th>
                      <th className="p-4 text-left">Total Marks</th>
                      <th className="p-4 text-left">Department</th>
                      <th className="p-4 text-left">Semester</th>
                      <th className="p-4 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredExams.map((exam) => (
                      <tr key={exam._id} className={`border-b ${
                        theme === 'dark' 
                          ? 'border-white/10 hover:bg-white/5' 
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}>
                        <td className="p-4">{exam.examName}</td>
                        <td className="p-4">{exam.subject}</td>
                        <td className="p-4">{new Date(exam.date).toLocaleDateString()}</td>
                        <td className="p-4">{exam.startTime}</td>
                        <td className="p-4">{exam.duration} minutes</td>
                        <td className="p-4">{exam.totalMarks}</td>
                        <td className="p-4">{exam.department}</td>
                        <td className="p-4">{exam.semester}</td>
                        <td className="p-4">
                          <button
                            onClick={() => {
                              setIsEditing(true);
                              setShowAddForm(true);
                              setNewExam(exam);
                            }}
                            className="mr-2 text-blue-400 hover:text-blue-300"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm('Are you sure you want to delete this exam?')) {
                                handleDelete(exam._id);
                              }
                            }}
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

export default ExamPage;
