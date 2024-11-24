import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('adminToken');
  console.log('PrivateRoute - Token:', token ? 'exists' : 'missing');
  
  if (!token) {
    console.log('Redirecting to login - no token');
    return <Navigate to="/admin/login" />;
  }
  
  return children;
};

export default PrivateRoute;

