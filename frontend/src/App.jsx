import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import './i18n.js';
import Header from './components/Header.jsx';
import NavBar from './components/NavBar.jsx';
import Positions from './pages/Positions.jsx';
import Profile from './pages/Profile.jsx';
import Login from './pages/Login.jsx';
import CVView from './pages/CVView.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';

const RequireAuth = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
            <Header />
            <NavBar />
            <main className="container mx-auto px-4 py-6">
              <Routes>
                <Route path="/" element={<Navigate to="/positions" replace />} />
                <Route path="/positions" element={<Positions />} />
                <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
                <Route path="/cvs/:id" element={<RequireAuth><CVView /></RequireAuth>} />
                <Route path="/admin" element={<RequireAuth><AdminDashboard /></RequireAuth>} />
                <Route path="/login" element={<Login />} />
                <Route path="*" element={<Navigate to="/positions" replace />} />
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
