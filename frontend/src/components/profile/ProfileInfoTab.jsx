import { useTranslation } from 'react-i18next';
import { BookOpen, Plus } from 'lucide-react';

const ProfileInfoTab = ({ profile, attributes, attrSearch, availableAttrs, onAttrSearchChange, onAttrChange, onAddAttr, t }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {(profile.attributeValues || []).length > 0 ? (
        <div className="card" style={{ overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Attribute</th>
                <th>Category</th>
                <th>Type</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              {profile.attributeValues.map((av, i) => (
                <tr key={av.id || i}>
                  <td className="cell-primary">{av.attribute?.name}</td>
                  <td><span className="badge badge-neutral">{av.attribute?.category}</span></td>
                  <td style={{ fontSize: '0.78rem', color: 'var(--color-text-3)' }}>{av.attribute?.type}</td>
                  <td>
                    <input
                      className={`input${!av.value ? ' attr-empty' : ''}`}
                      style={{ padding: '0.35rem 0.625rem', fontSize: '0.85rem' }}
                      placeholder={!av.value ? t('cv.emptyAttr') : ''}
                      value={typeof av.value === 'object' ? JSON.stringify(av.value) : (av.value || '')}
                      onChange={e => onAttrChange(i, e.target.value)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon"><BookOpen size={20} /></div>
            <div>{t('profile.noAttributes')}</div>
          </div>
        </div>
      )}

      <div className="card" style={{ padding: '1.25rem' }}>
        <h3 className="section-title" style={{ marginBottom: '0.75rem' }}>{t('profile.addAttribute')}</h3>
        <input
          id="attr-search"
          className="input"
          placeholder="Search library by name or category…"
          value={attrSearch}
          onChange={e => onAttrSearchChange(e.target.value)}
          style={{ marginBottom: '0.75rem' }}
        />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
          {availableAttrs.slice(0, 40).map(a => (
            <button
              key={a.id}
              className="tag"
              style={{ cursor: 'pointer' }}
              onClick={() => onAddAttr(a.id)}
            >
              <Plus size={11} />
              {a.name}
              <span style={{ opacity: 0.6, fontSize: '0.65rem' }}>({a.type})</span>
            </button>
          ))}
          {availableAttrs.length === 0 && (
            <span style={{ color: 'var(--color-text-3)', fontSize: '0.85rem' }}>
              All attributes added or no match.
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileInfoTab;
