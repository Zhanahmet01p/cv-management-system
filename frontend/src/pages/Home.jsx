import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchStats, fetchPositions } from '../api.js';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext.jsx';
import {
  Briefcase, Users, UserCheck, FileText, TrendingUp, Clock,
  BarChart2, Tag
} from 'lucide-react';

const StatCard = ({ icon, value, label, color }) => (
  <div className="stat-card">
    <div className="stat-icon" style={{ background: `color-mix(in srgb, ${color} 15%, transparent)` }}>
      <span style={{ color }}>{icon}</span>
    </div>
    <div className="stat-value">{value ?? '–'}</div>
    <div className="stat-label">{label}</div>
  </div>
);

const Home = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [sRes, pRes] = await Promise.all([fetchStats(), fetchPositions()]);
        setStats(sRes.data);
        setPositions(pRes.data || []);
      } catch (e) {
        console.error('Error fetching home stats:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const allTags = [...new Set(
    positions.flatMap(p => (p.tags || []).map(tag => typeof tag === 'string' ? tag : tag.name)).filter(Boolean)
  )];

  const popular = [...positions].sort((a, b) => (b._count?.cvs ?? 0) - (a._count?.cvs ?? 0)).slice(0, 5);

  const latest = positions.slice(0, 8);

  const statItems = stats ? [
    { icon: <Briefcase size={18} />, value: stats.totalPositions,  label: t('home.totalPositions'), color: 'var(--color-primary)' },
    { icon: <Users     size={18} />, value: stats.totalCandidates, label: t('home.totalCandidates'),color: 'var(--color-accent)'  },
    { icon: <UserCheck size={18} />, value: stats.totalRecruiters, label: t('home.totalRecruiters'), color: 'var(--color-success)' },
    { icon: <FileText  size={18} />, value: stats.totalCVs,        label: t('home.totalCVs'),       color: 'var(--color-warning)' },
    { icon: <TrendingUp size={18}/>, value: stats.totalSubmittedCVs,label: t('home.submittedCVs'),  color: 'var(--color-info)'    },
    { icon: <Clock     size={18} />, value: stats.cvsLast24h,      label: t('home.cvsLast24h'),     color: 'var(--color-danger)'  },
  ] : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <BarChart2 size={18} style={{ color: 'var(--color-primary)' }} />
          <h2 className="section-title">{t('home.stats')}</h2>
        </div>
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.875rem' }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} className="stat-card">
                <div className="skeleton" style={{ width: '2.5rem', height: '2.5rem', borderRadius: 'var(--radius)' }} />
                <div className="skeleton" style={{ width: '60%', height: '1.5rem', marginTop: '0.5rem' }} />
                <div className="skeleton" style={{ width: '80%', height: '0.75rem', marginTop: '0.25rem' }} />
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.875rem' }}>
            {statItems.map((s) => <StatCard key={s.label} {...s} />)}
          </div>
        )}
      </section>

      {}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '1.25rem', alignItems: 'start' }}>
        
        {}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Briefcase size={18} style={{ color: 'var(--color-primary)' }} />
              <h2 className="section-title">{t('home.latestPositions')}</h2>
            </div>
            <Link to="/positions" className="btn btn-ghost btn-sm">
              View all →
            </Link>
          </div>
          <div className="card" style={{ overflow: 'hidden' }}>
            {loading ? (
              <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="skeleton" style={{ height: '2rem', borderRadius: 'var(--radius)' }} />
                ))}
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Tags</th>
                    <th style={{ textAlign: 'right' }}>CVs</th>
                  </tr>
                </thead>
                <tbody>
                  {latest.length === 0 ? (
                    <tr>
                      <td colSpan={3} style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-3)' }}>
                        {t('common.noData')}
                      </td>
                    </tr>
                  ) : latest.map(p => (
                    <tr key={p.id}>
                      <td className="cell-primary">
                        <Link to="/positions" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
                          {p.title}
                        </Link>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                          {(p.tags || []).slice(0, 3).map((tag, idx) => {
                            const tagName = typeof tag === 'string' ? tag : tag.name;
                            return <span key={tag.id || idx} className="tag">{tagName}</span>;
                          })}
                          {(p.tags || []).length > 3 && (
                            <span className="tag">+{p.tags.length - 3}</span>
                          )}
                        </div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <span className="badge badge-neutral">{p._count?.cvs ?? 0}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        {}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {}
          <section>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.875rem' }}>
              <TrendingUp size={16} style={{ color: 'var(--color-accent)' }} />
              <h2 className="section-title" style={{ fontSize: '0.875rem' }}>{t('home.popularPositions')}</h2>
            </div>
            <div className="card" style={{ padding: '0.75rem' }}>
              {popular.length === 0 && !loading ? (
                <p style={{ color: 'var(--color-text-3)', fontSize: '0.85rem', padding: '0.5rem' }}>
                  {t('common.noData')}
                </p>
              ) : popular.map((p, i) => (
                <div key={p.id} style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.6rem 0.5rem',
                  borderBottom: i < popular.length - 1 ? '1px solid var(--color-border)' : 'none'
                }}>
                  <span style={{
                    width: '1.5rem', height: '1.5rem', borderRadius: '50%',
                    background: 'var(--color-surface-2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.72rem', fontWeight: 800, color: 'var(--color-text-3)',
                    flexShrink: 0
                  }}>
                    {i + 1}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--color-text)',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {p.title}
                    </div>
                    <div style={{ fontSize: '0.73rem', color: 'var(--color-text-3)' }}>
                      {p._count?.cvs ?? 0} CVs
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {}
          {allTags.length > 0 && (
            <section>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.875rem' }}>
                <Tag size={16} style={{ color: 'var(--color-success)' }} />
                <h2 className="section-title" style={{ fontSize: '0.875rem' }}>{t('home.tagCloud')}</h2>
              </div>
              <div className="card" style={{ padding: '1rem' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {allTags.slice(0, 30).map(tagName => (
                    <Link
                      key={tagName}
                      to="/positions"
                      className="tag"
                    >
                      {tagName}
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          )}

        </div>
      </div>
    </div>
  );
};

export default Home;