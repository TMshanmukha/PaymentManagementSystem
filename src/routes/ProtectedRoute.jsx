import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { LoadingState } from '../components/LoadingState.jsx';

/**
 * Frontend route guard — UX only. The backend independently enforces
 * authentication/authorization on every request; this component just
 * avoids flashing protected UI before we know the session is invalid.
 */
export function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingState fullScreen label="Loading VVSLedger..." />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return <Outlet />;
}
