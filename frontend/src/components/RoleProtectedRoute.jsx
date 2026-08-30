import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

function RoleProtectedRoute({ allowedRoles }) {
  const { user } = useContext(AuthContext);

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" />;
  }

  return <Outlet />;
}
export default RoleProtectedRoute;