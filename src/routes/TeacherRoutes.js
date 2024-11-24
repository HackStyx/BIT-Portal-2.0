import { Routes, Route } from 'react-router-dom';
import TeachersPage from '../pages/TeachersPage';
import PrivateRoute from '../components/PrivateRoute';

const TeacherRoutes = () => {
  return (
    <Routes>
      <Route 
        path="/" 
        element={
          <PrivateRoute>
            <TeachersPage />
          </PrivateRoute>
        } 
      />
    </Routes>
  );
};

export default TeacherRoutes;
