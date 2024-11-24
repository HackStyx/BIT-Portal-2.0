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
import FeePage from './pages/FeePage';
import ExamPage from './pages/ExamPage';
import TeacherRoutes from './routes/TeacherRoutes';

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
            <Route path="/admin/teachers/*" element={<TeacherRoutes />} />
            <Route path="/admin/fee" element={<FeePage />} />
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
            <Route path="/admin/*" element={<TeacherRoutes />} />
          </Routes>
        </Router>
      </AdminAuthProvider>
    </AvatarProvider>
  );
}

export default App;
