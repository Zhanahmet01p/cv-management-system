import React, { useEffect, useState } from 'react';
import { fetchPositions } from '../api.js';

const AdminDashboard = () => {
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchPositions();
        setPositions(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">This section helps administrators inspect the shared position library and system state.</p>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-xl font-semibold">Positions overview</h2>
        {loading ? (
          <div className="mt-4 text-slate-600 dark:text-slate-300">Loading positions…</div>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 p-5 dark:bg-slate-950">
              <div className="text-sm uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Total positions</div>
              <div className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">{positions.length}</div>
            </div>
            <div className="rounded-2xl bg-slate-50 p-5 dark:bg-slate-950">
              <div className="text-sm uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Most recent</div>
              <div className="mt-3 text-lg font-semibold text-slate-900 dark:text-white">{positions[0]?.title ?? 'N/A'}</div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminDashboard;
