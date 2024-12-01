import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { useNavigate } from 'react-router-dom';
import { Calendar } from 'lucide-react';

function AttendancePage() {
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [attendanceData, setAttendanceData] = useState([]);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const usn = localStorage.getItem('studentUSN');
        if (!usn) {
          navigate('/login');
          return;
        }

        const response = await fetch(`http://localhost:${process.env.REACT_APP_SERVER_PORT}/api/attendance/${usn}`);
        const data = await response.json();

        if (data.success) {
          setAttendanceData(data.attendance);
          setStudentData(data.student);
        } else {
          setError('Failed to fetch attendance data');
        }
      } catch (error) {
        console.error('Error fetching attendance:', error);
        setError('Failed to load attendance information');
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('studentUSN');
    localStorage.removeItem('token');
    navigate('/', { replace: true });
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
                {attendanceData.overallPercentage || '0'}%
              </p>
            </div>
            
            {/* Add more attendance statistics cards here */}
          </div>

          {/* Add attendance table or calendar view here */}
        </main>
      </div>
    </div>
  );
}

export default AttendancePage;
