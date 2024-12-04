import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { useNavigate } from 'react-router-dom';
import { BookOpen, TrendingUp, Award, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';

function MarksPage() {
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [marksData, setMarksData] = useState({});
  const [summary, setSummary] = useState({});
  const [selectedSemester, setSelectedSemester] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [availableSubjects, setAvailableSubjects] = useState([]);

  useEffect(() => {
    const fetchMarks = async () => {
      try {
        const usn = localStorage.getItem('studentUSN');
        if (!usn) {
          navigate('/login');
          return;
        }

        const response = await fetch(`http://localhost:${process.env.REACT_APP_SERVER_PORT}/api/marks/${usn}`);
        const data = await response.json();

        if (data.success) {
          setMarksData(data.marks);
          setStudentData(data.student);
          setSummary(data.summary);
        } else {
          setError('Failed to fetch marks');
        }
      } catch (error) {
        console.error('Error fetching marks:', error);
        setError('Failed to load marks information');
      } finally {
        setLoading(false);
      }
    };

    fetchMarks();
  }, [navigate]);

  useEffect(() => {
    if (selectedSemester === 'all') {
      setAvailableSubjects(Object.values(marksData)
        .flatMap(semester => Object.keys(semester))
        .filter((value, index, self) => self.indexOf(value) === index)
      );
    } else {
      setAvailableSubjects(Object.keys(marksData[selectedSemester] || {}));
    }
  }, [selectedSemester, marksData]);

  const handleLogout = () => {
    localStorage.removeItem('studentUSN');
    localStorage.removeItem('token');
    navigate('/', { replace: true });
  };

  const getFilteredMarksData = () => {
    if (selectedSemester === 'all') {
      if (selectedSubject === 'all') return marksData;
      return Object.entries(marksData).reduce((acc, [sem, subjects]) => {
        if (subjects[selectedSubject]) {
          acc[sem] = { [selectedSubject]: subjects[selectedSubject] };
        }
        return acc;
      }, {});
    }
    
    if (selectedSubject === 'all') {
      return { [selectedSemester]: marksData[selectedSemester] };
    }
    
    return {
      [selectedSemester]: {
        [selectedSubject]: marksData[selectedSemester]?.[selectedSubject]
      }
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  const getGradeColor = (percentage) => {
    if (percentage >= 90) return 'text-emerald-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 70) return 'text-indigo-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getGradeBadgeColor = (percentage) => {
    if (percentage >= 90) return 'bg-emerald-50 text-emerald-700 ring-emerald-600/20';
    if (percentage >= 80) return 'bg-blue-50 text-blue-700 ring-blue-600/20';
    if (percentage >= 70) return 'bg-indigo-50 text-indigo-700 ring-indigo-600/20';
    if (percentage >= 60) return 'bg-yellow-50 text-yellow-700 ring-yellow-600/20';
    return 'bg-red-50 text-red-700 ring-red-600/20';
  };

  return (
    <div className={`flex h-screen ${theme === 'dark' ? 'bg-[#111111]' : 'bg-gray-50'}`}>
      <Sidebar 
        open={sidebarOpen} 
        setOpen={setSidebarOpen}
        onLogout={handleLogout}
        theme={theme}
        studentName={studentData?.name}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className={`sticky top-0 z-50 ${
          theme === 'dark' 
            ? 'bg-[#111111] border-white/20' 
            : 'bg-white border-gray-200 shadow-sm'
        } border-b`}>
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <h1 className={`text-2xl font-bold ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Academic Performance
              </h1>
              <div className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                <span className="font-medium">{studentData?.name}</span>
                <span className="mx-2">•</span>
                <span className="text-gray-500">{studentData?.usn}</span>
              </div>
            </div>
          </div>
        </header>

        <main className={`flex-1 overflow-x-hidden overflow-y-auto p-6 ${
          theme === 'dark' ? 'bg-[#111111]' : 'bg-gray-50'
        }`}>
          {/* Filters */}
          <div className="mb-6 flex flex-wrap gap-4">
            <div className="relative">
              <select
                value={selectedSemester}
                onChange={(e) => {
                  setSelectedSemester(e.target.value);
                  setSelectedSubject('all');
                }}
                className={`appearance-none px-4 py-2 pr-8 rounded-lg border shadow-sm transition-colors ${
                  theme === 'dark' 
                    ? 'bg-gray-800 border-gray-600 text-white hover:border-gray-500' 
                    : 'bg-white border-gray-300 text-gray-900 hover:border-gray-400'
                } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
              >
                <option value="all">All Semesters</option>
                {Object.keys(marksData).sort().map(sem => (
                  <option key={sem} value={sem}>Semester {sem}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            </div>

            <div className="relative">
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className={`appearance-none px-4 py-2 pr-8 rounded-lg border shadow-sm transition-colors ${
                  theme === 'dark' 
                    ? 'bg-gray-800 border-gray-600 text-white hover:border-gray-500' 
                    : 'bg-white border-gray-300 text-gray-900 hover:border-gray-400'
                } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
              >
                <option value="all">All Subjects</option>
                {availableSubjects.sort().map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {Object.entries(selectedSemester === 'all' ? summary : { [selectedSemester]: summary[selectedSemester] })
              .map(([semester, data]) => (
                <motion.div
                  key={semester}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`rounded-xl border shadow-sm ${
                    theme === 'dark'
                      ? 'bg-white/10 border-white/20'
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  } transition-all duration-200`}
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className={`text-lg font-semibold ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                          Semester {semester}
                        </h3>
                        <p className={`text-sm ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {data.subjects} Subjects
                        </p>
                      </div>
                      <div className={`p-2 rounded-lg ${getGradeBadgeColor(data.percentage)}`}>
                        <Award className="h-6 w-6" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-gray-500">Overall Performance</span>
                          <span className={`text-sm font-medium ${getGradeColor(data.percentage)}`}>
                            {data.percentage}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              theme === 'dark' ? 'bg-blue-500' : 'bg-blue-600'
                            }`}
                            style={{ width: `${data.percentage}%` }}
                          />
                        </div>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                        <span className="text-sm text-gray-500">Total Marks</span>
                        <span className={`text-sm font-medium ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                          {data.obtainedMarks}/{data.totalMarks}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
          </div>

          {/* Detailed Marks */}
          {Object.entries(getFilteredMarksData()).map(([semester, subjects]) => (
            <motion.div
              key={semester}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`mb-8 rounded-xl border shadow-sm overflow-hidden ${
                theme === 'dark' ? 'bg-white/10 border-white/20' : 'bg-white border-gray-200'
              }`}
            >
              <div className={`px-6 py-4 ${
                theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'
              }`}>
                <h3 className={`text-lg font-semibold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  Semester {semester}
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'}>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Subject
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Exam Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Marks
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Percentage
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {Object.entries(subjects).map(([subject, marks]) => (
                      marks.map((mark, index) => (
                        <tr key={`${subject}-${index}`} className={`${
                          theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-gray-50'
                        } transition-colors`}>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-900'
                          }`}>
                            {subject}
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                          }`}>
                            {mark.examType}
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-900'
                          }`}>
                            {mark.marks}/{mark.totalMarks}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              getGradeBadgeColor((mark.marks / mark.totalMarks) * 100)
                            }`}>
                              {((mark.marks / mark.totalMarks) * 100).toFixed(2)}%
                            </span>
                          </td>
                        </tr>
                      ))
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          ))}
        </main>
      </div>
    </div>
  );
}

export default MarksPage; 