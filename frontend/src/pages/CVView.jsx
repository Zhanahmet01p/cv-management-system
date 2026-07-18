import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchCV, publishCV, toggleLike, createComment, saveAttributeValue } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useTranslation } from 'react-i18next';
import { Heart, MessageSquare, Printer, Send, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';

const POLL_INTERVAL = 4000;

const CVView = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { t } = useTranslation();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('cv');
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [comment, setComment] = useState('');
  const [sending, setSending] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishMsg, setPublishMsg] = useState('');
  const pollRef = useRef(null);

  const isRecruiter = user?.role === 'RECRUITER' || user?.role === 'ADMIN';
  const isAdmin = user?.role === 'ADMIN';
  const isOwner = user?.id === data?.cv?.userId;
  const canEdit = isOwner || isAdmin;


  const load = async () => {
    try {
      const res = await fetchCV(id);
      setData(res.data);
      setLikeCount(res.data.cv?.likes?.length ?? 0);
      const myLike = res.data.cv?.likes?.some(l => l.userId === user?.id);
      setLiked(!!myLike);
    } catch (e) {
      setError(e.response?.data?.error || 'Could not load CV');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    const fetchAll = async () => {
      try {
        const res = await fetchCV(id);
        if (active) {
          setData(res.data);
          setLikeCount(res.data.cv?.likes?.length ?? 0);
          const myLike = res.data.cv?.likes?.some(l => l.userId === user?.id);
          setLiked(!!myLike);
        }
      } catch (e) {
        if (active) setError(e.response?.data?.error || 'Could not load CV');
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchAll();

    pollRef.current = setInterval(async () => {
      try {
        const res = await fetchCV(id);
        if (active) setData(res.data);
      } catch {
        // ignore errors on polling
      }
    }, POLL_INTERVAL);

    return () => {
      active = false;
      clearInterval(pollRef.current);
    };
  }, [id, user?.id]);

  const handleAttrEdit = async (attrId, value, version) => {
    try {
      await saveAttributeValue({ attributeId: attrId, value, version });
      await load();
    } catch (e) {
      console.error('Attr save:', e);
    }
  };

  const handlePublish = async () => {
    setPublishing(true);
    setPublishMsg('');
    try {
      await publishCV(id, { version: data.cv.version });
      await load();
      setPublishMsg('CV published! Recruiters can now see it.');
    } catch (e) {
      if (e.response?.status === 409) {
        setPublishMsg('Version conflict. Please reload.');
      } else {
        setPublishMsg(e.response?.data?.error || 'Publish failed.');
      }
    } finally {
      setPublishing(false);
    }
  };

  const handleLike = async () => {
    if (!isRecruiter) return;
    try {
      const res = await toggleLike(id);
      setLiked(res.data.liked);
      setLikeCount(prev => res.data.liked ? prev + 1 : prev - 1);
    } catch (e) { console.error(e); }
  };

  const handleSendComment = async () => {
    if (!comment.trim()) return;
    setSending(true);
    try {
      await createComment(data.cv.positionId, comment);
      setComment('');
      await load();
    } catch (e) { console.error(e); }
    finally { setSending(false); }
  };

  const handlePrint = () => window.print();

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="skeleton" style={{ height: '3rem', borderRadius: 'var(--radius-xl)' }} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '2rem' }}>
        <div className="alert alert-danger">{error}</div>
        <Link to="/profile" className="btn btn-outline" style={{ marginTop: '1rem' }}>
          <ArrowLeft size={15} /> Back to Profile
        </Link>
      </div>
    );
  }

  const { cv, assembledData } = data;
  const allFilled = (assembledData?.attributes || []).every(av => av.value !== '' && av.value !== null && av.value !== undefined);

  const position = cv?.position;
  const comments = position?.comments || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Back + Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <Link to="/profile" className="btn btn-ghost btn-sm">
          <ArrowLeft size={15} /> {t('common.back')}
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {/* Like (Recruiters only) */}
          {isRecruiter && (
            <button
              id="btn-like-cv"
              className={`like-btn${liked ? ' liked' : ''}`}
              onClick={handleLike}
            >
              <Heart size={15} fill={liked ? 'currentColor' : 'none'} />
              {likeCount} {t('cv.likes')}
            </button>
          )}

          <button id="btn-print-cv" className="btn btn-outline btn-sm" onClick={handlePrint}>
            <Printer size={15} /> {t('cv.printPdf')}
          </button>

          {/* Publish (Owner/Admin only, when draft) */}
          {canEdit && cv.status === 'DRAFT' && (
            <button
              id="btn-publish-cv"
              className="btn btn-success"
              disabled={publishing || !allFilled}
              onClick={handlePublish}
              title={!allFilled ? t('cv.publishHint') : ''}
            >
              {publishing
                ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />
                : <CheckCircle size={15} />}
              {t('cv.publishBtn')}
            </button>
          )}

          <span className={`badge ${cv.status === 'PUBLISHED' ? 'badge-success' : 'badge-warning'}`}>
            {cv.status === 'PUBLISHED' ? t('cv.published') : t('cv.draft')}
          </span>
        </div>
      </div>

      {publishMsg && (
        <div className={`alert ${publishMsg.includes('published') ? 'alert-success' : 'alert-danger'}`}>
          {publishMsg}
        </div>
      )}

      {!allFilled && canEdit && (
        <div className="alert alert-warning">
          {t('cv.publishHint')} Fill in all highlighted (red) fields.
        </div>
      )}

      {/* Tabs */}
      <div className="tabs">
        <button className={`tab${activeTab === 'cv' ? ' active' : ''}`}
          onClick={() => setActiveTab('cv')}>
          CV
        </button>
        <button className={`tab${activeTab === 'disc' ? ' active' : ''}`}
          onClick={() => setActiveTab('disc')} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <MessageSquare size={14} /> {t('cv.discussions')}
          {comments.length > 0 && <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>{comments.length}</span>}
        </button>
      </div>

      {/* ── CV Tab ── */}
      {activeTab === 'cv' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Candidate header section */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
              {assembledData.photoUrl && (
                <img src={assembledData.photoUrl} alt="Photo"
                  className="avatar" style={{ width: '5rem', height: '5rem', fontSize: '1.5rem' }} />
              )}
              <div style={{ flex: 1 }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--color-text)' }}>
                  {assembledData.fullName}
                </h1>
                {assembledData.location && (
                  <div style={{ color: 'var(--color-text-3)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                    📍 {assembledData.location}
                  </div>
                )}
                <div style={{ marginTop: '0.75rem' }}>
                  <span className="badge badge-primary">{position?.title}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Attributes */}
          {(assembledData.attributes || []).length > 0 && (
            <div className="card" style={{ overflow: 'hidden' }}>
              <div style={{ padding: '1rem 1.25rem 0.5rem', borderBottom: '1px solid var(--color-border)' }}>
                <h2 className="section-title">Skills & Attributes</h2>
              </div>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Attribute</th>
                    <th>Category</th>
                    <th>Value</th>
                  </tr>
                </thead>
                <tbody>
                  {assembledData.attributes.map((av, i) => {
                    const isEmpty = !av.value || av.value === '';
                    return (
                      <tr key={av.id || i}>
                        <td className="cell-primary">{av.attribute?.name}</td>
                        <td><span className="badge badge-neutral">{av.attribute?.category}</span></td>
                        <td>
                          {canEdit ? (
                            <input
                              className={`input${isEmpty ? ' attr-empty' : ''}`}
                              style={{ padding: '0.3rem 0.625rem', fontSize: '0.85rem' }}
                              placeholder={isEmpty ? `⚠ ${t('cv.emptyAttr')}` : ''}
                              defaultValue={typeof av.value === 'object' ? JSON.stringify(av.value) : (av.value || '')}
                              onBlur={e => handleAttrEdit(av.attributeId || av.attribute?.id, e.target.value, av.version)}
                            />
                          ) : (
                            <span className={isEmpty ? 'badge badge-danger' : ''} style={{ fontSize: '0.875rem' }}>
                              {isEmpty ? `⚠ ${t('cv.emptyAttr')}` : (typeof av.value === 'object' ? JSON.stringify(av.value) : av.value)}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Projects */}
          {(assembledData.projects || []).length > 0 && (
            <div className="card" style={{ padding: '1.25rem' }}>
              <h2 className="section-title" style={{ marginBottom: '1rem' }}>Projects</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {assembledData.projects.map(proj => (
                  <div key={proj.id} style={{
                    padding: '1rem', background: 'var(--color-surface-2)',
                    borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-text)' }}>{proj.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-3)', marginTop: '0.2rem' }}>
                          {new Date(proj.startDate).toLocaleDateString()} – {proj.endDate ? new Date(proj.endDate).toLocaleDateString() : 'Present'}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                        {(proj.tags || []).map(tag => <span key={tag} className="tag">{tag}</span>)}
                      </div>
                    </div>
                    {proj.description && (
                      <div style={{ marginTop: '0.75rem', fontSize: '0.875rem', color: 'var(--color-text-2)', lineHeight: 1.7 }}>
                        {proj.description}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Discussion Tab ── */}
      {activeTab === 'disc' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Comments list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {comments.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon"><MessageSquare size={20} /></div>
                <div>No comments yet. Be the first!</div>
              </div>
            ) : comments.map(c => (
              <div key={c.id} className="comment-card">
                <div className="comment-meta">
                  <span className="comment-author">
                    {isRecruiter
                      ? <Link to="#" style={{ color: 'var(--color-primary)' }}>
                          {c.user?.firstName || c.user?.email?.split('@')[0] || 'User'}
                        </Link>
                      : (c.user?.firstName || 'User')}
                  </span>
                  <span>•</span>
                  <span>{new Date(c.createdAt).toLocaleString()}</span>
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--color-text-2)', lineHeight: 1.7 }}>
                  {c.text}
                </div>
              </div>
            ))}
          </div>

          {/* New comment */}
          {user && (
            <div className="card" style={{ padding: '1rem' }}>
              <textarea
                id="input-comment"
                className="textarea"
                rows={3}
                placeholder={t('cv.writeComment')}
                value={comment}
                onChange={e => setComment(e.target.value)}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.75rem' }}>
                <button
                  id="btn-send-comment"
                  className="btn btn-primary"
                  disabled={sending || !comment.trim()}
                  onClick={handleSendComment}
                >
                  {sending ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={15} />}
                  {t('cv.sendComment')}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CVView;
