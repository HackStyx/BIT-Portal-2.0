import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LoginPage from './LoginPage';
import DashboardPage from './DashboardPage';
import AdminLoginPage from './AdminLoginPage';
import AdminDashboard from './pages/AdminDashboard';
import { AdminAuthProvider } from './contexts/AdminAuthContext';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
import { AvatarProvider } from './contexts/AvatarContext';
import TeacherLoginPage from './TeacherLoginPage';
import TeacherDashboard from './TeacherDashboard';
import StudentsPage from './pages/StudentsPage';
import TeachersPage from './pages/TeachersPage';
import FeePageAdmin from './pages/FeePageAdmin';
import FeePage from './pages/student/FeePage';
import ExamPage from './pages/ExamPage';
import TeacherRoutes from './routes/TeacherRoutes';
import AttendancePage from './pages/student/AttendancePage';
import MarksPage from './pages/student/MarksPage';
import FeedbackPage from './pages/student/FeedbackPage';
import AboutPage from './pages/student/AboutPage';
import Schedule from './pages/teacher/Schedule';
import Attendance from './pages/teacher/Attendance';
import MarksEntry from './pages/teacher/MarksEntry';
import Classes from './pages/teacher/Classes';
import Settings from './pages/admin/Settings';


function PrivateRoute({ children, role = 'student' }) {
  const isAuthenticated = role === 'teacher' 
    ? localStorage.getItem('teacherToken') !== null
    : localStorage.getItem('token') !== null;
  
  return isAuthenticated ? children : <Navigate to={role === 'teacher' ? '/teacher/login' : '/'} />;
}

function App() {
  const isAuthenticated = () => {
    return localStorage.getItem('adminToken') !== null;
  };

  return (
    <AvatarProvider>
      <AdminAuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <DashboardPage />
                </PrivateRoute>
              }
            />
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedAdminRoute>
                  <AdminDashboard />
                </ProtectedAdminRoute>
              }
            />
            <Route path="/admin/students" element={<StudentsPage />} />
            <Route path="/admin/teachers/*" element={<TeachersPage />} />
            <Route path="/admin/fee" element={<FeePageAdmin />} />
            <Route path="/admin/exam" element={<ExamPage />} />
            <Route path="/teacher/login" element={<TeacherLoginPage />} />
            
            <Route
              path="/teacher/dashboard"
              element={
                <PrivateRoute role="teacher">
                  <TeacherDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/teacher/schedule"
              element={
                <PrivateRoute role="teacher">
                  <Schedule />
                </PrivateRoute>
              }
            />
            <Route
              path="/teacher/attendance"
              element={
                <PrivateRoute role="teacher">
                  <Attendance />
                </PrivateRoute>
              }
            />
            <Route
              path="/teacher/marks"
              element={
                <PrivateRoute role="teacher">
                  <MarksEntry />
                </PrivateRoute>
              }
            />
            <Route
              path="/teacher/classes"
              element={
                <PrivateRoute role="teacher">
                  <Classes />
                </PrivateRoute>
              }
            />


            <Route path="/fees" element={<FeePage />} />
            <Route path="/marks" element={<MarksPage />} />
            <Route path="/attendance" element={<AttendancePage />} />
            <Route path="/feedback" element={<FeedbackPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route
              path="/admin/settings"
              element={
                <ProtectedAdminRoute>
                  <Settings />
                </ProtectedAdminRoute>
              }
            />

            {/* <Route path="*" element={<Navigate to="/" replace />} /> */}
          </Routes>
        </Router>
      </AdminAuthProvider>
    </AvatarProvider>
  );
}

export default App;
