import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useTranslation } from 'react-i18next';

const NavBar = () => {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <NavLink
            to="/positions"
            className={({ isActive }) =>
              `text-sm font-medium ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-300'}`
            }
          >
            {t('nav.positions')}
          </NavLink>
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `text-sm font-medium ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-300'}`
            }
          >
            {t('nav.profile')}
          </NavLink>
          {user?.role === 'ADMIN' && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `text-sm font-medium ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-300'}`
              }
            >
              {t('nav.admin')}
            </NavLink>
          )}
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <button
              onClick={handleLogout}
              className="text-sm text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400"
            >
              {t('nav.logout')}
            </button>
          ) : (
            <NavLink to="/login" className="text-sm text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400">
              {t('nav.login')}
            </NavLink>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
