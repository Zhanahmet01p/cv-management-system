import { useState } from 'react';
import { X, Upload, Link as LinkIcon } from 'lucide-react';

const AvatarModal = ({ currentUrl, onClose, Save }) => {
  const [tab, setTab] = useState('file'); // 'file' | 'url'
  const [urlInput, setUrlInput] = useState(currentUrl || '');
  const [preview, setPreview] = useState(currentUrl || '');
  const [error, setError] = useState('');

  // Преобразование локального файла в Base64 строку
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) { // Ограничение 2 МБ
      setError('file size should be less than 2MB');
      return;
    }

    setError('');
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleApply = () => {
    const finalUrl = tab === 'file' ? preview : urlInput;
    Save(finalUrl);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', 
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 
    }}>
      <div className="card" onClick={e => e.stopPropagation()} style={{ width: '400px', padding: '1.5rem', background: 'var(--color-surface)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 className="section-title" style={{ margin: 0 }}>Change Profile Photo</h3>
          <button className="btn btn-ghost btn-sm btn-icon" onClick={onClose}><X size={16} /></button>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid var(--color-border)' }}>
          <button 
            className={`btn btn-sm ${tab === 'file' ? 'btn-primary' : 'btn-ghost'}`} 
            onClick={() => setTab('file')}
            style={{ borderRadius: 'var(--radius-md) var(--radius-md) 0 0' }}
          >
            <Upload size={14} /> File
          </button>
          <button 
            className={`btn btn-sm ${tab === 'url' ? 'btn-primary' : 'btn-ghost'}`} 
            onClick={() => setTab('url')}
            style={{ borderRadius: 'var(--radius-md) var(--radius-md) 0 0' }}
          >
            <LinkIcon size={14} /> URL
          </button>
        </div>

        {/* Preview */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
          {preview ? (
            <img src={preview} alt="Preview" className="avatar" style={{ width: '5rem', height: '5rem', objectFit: 'cover' }} />
          ) : (
            <div className="avatar" style={{ width: '5rem', height: '5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
              ?
            </div>
          )}
        </div>

        {/* File Upload */}
        {tab === 'file' && (
          <div>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFileChange} 
              className="input" 
              style={{ padding: '0.4rem' }}
            />
            {error && <p style={{ color: 'var(--color-danger)', fontSize: '0.8rem', marginTop: '0.4rem' }}>{error}</p>}
          </div>
        )}

        {/* URL Input */}
        {tab === 'url' && (
          <div>
            <label className="label">Image URL</label>
            <input 
              className="input" 
              placeholder="https://example.com/photo.jpg" 
              value={urlInput} 
              onChange={e => { setUrlInput(e.target.value); setPreview(e.target.value); }}
            />
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.5rem' }}>
          <button className="btn btn-outline btn-sm" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary btn-sm" onClick={handleApply}>Save</button>
        </div>
      </div>
    </div>
  );
};

export default AvatarModal;