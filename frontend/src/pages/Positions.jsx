import React, { useEffect, useMemo, useState } from 'react';
import { fetchPositions, createCV } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useTranslation } from 'react-i18next';

const Positions = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [positions, setPositions] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [selectedPositionId, setSelectedPositionId] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchPositions();
        setPositions(res.data);
      } catch (err) {
        setError('Unable to load positions.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const visiblePositions = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    if (!normalized) return positions;
    return positions.filter((position) => {
      return (
        position.title.toLowerCase().includes(normalized) ||
        position.description.toLowerCase().includes(normalized) ||
        position.tags.some((tag) => tag.name.toLowerCase().includes(normalized))
      );
    });
  }, [positions, search]);

  const handleCreateCV = async (positionId) => {
    if (!user) {
      setActionMessage('Please sign in to generate a CV.');
      return;
    }
    if (user.role !== 'CANDIDATE') {
      setActionMessage('Only candidates can generate CVs.');
      return;
    }
    setSelectedPositionId(positionId);
    setActionMessage('Creating CV...');

    try {
      await createCV(positionId);
      setActionMessage('CV created successfully. You can open it from your profile.');
    } catch (err) {
      if (err.response?.data?.error === 'CV already exists for this position') {
        setActionMessage('You already have a CV for this position. Open it from your profile.');
      } else if (err.response?.status === 401) {
        setActionMessage('Please sign in to create a CV.');
      } else {
        setActionMessage('Unable to create CV at this time.');
      }
    } finally {
      setSelectedPositionId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">{t('nav.positions')}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Browse position templates and review shared requirements.</p>
          </div>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('common.search')}
            className="w-full max-w-sm rounded-lg border border-slate-300 bg-slate-50 px-4 py-2 text-sm outline-none transition hover:border-slate-400 focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          />
        </div>

        {loading && <div className="py-8 text-center text-slate-600 dark:text-slate-300">Loading positions...</div>}
        {error && <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">{error}</div>}
        {actionMessage && !loading && (
          <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200">
            {actionMessage}
          </div>
        )}

        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border-separate border-spacing-y-3">
              <thead>
                <tr className="text-left text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">CVs</th>
                  <th className="px-4 py-3">Tags</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {visiblePositions.map((position) => (
                  <tr key={position.id} className="group rounded-2xl bg-slate-50 transition hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800">
                    <td className="px-4 py-4 align-top font-semibold text-slate-900 dark:text-white">{position.title}</td>
                    <td className="px-4 py-4 align-top text-sm text-slate-600 dark:text-slate-300">{position.description}</td>
                    <td className="px-4 py-4 align-top text-sm text-slate-600 dark:text-slate-300">{position._count?.cvs ?? 0}</td>
                    <td className="px-4 py-4 align-top text-sm text-slate-600 dark:text-slate-300">
                      {position.tags.map((tag) => tag.name).join(', ')}
                    </td>
                    <td className="px-4 py-4 align-top">
                      <button
                        onClick={() => handleCreateCV(position.id)}
                        disabled={selectedPositionId === position.id}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                      >
                        {selectedPositionId === position.id ? 'Working…' : 'Generate CV'}
                      </button>
                    </td>
                  </tr>
                ))}
                {visiblePositions.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">No positions match your filter.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Positions;
