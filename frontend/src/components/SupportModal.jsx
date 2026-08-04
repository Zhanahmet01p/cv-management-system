import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const RAW_API_URL = import.meta.env.VITE_API_URL || 'https://cv-management-system-ux49.onrender.com';
const API_BASE = RAW_API_URL.replace(/\/$/, '');

export const SupportModal = ({ isOpen, onClose, currentPositionTitle = null }) => {
  const { user } = useAuth();
  const [summary, setSummary] = useState('');
  const [priority, setPriority] = useState('Average');
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg({ type: '', text: '' });

    const ticketData = {
      reportedBy: `${user?.firstName || ''} ${user?.lastName || ''} (${user?.email || 'Guest'}) [Role: ${user?.role || 'CANDIDATE'}]`,
      position: currentPositionTitle || 'N/A',
      link: window.location.href,
      priority: priority, 
      summary: summary,
      adminEmails: ['admin@example.com', 'p.lebedev@itransition.com'] 
    };

    try {
      const res = await fetch(`${API_BASE}/api/support/ticket`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(ticketData),
      });

      if (!res.ok) throw new Error('Failed to submit ticket');

      setStatusMsg({ type: 'success', text: 'Ticket submitted successfully!' });
      setTimeout(() => {
        onClose();
        setSummary('');
      }, 1500);
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message || 'An error occurred' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div className="card" style={{ width: '100%', maxWidth: '450px', padding: '1.5rem', background: 'var(--color-surface, #fff)' }}>
        <h3 style={{ marginTop: 0 }}>Create Support Ticket</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Summary</label>
            <textarea
              required
              rows={3}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Describe your issue..."
              style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #ccc' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #ccc' }}
            >
              <option value="Low">Low</option>
              <option value="Average">Average</option>
              <option value="High">High</option>
            </select>
          </div>

          {statusMsg.text && (
            <div style={{ color: statusMsg.type === 'success' ? 'green' : 'red', fontSize: '0.85rem' }}>
              {statusMsg.text}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Sending...' : 'Submit Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};