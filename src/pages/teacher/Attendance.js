import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserCheck, Users, Calendar, Clock } from 'lucide-react';
import TeacherLayout from '../../components/layouts/TeacherLayout';

function Attendance() {
  const [theme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedSection, setSelectedSection] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [students, setStudents] = useState([]);
  const [availableSections, setAvailableSections] = useState([]);
  const [availableDepartments, setAvailableDepartments] = useState([]);

  const mockStudents = [
    { id: 1, name: 'Nishchay J', rollNo: '001', status: 'present' },
    { id: 2, name: 'Sudhanshu Kumar', rollNo: '002', status: 'absent' },
    { id: 3, name: 'Harshit', rollNo: '003', status: 'present' },
    // Add more mock students
  ];

  const years = ['ALL', '1', '2', '3', '4'];
  const subjects = ['Select Subject', 'DSA', 'Java', 'DBMS', 'OS', 'CN'];

  const handleAttendanceChange = (usn, status) => {
    setStudents(prevStudents => 
      prevStudents.map(student => 
        student.usn === usn ? { ...student, status } : student
      )
    );
  };

  // Calculate attendance statistics
  const totalStudents = students.length;
  const presentStudents = students.filter(student => student.status === 'present').length;
  const absentStudents = students.filter(student => student.status === 'absent').length;
  const presentPercentage = ((presentStudents / totalStudents) * 100).toFixed(2);

  // Fetch students based on selected filters
  const fetchStudents = async () => {
    try {
      const query = new URLSearchParams({
        year: selectedYear,
        department: selectedDepartment,
        section: selectedSection
      }).toString();

      const response = await fetch(`http://localhost:${process.env.REACT_APP_SERVER_PORT}/api/teacher/students?${query}`);
      const data = await response.json();
      if (data.success) {
        // Initialize each student with a 'present' status
        const studentsWithStatus = data.students.map(student => ({
          ...student,
          status: 'present'
        }));
        setStudents(studentsWithStatus);
        setAvailableSections(data.sections);
        setAvailableDepartments(data.departments);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  // Submit attendance
  const handleSubmitAttendance = async () => {
    if (!selectedSubject || selectedSubject === 'Select Subject') {
      alert('Please select a subject before submitting attendance.');
      return;
    }

    if (!selectedYear || selectedYear === 'ALL') {
      alert('Please select a year before submitting attendance.');
      return;
    }

    try {
      // Only create attendance records for visible students
      const attendanceData = students.map(student => ({
        usn: student.usn,
        year: selectedYear,
        section: student.section,
        subject: selectedSubject,
        date: selectedDate,
        status: student.status || 'present'
      }));

      console.log('Sending attendance data:', attendanceData);

      const response = await fetch(`http://localhost:${process.env.REACT_APP_SERVER_PORT}/api/teacher/attendance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ attendanceData }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('Attendance marked successfully');
        // Reset student status after successful submission
        setStudents(students.map(student => ({
          ...student,
          status: undefined
        })));
      } else {
        console.error('Server error:', data);
        alert(data.message || 'Failed to mark attendance');
      }
    } catch (error) {
      console.error('Error marking attendance:', error);
      alert('Error marking attendance. Please try again.');
    }
  };

  // Clear filters
  const clearFilters = () => {
    setSelectedYear('all');
    setSelectedSection('all');
    setSelectedDepartment('all');
    fetchStudents();
  };

  useEffect(() => {
    fetchStudents();
  }, [selectedYear, selectedDepartment, selectedSection]);

  const content = (
    <motion.div 
      className="flex-1"
      initial={false}
      animate={{ 
        marginLeft: sidebarOpen ? "240px" : "80px"
      }}
      transition={{
        duration: 0.3,
        ease: "easeInOut"
      }}
    >
      <div className="p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Attendance Management
          </h1>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className={`p-6 rounded-xl shadow-lg border backdrop-blur-sm ${
              theme === 'dark'
                ? 'bg-white/10 border-white/20 hover:bg-white/15'
                : 'bg-white border-gray-200 hover:bg-gray-50'
            } transition-all duration-300`}
          >
            <Users className={`h-8 w-8 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} mb-3`} />
            <h3 className={`text-xl font-semibold mb-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-800'
            }`}>Total Students</h3>
            <p className={`text-3xl font-bold ${
              theme === 'dark' ? 'text-gray-200' : 'text-gray-900'
            }`}>{totalStudents}</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className={`p-6 rounded-xl shadow-lg border backdrop-blur-sm ${
              theme === 'dark'
                ? 'bg-white/10 border-white/20 hover:bg-white/15'
                : 'bg-white border-gray-200 hover:bg-gray-50'
            } transition-all duration-300`}
          >
            <UserCheck className={`h-8 w-8 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'} mb-3`} />
            <h3 className={`text-xl font-semibold mb-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-800'
            }`}>Present Students</h3>
            <p className={`text-3xl font-bold ${
              theme === 'dark' ? 'text-gray-200' : 'text-gray-900'
            }`}>{presentStudents}</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className={`p-6 rounded-xl shadow-lg border backdrop-blur-sm ${
              theme === 'dark'
                ? 'bg-white/10 border-white/20 hover:bg-white/15'
                : 'bg-white border-gray-200 hover:bg-gray-50'
            } transition-all duration-300`}
          >
            <Users className={`h-8 w-8 ${theme === 'dark' ? 'text-red-400' : 'text-red-600'} mb-3`} />
            <h3 className={`text-xl font-semibold mb-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-800'
            }`}>Absent Students</h3>
            <p className={`text-3xl font-bold ${
              theme === 'dark' ? 'text-gray-200' : 'text-gray-900'
            }`}>{absentStudents}</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className={`p-6 rounded-xl shadow-lg border backdrop-blur-sm ${
              theme === 'dark'
                ? 'bg-white/10 border-white/20 hover:bg-white/15'
                : 'bg-white border-gray-200 hover:bg-gray-50'
            } transition-all duration-300`}
          >
            <Calendar className={`h-8 w-8 ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'} mb-3`} />
            <h3 className={`text-xl font-semibold mb-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-800'
            }`}>Present Percentage</h3>
            <p className={`text-3xl font-bold ${
              theme === 'dark' ? 'text-gray-200' : 'text-gray-900'
            }`}>{presentPercentage}%</p>
          </motion.div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
            }`}>
              Select Year
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className={`w-full p-2 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-800 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              {years.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
            }`}>
              Select Section
            </label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className={`w-full p-2 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-800 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="all">All</option>
              {availableSections.map((section) => (
                <option key={section} value={section}>{section}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
            }`}>
              Select Subject
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className={`w-full p-2 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-800 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              {subjects.map((subject) => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
            }`}>
              Select Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className={`w-full p-2 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-white/5 border-white/10 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
            }`}>
              Select Department
            </label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className={`w-full p-2 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-800 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="all">All</option>
              {availableDepartments.map((department) => (
                <option key={department} value={department}>{department}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Attendance Table */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`rounded-xl border backdrop-blur-sm ${
            theme === 'dark'
              ? 'bg-white/10 border-white/20'
              : 'bg-white border-gray-200'
          }`}
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`${
                  theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'
                }`}>
                  <th className="px-6 py-4 text-left text-lg font-semibold">USN</th>
                  <th className="px-6 py-4 text-left text-lg font-semibold">Name</th>
                  <th className="px-6 py-4 text-left text-lg font-semibold">Attendance</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.usn} className={`border-t ${
                    theme === 'dark' ? 'border-white/10' : 'border-gray-200'
                  }`}>
                    <td className="px-6 py-4">{student.usn}</td>
                    <td className="px-6 py-4">{student.name}</td>
                    <td className="px-6 py-4">
                      <select
                        value={student.status || 'present'}
                        onChange={(e) => handleAttendanceChange(student.usn, e.target.value)}
                        className={`p-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-white/5 border-white/10 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      >
                        <option value="present">Present</option>
                        <option value="absent">Absent</option>
                        <option value="late">Late</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Submit Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSubmitAttendance}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors duration-300"
          >
            Save Attendance
          </button>
        </div>
      </div>
    </motion.div>
  );

  return (
    <TeacherLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
      {content}
    </TeacherLayout>
  );
}

export default Attendance;