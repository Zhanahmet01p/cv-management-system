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
  const [imgError, setImgError] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
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
        <ProfileMeTab
          profile={profile}
          onFieldChange={handleFieldChange}
          onLocationChange={handleLocationChange}
          locParts={locParts}
          isCustomCountry={isCustomCountry}
        />
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

      {}
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