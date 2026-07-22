import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { SearchProvider } from './context/SearchContext.jsx';
import './i18n.js';
import Header from './components/Header.jsx';
import NavBar from './components/NavBar.jsx';
import Home from './pages/Home.jsx';
import Positions from './pages/Positions.jsx';
import Profile from './pages/Profile.jsx';
import Login from './pages/Login.jsx';
import CVView from './pages/CVView.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';

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

const LoginSuccess = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      login(token);
      navigate('/profile', { replace: true });
    } else {
      navigate('/login', { replace: true });
    }
  }, [login, navigate]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div className="skeleton" style={{ width: '160px', height: '20px', borderRadius: '8px' }} />
    </div>
  );
};

const AppLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <>
      <Header onToggleMobileMenu={() => setIsMobileMenuOpen(prev => !prev)} />
      <div className="page-wrap" style={{ alignItems: 'flex-start' }}>
        <NavBar 
          isOpen={isMobileMenuOpen} 
          onClose={() => setIsMobileMenuOpen(false)} 
        />
        <main className="page-main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/positions" element={<Positions />} />
            <Route path="/login" element={<Login />} />
            <Route path="/login-success" element={<LoginSuccess />} />
            
            <Route path="/profile" element={
              <RequireAuth>
                <Profile />
              </RequireAuth>
            } />
            
            <Route path="/cvs/:id" element={
              <RequireAuth>
                <CVView />
              </RequireAuth>
            } />
            
            <Route
              path="/admin"
              element={
                <RequireAuth roles={['RECRUITER', 'ADMIN']}>
                  <AdminDashboard />
                </RequireAuth>
              }
            />
            
            <Route
              path="/admin/users"
              element={
                <RequireAuth roles={['ADMIN']}>
                  <AdminDashboard tab="users" />
                </RequireAuth>
              }
            />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </>
  );
};

const App = () => (
  <ThemeProvider>
    <AuthProvider>
      <SearchProvider>
        <BrowserRouter>
          <AppLayout />
        </BrowserRouter>
      </SearchProvider>
    </AuthProvider>
  </ThemeProvider>
);

export default App;