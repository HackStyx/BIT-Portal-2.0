import { Routes, Route, Navigate } from 'react-router-dom';
import TeacherDashboard from '../../pages/teacher/Dashboard';
import Schedule from '../../pages/teacher/Schedule';
import TeacherAttendance from '../../pages/teacher/Attendance';
import TeacherMarks from '../../pages/teacher/Marks';
import TeacherClasses from '../../pages/teacher/Classes';
import TeacherLoginPage from '../../pages/teacher/Login';
import TeacherLayout from '../../components/layouts/TeacherLayout';

const PrivateTeacherRoute = ({ children }) => {
  const teacherToken = localStorage.getItem('teacherToken');
  return teacherToken ? (
    <TeacherLayout>{children}</TeacherLayout>
  ) : (
    <Navigate to="/teacher/login" replace />
  );
};

function TeacherRoutes() {
  return (
    <Routes>
      <Route path="login" element={<TeacherLoginPage />} />
      <Route
        path="dashboard"
        element={
          <PrivateTeacherRoute>
            <TeacherDashboard />
          </PrivateTeacherRoute>
        }
      />
      <Route
        path="schedule"
        element={
          <PrivateTeacherRoute>
            <Schedule />
          </PrivateTeacherRoute>
        }
      />
      {/* Other routes... */}
      <Route index element={<Navigate to="dashboard" replace />} />
    </Routes>
  );
}

export default TeacherRoutes;