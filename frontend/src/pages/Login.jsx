import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useTranslation } from 'react-i18next';
import { socialMock } from '../api.js';
import {
  Zap, ShieldCheck, User, Briefcase,
  Globe, Users, Mail, Lock, ChevronRight, Loader2
} from 'lucide-react';

const ROLES = [
  { value: 'CANDIDATE', label: 'Candidate / Соискатель' },
  { value: 'RECRUITER', label: 'Recruiter / Рекрутер' },
  { value: 'ADMIN',     label: 'Admin / Администратор' },
];

const DEV_ROLES = [
  { role: 'CANDIDATE', icon: <User size={16} />,       color: 'var(--color-primary)' },
  { role: 'RECRUITER', icon: <Briefcase size={16} />,  color: 'var(--color-accent)'  },
  { role: 'ADMIN',     icon: <ShieldCheck size={16} />, color: 'var(--color-danger)' },
];

const Input = ({ label, note, ...props }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
    <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-2)' }}>
      {label}
    </label>
    <input
      {...props}
      className="input"
      style={{
        padding: '0.55rem 0.75rem',
        borderRadius: 'var(--radius)',
        border: '1.5px solid var(--color-border)',
        background: 'var(--color-surface-2)',
        color: 'var(--color-text)',
        fontSize: '0.875rem',
        transition: 'border-color 0.2s',
        outline: 'none',
        width: '100%',
      }}
    />
    {note && <span style={{ fontSize: '0.72rem', color: 'var(--color-text-3)' }}>{note}</span>}
  </div>
);

const Login = () => {
  const { user, devLogin, login } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Tabs: 'form' | 'dev'
  const [activeTab, setActiveTab] = useState('form');

  // Form fields
  const [email, setEmail]         = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName]   = useState('');
  const [role, setRole]           = useState('CANDIDATE');

  const [loading, setLoading] = useState('');
  const [error, setError]     = useState('');

  useEffect(() => {
    if (user) navigate('/', { replace: true });
  }, [user, navigate]);

  // Email-based login/register via POST /api/auth/login
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    if (!email.trim()) { setError('Email is required'); return; }
    setLoading('email');
    setError('');
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/login`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim(), role, firstName: firstName || undefined, lastName: lastName || undefined }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      localStorage.setItem('token', data.token);
      login(data.token);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed. Is the backend running on port 5000?');
    } finally {
      setLoading('');
    }
  };

  // Simulated social login via POST /api/auth/social-mock
  const handleSocialLogin = async (provider) => {
    const emailInput = window.prompt(
      provider === 'google'
        ? 'Введите ваш email для имитации входа через Google:'
        : 'Введите ваш email для имитации входа через Facebook:',
      'user@example.com'
    );
    if (!emailInput) return;
    setLoading(provider);
    setError('');
    try {
      const res = await socialMock(provider, emailInput.trim());
      const { token: newToken } = res.data;
      localStorage.setItem('token', newToken);
      login(newToken);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Social login failed.');
    } finally {
      setLoading('');
    }
  };

  // Dev quick login
  const handleDevLogin = async (devRole) => {
    setLoading(devRole);
    setError('');
    try {
      await devLogin(devRole);
      navigate('/', { replace: true });
    } catch {
      setError('Login failed. Is the backend running?');
    } finally {
      setLoading('');
    }
  };

  const tabStyle = (tab) => ({
    padding: '0.5rem 1.25rem',
    borderRadius: 'var(--radius)',
    fontWeight: 600,
    fontSize: '0.82rem',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s',
    background: activeTab === tab ? 'var(--color-primary)' : 'transparent',
    color: activeTab === tab ? '#fff' : 'var(--color-text-3)',
  });

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', minHeight: '70vh', gap: '1.5rem', padding: '2rem 1rem'
    }}>
      {/* Hero */}
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

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: '0.25rem', padding: '0.3rem',
        background: 'var(--color-surface-2)', borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border)'
      }}>
        <button style={tabStyle('form')} onClick={() => { setActiveTab('form'); setError(''); }}>
          <Mail size={13} style={{ display: 'inline', marginRight: '0.3rem' }} />
          Войти / Войти
        </button>
        <button style={tabStyle('dev')} onClick={() => { setActiveTab('dev'); setError(''); }}>
          <Lock size={13} style={{ display: 'inline', marginRight: '0.3rem' }} />
          Dev Panel
        </button>
      </div>

      <div className="card" style={{ width: '100%', maxWidth: '440px', padding: '1.75rem' }}>
        {activeTab === 'form' ? (
          <>
            {/* Social Login Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', marginBottom: '1.25rem' }}>
              <button
                id="btn-google-login"
                className="btn btn-outline btn-lg"
                style={{ justifyContent: 'center', width: '100%' }}
                disabled={!!loading}
                onClick={() => handleSocialLogin('google')}
              >
                {loading === 'google' ? <Loader2 size={18} className="spin" /> : <Globe size={18} />}
                {t('login.googleBtn')}
              </button>
              <button
                id="btn-facebook-login"
                className="btn btn-outline btn-lg"
                style={{ justifyContent: 'center', width: '100%', borderColor: '#1877f2', color: '#1877f2' }}
                disabled={!!loading}
                onClick={() => handleSocialLogin('facebook')}
              >
                {loading === 'facebook' ? <Loader2 size={18} className="spin" /> : <Users size={18} />}
                {t('login.facebookBtn')}
              </button>
              <p style={{ fontSize: '0.7rem', color: 'var(--color-text-3)', textAlign: 'center', margin: '0.25rem 0 0' }}>
                ⚠️ {t('login.socialSimNote')}
              </p>
            </div>

            {/* Divider */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              marginBottom: '1.25rem', color: 'var(--color-text-3)', fontSize: '0.8rem'
            }}>
              <hr className="divider" style={{ flex: 1 }} />
              {t('login.orDivider')}
              <hr className="divider" style={{ flex: 1 }} />
            </div>

            {/* Email Form */}
            <form onSubmit={handleEmailLogin} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <Input
                id="input-email"
                label={t('login.emailLabel')}
                type="email"
                required
                placeholder={t('login.emailPlaceholder')}
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <Input
                  id="input-firstname"
                  label={t('login.firstNameLabel')}
                  type="text"
                  placeholder={t('login.firstNamePlaceholder')}
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                />
                <Input
                  id="input-lastname"
                  label={t('login.lastNameLabel')}
                  type="text"
                  placeholder={t('login.lastNamePlaceholder')}
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-2)' }}>
                  {t('login.roleLabel')}
                </label>
                <select
                  id="select-role"
                  value={role}
                  onChange={e => setRole(e.target.value)}
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
                  {ROLES.map(r => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>

              {error && (
                <div className="alert alert-danger" style={{ fontSize: '0.82rem', padding: '0.6rem 0.75rem' }}>
                  {error}
                </div>
              )}

              <button
                id="btn-email-login"
                type="submit"
                className="btn btn-primary btn-lg"
                disabled={!!loading}
                style={{ width: '100%', justifyContent: 'center', marginTop: '0.25rem' }}
              >
                {loading === 'email'
                  ? <Loader2 size={17} className="spin" />
                  : <ChevronRight size={17} />
                }
                {t('login.emailLoginBtn')}
              </button>

              <p style={{ fontSize: '0.73rem', color: 'var(--color-text-3)', textAlign: 'center' }}>
                💡 {t('login.emailLoginNote')}
              </p>
            </form>
          </>
        ) : (
          /* Dev Quick Login Panel */
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
              Аккаунты создаются автоматически в БД при первом нажатии
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
