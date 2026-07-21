import { useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Sun, Moon, Globe, Zap, LogIn } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { useSearch } from '../context/SearchContext';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const { searchQuery, setSearchQuery } = useSearch();
  const { user } = useAuth();
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const toggleLang = () => {
    const nextLng = i18n.resolvedLanguage?.startsWith('ru') ? 'en' : 'ru';
    i18n.changeLanguage(nextLng);
  };

  return (
    <header className="app-header">
      <div className="header-inner">
        {/* Logo */}
        <Link to="/" className="app-logo" id="header-logo">
          <Zap size={18} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.3rem', fill: 'currentColor' }} />
          CV·Tech
        </Link>

        {/* Global Search */}
        <div className="search-input-wrap">
          <Search size={15} />
          <input
            id="global-search"
            ref={inputRef}
            type="text"
            placeholder={t('common.search')}
            className="input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Right actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginLeft: 'auto' }}>
          <button
            id="btn-toggle-lang"
            className="btn btn-ghost btn-icon"
            onClick={toggleLang}
            title="Toggle Language"
          >
            <Globe size={17} />
            <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>
              {i18n.resolvedLanguage?.startsWith('ru') ? 'RU' : 'EN'}
            </span>
          </button>

          <button
            id="btn-toggle-theme"
            className="btn btn-ghost btn-icon"
            onClick={toggleTheme}
            title={theme === 'light' ? 'Dark Mode' : 'Light Mode'}
          >
            {theme === 'light' ? <Moon size={17} /> : <Sun size={17} />}
          </button>
          
          {!user && (
            <button 
              className="btn btn-primary" 
              onClick={() => navigate('/login')}
              style={{ padding: '0.35rem 0.8rem', marginLeft: '0.5rem', display: 'flex', gap: '0.3rem', alignItems: 'center' }}
            >
              <LogIn size={15} />
              {t('nav.login')}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
