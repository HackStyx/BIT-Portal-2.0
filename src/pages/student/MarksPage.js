import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { useNavigate } from 'react-router-dom';
import { BookOpen, TrendingUp, Award, ChevronDown, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const SemesterDetailsModal = ({ semester, data, summary, onClose, theme }) => {
  // Prepare data for visualizations
  const subjectData = Object.entries(data).map(([subject, marks]) => {
    const totalMarks = marks.reduce((sum, mark) => sum + mark.marks, 0);
    const maxMarks = marks.reduce((sum, mark) => sum + mark.totalMarks, 0);
    const percentage = (totalMarks / maxMarks) * 100;
    
    return {
      subject,
      percentage: parseFloat(percentage.toFixed(2)),
      totalMarks,
      maxMarks,
      details: marks
    };
  });

  // Colors for charts
  const COLORS = ['#4ECDC4', '#FF6B6B', '#45B7D1', '#96CEB4', '#FFEEAD', '#D4A5A5', '#9B5DE5', '#00BBF9'];

  const getGradeBadgeColor = (percentage) => {
    if (percentage >= 90) return 'bg-emerald-50 text-emerald-700 ring-emerald-600/20';
    if (percentage >= 80) return 'bg-blue-50 text-blue-700 ring-blue-600/20';
    if (percentage >= 70) return 'bg-indigo-50 text-indigo-700 ring-indigo-600/20';
    if (percentage >= 60) return 'bg-yellow-50 text-yellow-700 ring-yellow-600/20';
    return 'bg-red-50 text-red-700 ring-red-600/20';
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className={`relative w-full max-w-6xl p-8 rounded-2xl max-h-[90vh] overflow-y-auto ${
        theme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-white'
      }`}>
        <button
          onClick={onClose}
          className={`absolute right-4 top-4 p-1 rounded-full ${
            theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-gray-100'
          }`}
        >
          <X className={`h-5 w-5 ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`} />
        </button>

        <h2 className={`text-2xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
          Semester {semester} Performance Analysis
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column - Summary and Pie Chart */}
          <div className="space-y-6">
            {/* Summary Card */}
            <div className={`p-6 rounded-xl ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'}`}>
              <h3 className={`text-xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                Semester Overview
              </h3>
              <div className="space-y-4">
                <div>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    Overall Percentage
                  </p>
                  <p className={`text-3xl font-bold ${
                    summary[semester].percentage >= 85 ? 'text-green-500' :
                    summary[semester].percentage >= 75 ? 'text-blue-500' :
                    'text-red-500'
                  }`}>
                    {summary[semester].percentage}%
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      Total Marks
                    </p>
                    <p className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                      {summary[semester].obtainedMarks}/{summary[semester].totalMarks}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      Subjects
                    </p>
                    <p className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                      {summary[semester].subjects}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Pie Chart */}
            <div className={`p-6 rounded-xl ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'}`}>
              <h3 className={`text-xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                Subject Distribution
              </h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={subjectData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="percentage"
                      nameKey="subject"
                    >
                      {subjectData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={COLORS[index % COLORS.length]}
                          strokeWidth={2}
                          stroke={theme === 'dark' ? '#1a1a1a' : '#ffffff'}
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className={`p-4 rounded-lg shadow-lg ${
                              theme === 'dark' 
                                ? 'bg-gray-800 border border-gray-700' 
                                : 'bg-white border border-gray-200'
                            }`}>
                              <h4 className={`font-bold mb-2 ${
                                theme === 'dark' ? 'text-white' : 'text-gray-800'
                              }`}>{data.subject}</h4>
                              <div className={`space-y-1 text-sm ${
                                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                              }`}>
                                <p>Total Marks: {data.totalMarks}/{data.maxMarks}</p>
                                <p className={`font-semibold ${
                                  data.percentage >= 85 ? 'text-green-500' :
                                  data.percentage >= 75 ? 'text-blue-500' :
                                  'text-red-500'
                                }`}>
                                  Percentage: {data.percentage}%
                                </p>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {subjectData.map((subject, index) => (
                  <div key={subject.subject} className="flex items-center text-sm">
                    <span 
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className={`truncate ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {subject.subject}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Bar Chart and Details */}
          <div className="space-y-6">
            {/* Bar Chart */}
            <div className={`p-6 rounded-xl ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'}`}>
              <h3 className={`text-xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                Subject-wise Performance
              </h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={subjectData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 60
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis 
                      dataKey="subject" 
                      angle={-45} 
                      textAnchor="end" 
                      height={70}
                      interval={0}
                      tick={{ 
                        fill: theme === 'dark' ? '#fff' : '#000', 
                        fontSize: 12,
                        dy: 5
                      }}
                    />
                    <YAxis 
                      tick={{ fill: theme === 'dark' ? '#fff' : '#000' }}
                      domain={[0, 100]}
                    />
                    <Tooltip />
                    <Bar dataKey="percentage" fill="#4ECDC4" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Detailed Marks Table */}
            <div className={`rounded-xl border overflow-hidden ${
              theme === 'dark' ? 'bg-white/5 border-white/20' : 'bg-white border-gray-200'
            }`}>
              <div className="max-h-[300px] overflow-y-auto">
                <table className="w-full">
                  <thead className={`sticky top-0 ${
                    theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'
                  }`}>
                    <tr>
                      <th className={`px-4 py-3 text-left text-sm font-semibold ${
                        theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                      }`}>Subject</th>
                      <th className={`px-4 py-3 text-center text-sm font-semibold ${
                        theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                      }`}>Marks</th>
                      <th className={`px-4 py-3 text-center text-sm font-semibold ${
                        theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                      }`}>Percentage</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${theme === 'dark' ? 'divide-white/5' : 'divide-gray-100'}`}>
                    {subjectData.map((subject) => (
                      <tr key={subject.subject} className={
                        theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-gray-50'
                      }>
                        <td className={`px-4 py-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>
                          {subject.subject}
                        </td>
                        <td className={`px-4 py-3 text-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>
                          {subject.totalMarks}/{subject.maxMarks}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            getGradeBadgeColor(subject.percentage)
                          }`}>
                            {subject.percentage}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

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
  const [selectedSemesterDetails, setSelectedSemesterDetails] = useState(null);

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

  const handleSemesterClick = (semester) => {
    setSelectedSemesterDetails(semester);
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
                  onClick={() => handleSemesterClick(semester)}
                  className={`rounded-xl border shadow-sm cursor-pointer ${
                    theme === 'dark'
                      ? 'bg-white/10 border-white/20 hover:bg-white/[0.15]'
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

      {/* Add the modal */}
      {selectedSemesterDetails && (
        <SemesterDetailsModal
          semester={selectedSemesterDetails}
          data={marksData[selectedSemesterDetails]}
          summary={summary}
          onClose={() => setSelectedSemesterDetails(null)}
          theme={theme}
        />
      )}
    </div>
  );
}

export default MarksPage; 