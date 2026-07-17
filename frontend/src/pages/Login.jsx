import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useTranslation } from 'react-i18next';
import { apiUrl } from '../api.js';

const Login = () => {
  const { login, user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      login(token);
      navigate('/profile', { replace: true });
    }
  }, [searchParams, login, navigate]);

  if (user) {
    return <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">You are already logged in.</div>;
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 max-w-xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Login</h1>
      <p className="mb-4 text-slate-600 dark:text-slate-300">{t('nav.login')} to access your profile and CV tools.</p>
      <a
        href={`${apiUrl}/api/auth/google`}
        className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
      >
        Continue with Google
      </a>
      <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
        If Google authentication is not configured on the backend yet, ask to set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in the backend `.env`.
      </p>
    </div>
  );
};

export default Login;
