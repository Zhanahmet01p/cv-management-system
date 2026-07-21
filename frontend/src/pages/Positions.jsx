import { useEffect, useMemo, useState, useCallback, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  fetchPositions, createCV, createPosition, updatePosition,
  deletePosition, duplicatePosition, fetchAttributes
} from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useSearch } from '../context/SearchContext.jsx';
import { useTranslation } from 'react-i18next';
import {
  Plus, Copy, Trash2, Edit3, FileText, Check, X, ChevronDown, ChevronUp, Loader2, Briefcase
} from 'lucide-react';

const getTagName = (tag) => (typeof tag === 'string' ? tag : tag?.name || '');

const PositionModal = ({ position, attributes, onClose, onSaved }) => {
  const { t } = useTranslation();
  const isEdit = !!position?.id;

  const [form, setForm] = useState({
    title: position?.title || '',
    description: position?.description || '',
    maxProjects: position?.maxProjects ?? 3,
    accessRules: position?.accessRules || [],
    selectedAttrs: (position?.attributes || []).map(a => a.attributeId || a.attribute?.id),
    tags: (position?.tags || []).map(getTagName).join(', '),
    version: position?.version ?? 1,
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [attrSearch, setAttrSearch] = useState('');

  const visibleAttrs = useMemo(() =>
    attributes.filter(a =>
      a.name.toLowerCase().includes(attrSearch.toLowerCase()) ||
      (a.category && a.category.toLowerCase().includes(attrSearch.toLowerCase()))
    ),
    [attributes, attrSearch]
  );

  const toggleAttr = (id) => {
    setForm(prev => ({
      ...prev,
      selectedAttrs: prev.selectedAttrs.includes(id)
        ? prev.selectedAttrs.filter(x => x !== id)
        : [...prev.selectedAttrs, id]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      maxProjects: Number(form.maxProjects) || 3,
      attributeIds: form.selectedAttrs,
      tags: form.tags.split(',').map(s => s.trim()).filter(Boolean),
      version: form.version,
    };

    try {
      if (isEdit) {
        await updatePosition(position.id, payload);
      } else {
        await createPosition(payload);
      }
      onSaved();
    } catch (err) {
      if (err.response?.status === 409) {
        setError('Version conflict — the position was changed by another user.');
      } else {
        setError(err.response?.data?.error || err.response?.data?.message || 'Save failed');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-lg">
        <div className="modal-header">
          <h2 className="section-title">
            {isEdit ? t('positions.editPosition', 'Edit Position') : t('positions.createPosition', 'Create Position')}
          </h2>
          <button type="button" className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {error && <div className="alert alert-danger">{error}</div>}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label className="label">Position title *</label>
                <input className="input" required value={form.title}
                  onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
              </div>
              <div>
                <label className="label">{t('positions.maxProjects', 'Max projects in CV')}</label>
                <input className="input" type="number" min={1} max={20} value={form.maxProjects}
                  onChange={e => setForm(p => ({ ...p, maxProjects: e.target.value }))} />
              </div>
            </div>

            <div>
              <label className="label">Description and requirements</label>
              <textarea className="textarea" required rows={3} value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
            </div>

            <div>
              <label className="label">Tags (comma-separated)</label>
              <input className="input" placeholder="React, Node.js, PostgreSQL"
                value={form.tags}
                onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} />
            </div>

            {}
            <div>
              <label className="label">{t('positions.attributes', 'Required attributes from the library')}</label>
              <input className="input" placeholder="Search attributes by name or category..."
                value={attrSearch}
                onChange={e => setAttrSearch(e.target.value)}
                style={{ marginBottom: '0.5rem' }} />
              <div style={{
                maxHeight: '180px', overflowY: 'auto', border: '1.5px solid var(--color-border)',
                borderRadius: 'var(--radius)', padding: '0.5rem',
                display: 'flex', flexWrap: 'wrap', gap: '0.35rem'
              }}>
                {visibleAttrs.length === 0 ? (
                  <span style={{ color: 'var(--color-text-3)', fontSize: '0.85rem' }}>
                    No attributes found
                  </span>
                ) : visibleAttrs.map(a => {
                  const selected = form.selectedAttrs.includes(a.id);
                  return (
                    <button
                      key={a.id} type="button"
                      onClick={() => toggleAttr(a.id)}
                      className={`tag${selected ? ' tag-active' : ''}`}
                      style={{ cursor: 'pointer' }}
                    >
                      {selected && <Check size={11} />}
                      {a.name}
                      <span style={{ opacity: 0.6, fontSize: '0.65rem' }}>({a.type || a.category})</span>
                    </button>
                  );
                })}
              </div>
              {form.selectedAttrs.length > 0 && (
                <div style={{ marginTop: '0.4rem', fontSize: '0.78rem', color: 'var(--color-primary)' }}>
                  Selected attributes: {form.selectedAttrs.length}
                </div>
              )}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              {t('common.cancel', 'Cancel')}
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : null}
              {saving ? t('common.loading', 'Saving...') : (isEdit ? t('common.update', 'Update') : t('common.create', 'Create'))}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Positions = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { searchQuery } = useSearch();

  const [positions, setPositions]     = useState([]);
  const [attributes, setAttributes]   = useState([]);
  const [loading, setLoading]         = useState(true);
  const [selected, setSelected]       = useState(new Set());
  const [toast, setToast]             = useState('');
  const [modal, setModal]             = useState(null); // null | 'create' | position-object
  const [actionLoading, setActionLoading] = useState('');
  const [expandedId, setExpandedId]   = useState(null);

  const isRecruiter = user?.role === 'RECRUITER' || user?.role === 'ADMIN';
  const isCandidate = user?.role === 'CANDIDATE';

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [pRes, aRes] = await Promise.all([fetchPositions(), fetchAttributes()]);
      setPositions(pRes.data || []);
      setAttributes(aRes.data || []);
    } catch (err) {
      console.error('Failed to load positions data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
  };

  const visible = useMemo(() => {
    const q = (searchQuery || '').trim().toLowerCase();
    if (!q) return positions;
    return positions.filter(p =>
      p.title?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q) ||
      (p.tags || []).some(t => getTagName(t).toLowerCase().includes(q))
    );
  }, [positions, searchQuery]);

  const allSelected = visible.length > 0 && visible.every(p => selected.has(p.id));
  const someSelected = selected.size > 0;

  const toggleSelect = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(visible.map(p => p.id)));
    }
  };

  const handleGenerateCV = async (positionId) => {
    if (!user) { showToast(t('positions.signInRequired', 'Authentication required')); return; }
    if (!isCandidate) { showToast(t('positions.candidatesOnly', 'Only candidates can generate a CV')); return; }

    setActionLoading(positionId);
    try {
      const res = await createCV(positionId);
      showToast(t('positions.cvCreated', 'CV created! Opening it...'));
      if (res?.data?.id) {
        navigate(`/cvs/${res.data.id}`);
      }
    } catch (err) {
      if (err.response?.data?.error === 'CV already exists for this position') {
        showToast(t('positions.cvExists', 'You already have a CV for this position'));
      } else {
        showToast(err.response?.data?.error || err.response?.data?.message || 'Failed to create CV');
      }
    } finally {
      setActionLoading('');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete selected positions (${selected.size})?`)) return;
    setActionLoading('delete');
    try {
      await Promise.all([...selected].map(id => deletePosition(id)));
      showToast(`Deleted positions: ${selected.size}`);
      setSelected(new Set());
      await load();
    } catch {
      showToast('Delete failed');
    } finally {
      setActionLoading('');
    }
  };

  const handleDuplicate = async () => {
    if (selected.size !== 1) return;
    const [id] = selected;
    setActionLoading('dup');
    try {
      await duplicatePosition(id);
      showToast('Position duplicated');
      setSelected(new Set());
      await load();
    } catch {
      showToast('Duplication failed');
    } finally {
      setActionLoading('');
    }
  };

  const handleEdit = () => {
    if (selected.size !== 1) return;
    const [id] = selected;
    const pos = positions.find(p => p.id === id);
    if (pos) setModal(pos);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {}
      {toast && (
        <div className="alert alert-info" style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 200, maxWidth: '360px', animation: 'toolbar-in 0.2s ease' }}>
          {toast}
        </div>
      )}

      {}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div>
          <h1 className="page-title">{t('positions.title', 'Positions')}</h1>
          <p style={{ color: 'var(--color-text-3)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
            {t('positions.subtitle', 'Total found:')} {visible.length}
          </p>
        </div>
        {isRecruiter && (
          <button id="btn-create-position" className="btn btn-primary" onClick={() => setModal('create')}>
            <Plus size={16} />
            {t('positions.createPosition', 'Create Position')}
          </button>
        )}
      </div>

      {}
      {someSelected && (
        <div className="toolbar">
          <span className="toolbar-selection">Selected: {selected.size}</span>

          {isCandidate && selected.size === 1 && (
            <button
              className="btn btn-primary btn-sm"
              disabled={!!actionLoading}
              onClick={() => handleGenerateCV([...selected][0])}
            >
              <FileText size={14} />
              {t('positions.generateCV', 'Generate CV')}
            </button>
          )}

          {isRecruiter && (
            <>
              {selected.size === 1 && (
                <>
                  <button className="btn btn-outline btn-sm" onClick={handleEdit}>
                    <Edit3 size={14} />
                    {t('common.edit', 'Edit')}
                  </button>
                  <button className="btn btn-outline btn-sm" disabled={!!actionLoading} onClick={handleDuplicate}>
                    <Copy size={14} />
                    {t('common.duplicate', 'Duplicate')}
                  </button>
                </>
              )}
              <button className="btn btn-danger btn-sm" disabled={!!actionLoading} onClick={handleDelete}>
                <Trash2 size={14} />
                {t('common.delete', 'Delete')} ({selected.size})
              </button>
            </>
          )}

          <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setSelected(new Set())} style={{ marginLeft: 'auto' }}>
            <X size={15} />
          </button>
        </div>
      )}

      {}
      <div className="card" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[...Array(4)].map((_, i) => (
              <div key={i} className="skeleton" style={{ height: '2.5rem', borderRadius: 'var(--radius)' }} />
            ))}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '3rem' }}>
                    <input
                      id="chk-select-all"
                      type="checkbox"
                      className="row-check"
                      checked={allSelected}
                      onChange={toggleAll}
                    />
                  </th>
                  <th>Position</th>
                  <th>Description</th>
                  <th>Attributes</th>
                  <th>Tags</th>
                  <th style={{ textAlign: 'right' }}>CV</th>
                  <th style={{ width: '3rem' }} />
                </tr>
              </thead>
              <tbody>
                {visible.length === 0 ? (
                  <tr>
                    <td colSpan={7}>
                      <div className="empty-state">
                        <div className="empty-icon"><Briefcase size={22} /></div>
                        <div style={{ fontWeight: 600 }}>No positions found</div>
                      </div>
                    </td>
                  </tr>
                ) : visible.map(p => (
                  <Fragment key={p.id}>
                    <tr
                      className={selected.has(p.id) ? 'selected' : ''}
                      onClick={() => toggleSelect(p.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td onClick={e => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          className="row-check"
                          checked={selected.has(p.id)}
                          onChange={() => toggleSelect(p.id)}
                        />
                      </td>
                      <td className="cell-primary">{p.title}</td>
                      <td style={{ maxWidth: '260px' }}>
                        <span style={{
                          display: '-webkit-box', WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical', overflow: 'hidden',
                          fontSize: '0.83rem'
                        }}>
                          {p.description}
                        </span>
                      </td>
                      <td>
                        <span className="badge badge-primary">{p.attributes?.length ?? 0}</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                          {(p.tags || []).slice(0, 3).map((tag, idx) => (
                            <span key={tag.id || idx} className="tag">
                              #{getTagName(tag)}
                            </span>
                          ))}
                          {(p.tags || []).length > 3 && (
                            <span className="tag">+{p.tags.length - 3}</span>
                          )}
                        </div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <span className="badge badge-neutral">{p._count?.cvs ?? 0}</span>
                      </td>
                      <td onClick={e => e.stopPropagation()}>
                        <button
                          className="btn btn-ghost btn-icon btn-sm"
                          onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}
                        >
                          {expandedId === p.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                      </td>
                    </tr>

                    {}
                    {expandedId === p.id && (
                      <tr style={{ background: 'var(--color-surface-2)' }}>
                        <td colSpan={7} style={{ padding: '1rem 1rem 1rem 3rem' }}>
                          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                            <div>
                              <div className="label">Full description</div>
                              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-2)', maxWidth: '400px', whiteSpace: 'pre-line' }}>
                                {p.description}
                              </div>
                            </div>
                            {p.attributes?.length > 0 && (
                              <div>
                                <div className="label">Required attributes</div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginTop: '0.3rem' }}>
                                  {p.attributes.map(a => (
                                    <span key={a.attributeId || a.id} className="badge badge-accent">
                                      {a.attribute?.name || a.attributeId}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            <div>
                              <div className="label">Max projects in CV</div>
                              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-2)' }}>{p.maxProjects ?? 3}</div>
                            </div>
                          </div>

                          <div style={{ marginTop: '0.875rem', display: 'flex', gap: '0.5rem' }}>
                            {isCandidate && (
                              <button
                                className="btn btn-primary btn-sm"
                                disabled={actionLoading === p.id}
                                onClick={() => handleGenerateCV(p.id)}
                              >
                                {actionLoading === p.id
                                  ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                                  : <FileText size={14} />}
                                {t('positions.generateCV', 'Generate CV')}
                              </button>
                            )}
                            {isRecruiter && (
                              <>
                                <button className="btn btn-outline btn-sm" onClick={() => { setSelected(new Set([p.id])); setModal(p); }}>
                                  <Edit3 size={14} /> {t('common.edit', 'Edit')}
                                </button>
                                <button className="btn btn-outline btn-sm" onClick={async () => {
                                  setActionLoading('dup');
                                  await duplicatePosition(p.id);
                                  await load();
                                  setActionLoading('');
                                  showToast('Duplicated!');
                                }}>
                                  <Copy size={14} /> {t('common.duplicate', 'Duplicate')}
                                </button>
                                <button className="btn btn-danger btn-sm" onClick={async () => {
                                  if (!window.confirm('Delete this position?')) return;
                                  await deletePosition(p.id);
                                  await load();
                                  showToast('Deleted');
                                }}>
                                  <Trash2 size={14} /> {t('common.delete', 'Delete')}
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {}
      {modal && (
        <PositionModal
          position={modal === 'create' ? null : modal}
          attributes={attributes}
          onClose={() => { setModal(null); setSelected(new Set()); }}
          onSaved={async () => {
            setModal(null);
            setSelected(new Set());
            await load();
            showToast('Position saved successfully!');
          }}
        />
      )}
    </div>
  );
};

export default Positions;