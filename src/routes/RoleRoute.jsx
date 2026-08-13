import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { ROLE_HOME } from '../config/constants.js';

/** Restricts a subtree to specific roles; redirects elsewhere if the user doesn't match. */
export function RoleRoute({ allow }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!allow.includes(user.role)) return <Navigate to={ROLE_HOME[user.role] || '/login'} replace />;
  return <Outlet />;
}
