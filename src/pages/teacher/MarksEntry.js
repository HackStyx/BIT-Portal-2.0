import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Book, Award, Users, TrendingUp } from 'lucide-react';
import TeacherLayout from '../../components/layouts/TeacherLayout';

function MarksEntry() {
  const [theme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedSection, setSelectedSection] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedExam, setSelectedExam] = useState('Internal Assessment 1');
  const [students, setStudents] = useState([]);
  const [maxMarks, setMaxMarks] = useState(100);
  const [loading, setLoading] = useState(false);
  const [availableSections, setAvailableSections] = useState([]);
  const [availableDepartments, setAvailableDepartments] = useState([]);
  const [availableYears, setAvailableYears] = useState([]);

  const subjects = ['Select Subject', 'DSA', 'Java', 'DBMS', 'OS', 'CN'];
  const examTypes = ['Internal Assessment 1', 'Internal Assessment 2', 'Internal Assessment 3', 'Semester'];

  useEffect(() => {
    fetchStudents();
  }, [selectedYear, selectedDepartment, selectedSection]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams({
        year: selectedYear,
        department: selectedDepartment,
        section: selectedSection
      }).toString();

      const response = await fetch(
        `http://localhost:${process.env.REACT_APP_SERVER_PORT}/api/teacher/students-for-marks?${query}`
      );
      const data = await response.json();

      if (data.success) {
        setStudents(data.students);
        setAvailableSections(['all', ...data.sections]);
        setAvailableDepartments(['all', ...data.departments]);
        setAvailableYears(['all', ...data.years]);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarksChange = (studentId, marks) => {
    if (marks === '' || (Number(marks) >= 0 && Number(marks) <= maxMarks)) {
      setStudents(prevStudents =>
        prevStudents.map(student =>
          student.id === studentId ? { ...student, marks } : student
        )
      );
    }
  };

  const handleMaxMarksChange = (value) => {
    const newMaxMarks = Number(value);
    if (newMaxMarks >= 1) {
      setMaxMarks(newMaxMarks);
      setStudents(prevStudents =>
        prevStudents.map(student => ({
          ...student,
          marks: student.marks && Number(student.marks) > newMaxMarks ? newMaxMarks.toString() : student.marks
        }))
      );
    }
  };

  const handleSubmit = async () => {
    if (!selectedSubject || selectedSubject === 'Select Subject') {
      alert('Please select a subject before submitting marks.');
      return;
    }

    try {
      const marksData = students
        .filter(student => student.marks !== '')
        .map(student => ({
          studentId: student.usn,
          subject: selectedSubject,
          examType: selectedExam,
          marks: Number(student.marks),
          totalMarks: Number(maxMarks),
          semester: student.year,
          academicYear: new Date().getFullYear().toString()
        }));

      if (marksData.length === 0) {
        alert('Please enter marks for at least one student');
        return;
      }

      const response = await fetch(`http://localhost:${process.env.REACT_APP_SERVER_PORT}/api/teacher/marks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ marksData }),
      });

      const data = await response.json();
      if (data.success) {
        alert('Marks saved successfully');
        setStudents(prevStudents =>
          prevStudents.map(student => ({
            ...student,
            marks: ''
          }))
        );
      } else {
        alert(data.message || 'Failed to save marks');
      }
    } catch (error) {
      console.error('Error saving marks:', error);
      alert('Error saving marks. Please try again.');
    }
  };

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
            Marks Entry
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
            <Book className={`h-8 w-8 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} mb-3`} />
            <h3 className={`text-xl font-semibold mb-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-800'
            }`}>Total Subjects</h3>
            <p className={`text-3xl font-bold ${
              theme === 'dark' ? 'text-gray-200' : 'text-gray-900'
            }`}>{subjects.length - 1}</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className={`p-6 rounded-xl shadow-lg border backdrop-blur-sm ${
              theme === 'dark'
                ? 'bg-white/10 border-white/20 hover:bg-white/15'
                : 'bg-white border-gray-200 hover:bg-gray-50'
            } transition-all duration-300`}
          >
            <Award className={`h-8 w-8 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'} mb-3`} />
            <h3 className={`text-xl font-semibold mb-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-800'
            }`}>Exam Types</h3>
            <p className={`text-3xl font-bold ${
              theme === 'dark' ? 'text-gray-200' : 'text-gray-900'
            }`}>{examTypes.length}</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className={`p-6 rounded-xl shadow-lg border backdrop-blur-sm ${
              theme === 'dark'
                ? 'bg-white/10 border-white/20 hover:bg-white/15'
                : 'bg-white border-gray-200 hover:bg-gray-50'
            } transition-all duration-300`}
          >
            <Users className={`h-8 w-8 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'} mb-3`} />
            <h3 className={`text-xl font-semibold mb-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-800'
            }`}>Total Students</h3>
            <p className={`text-3xl font-bold ${
              theme === 'dark' ? 'text-gray-200' : 'text-gray-900'
            }`}>{students.length}</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className={`p-6 rounded-xl shadow-lg border backdrop-blur-sm ${
              theme === 'dark'
                ? 'bg-white/10 border-white/20 hover:bg-white/15'
                : 'bg-white border-gray-200 hover:bg-gray-50'
            } transition-all duration-300`}
          >
            <TrendingUp className={`h-8 w-8 ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'} mb-3`} />
            <h3 className={`text-xl font-semibold mb-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-800'
            }`}>Max Marks</h3>
            <p className={`text-3xl font-bold ${
              theme === 'dark' ? 'text-gray-200' : 'text-gray-900'
            }`}>{maxMarks}</p>
          </motion.div>
        </div>

        {/* Controls */}
        <div className={`p-6 rounded-xl shadow-lg border backdrop-blur-sm mb-8 ${
          theme === 'dark'
            ? 'bg-white/10 border-white/20'
            : 'bg-white border-gray-200'
        }`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                    ? 'bg-white/5 border-white/10 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                {availableYears.map((year) => (
                  <option key={year} value={year}>
                    {year === 'all' ? 'All Years' : `Year ${year}`}
                  </option>
                ))}
              </select>
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
                    ? 'bg-white/5 border-white/10 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                {availableDepartments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept === 'all' ? 'All Departments' : dept}
                  </option>
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
                    ? 'bg-white/5 border-white/10 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                {availableSections.map((section) => (
                  <option key={section} value={section}>
                    {section === 'all' ? 'All Sections' : `Section ${section}`}
                  </option>
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
                    ? 'bg-white/5 border-white/10 text-white'
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
                Select Exam Type
              </label>
              <select
                value={selectedExam}
                onChange={(e) => setSelectedExam(e.target.value)}
                className={`w-full p-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-white/5 border-white/10 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                {examTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
              }`}>
                Max Marks
              </label>
              <input
                type="number"
                value={maxMarks}
                onChange={(e) => handleMaxMarksChange(e.target.value)}
                min="1"
                className={`w-full p-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-white/5 border-white/10 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Marks Table */}
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
                  <th className="px-6 py-4 text-left text-lg font-semibold">Year</th>
                  <th className="px-6 py-4 text-left text-lg font-semibold">Department</th>
                  <th className="px-6 py-4 text-left text-lg font-semibold">Section</th>
                  <th className="px-6 py-4 text-left text-lg font-semibold">Marks</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id} className={`${
                    theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-gray-50'
                  } transition-colors`}>
                    <td className={`px-6 py-4 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-900'
                    }`}>
                      {student.usn}
                    </td>
                    <td className={`px-6 py-4 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-900'
                    }`}>
                      {student.name}
                    </td>
                    <td className={`px-6 py-4 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-900'
                    }`}>
                      {student.year}
                    </td>
                    <td className={`px-6 py-4 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-900'
                    }`}>
                      {student.department}
                    </td>
                    <td className={`px-6 py-4 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-900'
                    }`}>
                      {student.section}
                    </td>
                    <td className={`px-6 py-4 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-900'
                    }`}>
                      <input
                        type="number"
                        value={student.marks}
                        onChange={(e) => handleMarksChange(student.id, e.target.value)}
                        min="0"
                        max={maxMarks}
                        className={`w-24 p-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-white/5 border-white/10 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
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
            onClick={handleSubmit}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors duration-300"
          >
            Save Marks
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

export default MarksEntry;