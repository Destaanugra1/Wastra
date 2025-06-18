import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user')) || {};
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  if (adminOnly && user.role !== 'admin') {
    return <Navigate to='/toko' replace />
  }
  return children;
};

export default ProtectedRoute;