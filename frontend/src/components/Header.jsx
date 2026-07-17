import React from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, Search, Globe, User } from 'lucide-react';
import { Link } from 'react-router-dom';

const Header = () => {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();

  const changeLanguage = () => {
    const nextLng = i18n.language === 'en' ? 'ru' : 'en';
    i18n.changeLanguage(nextLng);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white dark:bg-slate-950 dark:border-slate-800">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="text-xl font-bold text-blue-600 dark:text-blue-400 shrink-0">
          CV-Tech
        </Link>

        {/* Full-text Search - Mandatory Requirement */}
        <div className="flex-1 max-w-xl relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder={t('common.search')}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-gray-50 dark:bg-slate-900 dark:border-slate-700 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={changeLanguage}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-gray-300"
            title="Toggle Language"
          >
            <Globe className="h-5 w-5" />
          </button>
          
          <button
            onClick={toggleTheme}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-gray-300"
            title="Toggle Theme"
          >
            {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </button>

          <Link
            to="/profile"
            className="flex items-center gap-2 ml-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-gray-300"
          >
            <User className="h-5 w-5" />
            <span className="hidden md:inline text-sm font-medium">{t('nav.profile')}</span>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
