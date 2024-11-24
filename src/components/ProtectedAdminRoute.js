import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '../contexts/AdminAuthContext';

function ProtectedAdminRoute({ children }) {
  const { isAdminAuthenticated } = useAdminAuth();
  
  if (!isAdminAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}

export default ProtectedAdminRoute;
