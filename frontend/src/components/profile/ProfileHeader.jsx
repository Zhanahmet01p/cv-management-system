import { Save, Camera } from 'lucide-react';

const ProfileHeader = ({ profile, imgError, onEditAvatar, onImgError, statusClass, statusLabel, dirty, saveMsg, onSave, t }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div
          style={{ position: 'relative', cursor: 'pointer' }}
          onClick={onEditAvatar}
          title="Click to change photo"
        >
          {profile.photoUrl && !imgError ? (
            <img
              src={profile.photoUrl}
              alt="avatar"
              className="avatar"
              style={{ width: '3.75rem', height: '3.75rem', objectFit: 'cover' }}
              onError={onImgError}
            />
          ) : (
            <div className="avatar" style={{ width: '3.75rem', height: '3.75rem', fontSize: '1.3rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {(profile.firstName?.[0] || profile.email?.[0] || '?').toUpperCase()}
            </div>
          )}
          <div style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            background: 'var(--color-primary)',
            borderRadius: '50%',
            width: '1.35rem',
            height: '1.35rem',
            padding: '0.25rem',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}>
            <Camera size={11} />
          </div>
        </div>

        <div>
          <h1 className="page-title" style={{ fontSize: '1.25rem' }}>
            {profile.firstName ? `${profile.firstName} ${profile.lastName || ''}` : t('profile.title')}
          </h1>
          <p style={{ color: 'var(--color-text-3)', fontSize: '0.8rem' }}>{profile.email}</p>
          {profile.bio && (
            <p style={{ color: 'var(--color-text-2)', fontSize: '0.85rem', marginTop: '0.25rem', maxWidth: '500px' }}>
              {profile.bio}
            </p>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <span className={`save-status ${statusClass}`}>{statusLabel}</span>
        {saveMsg && <span style={{ fontSize: '0.78rem', color: 'var(--color-danger)' }}>{saveMsg}</span>}
        {dirty && (
          <button className="btn btn-primary btn-sm" onClick={onSave}>
            <Save size={14} /> {t('common.save')}
          </button>
        )}
      </div>
    </div>
  );
};

export default ProfileHeader;
