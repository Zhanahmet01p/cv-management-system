import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  Briefcase,
  User,
  ShieldCheck,
  LogOut,
  LogIn,
  Library
} from 'lucide-react';

const NavBar = () => {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const linkClass = ({ isActive }) =>
    `nav-link${isActive ? ' active' : ''}`;

  return (
    <nav 
      style={{
        background: 'var(--color-surface)',
        borderRight: '1px solid var(--color-border)',
        padding: '1rem 0.75rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.25rem',
        minHeight: 'calc(100vh - 60px)',
        position: 'sticky',
        top: '60px',
        height: 'fit-content',
      }}
      className="nav-sidebar"
    >
      <NavLink to="/" end className={linkClass} id="nav-home">
        <LayoutDashboard size={16} />
        {t('nav.home') || 'Dashboard'}
      </NavLink>

      <NavLink to="/positions" className={linkClass} id="nav-positions">
        <Briefcase size={16} />
        {t('nav.positions') || 'Positions'}
      </NavLink>

      {user && (
        <NavLink to="/profile" className={linkClass} id="nav-profile">
          <User size={16} />
          {t('nav.profile') || 'Profile'}
        </NavLink>
      )}

      {(user?.role === 'ADMIN' || user?.role === 'RECRUITER') && (
        <NavLink to="/admin" end className={linkClass} id="nav-admin">
          <Library size={16} />
          {t('nav.admin') || 'Attributes'}
        </NavLink>
      )}

      {user?.role === 'ADMIN' && (
        <NavLink to="/admin/users" className={linkClass} id="nav-users">
          <ShieldCheck size={16} />
          {t('nav.users') || 'Users'}
        </NavLink>
      )}

      <div style={{ flex: 1 }} />
      <hr className="divider" style={{ margin: '0.75rem 0' }} />

      {user ? (
        <div>
          {/* User info */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.625rem',
            padding: '0.5rem 0.875rem', marginBottom: '0.5rem'
          }}>
            {user.photoUrl ? (
              <img
                src={user.photoUrl}
                alt="avatar"
                className="avatar"
                style={{ width: '2rem', height: '2rem', fontSize: '0.75rem' }}
              />
            ) : (
              <div className="avatar" style={{ width: '2rem', height: '2rem', fontSize: '0.75rem' }}>
                {(user.firstName?.[0] || user.email?.[0] || 'U').toUpperCase()}
              </div>
            )}
            <div style={{ minWidth: 0 }}>
              <div style={{
                fontSize: '0.8rem', fontWeight: 600,
                color: 'var(--color-text)',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
              }}>
                {user.firstName || user.email?.split('@')[0]}
              </div>
              <div>
                <span className={`badge badge-${user.role === 'ADMIN' ? 'danger' : user.role === 'RECRUITER' ? 'accent' : 'primary'}`}
                  style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>
                  {user.role}
                </span>
              </div>
            </div>
          </div>

          <button
            id="btn-logout"
            onClick={handleLogout}
            className="nav-link"
            style={{ width: '100%', border: 'none', background: 'none', color: 'var(--color-danger)', cursor: 'pointer' }}
          >
            <LogOut size={16} />
            {t('nav.logout') || 'Logout'}
          </button>
        </div>
      ) : (
        <NavLink to="/login" className={linkClass} id="nav-login">
          <LogIn size={16} />
          {t('nav.login') || 'Login'}
        </NavLink>
      )}
    </nav>
  );
};

export default NavBar;