import React, { useState, useEffect, useCallback } from 'react';
import ApiService from '../services/api';

const CommentSection = ({ summaryDate, summaryExists = true }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split(".")[1]));
                setUser({ 
                    id: payload.id,
                    name: payload.name || payload.full_name,
                    email: payload.email 
                });
            } catch (err) {
                console.error('Error parsing token:', err);
            }
        }
    }, []);

    const loadComments = useCallback(async () => {
        setLoading(true);
        setError(null);
        
        try {
            const loadedComments = await ApiService.getSummaryComments(summaryDate);
            setComments(loadedComments);
        } catch (error) {
            console.error('Error loading comments:', error);
            if (error.message.includes('404')) {
                setComments([]);
            } else {
                setError('Failed to load comments');
            }
        } finally {
            setLoading(false);
        }
    }, [summaryDate]);

    useEffect(() => {
        if (summaryDate) {
            loadComments();
        }
    }, [summaryDate, loadComments]);

    const handleSubmitComment = async (e) => {
        e.preventDefault();
        
        if (!newComment.trim() || submitting) return;
        
        setSubmitting(true);
        setError(null);
        
        try {
            const commentData = {
                content: newComment.trim()
            };
            
            const createdComment = await ApiService.addSummaryComment(summaryDate, commentData);
            setComments(prevComments => [createdComment, ...prevComments]);
            setNewComment('');
            
        } catch (error) {
            console.error('Error adding comment:', error);
            setError(error.message || 'Failed to add comment. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const formatCommentDate = (dateString) => {
        return new Date(dateString).toLocaleString('en-UK', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatDisplayDate = (dateString) => {        
        return new Date(dateString).toLocaleDateString('en-UK', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="comment-section">
            <div className="comment-section-header">
                <h2 className="comment-section-title">
                    Discussion
                </h2>
                <p className="comment-section-subtitle">
                    Share your thoughts on the market summary for {formatDisplayDate(summaryDate)}
                </p>
            </div>

            {user ? (
                <form onSubmit={handleSubmitComment} className="add-comment-form">
                    <div className="comment-form-header">
                        <div className="user-avatar">
                            {user.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="user-info">
                            <span className="user-name">{user.name}</span>
                        </div>
                    </div>
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Share your analysis or thoughts on this market summary..."
                        className="comment-textarea"
                        rows="4"
                        disabled={submitting}
                    />
                    <div className="comment-form-actions">
                        <div className="comment-form-info">
                            <small className="text-gray-500">
                                {newComment.length}/500 characters
                            </small>
                        </div>
                        <button
                            type="submit"
                            disabled={!newComment.trim() || submitting || newComment.length > 500}
                            className="submit-comment-btn"
                        >
                            {submitting ? (
                                <>
                                    <svg className="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Posting...
                                </>
                            ) : (
                                'Post Comment'
                            )}
                        </button>
                    </div>
                </form>
            ) : (
                <div className="login-prompt">
                    <p>Please sign in to join the discussion</p>
                </div>
            )}

            {error && (
                <div className="comment-error">
                    <p>{error}</p>
                    <button onClick={() => setError(null)} className="dismiss-error">×</button>
                </div>
            )}

            <div className="comments-list">
                {loading ? (
                    <div className="comments-loading">
                        <p>Loading comments...</p>
                    </div>
                ) : comments.length > 0 ? (
                    <>
                        <div className="comments-count">
                            {comments.length} comment{comments.length !== 1 ? 's' : ''}
                        </div>
                        {comments.map((comment) => (
                            <div key={comment._id} className="comment-item">
                                <div className="comment-avatar">
                                    {comment.user_name?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <div className="comment-content">
                                    <div className="comment-header">
                                        <span className="comment-author">{comment.user_name}</span>
                                        <span className="comment-date">
                                            {formatCommentDate(comment.created_at)}
                                        </span>
                                    </div>
                                    <div className="comment-text">
                                        {comment.content}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </>
                ) : (
                    <div className="no-comments">
                        <p>No comments yet. Be the first to share your thoughts!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CommentSection;
