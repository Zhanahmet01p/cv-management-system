import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import {
  fetchProfile, saveProfile, saveAttributeValue, createProject,
  updateProject, deleteProject, fetchAttributes
} from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useTranslation } from 'react-i18next';
import { User, BookOpen, FolderOpen, FileText } from 'lucide-react';
import AvatarModal from '../components/profile/AvatarModal.jsx';
import ProfileHeader from '../components/profile/ProfileHeader.jsx';
import ProfileTabs from '../components/profile/ProfileTabs.jsx';
import ProfileMeTab from '../components/profile/ProfileMeTab.jsx';
import ProfileInfoTab from '../components/profile/ProfileInfoTab.jsx';
import ProfileProjectsTab from '../components/profile/ProfileProjectsTab.jsx';
import ProfileCVsTab from '../components/profile/ProfileCVsTab.jsx';
import { COUNTRIES, getLocationParts } from '../utils/location.js';

const TABS = [
  { id: 'me',       icon: <User size={15} />,       key: 'profile.me' },
  { id: 'info',     icon: <BookOpen size={15} />,    key: 'profile.info' },
  { id: 'projects', icon: <FolderOpen size={15} />,  key: 'profile.projects' },
  { id: 'cvs',      icon: <FileText size={15} />,    key: 'profile.cvs' },
];

const EMPTY_PROJECT = { name: '', startDate: '', endDate: '', description: '', tags: '' };

const Profile = () => {
  const { user, setUser } = useAuth();
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
  const [imgError, setImgError] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const dirty_ref = useRef(false);

  // Salesforce State
  const [sfCompany, setSfCompany] = useState('');
  const [sfPhone, setSfPhone] = useState('');
  const [sfLoading, setSfLoading] = useState(false);
  const [sfMsg, setSfMsg] = useState('');

  // Base API URL
  const RAW_API_URL = import.meta.env.VITE_API_URL || 'https://cv-management-system-ux49.onrender.com';
  const API_BASE = RAW_API_URL.replace(/\/$/, '');

  const handleExportToSalesforce = async (e) => {
    e.preventDefault();
    setSfLoading(true);
    setSfMsg('');
    try {
      const res = await fetch(`${API_BASE}/api/salesforce/export-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          companyName: sfCompany,
          phone: sfPhone,
          positionTitle: user?.role || 'Candidate',
          userEmail: profile?.email || user?.email || '',
          firstName: profile?.firstName || user?.firstName || '',
          lastName: profile?.lastName || user?.lastName || ''
        })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Export failed');
      
      setSfMsg('✅ User exported to Salesforce successfully!');
      alert('User exported to Salesforce successfully!');
    } catch (err) {
      setSfMsg(`❌ ${err.message}`);
      alert(err.message);
    } finally {
      setSfLoading(false);
    }
  };

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

  const handleSave = useCallback(async () => {
    if (!profile) return;
    setSaveStatus('saving');
    try {
      const res = await saveProfile({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        location: profile.location || '',
        photoUrl: profile.photoUrl || '',
        bio: profile.bio || '',
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
    if (field === 'photoUrl') setImgError(false);
    setProfile(prev => ({ ...prev, [field]: value }));
    setDirty(true);
    dirty_ref.current = true;
    setSaveStatus('dirty');
  };

  const handleLocationChange = (newCountry, newCity) => {
    let combined = '';
    if (newCountry && newCity) {
      combined = `${newCountry}, ${newCity}`;
    } else if (newCountry) {
      combined = newCountry;
    } else if (newCity) {
      combined = newCity;
    }
    handleFieldChange('location', combined);
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

    if (projForm.endDate && new Date(projForm.endDate) < new Date(projForm.startDate)) {
      setProjError('End date cannot be earlier than start date');
      return;
    }

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

  const availableAttrs = useMemo(() => {
    const addedIds = new Set((profile?.attributeValues || []).map(av => av.attributeId || av.attribute?.id));
    return attributes.filter(a =>
      !addedIds.has(a.id) &&
      (a.name.toLowerCase().includes(attrSearch.toLowerCase()) || a.category.toLowerCase().includes(attrSearch.toLowerCase()))
    );
  }, [attributes, profile, attrSearch]);

  const locationValue = profile?.location || '';
  const locParts = useMemo(() => getLocationParts(locationValue), [locationValue]);
  const isCustomCountry = locParts.country && !COUNTRIES.includes(locParts.country);

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
      <ProfileHeader
        profile={profile}
        imgError={imgError}
        onEditAvatar={() => setShowAvatarModal(true)}
        onImgError={() => setImgError(true)}
        statusClass={statusClass}
        statusLabel={statusLabel}
        dirty={dirty}
        saveMsg={saveMsg}
        onSave={handleSave}
        t={t}
      />

      <ProfileTabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} t={t} />

      {activeTab === 'me' && (
        <>
          <ProfileMeTab
            profile={profile}
            onFieldChange={handleFieldChange}
            onLocationChange={handleLocationChange}
            locParts={locParts}
            isCustomCountry={isCustomCountry}
          />

          {/* Salesforce Integration Form */}
          <div className="card" style={{ padding: '1.5rem', marginTop: '1rem', border: '1px solid #e2e8f0', borderRadius: '12px', backgroundColor: 'var(--color-surface, #fff)' }}>
            <h3 style={{ marginTop: 0, marginBottom: '0.5rem' }}>Sync with Salesforce CRM</h3>
            <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '1rem' }}>
              Export your user details to create an Account and linked Contact in Salesforce.
            </p>

            <form onSubmit={handleExportToSalesforce} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '400px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Company Name</label>
                <input
                  type="text"
                  placeholder="e.g. Acme Corp"
                  value={sfCompany}
                  onChange={(e) => setSfCompany(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #ccc' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Phone Number</label>
                <input
                  type="text"
                  placeholder="+1 234 567 890"
                  value={sfPhone}
                  onChange={(e) => setSfPhone(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #ccc' }}
                />
              </div>

              <button type="submit" className="btn btn-primary" disabled={sfLoading} style={{ alignSelf: 'flex-start' }}>
                {sfLoading ? 'Exporting...' : 'Export to Salesforce'}
              </button>

              {sfMsg && <div style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>{sfMsg}</div>}
            </form>
          </div>
        </>
      )}

      {activeTab === 'info' && (
        <ProfileInfoTab
          profile={profile}
          attrSearch={attrSearch}
          availableAttrs={availableAttrs}
          onAttrSearchChange={setAttrSearch}
          onAttrChange={handleAttrChange}
          onAddAttr={handleAddAttr}
          t={t}
        />
      )}

      {activeTab === 'projects' && (
        <ProfileProjectsTab
          profile={profile}
          projForm={projForm}
          editingProj={editingProj}
          projError={projError}
          onProjSubmit={handleProjSubmit}
          onProjFormChange={(field, value) => setProjForm(prev => ({ ...prev, [field]: value }))}
          onCancelEdit={() => { setEditingProj(null); setProjForm(EMPTY_PROJECT); }}
          onEditProject={(proj) => {
            setEditingProj(proj);
            setProjForm({
              name: proj.name,
              startDate: proj.startDate?.slice(0, 10) || '',
              endDate: proj.endDate?.slice(0, 10) || '',
              description: proj.description || '',
              tags: (proj.tags || []).join(', ')
            });
            setActiveTab('projects');
          }}
          onDeleteProject={handleDeleteProj}
          t={t}
        />
      )}

      {activeTab === 'cvs' && <ProfileCVsTab profile={profile} t={t} />}

      {showAvatarModal && (
        <AvatarModal
          currentUrl={profile.photoUrl}
          onClose={() => setShowAvatarModal(false)}
          onSave={(newUrl) => handleFieldChange('photoUrl', newUrl)}
        />
      )}
    </div>
  );
};

export default Profile;