import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Book, Award, Users, TrendingUp } from 'lucide-react';
import TeacherLayout from '../../components/layouts/TeacherLayout';

function MarksEntry() {
  const [theme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState('First Year');
  const [selectedSubject, setSelectedSubject] = useState('Mathematics');
  const [selectedExam, setSelectedExam] = useState('Mid Term');

  const mockStudents = [
    { id: 1, name: 'Nishchay J', rollNo: '001', marks: '', maxMarks: 100 },
    { id: 2, name: 'Harshit', rollNo: '002', marks: '', maxMarks: 100 },
    { id: 3, name: 'Sudhanshu Kumar', rollNo: '003', marks: '', maxMarks: 100 }
  ];

  const years = ['First Year', 'Second Year', 'Third Year', 'Fourth Year'];
  const subjects = ['Data Structures', 'Algorithms', 'Operating Systems', 'Database Systems', 'Computer Networks'];
  const examTypes = ['Mid Term', 'Final Term', 'Unit Test', 'Project'];

  const [students, setStudents] = useState(mockStudents);
  const [maxMarks, setMaxMarks] = useState(100);

  const handleMarksChange = (studentId, marks) => {
    if (marks === '' || (Number(marks) >= 0 && Number(marks) <= maxMarks)) {
      setStudents(students.map(student =>
        student.id === studentId ? { ...student, marks } : student
      ));
    }
  };

  const handleMaxMarksChange = (newMaxMarks) => {
    if (newMaxMarks === '' || (Number(newMaxMarks) > 0)) {
      setMaxMarks(newMaxMarks);
      setStudents(students.map(student => ({ ...student, maxMarks: newMaxMarks })));
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
            }`}>5</p>
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
            }`}>Exams</h3>
            <p className={`text-3xl font-bold ${
              theme === 'dark' ? 'text-gray-200' : 'text-gray-900'
            }`}>4</p>
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
            }`}>150</p>
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
            }`}>Average Score</h3>
            <p className={`text-3xl font-bold ${
              theme === 'dark' ? 'text-gray-200' : 'text-gray-900'
            }`}>85%</p>
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
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                style={{
                  WebkitAppearance: 'none',
                  MozAppearance: 'none',
                  backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='${theme === 'dark' ? 'white' : 'black'}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 0.5rem center',
                  backgroundSize: '1.5em 1.5em',
                  paddingRight: '2.5rem'
                }}
              >
                {years.map((year) => (
                  <option 
                    key={year} 
                    value={year}
                    className={`${
                      theme === 'dark' 
                        ? 'bg-gray-800 text-white' 
                        : 'bg-white text-gray-900'
                    } py-2`}
                  >
                    {year}
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
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                style={{
                  WebkitAppearance: 'none',
                  MozAppearance: 'none',
                  backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='${theme === 'dark' ? 'white' : 'black'}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 0.5rem center',
                  backgroundSize: '1.5em 1.5em',
                  paddingRight: '2.5rem'
                }}
              >
                {subjects.map((subject) => (
                  <option 
                    key={subject} 
                    value={subject}
                    className={`${
                      theme === 'dark' 
                        ? 'bg-gray-800 text-white' 
                        : 'bg-white text-gray-900'
                    } py-2`}
                  >
                    {subject}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
              }`}>
                Select Exam
              </label>
              <select
                value={selectedExam}
                onChange={(e) => setSelectedExam(e.target.value)}
                className={`w-full p-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-white/5 border-white/10 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                style={{
                  WebkitAppearance: 'none',
                  MozAppearance: 'none',
                  backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='${theme === 'dark' ? 'white' : 'black'}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 0.5rem center',
                  backgroundSize: '1.5em 1.5em',
                  paddingRight: '2.5rem'
                }}
              >
                {examTypes.map((exam) => (
                  <option 
                    key={exam} 
                    value={exam}
                    className={`${
                      theme === 'dark' 
                        ? 'bg-gray-800 text-white' 
                        : 'bg-white text-gray-900'
                    } py-2`}
                  >
                    {exam}
                  </option>
                ))}
              </select>
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
                  <th className="px-6 py-4 text-left text-lg font-semibold">Roll No</th>
                  <th className="px-6 py-4 text-left text-lg font-semibold">Name</th>
                  <th className="px-6 py-4 text-left text-lg font-semibold">Marks</th>
                  <th className="px-6 py-4 text-left text-lg font-semibold">Max Marks</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id} className={`border-t ${
                    theme === 'dark' ? 'border-white/10' : 'border-gray-200'
                  }`}>
                    <td className="px-6 py-4">{student.rollNo}</td>
                    <td className="px-6 py-4">{student.name}</td>
                    <td className="px-6 py-4">
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
                    <td className="px-6 py-4">
                      <input
                        type="number"
                        value={maxMarks}
                        onChange={(e) => handleMaxMarksChange(e.target.value)}
                        min="1"
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