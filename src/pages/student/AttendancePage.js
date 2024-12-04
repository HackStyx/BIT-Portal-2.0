import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { useNavigate } from 'react-router-dom';
import { Calendar, UserCheck, UserX } from 'lucide-react';
import { useAttendance } from '../../contexts/AttendanceContext';

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
            <div className={`p-6 rounded-lg shadow-lg border ${
              theme === 'dark'
                ? 'bg-white/10 border-white/20'
                : 'bg-white border-gray-200'
            }`}>
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
            <div className="mt-12">
              <h2 className={`text-xl font-semibold mb-6 flex items-center justify-between max-w-md mx-auto ${
                theme === 'dark' ? 'text-white' : 'text-gray-800'
              }`}>
                <span className="flex-1 text-center pr-8">Detailed Records - {selectedSubject}</span>
                <button 
                  onClick={() => setSelectedSubject(null)}
                  className={`text-sm px-3 py-1 rounded-lg ${
                    theme === 'dark' 
                      ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                  }`}
                >
                  Close
                </button>
              </h2>
              
              <div className="flex justify-center">
                <div className={`rounded-xl border overflow-hidden w-full max-w-md ${
                  theme === 'dark' ? 'bg-white/10 border-white/20' : 'bg-white border-gray-200'
                }`}>
                  <table className="w-full">
                    <thead className={`${
                      theme === 'dark' 
                        ? 'bg-gradient-to-r from-blue-900/50 via-purple-900/50 to-blue-900/50' 
                        : 'bg-gradient-to-r from-blue-50 via-purple-50 to-blue-50'
                    }`}>
                      <tr>
                        <th className={`px-4 py-3 text-left text-sm font-semibold ${
                          theme === 'dark' ? 'text-gray-100' : 'text-gray-700'
                        }`}>Date</th>
                        <th className={`px-4 py-3 text-center text-sm font-semibold ${
                          theme === 'dark' ? 'text-gray-100' : 'text-gray-700'
                        }`}>Status</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${
                      theme === 'dark' ? 'divide-white/5' : 'divide-gray-100'
                    }`}>
                      {subjectWiseAttendance[selectedSubject]?.records?.map((record, index) => (
                        <tr key={index} className={`${
                          theme === 'dark'
                            ? 'hover:bg-white/5 even:bg-white/[0.02]'
                            : 'hover:bg-gray-50 even:bg-gray-50/50'
                        }`}>
                          <td className={`px-4 py-3 ${
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-900'
                          }`}>{new Date(record.date).toLocaleDateString()}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              record.status === 'present'
                                ? 'bg-green-100/10 text-green-500'
                                : record.status === 'absent'
                                ? 'bg-red-100/10 text-red-500'
                                : 'bg-yellow-100/10 text-yellow-500'
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
          )}
        </main>
      </div>
    </div>
  );
}

export default AttendancePage;
