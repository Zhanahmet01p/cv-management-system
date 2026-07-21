import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Upload, Link as LinkIcon, Camera } from 'lucide-react';

const AvatarModal = ({ currentUrl, onClose, onSave }) => {
  const { t } = useTranslation();
  const [tab, setTab] = useState('file');
  const [urlInput, setUrlInput] = useState(currentUrl || '');
  const [preview, setPreview] = useState(currentUrl || '');
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError('Файл слишком большой (максимум 2 МБ)');
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
    onSave(finalUrl);
    onClose();
  };

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem'
      }}
    >
      <div
        className="card"
        onClick={e => e.stopPropagation()}
        style={{ width: '100%', maxWidth: '420px', padding: '1.5rem', background: 'var(--color-surface)' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 className="section-title" style={{ margin: 0, fontSize: '1.1rem' }}>{t('profile.changeAvatar', 'Изменить аватар')}</h3>
          <button className="btn btn-ghost btn-sm btn-icon" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--color-border)' }}>
          <button
            type="button"
            className={`btn btn-sm ${tab === 'file' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setTab('file')}
            style={{ borderRadius: 'var(--radius-md) var(--radius-md) 0 0' }}
          >
            <Upload size={14} /> {t('profile.uploadFile', 'Загрузить файл')}
          </button>
          <button
            type="button"
            className={`btn btn-sm ${tab === 'url' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setTab('url')}
            style={{ borderRadius: 'var(--radius-md) var(--radius-md) 0 0' }}
          >
            <LinkIcon size={14} /> {t('profile.insertUrl', 'Вставить ссылку')}
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
          {preview ? (
            <img
              src={preview}
              alt="Preview"
              className="avatar"
              style={{ width: '5.5rem', height: '5.5rem', objectFit: 'cover' }}
            />
          ) : (
            <div className="avatar" style={{ width: '5.5rem', height: '5.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem' }}>
              ?
            </div>
          )}
        </div>

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

        {tab === 'url' && (
          <div>
            <label className="label">URL изображения</label>
            <input
              className="input"
              placeholder="https://example.com/photo.jpg"
              value={urlInput}
              onChange={e => {
                setUrlInput(e.target.value);
                setPreview(e.target.value);
              }}
            />
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.5rem' }}>
          <button type="button" className="btn btn-outline btn-sm" onClick={onClose}>
            {t('common.cancel')}
          </button>
          <button type="button" className="btn btn-primary btn-sm" onClick={handleApply}>
            {t('common.save')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AvatarModal;
