import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FileText } from 'lucide-react';

const ProfileCVsTab = ({ profile, t }) => {
  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      {(profile.cvs || []).length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><FileText size={20} /></div>
          <div>{t('profile.noCVs')}</div>
          <Link to="/positions" className="btn btn-primary btn-sm">Browse Positions</Link>
        </div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Position</th>
              <th>{t('common.status')}</th>
              <th>Created</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {profile.cvs.map(cv => (
              <tr key={cv.id}>
                <td className="cell-primary">{cv.position?.title || 'Unknown'}</td>
                <td>
                  <span className={`badge ${cv.status === 'PUBLISHED' ? 'badge-success' : 'badge-warning'}`}>
                    {cv.status === 'PUBLISHED' ? t('cv.published') : t('cv.draft')}
                  </span>
                </td>
                <td style={{ color: 'var(--color-text-3)', fontSize: '0.82rem' }}>
                  {new Date(cv.createdAt).toLocaleDateString()}
                </td>
                <td>
                  <Link to={`/cvs/${cv.id}`} className="btn btn-primary btn-sm" id={`btn-view-cv-${cv.id}`}>
                    {t('common.view')}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ProfileCVsTab;
