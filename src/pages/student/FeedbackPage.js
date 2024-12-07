import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, ChevronRight } from 'lucide-react';
import { Sidebar } from '../../components/Sidebar';
import { useNavigate } from 'react-router-dom';

const feedbackQuestions = [
  "The teacher seems genuinely interested in teaching.",
  "The teacher comes to the class in time with well preparation and utilizes the complete class hour fruitfully towards teaching learning.",
  "The teacher has a good command of course material with well-organized presentation.",
  "The Teacher presents material clearly with the needs of students and examination.",
  "The teacher uses the class room language with words and expressions within the students' level of understanding.",
  "The teacher encourages the students to ask questions and motivate them through real world examples.",
  "The teacher Rapport with students with respect to academics.",
  "The teacher organizes and presents the concepts towards the course objectives and course outcomes defined.",
  "The teacher is readily available for consultation with students.",
  "The teacher's Behavior, Sincerity and Overall Teaching effectiveness"
];

function FeedbackPage() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [ratings, setRatings] = useState({});
  const [theme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [studentData, setStudentData] = useState(null);
  const [submittedSubjects, setSubmittedSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState([
    {
      section: 'B',
      code: 'CS101',
      name: 'Data Structures and Algorithms',
      faculty: 'Dr. Harish Kumar BT',
      status: 'Pending'
    },
    {
      section: 'B',
      code: 'CS102',
      name: 'Database Management Systems',
      faculty: 'Prof. Nethravathy V',
      status: 'Pending'
    },
    {
      section: 'B',
      code: 'CS103',
      name: 'Operating Systems',
      faculty: 'Prof. Pooja P',
      status: 'Pending'
    }
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usn = localStorage.getItem('studentUSN');
        if (!usn) {
          navigate('/login');
          return;
        }

        // Fetch student data
        const studentResponse = await fetch(
          `http://localhost:${process.env.REACT_APP_SERVER_PORT}/api/auth/student/${usn}`
        );
        const studentData = await studentResponse.json();
        
        console.log('Raw student data:', studentData);

        if (studentData.success) {
          console.log('Student object:', studentData.student);
          setStudentData(studentData.student);
          
          // Fetch feedback status
          const statusResponse = await fetch(
            `http://localhost:${process.env.REACT_APP_SERVER_PORT}/api/feedback/status/${usn}`
          );
          const statusData = await statusResponse.json();
          
          if (statusData.success) {
            setSubmittedSubjects(statusData.submittedSubjects);
            // Update subjects with submission status
            setSubjects(prevSubjects => 
              prevSubjects.map(subject => ({
                ...subject,
                status: statusData.submittedSubjects.includes(subject.code) 
                  ? 'Submitted' 
                  : 'Pending'
              }))
            );
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('studentUSN');
    localStorage.removeItem('token');
    navigate('/', { replace: true });
  };

  const handleRating = (questionIndex, rating) => {
    setRatings(prev => ({
      ...prev,
      [`${selectedSubject?.code}-${questionIndex}`]: rating
    }));
  };

  const handleSubmit = async () => {
    try {
      const usn = localStorage.getItem('studentUSN');
      if (!usn || !selectedSubject) {
        alert('Please select a subject before submitting.');
        return;
      }

      // Calculate semester from year
      const semester = studentData?.year ? studentData.year * 2 : null;
      if (!semester) {
        alert('Unable to determine semester. Please try again.');
        return;
      }

      // Validate all questions are answered
      const responses = feedbackQuestions.map((_, index) => ({
        questionId: index + 1,
        rating: ratings[`${selectedSubject.code}-${index}`] || 0
      }));

      if (responses.some(r => r.rating === 0)) {
        alert('Please answer all questions before submitting.');
        return;
      }

      const submissionData = {
        studentId: usn,
        subject: selectedSubject.code,
        faculty: selectedSubject.faculty,
        responses,
        semester: semester.toString()
      };

      // Debug log
      console.log('Submitting feedback data:', submissionData);

      const response = await fetch(
        `http://localhost:${process.env.REACT_APP_SERVER_PORT}/api/feedback/submit`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(submissionData),
        }
      );

      const data = await response.json();
      console.log('Server response:', data);

      if (data.success) {
        alert('Feedback submitted successfully!');
        setSubmittedSubjects([...submittedSubjects, selectedSubject.code]);
        setSubjects(prevSubjects =>
          prevSubjects.map(subject =>
            subject.code === selectedSubject.code
              ? { ...subject, status: 'Submitted' }
              : subject
          )
        );
        setSelectedSubject(null);
        setRatings({});
      } else {
        alert(data.message || 'Failed to submit feedback');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Error submitting feedback. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
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
          {studentData && (
            <div className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              {studentData.name} | {studentData.usn} | Year: {studentData.year} | Sem: {studentData.year * 2}
            </div>
          )}
        </header>

        <main className={`flex-1 overflow-x-hidden overflow-y-auto p-6 ${
          theme === 'dark' ? 'bg-[#111111]' : 'bg-gray-50'
        }`}>
          <div className="max-w-7xl mx-auto">
            {!selectedSubject ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`rounded-xl border overflow-hidden ${
                  theme === 'dark' ? 'border-white/10' : 'border-gray-200'
                }`}
              >
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className={`${
                      theme === 'dark' 
                        ? 'bg-gradient-to-r from-blue-900/50 via-purple-900/50 to-blue-900/50' 
                        : 'bg-gradient-to-r from-blue-50 via-purple-50 to-blue-50'
                    }`}>
                      <tr>
                        <th className={`px-6 py-4 text-left text-sm font-semibold ${
                          theme === 'dark' ? 'text-gray-100' : 'text-gray-700'
                        }`}>Section</th>
                        <th className={`px-6 py-4 text-left text-sm font-semibold ${
                          theme === 'dark' ? 'text-gray-100' : 'text-gray-700'
                        }`}>Subject</th>
                        <th className={`px-6 py-4 text-left text-sm font-semibold ${
                          theme === 'dark' ? 'text-gray-100' : 'text-gray-700'
                        }`}>Faculty</th>
                        <th className={`px-6 py-4 text-left text-sm font-semibold ${
                          theme === 'dark' ? 'text-gray-100' : 'text-gray-700'
                        }`}>Status</th>
                        <th className={`px-6 py-4 text-left text-sm font-semibold ${
                          theme === 'dark' ? 'text-gray-100' : 'text-gray-700'
                        }`}></th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${
                      theme === 'dark' ? 'divide-white/5' : 'divide-gray-100'
                    }`}>
                      {subjects.map((subject, index) => (
                        <tr
                          key={index}
                          onClick={() => {
                            if (subject.status !== 'Submitted') {
                              setSelectedSubject(subject);
                            }
                          }}
                          className={`cursor-pointer transition-all duration-200 ${
                            theme === 'dark'
                              ? 'hover:bg-white/5 even:bg-white/[0.02]'
                              : 'hover:bg-gray-50 even:bg-gray-50/50'
                          } ${subject.status === 'Submitted' ? 'opacity-50' : ''}`}
                        >
                          <td className={`px-6 py-4 text-sm ${
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-900'
                          }`}>{subject.section}</td>
                          <td className={`px-6 py-4 ${
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-900'
                          }`}>
                            <div className="font-medium">{subject.code}</div>
                            <div className={`text-sm ${
                              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                            }`}>{subject.name}</div>
                          </td>
                          <td className={`px-6 py-4 text-sm ${
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-900'
                          }`}>{subject.faculty}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              subject.status === 'Pending'
                                ? 'bg-yellow-100/10 text-yellow-500'
                                : 'bg-green-100/10 text-green-500'
                            }`}>
                              {subject.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <ChevronRight className={`w-5 h-5 ${
                              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                            }`} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <div className={`p-6 rounded-xl border ${
                  theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
                }`}>
                  <h2 className={`text-xl font-semibold mb-4 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    {selectedSubject.code} - {selectedSubject.name}
                  </h2>
                  <p className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Faculty: {selectedSubject.faculty}
                  </p>
                </div>

                <div className={`p-6 rounded-xl border ${
                  theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
                }`}>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className={`text-lg font-semibold ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      Feedback Questions
                    </h3>
                    <div className={`text-sm ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      1 → Lowest &nbsp;&nbsp; 5 → Excellent
                    </div>
                  </div>
                  <div className="space-y-8">
                    {feedbackQuestions.map((question, index) => (
                      <div key={index} className="space-y-3">
                        <p className={`text-sm ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          {index + 1}. {question}
                        </p>
                        <div className="flex gap-4">
                          {[1, 2, 3, 4, 5].map((rating) => {
                            const currentRating = ratings[`${selectedSubject.code}-${index}`] || 0;
                            const isSelected = rating <= currentRating;
                            
                            return (
                              <button
                                key={rating}
                                onClick={() => handleRating(index, rating)}
                                className={`group p-2 rounded-full transition-all duration-200 ${
                                  theme === 'dark'
                                    ? 'hover:bg-white/10'
                                    : 'hover:bg-gray-100'
                                }`}
                              >
                                <Star 
                                  className={`h-6 w-6 transition-colors duration-200 ${
                                    isSelected
                                      ? 'text-yellow-400 fill-yellow-400'
                                      : theme === 'dark'
                                        ? 'text-gray-600 group-hover:text-gray-400'
                                        : 'text-gray-400 group-hover:text-gray-600'
                                  }`}
                                />
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between gap-4">
                  <button
                    onClick={() => {
                      setSelectedSubject(null);
                      setRatings({});
                    }}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      theme === 'dark'
                        ? 'bg-white/10 hover:bg-white/20 text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                    }`}
                  >
                    Back
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                  >
                    Submit Feedback
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default FeedbackPage;