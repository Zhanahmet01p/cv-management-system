import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  fetchProfile, saveProfile, saveAttributeValue, createProject,
  updateProject, deleteProject, fetchAttributes
} from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useTranslation } from 'react-i18next';
import { User, BookOpen, FolderOpen, FileText, Plus, Trash2, Edit3, X, Save } from 'lucide-react';

const TABS = [
  { id: 'me',       icon: <User size={15} />,       key: 'profile.me' },
  { id: 'info',     icon: <BookOpen size={15} />,    key: 'profile.info' },
  { id: 'projects', icon: <FolderOpen size={15} />,  key: 'profile.projects' },
  { id: 'cvs',      icon: <FileText size={15} />,    key: 'profile.cvs' },
];

const EMPTY_PROJECT = { name: '', startDate: '', endDate: '', description: '', tags: '' };

const Profile = () => {
  const { setUser } = useAuth();
  const { t } = useTranslation();
  const [profile, setProfile] = useState(null);
  const [attributes, setAttributes] = useState([]);
  const [activeTab, setActiveTab] = useState('me');
  const [dirty, setDirty] = useState(false);
  const [saveStatus, setSaveStatus] = useState('saved'); // saved | saving | dirty | error
  const [saveMsg, setSaveMsg] = useState('');
  const [projForm, setProjForm] = useState(EMPTY_PROJECT);
  const [editingProj, setEditingProj] = useState(null);
  const [projError, setProjError] = useState('');
  const [attrSearch, setAttrSearch] = useState('');
  const dirty_ref = useRef(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [pRes, aRes] = await Promise.all([fetchProfile(), fetchAttributes()]);
        setProfile(pRes.data);
        setAttributes(aRes.data);
      } catch (e) { console.error(e); }
    };
    load();
  }, []);

  // Auto-save: 5s after last change
  const handleSave = useCallback(async () => {
    if (!profile) return;
    setSaveStatus('saving');
    try {
      const res = await saveProfile({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        location: profile.location || '',
        photoUrl: profile.photoUrl || '',
        version: profile.version || 1,
      });
      setProfile(res.data);
      setDirty(false);
      dirty_ref.current = false;
      setSaveStatus('saved');
      if (setUser) setUser(res.data);
    } catch (err) {
      if (err.response?.status === 409) {
        setSaveStatus('error');
        setSaveMsg('Version conflict! Please reload.');
      } else {
        setSaveStatus('error');
        setSaveMsg('Save failed');
      }
    }
  }, [profile, setUser]);

  useEffect(() => {
    if (!dirty || !profile) return;
    const timer = setTimeout(() => handleSave(), 6000);
    return () => clearTimeout(timer);
  }, [dirty, profile, handleSave]);

  const handleFieldChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
    setDirty(true);
    dirty_ref.current = true;
    setSaveStatus('dirty');
  };

  const handleAttrChange = async (avIndex, value) => {
    const next = (profile.attributeValues || []).map((av, idx) =>
      idx === avIndex ? { ...av, value } : av
    );
    setProfile(prev => ({ ...prev, attributeValues: next }));
    try {
      const res = await saveAttributeValue({
        attributeId: next[avIndex].attribute.id,
        value,
        version: next[avIndex].version,
      });
      setProfile(prev => ({
        ...prev,
        attributeValues: (prev.attributeValues || []).map((av, idx) =>
          idx === avIndex ? res.data : av
        )
      }));
    } catch (err) {
      console.error('Attr save failed', err);
    }
  };

  // Add attribute from library
  const handleAddAttr = async (attrId) => {
    const already = (profile.attributeValues || []).some(av => av.attributeId === attrId || av.attribute?.id === attrId);
    if (already) return;
    try {
      const res = await saveAttributeValue({ attributeId: attrId, value: '', version: 1 });
      setProfile(prev => ({ ...prev, attributeValues: [...(prev.attributeValues || []), res.data] }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleProjSubmit = async (e) => {
    e.preventDefault();
    setProjError('');
    const payload = {
      name: projForm.name,
      startDate: projForm.startDate,
      endDate: projForm.endDate || null,
      description: projForm.description,
      tags: projForm.tags.split(',').map(s => s.trim()).filter(Boolean),
    };
    try {
      if (editingProj) {
        await updateProject(editingProj.id, { ...payload, version: editingProj.version });
      } else {
        await createProject(payload);
      }
      setProjForm(EMPTY_PROJECT);
      setEditingProj(null);
      const res = await fetchProfile();
      setProfile(res.data);
    } catch {
      setProjError('Save failed');
    }
  };

  const handleDeleteProj = async (proj) => {
    if (!window.confirm('Delete this project?')) return;
    try {
      await deleteProject(proj.id, proj.version);
      const res = await fetchProfile();
      setProfile(res.data);
    } catch {
      setProjError('Delete failed');
    }
  };

  // Filtered library attrs (not yet added)
  const availableAttrs = useMemo(() => {
    const addedIds = new Set((profile?.attributeValues || []).map(av => av.attributeId || av.attribute?.id));
    return attributes.filter(a =>
      !addedIds.has(a.id) &&
      (a.name.toLowerCase().includes(attrSearch.toLowerCase()) || a.category.toLowerCase().includes(attrSearch.toLowerCase()))
    );
  }, [attributes, profile, attrSearch]);

  const statusClass = { saved: 'saved', saving: 'saving', dirty: 'dirty', error: 'error' }[saveStatus];
  const statusLabel = {
    saved:  t('profile.saveStatus.saved'),
    saving: t('profile.saveStatus.saving'),
    dirty:  t('profile.saveStatus.pending'),
    error:  t('profile.saveStatus.error'),
  }[saveStatus];

  if (!profile) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="skeleton" style={{ height: '4rem', borderRadius: 'var(--radius-xl)' }} />
        ))}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {profile.photoUrl ? (
            <img src={profile.photoUrl} alt="avatar" className="avatar" style={{ width: '3.5rem', height: '3.5rem' }} />
          ) : (
            <div className="avatar" style={{ width: '3.5rem', height: '3.5rem', fontSize: '1.2rem' }}>
              {(profile.firstName?.[0] || profile.email?.[0] || '?').toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="page-title" style={{ fontSize: '1.25rem' }}>
              {profile.firstName ? `${profile.firstName} ${profile.lastName || ''}` : t('profile.title')}
            </h1>
            <p style={{ color: 'var(--color-text-3)', fontSize: '0.8rem' }}>{profile.email}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span className={`save-status ${statusClass}`}>{statusLabel}</span>
          {saveMsg && <span style={{ fontSize: '0.78rem', color: 'var(--color-danger)' }}>{saveMsg}</span>}
          {dirty && (
            <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saveStatus === 'saving'}>
              <Save size={14} /> {t('common.save')}
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {TABS.map(tab => (
          <button
            key={tab.id}
            id={`tab-${tab.id}`}
            className={`tab${activeTab === tab.id ? ' active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}
          >
            {tab.icon} {t(tab.key)}
          </button>
        ))}
      </div>

      {/* ── Me Tab ── */}
      {activeTab === 'me' && (
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {[
              { field: 'firstName', label: t('profile.firstName') },
              { field: 'lastName',  label: t('profile.lastName') },
              { field: 'location',  label: t('profile.location') },
              { field: 'photoUrl',  label: t('profile.photoUrl') },
            ].map(({ field, label }) => (
              <div key={field}>
                <label className="label">{label}</label>
                <input
                  id={`input-${field}`}
                  className="input"
                  value={profile[field] || ''}
                  onChange={e => handleFieldChange(field, e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Info Tab ── */}
      {activeTab === 'info' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Existing attributes */}
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
                          onChange={e => handleAttrChange(i, e.target.value)}
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

          {/* Add from library */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <h3 className="section-title" style={{ marginBottom: '0.75rem' }}>{t('profile.addAttribute')}</h3>
            <input
              id="attr-search"
              className="input"
              placeholder="Search library by name or category…"
              value={attrSearch}
              onChange={e => setAttrSearch(e.target.value)}
              style={{ marginBottom: '0.75rem' }}
            />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {availableAttrs.slice(0, 40).map(a => (
                <button
                  key={a.id}
                  className="tag"
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleAddAttr(a.id)}
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
      )}

      {/* ── Projects Tab ── */}
      {activeTab === 'projects' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Project form */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <h3 className="section-title" style={{ marginBottom: '1rem' }}>
              {editingProj ? t('profile.editProject') : t('profile.addProject')}
            </h3>
            {projError && <div className="alert alert-danger" style={{ marginBottom: '0.75rem' }}>{projError}</div>}
            <form onSubmit={handleProjSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                <div>
                  <label className="label">Project Name</label>
                  <input id="proj-name" className="input" required value={projForm.name}
                    onChange={e => setProjForm(p => ({ ...p, name: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Tags (comma-separated)</label>
                  <input id="proj-tags" className="input" placeholder="React, Node.js"
                    value={projForm.tags}
                    onChange={e => setProjForm(p => ({ ...p, tags: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Start Date</label>
                  <input id="proj-start" className="input" type="date" required value={projForm.startDate}
                    onChange={e => setProjForm(p => ({ ...p, startDate: e.target.value }))} />
                </div>
                <div>
                  <label className="label">End Date</label>
                  <input id="proj-end" className="input" type="date" value={projForm.endDate}
                    onChange={e => setProjForm(p => ({ ...p, endDate: e.target.value }))} />
                </div>
              </div>
              <div style={{ marginTop: '0.875rem' }}>
                <label className="label">Description (Markdown)</label>
                <textarea id="proj-desc" className="textarea" rows={4} value={projForm.description}
                  onChange={e => setProjForm(p => ({ ...p, description: e.target.value }))} />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <button type="submit" id="btn-save-project" className="btn btn-primary">
                  <Save size={14} />
                  {editingProj ? t('common.update') : t('common.add')}
                </button>
                {editingProj && (
                  <button type="button" className="btn btn-outline" onClick={() => { setEditingProj(null); setProjForm(EMPTY_PROJECT); }}>
                    <X size={14} /> {t('common.cancel')}
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Projects table */}
          {(profile.projects || []).length > 0 ? (
            <div className="card" style={{ overflow: 'hidden' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Period</th>
                    <th>Tags</th>
                    <th>Description</th>
                    <th style={{ width: '5rem' }} />
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
                        {/* No inline buttons — context actions via hover */}
                        <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'flex-end', opacity: 0, transition: 'opacity 0.15s' }}
                          onMouseEnter={e => e.currentTarget.style.opacity = 1}
                          onMouseLeave={e => e.currentTarget.style.opacity = 0}
                        >
                          <button className="btn btn-ghost btn-icon btn-sm"
                            onClick={() => { setEditingProj(proj); setProjForm({ name: proj.name, startDate: proj.startDate?.slice(0, 10) || '', endDate: proj.endDate?.slice(0, 10) || '', description: proj.description || '', tags: (proj.tags || []).join(', ') }); setActiveTab('projects'); }}>
                            <Edit3 size={14} />
                          </button>
                          <button className="btn btn-danger btn-icon btn-sm" onClick={() => handleDeleteProj(proj)}>
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
      )}

      {/* ── CVs Tab ── */}
      {activeTab === 'cvs' && (
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
      )}
    </div>
  );
};

export default Profile;
