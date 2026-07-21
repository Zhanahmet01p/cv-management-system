import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useTranslation } from 'react-i18next';
import {
  Zap, ShieldCheck, User, Briefcase,
  Globe, Users, Mail, Lock, ChevronRight, Loader2,
  UserPlus, LogIn, Eye, EyeOff
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const DEV_ROLES = [
  { role: 'CANDIDATE', icon: <User size={16} />,       color: 'var(--color-primary)' },
  { role: 'RECRUITER', icon: <Briefcase size={16} />,  color: 'var(--color-accent)'  },
  { role: 'ADMIN',     icon: <ShieldCheck size={16} />, color: 'var(--color-danger)' },
];

const Input = ({ label, note, rightIcon, ...props }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
    <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-2)' }}>
      {label}
    </label>
    <div style={{ position: 'relative' }}>
      <input
        {...props}
        className="input"
        style={{
          padding: rightIcon ? '0.55rem 2.5rem 0.55rem 0.75rem' : '0.55rem 0.75rem',
          borderRadius: 'var(--radius)',
          border: '1.5px solid var(--color-border)',
          background: 'var(--color-surface-2)',
          color: 'var(--color-text)',
          fontSize: '0.875rem',
          transition: 'border-color 0.2s',
          outline: 'none',
          width: '100%',
          boxSizing: 'border-box',
        }}
      />
      {rightIcon && (
        <span style={{
          position: 'absolute', right: '0.6rem', top: '50%',
          transform: 'translateY(-50%)', cursor: 'pointer',
          color: 'var(--color-text-3)', display: 'flex'
        }}>
          {rightIcon}
        </span>
      )}
    </div>
    {note && <span style={{ fontSize: '0.72rem', color: 'var(--color-text-3)' }}>{note}</span>}
  </div>
);

const Login = () => {
  const { user, devLogin, login } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const registerRoles = [
    { value: 'CANDIDATE', label: t('login.roleCandidate') },
    { value: 'RECRUITER', label: t('login.roleRecruiter') },
  ];

  const [activeTab, setActiveTab] = useState('signin');

  const [signInEmail,    setSignInEmail]    = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [showSignInPw,   setShowSignInPw]   = useState(false);

  const [regEmail,     setRegEmail]     = useState('');
  const [regPassword,  setRegPassword]  = useState('');
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName,  setRegLastName]  = useState('');
  const [regRole,      setRegRole]      = useState('CANDIDATE');
  const [showRegPw,    setShowRegPw]    = useState(false);

  const [loading, setLoading] = useState('');
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    const err   = searchParams.get('error');
    if (token) {
      localStorage.setItem('token', token);
      login(token);
      navigate('/', { replace: true });
    } else if (err) {
      const msgs = {
        google_failed:   t('login.oauthGoogleFailed'),
        facebook_failed: t('login.oauthFacebookFailed'),
      };
      setError(msgs[err] || t('login.oauthGenericFailed'));
    }
  }, [searchParams, login, navigate, t]);

  useEffect(() => {
    if (user) navigate('/', { replace: true });
  }, [user, navigate]);

  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!signInEmail.trim() || !signInPassword) {
      setError(t('login.emailRequired'));
      return;
    }
    setLoading('signin');
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/auth/login-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: signInEmail.trim(), password: signInPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t('login.loginFailed'));
      localStorage.setItem('token', data.token);
      login(data.token);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || t('login.loginFailed'));
    } finally {
      setLoading('');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!regEmail.trim() || !regPassword) {
      setError(t('login.emailRequired'));
      return;
    }
    if (regPassword.length < 6) {
      setError(t('login.passwordTooShort'));
      return;
    }
    setLoading('register');
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email:     regEmail.trim(),
          password:  regPassword,
          firstName: regFirstName || undefined,
          lastName:  regLastName  || undefined,
          role:      regRole,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t('login.registrationFailed'));
      localStorage.setItem('token', data.token);
      login(data.token);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || t('login.registrationFailed'));
    } finally {
      setLoading('');
    }
  };

  const handleOAuth = (provider) => {
    window.location.href = `${API_BASE}/api/auth/${provider}`;
  };

  const handleDevLogin = async (devRole) => {
    setLoading(devRole);
    setError('');
    try {
      await devLogin(devRole);
      navigate('/', { replace: true });
    } catch {
      setError(t('login.loginFailed'));
    } finally {
      setLoading('');
    }
  };

  const tabStyle = (tab) => ({
    padding: '0.45rem 1.1rem',
    borderRadius: 'var(--radius)',
    fontWeight: 600,
    fontSize: '0.82rem',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s',
    background: activeTab === tab ? 'var(--color-primary)' : 'transparent',
    color: activeTab === tab ? '#fff' : 'var(--color-text-3)',
  });

  const clearMessages = () => { setError(''); setSuccess(''); };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', minHeight: '80vh', gap: '1.25rem', padding: '2rem 1rem'
    }}>
      {}
      <div style={{ textAlign: 'center', maxWidth: '480px' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: '3.5rem', height: '3.5rem', borderRadius: 'var(--radius-xl)',
          background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
          marginBottom: '0.875rem',
          boxShadow: '0 8px 24px color-mix(in srgb, var(--color-primary) 30%, transparent)'
        }}>
          <Zap size={24} color="#fff" fill="#fff" />
        </div>
        <h1 className="page-title" style={{ marginBottom: '0.35rem' }}>
          {t('login.title')}
        </h1>
        <p style={{ color: 'var(--color-text-3)', fontSize: '0.875rem' }}>
          {t('login.subtitle')}
        </p>
      </div>

      {}
      <div style={{
        display: 'flex', gap: '0.2rem', padding: '0.3rem',
        background: 'var(--color-surface-2)', borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border)'
      }}>
        <button style={tabStyle('signin')} onClick={() => { setActiveTab('signin'); clearMessages(); }}>
          <LogIn size={13} style={{ display: 'inline', marginRight: '0.3rem' }} />
          {t('login.tabSignIn')}
        </button>
        <button style={tabStyle('signup')} onClick={() => { setActiveTab('signup'); clearMessages(); }}>
          <UserPlus size={13} style={{ display: 'inline', marginRight: '0.3rem' }} />
          {t('login.tabRegister')}
        </button>
        <button style={tabStyle('dev')} onClick={() => { setActiveTab('dev'); clearMessages(); }}>
          <Lock size={13} style={{ display: 'inline', marginRight: '0.3rem' }} />
          {t('login.tabDev')}
        </button>
      </div>

      <div className="card" style={{ width: '100%', maxWidth: '440px', padding: '1.75rem' }}>

        {}
        {activeTab === 'signin' && (
          <>
            {}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', marginBottom: '1.25rem' }}>
              <button
                id="btn-google-login"
                className="btn btn-outline btn-lg"
                style={{ justifyContent: 'center', width: '100%' }}
                disabled={!!loading}
                onClick={() => handleOAuth('google')}
              >
                <svg width="18" height="18" viewBox="0 0 48 48">
                  <path fill="#4285F4" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#34A853" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#EA4335" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
                {t('login.googleBtn')}
              </button>
              <button
                id="btn-facebook-login"
                className="btn btn-outline btn-lg"
                style={{ justifyContent: 'center', width: '100%', borderColor: '#1877f2', color: '#1877f2' }}
                disabled={!!loading}
                onClick={() => handleOAuth('facebook')}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877f2">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                {t('login.facebookBtn')}
              </button>
            </div>

            {}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              marginBottom: '1.25rem', color: 'var(--color-text-3)', fontSize: '0.8rem'
            }}>
              <hr className="divider" style={{ flex: 1 }} />
              {t('login.orLoginByEmail')}
              <hr className="divider" style={{ flex: 1 }} />
            </div>

            {}
            <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <Input
                id="input-signin-email"
                label={t('login.emailLabel')}
                type="email"
                required
                placeholder="you@example.com"
                value={signInEmail}
                onChange={e => setSignInEmail(e.target.value)}
              />
              <Input
                id="input-signin-password"
                label={t('login.passwordLabel')}
                type={showSignInPw ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={signInPassword}
                onChange={e => setSignInPassword(e.target.value)}
                rightIcon={
                  <span onClick={() => setShowSignInPw(v => !v)} style={{ lineHeight: 0 }}>
                    {showSignInPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </span>
                }
              />

              {error && (
                <div className="alert alert-danger" style={{ fontSize: '0.82rem', padding: '0.6rem 0.75rem' }}>
                  {error}
                </div>
              )}

              <button
                id="btn-signin"
                type="submit"
                className="btn btn-primary btn-lg"
                disabled={!!loading}
                style={{ width: '100%', justifyContent: 'center', marginTop: '0.25rem' }}
              >
                {loading === 'signin'
                  ? <Loader2 size={17} className="spin" />
                  : <LogIn size={17} />
                }
                {t('login.loginButton')}
              </button>

              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-3)', textAlign: 'center', margin: 0 }}>
                {t('login.noAccount')}{' '}
                <button
                  type="button"
                  onClick={() => { setActiveTab('signup'); clearMessages(); }}
                  style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, padding: 0 }}
                >
                  {t('login.tabRegister')}
                </button>
              </p>
            </form>
          </>
        )}

        {}
        {activeTab === 'signup' && (
          <>

            {}
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <Input
                id="input-reg-email"
                label={`${t('login.emailLabel')} *`}
                type="email"
                required
                placeholder="you@example.com"
                value={regEmail}
                onChange={e => setRegEmail(e.target.value)}
              />
              <Input
                id="input-reg-password"
                label={`${t('login.passwordLabel')} * (${t('login.passwordHint').toLowerCase()})`}
                type={showRegPw ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={regPassword}
                onChange={e => setRegPassword(e.target.value)}
                rightIcon={
                  <span onClick={() => setShowRegPw(v => !v)} style={{ lineHeight: 0 }}>
                    {showRegPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </span>
                }
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <Input
                  id="input-reg-firstname"
                  label={t('login.firstNameLabel')}
                  type="text"
                  placeholder={t('login.firstNamePlaceholder')}
                  value={regFirstName}
                  onChange={e => setRegFirstName(e.target.value)}
                />
                <Input
                  id="input-reg-lastname"
                  label={t('login.lastNameLabel')}
                  type="text"
                  placeholder={t('login.lastNamePlaceholder')}
                  value={regLastName}
                  onChange={e => setRegLastName(e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-2)' }}>
                  {t('login.roleLabel')}
                </label>
                <select
                  id="select-reg-role"
                  value={regRole}
                  onChange={e => setRegRole(e.target.value)}
                  style={{
                    padding: '0.55rem 0.75rem',
                    borderRadius: 'var(--radius)',
                    border: '1.5px solid var(--color-border)',
                    background: 'var(--color-surface-2)',
                    color: 'var(--color-text)',
                    fontSize: '0.875rem',
                    width: '100%',
                    cursor: 'pointer',
                  }}
                >
                  {registerRoles.map(r => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>

              {error && (
                <div className="alert alert-danger" style={{ fontSize: '0.82rem', padding: '0.6rem 0.75rem' }}>
                  {error}
                </div>
              )}
              {success && (
                <div className="alert alert-success" style={{ fontSize: '0.82rem', padding: '0.6rem 0.75rem' }}>
                  {success}
                </div>
              )}

              <button
                id="btn-register"
                type="submit"
                className="btn btn-primary btn-lg"
                disabled={!!loading}
                style={{ width: '100%', justifyContent: 'center', marginTop: '0.25rem' }}
              >
                {loading === 'register'
                  ? <Loader2 size={17} className="spin" />
                  : <UserPlus size={17} />
                }
                {t('login.createAccountButton')}
              </button>

              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-3)', textAlign: 'center', margin: 0 }}>
                {t('login.alreadyHaveAccount')}{' '}
                <button
                  type="button"
                  onClick={() => { setActiveTab('signin'); clearMessages(); }}
                  style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, padding: 0 }}
                >
                  {t('login.tabSignIn')}
                </button>
              </p>
            </form>
          </>
        )}

        {}
        {activeTab === 'dev' && (
          <div>
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-text)', marginBottom: '0.2rem' }}>
                {t('login.devTitle')}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--color-text-3)' }}>
                {t('login.devSubtitle')}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {DEV_ROLES.map(({ role: devRole, icon, color }) => {
                const labels = { CANDIDATE: t('login.asCandidate'), RECRUITER: t('login.asRecruiter'), ADMIN: t('login.asAdmin') };
                return (
                  <button
                    key={devRole}
                    id={`btn-dev-${devRole.toLowerCase()}`}
                    className="btn btn-outline"
                    onClick={() => handleDevLogin(devRole)}
                    disabled={!!loading}
                    style={{
                      justifyContent: 'flex-start', gap: '0.625rem',
                      color, borderColor: `color-mix(in srgb, ${color} 35%, transparent)`,
                      padding: '0.65rem 1rem'
                    }}
                  >
                    {loading === devRole
                      ? <Loader2 size={16} className="spin" />
                      : <span style={{ color }}>{icon}</span>
                    }
                    {labels[devRole]}
                    {!loading && (
                      <span className="badge badge-neutral" style={{ marginLeft: 'auto', fontSize: '0.65rem' }}>
                        {devRole}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {error && (
              <div className="alert alert-danger" style={{ marginTop: '0.75rem', fontSize: '0.82rem' }}>
                {error}
              </div>
            )}

            <p style={{ fontSize: '0.72rem', color: 'var(--color-text-3)', marginTop: '1rem', textAlign: 'center' }}>
              {t('login.devNote')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
