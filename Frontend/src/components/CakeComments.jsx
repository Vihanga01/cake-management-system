import React, { useEffect, useMemo, useState } from 'react';
import { useStore } from '../context/StoreContext';
import axios from 'axios';
import { FaHeart, FaRegHeart, FaReply } from 'react-icons/fa';
import { toast } from 'react-toastify';
import './CakeComments.css';

const Stars = ({ value = 0, onChange, readOnly = false }) => {
    const stars = [1,2,3,4,5];
    return (
        <div className="cc-stars">
            {stars.map((s) => (
                <span
                    key={s}
                    className={`cc-star ${s <= (value || 0) ? 'active' : ''}`}
                    onClick={() => !readOnly && onChange?.(s)}
                >
                    ★
                </span>
            ))}
        </div>
    );
};

const CakeComments = ({ cakeId }) => {
    const { isAuthenticated, user, token } = useStore();
    const api = useMemo(() => axios.create({ baseURL: 'http://localhost:5000' }), []);
    const [comments, setComments] = useState([]);
    const [text, setText] = useState('');
    const [rating, setRating] = useState(0);
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [replyFor, setReplyFor] = useState(null);
    const [replyText, setReplyText] = useState('');

    useEffect(() => {
        fetchComments();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cakeId]);

    const fetchComments = async () => {
        try {
            const res = await api.get(`/api/comments/${cakeId}`);
            setComments(res.data || []);
        } catch {
            toast.error('Failed to load comments');
        }
    };

    const authHeader = () => token ? { Authorization: `Bearer ${token}` } : {};

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!text.trim()) return;
        setLoading(true);
        try {
            if (editingId) {
                await api.put(`/api/comments/${editingId}`, { commentText: text, rating }, { headers: authHeader() });
                toast.success('Comment updated');
            } else {
                await api.post('/api/comments', { cakeId, commentText: text, rating }, { headers: authHeader() });
                toast.success('Comment added');
            }
            setText('');
            setRating(0);
            setEditingId(null);
            fetchComments();
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Action failed');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this comment?')) return;
        try {
            await api.delete(`/api/comments/${id}`, { headers: authHeader() });
            toast.success('Comment deleted');
            fetchComments();
        } catch {
            toast.error('Delete failed');
        }
    };

    const handleLike = async (id) => {
        try {
            await api.patch(`/api/comments/like/${id}`, {}, { headers: authHeader() });
            fetchComments();
        } catch {
            toast.error('Like failed');
        }
    };

    const handleReply = async (id) => {
        if (!replyText.trim()) return;
        try {
            await api.post(`/api/comments/reply/${id}`, { replyText }, { headers: authHeader() });
            toast.success('Reply added');
            setReplyFor(null);
            setReplyText('');
            fetchComments();
        } catch {
            toast.error('Reply failed');
        }
    };

    const currentUserId = () => user?._id || user?.id;
    const normalizeLikeId = (u) => (typeof u === 'string' ? u : (u?._id || u?.id));
    const canEdit = (c) => isAuthenticated && (currentUserId() === c.userId || user?.role === 'admin');
    const likedByMe = (c) => isAuthenticated && c.likes?.some((u) => normalizeLikeId(u) === currentUserId());

    return (
        <div className="cake-comments">
            <div className="cc-header">
                <div className="cc-title">Comments & Ratings</div>
            </div>

            {isAuthenticated ? (
                <form onSubmit={handleSubmit} className="cc-form">
                    <Stars value={rating} onChange={setRating} />
                    <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Write a comment..." rows={3} />
                    <div className="cc-form-actions">
                        <button className="btn primary" type="submit" disabled={loading}>{editingId ? 'Update' : 'Post'} Comment</button>
                        {editingId && (
                            <button className="btn secondary" type="button" onClick={() => { setEditingId(null); setText(''); setRating(0); }}>Cancel</button>
                        )}
                    </div>
                </form>
            ) : (
                <div style={{ marginBottom: 16 }}>Login to post a comment.</div>
            )}

            <div className="cc-list">
                {comments.map((c) => (
                    <div key={c._id} className="cc-card">
                        <div className="cc-card-head">
                            <div className="cc-user">
                                <div className="cc-avatar">{(c.userName || 'U').slice(0,1).toUpperCase()}</div>
                                <div className="cc-user-meta">
                                    <span className="cc-username">{c.userName}</span>
                                    <span className="cc-date">{new Date(c.createdAt).toLocaleString()}</span>
                                </div>
                            </div>
                            <Stars value={c.rating} readOnly />
                        </div>
                        <div className="cc-text">{c.commentText}</div>
                        <div className="cc-actions">
                            <button className="btn icon" onClick={() => handleLike(c._id)} disabled={!isAuthenticated} title={likedByMe(c) ? 'Unlike' : 'Like'}>
                                {likedByMe(c) ? <FaHeart color="#e11d48" /> : <FaRegHeart />}
                                <span>{c.likes?.length || 0}</span>
                            </button>
                            <button className="btn icon" onClick={() => setReplyFor(replyFor === c._id ? null : c._id)} disabled={!isAuthenticated}>
                                <FaReply /> <span>Reply</span>
                            </button>
                            {canEdit(c) && (
                                <>
                                    <button className="btn" onClick={() => { setEditingId(c._id); setText(c.commentText); setRating(c.rating || 0); }}>Edit</button>
                                    <button className="btn" onClick={() => handleDelete(c._id)}>Delete</button>
                                </>
                            )}
                        </div>

                        {replyFor === c._id && (
                            <div className="cc-reply-form">
                                <textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Write a reply..." rows={2} />
                                <div>
                                    <button className="btn primary" onClick={() => handleReply(c._id)}>Send Reply</button>
                                </div>
                            </div>
                        )}

                        {Array.isArray(c.replies) && c.replies.length > 0 && (
                            <div className="cc-replies">
                                {c.replies.map((r) => (
                                    <div key={r._id} className="cc-reply-item">
                                        <div style={{ fontSize: 13 }}><strong>{r.userName}</strong> <span style={{ color: '#666' }}>{new Date(r.createdAt).toLocaleString()}</span></div>
                                        <div>{r.replyText}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CakeComments;


