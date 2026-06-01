import { useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { CircularProgress } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

export default function ProtectedRoute({ children }) {
  const { isLoggedIn, authChecked, onUnauthorizedRef } = useAuth();
  const location  = useLocation();
  const navigate  = useNavigate();

  // Register the 401 redirect handler
  useEffect(() => {
    onUnauthorizedRef.current = () => {
      navigate(`/login?redirect=${encodeURIComponent(location.pathname)}&expired=1`, { replace: true });
    };
    return () => { onUnauthorizedRef.current = null; };
  }, [location.pathname, navigate, onUnauthorizedRef]);

  // Still verifying token with backend
  if (!authChecked) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' }}>
        <CircularProgress style={{ color: '#6366f1' }} />
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  return children;
}
