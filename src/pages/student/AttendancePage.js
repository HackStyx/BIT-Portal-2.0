import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { useNavigate } from 'react-router-dom';
import { Calendar, UserCheck, UserX, X } from 'lucide-react';
import { useAttendance } from '../../contexts/AttendanceContext';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const calculateClassesNeeded = (presentClasses, totalClasses) => {
  const currentPercentage = (presentClasses / totalClasses) * 100;
  if (currentPercentage >= 85) return null;

  // Formula: (present + x)/(total + x) = 0.85
  // Solving for x: x = (0.85*total - present)/(0.15)
  const classesNeeded = Math.ceil((0.85 * totalClasses - presentClasses) / 0.15);
  return classesNeeded;
};

function AttendancePage() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [studentData, setStudentData] = useState(null);
  const [subjectWiseAttendance, setSubjectWiseAttendance] = useState({});
  const [loading, setLoading] = useState(true);
  const { setOverallAttendance } = useAttendance();
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [showOverallStats, setShowOverallStats] = useState(false);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const usn = localStorage.getItem('studentUSN');
        if (!usn) {
          navigate('/login');
          return;
        }
        const response = await fetch(`http://localhost:${process.env.REACT_APP_SERVER_PORT}/api/auth/student/${usn}`);
        const data = await response.json();
        if (data.success) {
          setStudentData(data.student);
          fetchAttendanceData(usn);
        }
      } catch (error) {
        console.error('Error fetching student data:', error);
      }
    };

    const fetchAttendanceData = async (usn) => {
      try {
        const response = await fetch(`http://localhost:${process.env.REACT_APP_SERVER_PORT}/api/attendance/${usn}`);
        const data = await response.json();
        if (data.success) {
          const attendance = data.attendance.subjectWise;
          if (!attendance['Overall']) {
            let totalPresent = 0;
            let totalClasses = 0;
            
            Object.values(attendance).forEach(subject => {
              totalPresent += parseInt(subject.presentClasses) || 0;
              totalClasses += parseInt(subject.totalClasses) || 0;
            });

            attendance['Overall'] = {
              presentClasses: totalPresent,
              totalClasses: totalClasses,
              absentDays: totalClasses - totalPresent,
              percentage: totalClasses ? ((totalPresent / totalClasses) * 100).toFixed(2) : '0'
            };
          }
          setSubjectWiseAttendance(attendance);
          setOverallAttendance(attendance['Overall']);
        }
      } catch (error) {
        console.error('Error fetching attendance data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('studentUSN');
    localStorage.removeItem('token');
    navigate('/', { replace: true });
  };

  const handleSubjectClick = (subject, data) => {
    setSelectedSubject(selectedSubject === subject ? null : subject);
  };

  const OverallStatsModal = () => {
    const overall = subjectWiseAttendance['Overall'];
    const percentage = parseFloat(overall?.percentage || 0);
    const presentClasses = parseInt(overall?.presentClasses || 0);
    const totalClasses = parseInt(overall?.totalClasses || 0);
    const absentClasses = totalClasses - presentClasses;
    
    // Prepare data for the pie chart
    const subjectData = Object.entries(subjectWiseAttendance)
      .filter(([subject]) => subject !== 'Overall')
      .map(([subject, data]) => ({
        name: subject,
        value: parseInt(data.presentClasses),
        totalClasses: parseInt(data.totalClasses),
        absentDays: parseInt(data.totalClasses) - parseInt(data.presentClasses),
        percentage: parseFloat(data.percentage)
      }));

    // Colors for the pie chart
    const COLORS = [
      '#4ECDC4', '#FF6B6B', '#45B7D1', '#96CEB4', 
      '#FFEEAD', '#D4A5A5', '#9B5DE5', '#00BBF9'
    ];

    // Custom tooltip component
    const CustomTooltip = ({ active, payload }) => {
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
            }`}>{data.name}</h4>
            <div className={`space-y-1 text-sm ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              <p>Total Classes: {data.totalClasses}</p>
              <p>Present Days: {data.value}</p>
              <p>Absent Days: {data.absentDays}</p>
              <p className={`font-semibold ${
                data.percentage >= 85 ? 'text-green-500' :
                data.percentage >= 75 ? 'text-blue-500' :
                'text-red-500'
              }`}>
                Attendance: {data.percentage}%
              </p>
            </div>
          </div>
        );
      }
      return null;
    };

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className={`relative w-full max-w-4xl p-8 rounded-2xl ${
          theme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-white'
        }`}>
          <button
            onClick={() => setShowOverallStats(false)}
            className={`absolute right-4 top-4 p-1 rounded-full ${
              theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-gray-100'
            }`}
          >
            <X className={`h-5 w-5 ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`} />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column - Pie Chart */}
            <div>
              <h2 className={`text-2xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                Attendance Distribution
              </h2>
              
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={subjectData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={140}
                      paddingAngle={2}
                      dataKey="value"
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
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend */}
              <div className="mt-4 grid grid-cols-2 gap-2">
                {subjectData.map((subject, index) => (
                  <div 
                    key={subject.name}
                    className="flex items-center text-sm"
                  >
                    <span 
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className={`truncate ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {subject.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column - Stats */}
            <div className="space-y-6">
              <div className={`p-6 rounded-xl ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'}`}>
                <h3 className={`text-xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                  Overall Statistics
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      Overall Attendance
                    </p>
                    <p className={`text-3xl font-bold ${
                      percentage >= 85 ? 'text-green-500' :
                      percentage >= 75 ? 'text-blue-500' :
                      'text-red-500'
                    }`}>
                      {percentage}%
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        Total Classes
                      </p>
                      <p className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                        {totalClasses}
                      </p>
                    </div>
                    <div>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        Classes Attended
                      </p>
                      <p className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                        {presentClasses}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Target Analysis */}
              <div className={`p-6 rounded-xl ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'}`}>
                <h3 className={`text-xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                  Target Analysis
                </h3>
                
                {percentage >= 85 ? (
                  <p className="text-green-500 font-medium">
                    ✨ Congratulations! You've maintained excellent attendance above 85%
                  </p>
                ) : (
                  <div className="space-y-2">
                    <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                      To reach 85% attendance:
                    </p>
                    <p className={`font-medium ${
                      theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'
                    }`}>
                      Need {calculateClassesNeeded(presentClasses, totalClasses)} consecutive presents
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const DetailedRecordsModal = ({ subject, data, onClose }) => {
    // Calculate attendance statistics
    const records = data?.records || [];
    const presentCount = records.filter(r => r.status === 'present').length;
    const absentCount = records.filter(r => r.status === 'absent').length;
    const totalCount = records.length;

    // Prepare data for the pie chart
    const chartData = [
      { name: 'Present', value: presentCount },
      { name: 'Absent', value: absentCount }
    ];

    const COLORS = ['#4ECDC4', '#FF6B6B'];

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className={`relative w-full max-w-4xl p-8 rounded-2xl ${
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column - Pie Chart */}
            <div>
              <h2 className={`text-2xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                {subject} - Attendance Distribution
              </h2>
              
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={140}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={COLORS[index]}
                          strokeWidth={2}
                          stroke={theme === 'dark' ? '#1a1a1a' : '#ffffff'}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend */}
              <div className="mt-4 flex justify-center gap-6">
                {chartData.map((item, index) => (
                  <div key={item.name} className="flex items-center">
                    <span 
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: COLORS[index] }}
                    />
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                      {item.name} ({item.value})
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column - Records Table */}
            <div>
              <h3 className={`text-xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                Attendance Records
              </h3>
              
              <div className={`rounded-xl border overflow-hidden ${
                theme === 'dark' ? 'bg-white/5 border-white/20' : 'bg-white border-gray-200'
              }`}>
                <div className="max-h-[500px] overflow-y-auto">
                  <table className="w-full">
                    <thead className={`sticky top-0 ${
                      theme === 'dark' 
                        ? 'bg-gray-800' 
                        : 'bg-gray-50'
                    }`}>
                      <tr>
                        <th className={`px-4 py-3 text-left text-sm font-semibold ${
                          theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                        }`}>Date</th>
                        <th className={`px-4 py-3 text-center text-sm font-semibold ${
                          theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                        }`}>Status</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${
                      theme === 'dark' ? 'divide-white/5' : 'divide-gray-100'
                    }`}>
                      {records.map((record, index) => (
                        <tr key={index} className={
                          theme === 'dark'
                            ? 'hover:bg-white/5'
                            : 'hover:bg-gray-50'
                        }>
                          <td className={`px-4 py-3 ${
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-900'
                          }`}>{new Date(record.date).toLocaleDateString()}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              record.status === 'present'
                                ? 'bg-green-100/10 text-green-500'
                                : 'bg-red-100/10 text-red-500'
                            }`}>
                              {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

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
        <header className={`flex items-center justify-between p-4 border-b ${
          theme === 'dark' 
            ? 'bg-[#111111] border-white/20' 
            : 'bg-white border-gray-300'
        }`}>
          <h1 className={`text-2xl font-bold ${
            theme === 'dark' ? 'text-white' : 'text-gray-800'
          }`}>
            Attendance Record
          </h1>
        </header>

        <main className={`flex-1 overflow-x-hidden overflow-y-auto p-6 ${
          theme === 'dark' ? 'bg-[#111111]' : 'bg-gray-50'
        }`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div
              onClick={() => setShowOverallStats(true)}
              className={`p-6 rounded-lg shadow-lg border cursor-pointer transition-all ${
                theme === 'dark'
                  ? 'bg-white/10 border-white/20 hover:bg-white/[0.15]'
                  : 'bg-white border-gray-200 hover:bg-gray-50'
              }`}
            >
              <Calendar className={`h-8 w-8 ${theme === 'dark' ? 'text-blue-500' : 'text-blue-600'} mb-2`} />
              <h3 className={`text-xl font-semibold mb-2 ${
                theme === 'dark' ? 'text-white' : 'text-gray-800'
              }`}>Overall Attendance</h3>
              <p className={`text-3xl font-bold ${
                theme === 'dark' ? 'text-gray-200' : 'text-gray-900'
              }`}>
                {subjectWiseAttendance['Overall']?.percentage || '0'}%
              </p>
            </div>

            <div className={`p-6 rounded-lg shadow-lg border ${
              theme === 'dark'
                ? 'bg-white/10 border-white/20'
                : 'bg-white border-gray-200'
            }`}>
              <UserCheck className={`h-8 w-8 ${theme === 'dark' ? 'text-green-500' : 'text-green-600'} mb-2`} />
              <h3 className={`text-xl font-semibold mb-2 ${
                theme === 'dark' ? 'text-white' : 'text-gray-800'
              }`}>Present Days</h3>
              <p className={`text-3xl font-bold ${
                theme === 'dark' ? 'text-gray-200' : 'text-gray-900'
              }`}>
                {subjectWiseAttendance['Overall']?.presentClasses || '0'}
              </p>
            </div>

            <div className={`p-6 rounded-lg shadow-lg border ${
              theme === 'dark'
                ? 'bg-white/10 border-white/20'
                : 'bg-white border-gray-200'
            }`}>
              <UserX className={`h-8 w-8 ${theme === 'dark' ? 'text-red-500' : 'text-red-600'} mb-2`} />
              <h3 className={`text-xl font-semibold mb-2 ${
                theme === 'dark' ? 'text-white' : 'text-gray-800'
              }`}>Absent Days</h3>
              <p className={`text-3xl font-bold ${
                theme === 'dark' ? 'text-gray-200' : 'text-gray-900'
              }`}>
                {subjectWiseAttendance['Overall']?.absentDays || '0'}
              </p>
            </div>
          </div>

          <div className="mt-6">
            <h2 className={`text-xl font-semibold mb-4 ${
              theme === 'dark' ? 'text-white' : 'text-gray-800'
            }`}>Subject-wise Attendance</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(subjectWiseAttendance)
                .filter(([subject]) => subject !== 'Overall')
                .map(([subject, data]) => {
                  const classesNeeded = calculateClassesNeeded(
                    parseInt(data.presentClasses),
                    parseInt(data.totalClasses)
                  );

                  return (
                    <div
                      key={subject}
                      onClick={() => handleSubjectClick(subject, data)}
                      className={`p-6 rounded-xl border cursor-pointer transition-all ${
                        theme === 'dark'
                          ? 'bg-white/10 border-white/20 hover:bg-white/[0.15]'
                          : 'bg-white border-gray-200 hover:bg-gray-50'
                      } ${selectedSubject === subject ? 'ring-2 ring-blue-500' : ''}`}
                    >
                      <h3 className={`text-lg font-semibold mb-2 ${
                        theme === 'dark' ? 'text-white' : 'text-gray-800'
                      }`}>{subject}</h3>
                      
                      <div className="space-y-2">
                        <p className={`${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                          Total Classes: {data.totalClasses}
                        </p>
                        <p className={`${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                          Present: {data.presentClasses}
                        </p>
                        <p className={`text-lg font-bold ${
                          parseFloat(data.percentage) >= 85
                            ? 'text-green-500'
                            : parseFloat(data.percentage) >= 75
                            ? 'text-blue-500'
                            : parseFloat(data.percentage) >= 65
                            ? 'text-yellow-500'
                            : parseFloat(data.percentage) >= 55
                            ? 'text-orange-500'
                            : 'text-red-500'
                        }`}>
                          {data.percentage}%
                        </p>
                        
                        <p className={`text-sm mt-2 ${
                          parseFloat(data.percentage) >= 85
                            ? theme === 'dark' ? 'text-green-400' : 'text-green-600'
                            : theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {parseFloat(data.percentage) >= 85 ? (
                            <span className="flex items-center">
                              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                              Perfect Attendance!
                            </span>
                          ) : classesNeeded ? (
                            <span className="flex items-center">
                              <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                              Need {classesNeeded} consecutive present{classesNeeded === 1 ? '' : 's'} for 85%
                            </span>
                          ) : null}
                        </p>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {selectedSubject && (
            <DetailedRecordsModal
              subject={selectedSubject}
              data={subjectWiseAttendance[selectedSubject]}
              onClose={() => setSelectedSubject(null)}
            />
          )}
        </main>
      </div>
      {showOverallStats && <OverallStatsModal />}
    </div>
  );
}

export default AttendancePage;