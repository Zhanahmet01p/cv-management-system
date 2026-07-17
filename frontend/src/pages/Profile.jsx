import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { fetchProfile, saveProfile, saveAttributeValue, createProject, updateProject, deleteProject } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useTranslation } from 'react-i18next';

const emptyProject = {
  name: '',
  startDate: '',
  endDate: '',
  description: '',
  tags: ''
};

const Profile = () => {
  const { user, setUser } = useAuth();
  const { t } = useTranslation();
  const [profile, setProfile] = useState(null);
  const [dirty, setDirty] = useState(false);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [projectForm, setProjectForm] = useState(emptyProject);
  const [editingProject, setEditingProject] = useState(null);
  const [projectError, setProjectError] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetchProfile();
        setProfile(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    loadProfile();
  }, []);

  useEffect(() => {
    if (!dirty || !profile) return;
    const timeout = setTimeout(handleSave, 5000);
    return () => clearTimeout(timeout);
  }, [dirty, profile, handleSave]);

  const handleSave = useCallback(async () => {
    if (!profile) return;
    setSaving(true);
    setMessage('');
    try {
      const res = await saveProfile({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        location: profile.location || '',
        photoUrl: profile.photoUrl || '',
        version: profile.version || 1
      });
      setProfile(res.data);
      setDirty(false);
      setMessage('Profile saved successfully.');
      if (setUser) setUser(res.data);
    } catch (err) {
      if (err.response?.status === 409) {
        setMessage('Version conflict detected. Please reload the page.');
      } else {
        setMessage('Unable to save profile.');
      }
    } finally {
      setSaving(false);
    }
  }, [profile, setUser]);

  const handleFieldChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
    setDirty(true);
  };

  const handleAttributeChange = async (index, value) => {
    const nextAttributes = [...(profile.attributeValues || [])];
    nextAttributes[index] = { ...nextAttributes[index], value };
    setProfile((prev) => ({ ...prev, attributeValues: nextAttributes }));

    try {
      const payload = {
        attributeId: nextAttributes[index].attribute.id,
        value,
        version: nextAttributes[index].version
      };
      const res = await saveAttributeValue(payload);
      nextAttributes[index] = res.data;
      setProfile((prev) => ({ ...prev, attributeValues: nextAttributes }));
    } catch (err) {
      console.error('Attribute save failed', err);
    }
  };

  const refreshProfile = async () => {
    try {
      const res = await fetchProfile();
      setProfile(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleProjectInputChange = (field, value) => {
    setProjectForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleProjectSubmit = async (event) => {
    event.preventDefault();
    setProjectError('');
    const payload = {
      name: projectForm.name,
      startDate: projectForm.startDate,
      endDate: projectForm.endDate || null,
      description: projectForm.description,
      tags: projectForm.tags.split(',').map((tag) => tag.trim()).filter(Boolean)
    };

    try {
      if (editingProject) {
        await updateProject(editingProject.id, { ...payload, version: editingProject.version });
      } else {
        await createProject(payload);
      }
      setProjectForm(emptyProject);
      setEditingProject(null);
      await refreshProfile();
    } catch (err) {
      setProjectError('Unable to save project.');
      console.error(err);
    }
  };

  const handleEditProject = (project) => {
    setEditingProject(project);
    setProjectForm({
      name: project.name,
      startDate: project.startDate?.slice(0, 10) || '',
      endDate: project.endDate?.slice(0, 10) || '',
      description: project.description || '',
      tags: (project.tags || []).join(', ')
    });
  };

  const handleDeleteProject = async (project) => {
    setProjectError('');
    try {
      await deleteProject(project.id, project.version);
      await refreshProfile();
    } catch (err) {
      setProjectError('Unable to delete project.');
      console.error(err);
    }
  };

  const builtInFields = useMemo(
    () => [
      { label: 'First Name', value: profile?.firstName || '', name: 'firstName' },
      { label: 'Last Name', value: profile?.lastName || '', name: 'lastName' },
      { label: 'Location', value: profile?.location || '', name: 'location' },
      { label: 'Photo URL', value: profile?.photoUrl || '', name: 'photoUrl' }
    ],
    [profile]
  );

  if (!user || !profile) {
    return <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">Loading profile...</div>;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">{t('nav.profile')}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Manage your reusable profile, shared attribute values, and CV history.</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200">
            {saving ? 'Saving…' : dirty ? 'Pending changes' : 'All changes saved'}
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {builtInFields.map((field) => (
            <label key={field.name} className="block text-sm text-slate-700 dark:text-slate-200">
              <div className="mb-2 font-medium">{field.label}</div>
              <input
                value={field.value}
                onChange={(event) => {
                  handleFieldChange(field.name, event.target.value);
                }}
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </label>
          ))}
        </div>

        {message && (
          <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200">
            {message}
          </div>
        )}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">Projects</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Your portfolio projects are used to populate generated CVs.</p>
          </div>
          <span className="text-sm text-slate-500 dark:text-slate-400">Manage live project data</span>
        </div>

        {projectError && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200">
            {projectError}
          </div>
        )}

        <form onSubmit={handleProjectSubmit} className="grid gap-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <label className="block text-sm text-slate-700 dark:text-slate-200">
              Project name
              <input
                value={projectForm.name}
                onChange={(e) => handleProjectInputChange('name', e.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </label>
            <label className="block text-sm text-slate-700 dark:text-slate-200">
              Period start
              <input
                type="date"
                value={projectForm.startDate}
                onChange={(e) => handleProjectInputChange('startDate', e.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </label>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <label className="block text-sm text-slate-700 dark:text-slate-200">
              Period end
              <input
                type="date"
                value={projectForm.endDate}
                onChange={(e) => handleProjectInputChange('endDate', e.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </label>
            <label className="block text-sm text-slate-700 dark:text-slate-200">
              Tags (comma-separated)
              <input
                value={projectForm.tags}
                onChange={(e) => handleProjectInputChange('tags', e.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </label>
          </div>

          <label className="block text-sm text-slate-700 dark:text-slate-200">
            Description
            <textarea
              value={projectForm.description}
              onChange={(e) => handleProjectInputChange('description', e.target.value)}
              rows={4}
              className="mt-2 w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </label>

          <div className="flex flex-wrap items-center gap-3">
            <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
              {editingProject ? 'Update project' : 'Add project'}
            </button>
            {editingProject && (
              <button
                type="button"
                onClick={() => {
                  setEditingProject(null);
                  setProjectForm(emptyProject);
                }}
                className="rounded-lg border border-slate-300 bg-slate-50 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
              >
                Cancel edit
              </button>
            )}
          </div>
        </form>

        <div className="mt-8 space-y-4">
          {profile.projects.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-400">
              No projects added yet.
            </div>
          ) : (
            profile.projects.map((project) => (
              <div key={project.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="text-lg font-semibold text-slate-900 dark:text-white">{project.name}</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      {new Date(project.startDate).toLocaleDateString()} — {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'Present'}
                    </div>
                    <div className="mt-2 text-sm text-slate-700 dark:text-slate-300">{project.description}</div>
                    <div className="mt-3 text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Tags: {project.tags.join(', ')}</div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditProject(project)}
                      className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 hover:border-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteProject(project)}
                      className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 hover:bg-red-100 dark:border-red-800 dark:bg-red-950/50 dark:text-red-300"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">Generated CVs</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">View CVs generated from your profile and skills.</p>
          </div>
          <span className="text-sm text-slate-500 dark:text-slate-400">Recent CV drafts</span>
        </div>

        {profile.cvs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-400">
            You have not generated any CVs yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  <th className="px-4 py-3">Position</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3">View</th>
                </tr>
              </thead>
              <tbody>
                {profile.cvs.map((cv) => (
                  <tr key={cv.id} className="border-t border-slate-200 dark:border-slate-800">
                    <td className="px-4 py-4 font-medium text-slate-900 dark:text-white">{cv.position?.title || 'Unknown'}</td>
                    <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{cv.status}</td>
                    <td className="px-4 py-4 text-slate-500 dark:text-slate-400">{new Date(cv.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-4">
                      <Link
                        to={`/cvs/${cv.id}`}
                        className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                      >
                        View CV
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default Profile;
