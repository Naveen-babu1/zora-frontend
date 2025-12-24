import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { PageLoader } from '../common/Loader';

// Protected Route - Requires authentication
export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    // Redirect to signin but save the attempted URL
    return <Navigate to="/signin" state={{ from: location.pathname }} replace />;
  }

  return children;
};

// Admin Route - Requires authentication + admin role
export const AdminRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />;
  }

  if (user?.role !== 'admin') {
    // User is logged in but not an admin
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;