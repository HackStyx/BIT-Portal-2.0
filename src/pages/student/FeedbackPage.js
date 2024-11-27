import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { useNavigate } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';

function FeedbackPage() {
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const usn = localStorage.getItem('studentUSN');
        if (!usn) {
          navigate('/login');
          return;
        }

        // Replace with your actual API endpoint
        const response = await fetch(`http://localhost:${process.env.REACT_APP_SERVER_PORT}/api/student/${usn}`);
        const data = await response.json();

        if (data.success) {
          setStudentData(data.student);
        } else {
          setError('Failed to fetch student data');
        }
      } catch (error) {
        console.error('Error fetching student data:', error);
        setError('Failed to load student information');
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

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    // Add your feedback submission logic here
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
            Feedback
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
              <MessageSquare className={`h-8 w-8 ${theme === 'dark' ? 'text-yellow-500' : 'text-yellow-600'} mb-2`} />
              <h3 className={`text-xl font-semibold mb-2 ${
                theme === 'dark' ? 'text-white' : 'text-gray-800'
              }`}>Feedback</h3>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Enter your feedback here..."
                className={`w-full h-32 p-2 border ${
                  theme === 'dark' ? 'bg-white/10 border-white/20' : 'bg-white border-gray-200'
                } rounded-lg`}
              />
            </div>
          </div>

          <button
            onClick={handleSubmitFeedback}
            className={`mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600`}
          >
            Submit Feedback
          </button>
        </main>
      </div>
    </div>
  );
}

export default FeedbackPage; 