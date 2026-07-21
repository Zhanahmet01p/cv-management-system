import { Routes, Route, Navigate } from 'react-router-dom';
import Header from '../Header.jsx';
import NavBar from '../NavBar.jsx';
import Home from '../../pages/Home.jsx';
import Positions from '../../pages/Positions.jsx';
import Profile from '../../pages/Profile.jsx';
import Login from '../../pages/Login.jsx';
import CVView from '../../pages/CVView.jsx';
import AdminDashboard from '../../pages/AdminDashboard.jsx';
import RequireAuth from './RequireAuth.jsx';
import LoginSuccess from './LoginSuccess.jsx';

const AppLayout = () => {
  return (
    <>
      <Header />
      <div className="page-wrap" style={{ alignItems: 'flex-start' }}>
        <NavBar />
        <main className="page-main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/positions" element={<Positions />} />
            <Route path="/login" element={<Login />} />
            <Route path="/login-success" element={<LoginSuccess />} />

            <Route
              path="/profile"
              element={
                <RequireAuth>
                  <Profile />
                </RequireAuth>
              }
            />

            <Route
              path="/cvs/:id"
              element={
                <RequireAuth>
                  <CVView />
                </RequireAuth>
              }
            />

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

export default AppLayout;
