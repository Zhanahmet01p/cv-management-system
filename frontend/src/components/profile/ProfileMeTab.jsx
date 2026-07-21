import { useTranslation } from 'react-i18next';
import { COUNTRIES, getLocationParts } from '../../utils/location.js';

const ProfileMeTab = ({ profile, onFieldChange, onLocationChange, locParts, isCustomCountry }) => {
  const { t } = useTranslation();

  return (
    <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div>
          <label className="label">{t('profile.firstName', 'Имя')}</label>
          <input
            id="input-firstName"
            className="input"
            value={profile.firstName || ''}
            onChange={e => onFieldChange('firstName', e.target.value)}
          />
        </div>

        <div>
          <label className="label">{t('profile.lastName', 'Фамилия')}</label>
          <input
            id="input-lastName"
            className="input"
            value={profile.lastName || ''}
            onChange={e => onFieldChange('lastName', e.target.value)}
          />
        </div>

        <div>
          <label className="label">{t('profile.country', 'Страна')}</label>
          <select
            id="input-country"
            className="input"
            value={locParts.country}
            onChange={e => onLocationChange(e.target.value, locParts.city)}
          >
            <option value="">-- Выберите страну --</option>
            {isCustomCountry && <option value={locParts.country}>{locParts.country}</option>}
            {COUNTRIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">{t('profile.city', 'Город')}</label>
          <input
            id="input-city"
            className="input"
            placeholder="например, Алматы"
            value={locParts.city}
            onChange={e => onLocationChange(locParts.country, e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="label">{t('profile.bio', 'О себе / Краткое описание')}</label>
        <textarea
          id="input-bio"
          className="textarea"
          rows={4}
          placeholder="Расскажите кратко о своем опыте, ключевых навыках или профессиональных целях..."
          value={profile.bio || ''}
          onChange={e => onFieldChange('bio', e.target.value)}
        />
      </div>
    </div>
  );
};

export default ProfileMeTab;
