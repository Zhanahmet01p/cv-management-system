import { useTranslation } from 'react-i18next';
import { FolderOpen, Save, X, Edit3, Trash2 } from 'lucide-react';

const ProfileProjectsTab = ({
  profile,
  projForm,
  editingProj,
  projError,
  onProjSubmit,
  onProjFormChange,
  onCancelEdit,
  onEditProject,
  onDeleteProject,
  t
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div className="card" style={{ padding: '1.25rem' }}>
        <h3 className="section-title" style={{ marginBottom: '1rem' }}>
          {editingProj ? t('profile.editProject') : t('profile.addProject')}
        </h3>
        {projError && <div className="alert alert-danger" style={{ marginBottom: '0.75rem' }}>{projError}</div>}
        <form onSubmit={onProjSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
            <div>
              <label className="label">Project Name</label>
              <input id="proj-name" className="input" required value={projForm.name}
                onChange={e => onProjFormChange('name', e.target.value)} />
            </div>
            <div>
              <label className="label">Tags (comma-separated)</label>
              <input id="proj-tags" className="input" placeholder="React, Node.js"
                value={projForm.tags}
                onChange={e => onProjFormChange('tags', e.target.value)} />
            </div>
            <div>
              <label className="label">Start Date</label>
              <input id="proj-start" className="input" type="date" required value={projForm.startDate}
                onChange={e => onProjFormChange('startDate', e.target.value)} />
            </div>
            <div>
              <label className="label">End Date</label>
              <input id="proj-end" className="input" type="date" value={projForm.endDate}
                onChange={e => onProjFormChange('endDate', e.target.value)} />
            </div>
          </div>
          <div style={{ marginTop: '0.875rem' }}>
            <label className="label">Description (Markdown)</label>
            <textarea id="proj-desc" className="textarea" rows={4} value={projForm.description}
              onChange={e => onProjFormChange('description', e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
            <button type="submit" id="btn-save-project" className="btn btn-primary">
              <Save size={14} />
              {editingProj ? t('common.update') : t('common.add')}
            </button>
            {editingProj && (
              <button type="button" className="btn btn-outline" onClick={onCancelEdit}>
                <X size={14} /> {t('common.cancel')}
              </button>
            )}
          </div>
        </form>
      </div>

      {(profile.projects || []).length > 0 ? (
        <div className="card" style={{ overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Period</th>
                <th>Tags</th>
                <th>Description</th>
                <th style={{ width: '6rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {profile.projects.map(proj => (
                <tr key={proj.id}>
                  <td className="cell-primary">{proj.name}</td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--color-text-3)', whiteSpace: 'nowrap' }}>
                    {new Date(proj.startDate).toLocaleDateString()} –{' '}
                    {proj.endDate ? new Date(proj.endDate).toLocaleDateString() : 'Present'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                      {(proj.tags || []).map(tag => <span key={tag} className="tag">{tag}</span>)}
                    </div>
                  </td>
                  <td style={{ fontSize: '0.82rem', maxWidth: '200px' }}>
                    <span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {proj.description}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'flex-end' }}>
                      <button className="btn btn-ghost btn-icon btn-sm" onClick={() => onEditProject(proj)}>
                        <Edit3 size={14} />
                      </button>
                      <button className="btn btn-danger btn-icon btn-sm" onClick={() => onDeleteProject(proj)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon"><FolderOpen size={20} /></div>
            <div>{t('profile.noProjects')}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileProjectsTab;
