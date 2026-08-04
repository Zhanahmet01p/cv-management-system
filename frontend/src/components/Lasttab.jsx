import { MessageSquare, Send, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const Lasttab = ({ comments = [], user, comment, setComment, sending, handleSendComment }) => {
  const { t } = useTranslation();
  
  const isRecruiter = user?.role === 'RECRUITER' || user?.role === 'ADMIN';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {comments.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><MessageSquare size={20} /></div>
            <div>No comments yet. Be the first!</div>
          </div>
        ) : (
          comments.map(c => (
            <div key={c.id || c._id} className="comment-card">
              <div className="comment-meta">
                <span className="comment-author">
                  {isRecruiter ? (
                    <Link to="#" style={{ color: 'var(--color-primary)' }}>
                      {c.user?.firstName || c.user?.email?.split('@')[0] || 'User'}
                    </Link>
                  ) : (
                    c.user?.firstName || 'User'
                  )}
                </span>
                <span>•</span>
                <span>{c.createdAt ? new Date(c.createdAt).toLocaleString() : ''}</span>
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--color-text-2)', lineHeight: 1.7 }}>
                {c.text}
              </div>
            </div>
          ))
        )}
      </div>

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
              {sending ? (
                <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />
              ) : (
                <Send size={15} />
              )}
              {t('cv.sendComment')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};