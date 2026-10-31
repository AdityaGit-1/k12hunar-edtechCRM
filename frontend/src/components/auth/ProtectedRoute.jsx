import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import Spinner from '../ui/Spinner.jsx';

// Wraps every admin page. Nobody without a valid session ever sees the dashboard:
// while we check the stored token we show a spinner, and if there is no session
// we redirect to the login page.
export default function ProtectedRoute() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center text-brand-700" role="status">
        <Spinner className="h-8 w-8" />
        <span className="sr-only">Checking your session</span>
      </div>
    );
  }

  if (status !== 'authenticated') {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
