import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchCV, publishCV } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';

const CVView = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [cvData, setCvData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchCV(id);
        setCvData(res.data);
      } catch (err) {
        setError('Unable to load CV.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handlePublish = async () => {
    if (!cvData) return;
    setSaving(true);
    try {
      await publishCV(cvData.cv.id, { version: cvData.cv.version });
      const refreshed = await fetchCV(id);
      setCvData(refreshed.data);
    } catch (err) {
      setError('Could not publish CV.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">Loading CV...</div>;
  }

  if (error) {
    return <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700 shadow-sm dark:border-red-800 dark:bg-red-950/40 dark:text-red-200">{error}</div>;
  }

  if (!cvData) {
    return null;
  }

  const { cv, assembledData } = cvData;
  const requiredAttributes = assembledData.attributes || [];
  const projectCount = assembledData.projects?.length || 0;

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">CV: {cv.position.title}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Generated for position template with automatic profile values.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700 dark:bg-slate-800 dark:text-slate-200">{cv.status}</span>
            {user?.id === cv.userId && cv.status === 'DRAFT' && (
              <button
                disabled={saving}
                onClick={handlePublish}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {saving ? 'Publishing…' : 'Publish CV'}
              </button>
            )}
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
            <div className="text-sm text-slate-500 dark:text-slate-400">Candidate</div>
            <div className="mt-2 text-lg font-semibold">{assembledData.fullName}</div>
            <div className="text-sm text-slate-500">{assembledData.location}</div>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
            <div className="text-sm text-slate-500 dark:text-slate-400">Projects Included</div>
            <div className="mt-2 text-lg font-semibold">{projectCount}</div>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-4 text-xl font-semibold">Selected Attributes</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                <th className="px-4 py-3">Attribute</th>
                <th className="px-4 py-3">Value</th>
              </tr>
            </thead>
            <tbody>
              {requiredAttributes.map((attr) => {
                const value = attr.value || '—';
                const missing = !attr.value || String(attr.value).trim() === '';
                return (
                  <tr key={attr.id} className={`border-t border-slate-200 dark:border-slate-800 ${missing ? 'bg-red-50 dark:bg-red-950/30' : ''}`}>
                    <td className="px-4 py-4 font-medium text-slate-900 dark:text-white">{attr.attribute.name}</td>
                    <td className="px-4 py-4 text-slate-700 dark:text-slate-200">{missing ? <span className="text-red-600 dark:text-red-300">Missing value</span> : value}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-4 text-xl font-semibold">Relevant Projects</h2>
        {assembledData.projects.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">No matching projects are available.</div>
        ) : (
          <div className="space-y-4">
            {assembledData.projects.map((project) => (
              <div key={project.id} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                <div className="text-lg font-semibold text-slate-900 dark:text-white">{project.name}</div>
                <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">{new Date(project.startDate).toLocaleDateString()} — {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'Present'}</div>
                <p className="mt-3 text-sm leading-6 text-slate-700 dark:text-slate-300">{project.description}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default CVView;
