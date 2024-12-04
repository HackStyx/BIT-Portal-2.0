import React, { createContext, useContext, useState, useEffect } from 'react';

const AttendanceContext = createContext();

export function AttendanceProvider({ children }) {
  const [overallAttendance, setOverallAttendance] = useState({
    percentage: '0',
    presentClasses: '0',
    totalClasses: '0'
  });

  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        const usn = localStorage.getItem('studentUSN');
        if (!usn) return;

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
          setOverallAttendance(attendance['Overall']);
        }
      } catch (error) {
        console.error('Error fetching attendance data:', error);
      }
    };

    fetchAttendanceData();
  }, []);

  return (
    <AttendanceContext.Provider value={{ overallAttendance, setOverallAttendance }}>
      {children}
    </AttendanceContext.Provider>
  );
}

export function useAttendance() {
  return useContext(AttendanceContext);
} 