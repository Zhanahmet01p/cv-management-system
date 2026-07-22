import { useState } from 'react';
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
  Library,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';

const NavBar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    if (onClose) onClose();
    navigate('/login');
  };

  const handleLinkClick = () => {
    if (onClose) onClose();
  };

  const toggleCollapse = () => {
    setIsCollapsed(prev => !prev);
  };

  const linkClass = ({ isActive }) =>
    `modern-nav-link${isActive ? ' active' : ''}`;

  return (
    <>
      <div 
        className={`sidebar-overlay ${isOpen ? 'active' : ''} ` } 
        onClick={onClose} 
      />

      <aside className={`sidebar-nav ${isOpen ? 'open' : ''} ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-mobile-header">
          <span className="sidebar-mobile-title">Navigation</span>
          <button onClick={onClose} className="btn-icon-close" aria-label="Close navigation">
            <X size={18} />
          </button>
        </div>

        <button 
          onClick={toggleCollapse} 
          className="desktop-collapse-btn"
          aria-label="Toggle navigation width"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        <div className="sidebar-content">
          <div className="nav-group">
            <span className="nav-group-title">Main</span>
            
            <NavLink to="/" end className={linkClass} onClick={handleLinkClick} id="nav-home" title={isCollapsed ? t('nav.home') : ''}>
              <LayoutDashboard size={18} className="nav-icon" />
              <span className="nav-label">{t('nav.home')}</span>
            </NavLink>

            <NavLink to="/positions" className={linkClass} onClick={handleLinkClick} id="nav-positions" title={isCollapsed ? t('nav.positions') : ''}>
              <Briefcase size={18} className="nav-icon" />
              <span className="nav-label">{t('nav.positions')}</span>
            </NavLink>

            {user && (
              <NavLink to="/profile" className={linkClass} onClick={handleLinkClick} id="nav-profile" title={isCollapsed ? t('nav.profile') : ''}>
                <User size={18} className="nav-icon" />
                <span className="nav-label">{t('nav.profile')}</span>
              </NavLink>
            )}
          </div>

          {(user?.role === 'ADMIN' || user?.role === 'RECRUITER') && (
            <div className="nav-group">
              <span className="nav-group-title">Management</span>
              
              <NavLink to="/admin" className={linkClass} onClick={handleLinkClick} id="nav-admin" title={isCollapsed ? t('nav.admin') : ''}>
                <Library size={18} className="nav-icon" />
                <span className="nav-label">{t('nav.admin')}</span>
              </NavLink>

              {user?.role === 'ADMIN' && (
                <NavLink to="/admin/users" className={linkClass} onClick={handleLinkClick} id="nav-users" title={isCollapsed ? t('nav.users') : ''}>
                  <ShieldCheck size={18} className="nav-icon" />
                  <span className="nav-label">{t('nav.users')}</span>
                </NavLink>
              )}
            </div>
          )}
        </div>

        <div className="sidebar-footer">
          {user ? (
            <div className="user-profile-card">
              {user.photoUrl ? (
                <img
                  src={user.photoUrl}
                  alt="avatar"
                  className="user-avatar-img"
                />
              ) : (
                <div className="user-avatar-placeholder">
                  {(user.firstName?.[0] || user.email[0]).toUpperCase()}
                </div>
              )}

              <div className="user-info">
                <span className="user-name">
                  {user.firstName || user.email.split('@')[0]}
                </span>
                <span className={`badge badge-role badge-${user.role === 'ADMIN' ? 'danger' : user.role === 'RECRUITER' ? 'accent' : 'primary'}`}>
                  {user.role}
                </span>
              </div>

              <button
                id="btn-logout"
                onClick={handleLogout}
                className="btn-logout-icon"
                title={t('nav.logout')}
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <NavLink to="/login" className={linkClass} onClick={handleLinkClick} id="nav-login" title={isCollapsed ? t('nav.login') : ''}>
              <LogIn size={18} className="nav-icon" />
              <span className="nav-label">{t('nav.login')}</span>
            </NavLink>
          )}
        </div>
      </aside>
    </>
  );
};

export default NavBar;