import { useEffect, useState, useCallback } from 'react';
import {
  fetchAttributes, createAttribute, updateAttribute, deleteAttribute,
  fetchUsers, updateUserRole, toggleBlockUser, deleteUser
} from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useTranslation } from 'react-i18next';
import { Plus, Edit3, Trash2, ShieldOff, X, Check, Loader2, Search, Tag, Users } from 'lucide-react';

const ATTR_TYPES = ['STRING', 'TEXT', 'IMAGE', 'NUMERIC', 'DATE', 'PERIOD', 'BOOLEAN', 'SELECT'];
const ATTR_CATEGORIES = ['Certification', 'Domain Knowledge', 'Personal Information', 'Soft Skills', 'Technical Skills', 'Language', 'Other'];
const ROLES = ['CANDIDATE', 'RECRUITER', 'ADMIN'];

const AttrModal = ({ attr, onClose, onSaved }) => {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    category: attr?.category || '',
    name: attr?.name || '',
    type: attr?.type || 'STRING',
    version: attr?.version ?? 1
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      if (attr?.id) {
        await updateAttribute(attr.id, form);
      } else {
        await createAttribute(form);
      }
      onSaved();
    } catch (err) {
      if (err.response?.status === 409) setError('Version conflict. Please reload.');
      else setError(err.response?.data?.error || 'Failed to save attribute');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="section-title">{attr?.id ? t('admin.editAttribute') : t('admin.createAttribute')}</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {error && <div className="alert alert-danger">{error}</div>}
            <div>
              <label className="label">{t('admin.attrName')}</label>
              <input className="input" required value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div>
              <label className="label">{t('admin.attrCategory')}</label>
              <select className="select" value={form.category}
                onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                <option value="">Select category…</option>
                {ATTR_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">{t('admin.attrType')}</label>
              <select className="select" value={form.type}
                onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
                {ATTR_TYPES.map(tp => <option key={tp} value={tp}>{tp}</option>)}
              </select>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>{t('common.cancel')}</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <Loader2 size={15} className="spin" style={{ animation: 'spin 1s linear infinite' }} /> : null}
              {saving ? t('common.loading') : t('common.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AdminDashboard = ({ tab: initialTab }) => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState(initialTab === 'users' ? 'users' : 'attrs');
  const [attributes, setAttributes] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [actionMsg, setActionMsg] = useState('');

  const [searchQuery, setSearchQuery] = useState('');

  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab === 'users' ? 'users' : 'attrs');
    }
  }, [initialTab]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const aRes = await fetchAttributes();
      setAttributes(aRes.data || []);
      if (isAdmin) {
        const uRes = await fetchUsers();
        setUsers(uRes.data || []);
      }
    } catch (e) { 
      console.error('Failed to load admin data:', e); 
    } finally { 
      setLoading(false); 
    }
  }, [isAdmin]);

  useEffect(() => { 
    loadData(); 
  }, [loadData]);

  const showMsg = (msg) => { 
    setActionMsg(msg); 
    setTimeout(() => setActionMsg(''), 4000); 
  };

  const handleDeleteAttr = async (attr) => {
    if (!window.confirm(`Delete attribute "${attr.name}"?`)) return;
    try {
      await deleteAttribute(attr.id);
      setAttributes(prev => prev.filter(a => a.id !== attr.id));
      showMsg('Attribute deleted');
    } catch { 
      showMsg('Delete failed. Attribute may be used in active positions.'); 
    }
  };

  const handleToggleBlock = async (u) => {
    try {
      const res = await toggleBlockUser(u.id, u.version);
      const updatedBlocked = res.data?.blocked ?? !u.blocked;
      setUsers(prev => prev.map(usr => usr.id === u.id ? { ...usr, blocked: updatedBlocked, version: (usr.version || 1) + 1 } : usr));
      showMsg(`User ${updatedBlocked ? 'blocked' : 'unblocked'}`);
    } catch { 
      showMsg('Action failed'); 
    }
  };

  const handleRoleChange = async (u, newRole) => {
    try {
      await updateUserRole(u.id, newRole, u.version);
      setUsers(prev => prev.map(usr => usr.id === u.id ? { ...usr, role: newRole, version: (usr.version || 1) + 1 } : usr));
      showMsg('Role updated');
    } catch { 
      showMsg('Role change failed'); 
    }
  };

  const handleDeleteUser = async (u) => {
    if (u.id === user?.id) { showMsg("You can't delete yourself"); return; }
    if (!window.confirm(`Delete user ${u.email}?`)) return;
    try {
      await deleteUser(u.id);
      setUsers(prev => prev.filter(usr => usr.id !== u.id));
      showMsg('User deleted');
    } catch { 
      showMsg('Delete failed'); 
    }
  };

  const filteredAttributes = attributes.filter(a => 
    (a.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (a.category || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUsers = users.filter(u => 
    (u.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.firstName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.lastName || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const TABS = [
    { id: 'attrs', label: t('admin.attributes') || 'Attributes' },
    ...(isAdmin ? [{ id: 'users', label: t('admin.users') || 'Users' }] : []),
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {}
      {actionMsg && (
        <div className="alert alert-info" style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 200, maxWidth: '360px' }}>
          {actionMsg}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 className="page-title">{t('admin.title') || 'Admin Panel'}</h1>
        
        {}
        <div style={{ position: 'relative', width: '260px' }}>
          <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-3)' }} />
          <input
            type="text"
            className="input"
            style={{ paddingLeft: '2.25rem', fontSize: '0.85rem' }}
            placeholder={activeTab === 'attrs' ? "Search attributes..." : "Search users..."}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {}
      <div className="tabs">
        {TABS.map(tab => (
          <button
            key={tab.id}
            id={`admin-tab-${tab.id}`}
            className={`tab${activeTab === tab.id ? ' active' : ''}`}
            onClick={() => { setActiveTab(tab.id); setSearchQuery(''); }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {}
      {activeTab === 'attrs' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button id="btn-create-attribute" className="btn btn-primary" onClick={() => setModal({})}>
              <Plus size={16} /> {t('admin.createAttribute') || 'Create Attribute'}
            </button>
          </div>

          <div className="card" style={{ overflow: 'hidden' }}>
            {loading ? (
              <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                {[...Array(5)].map((_, i) => <div key={i} className="skeleton" style={{ height: '2.25rem', borderRadius: 'var(--radius)' }} />)}
              </div>
            ) : filteredAttributes.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon"><Tag size={24} /></div>
                <div>{searchQuery ? 'No attributes match your query' : (t('admin.noAttributes') || 'No attributes found')}</div>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>{t('admin.attrName') || 'Name'}</th>
                    <th>{t('admin.attrCategory') || 'Category'}</th>
                    <th>{t('admin.attrType') || 'Type'}</th>
                    <th>Used In</th>
                    <th style={{ width: '6rem' }} />
                  </tr>
                </thead>
                <tbody>
                  {filteredAttributes.map(a => (
                    <tr key={a.id}>
                      <td className="cell-primary">{a.name}</td>
                      <td><span className="badge badge-neutral">{a.category || 'General'}</span></td>
                      <td>
                        <span className="badge badge-accent" style={{ fontFamily: 'monospace', fontSize: '0.7rem' }}>{a.type}</span>
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--color-text-3)' }}>
                        {a._count?.positions ?? 0} positions
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'flex-end' }}>
                          <button
                            className="btn btn-ghost btn-icon btn-sm"
                            id={`btn-edit-attr-${a.id}`}
                            onClick={() => setModal(a)}
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            className="btn btn-danger btn-icon btn-sm"
                            id={`btn-delete-attr-${a.id}`}
                            onClick={() => handleDeleteAttr(a)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {}
      {activeTab === 'users' && isAdmin && (
        <div className="card" style={{ overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {[...Array(5)].map((_, i) => <div key={i} className="skeleton" style={{ height: '2.5rem', borderRadius: 'var(--radius)' }} />)}
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon"><Users size={24} /></div>
              <div>{searchQuery ? 'No users match your search' : 'No users found'}</div>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>{t('common.actions') || 'Actions'}</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(u => (
                  <tr key={u.id} style={u.blocked ? { opacity: 0.55 } : {}}>
                    <td className="cell-primary">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {u.photoUrl ? (
                          <img src={u.photoUrl} alt="" className="avatar" style={{ width: '1.75rem', height: '1.75rem', fontSize: '0.7rem' }} />
                        ) : (
                          <div className="avatar" style={{ width: '1.75rem', height: '1.75rem', fontSize: '0.7rem' }}>
                            {(u.firstName?.[0] || u.email?.[0] || 'U').toUpperCase()}
                          </div>
                        )}
                        {u.firstName ? `${u.firstName} ${u.lastName || ''}` : u.email?.split('@')[0]}
                        {u.id === user?.id && <span className="badge badge-primary" style={{ fontSize: '0.62rem' }}>You</span>}
                      </div>
                    </td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--color-text-3)' }}>{u.email}</td>
                    <td>
                      <select
                        className="select"
                        style={{ width: '120px', padding: '0.3rem 0.5rem', fontSize: '0.8rem' }}
                        value={u.role}
                        onChange={e => {
                          if (u.id === user?.id && e.target.value !== u.role) {
                            if (!window.confirm(`Change YOUR role to ${e.target.value}? You may lose admin access.`)) return;
                          }
                          handleRoleChange(u, e.target.value);
                        }}
                      >
                        {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </td>
                    <td>
                      <span className={`badge ${u.blocked ? 'badge-danger' : 'badge-success'}`}>
                        {u.blocked ? 'Blocked' : 'Active'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.3rem', justifyContent: 'flex-end' }}>
                        {u.id !== user?.id && (
                          <>
                            <button
                              className={`btn btn-sm ${u.blocked ? 'btn-success' : 'btn-outline'}`}
                              onClick={() => handleToggleBlock(u)}
                              title={u.blocked ? (t('admin.unblockUser') || 'Unblock') : (t('admin.blockUser') || 'Block')}
                            >
                              {u.blocked ? <Check size={14} /> : <ShieldOff size={14} />}
                              {u.blocked ? 'Unblock' : 'Block'}
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleDeleteUser(u)}
                            >
                              <Trash2 size={14} /> {t('admin.deleteUser') || 'Delete'}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {}
      {modal !== null && (
        <AttrModal
          key={modal?.id || 'new-attr'}
          attr={modal?.id ? modal : null}
          onClose={() => setModal(null)}
          onSaved={async () => { setModal(null); await loadData(); showMsg('Saved successfully!'); }}
        />
      )}
    </div>
  );
};

export default AdminDashboard;