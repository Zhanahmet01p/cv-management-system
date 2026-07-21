import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

const RequireAuth = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '60vh', color: 'var(--color-text-3)', fontSize: '0.9rem'
      }}>
        <div className="skeleton" style={{ width: '120px', height: '16px', borderRadius: '999px' }} />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

export default RequireAuth;
