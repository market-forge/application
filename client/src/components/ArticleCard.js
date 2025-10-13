import React, {useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = process.env.REACT_APP_SERVER_URL;

// Component to display individual article
const ArticleCard = ({ article, onFavoriteUpdate }) => { // Add onFavoriteUpdate prop
    const navigate = useNavigate();
    const [isFaved, setIsFaved] = useState(false);
    const token = localStorage.getItem("token");

    // Load favorites from API
    useEffect(() => {
        const checkFavorite = async () => {
            try {
                const res = await fetch(`${API_URL}/api/favorites`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                
                const favorites = await res.json();
                if (Array.isArray(favorites)) {
                    setIsFaved(favorites.some(fav => fav.article._id === article._id));
                } else {
                    console.warn("Unexpected favorites response:", favorites);
                }

            } catch (err) {
                console.error("Error checking favorites:", err);
            }
        };
        if (token) checkFavorite();
    }, [article._id, token, API_URL]);

    const handleLinkClick = (e) => {
        e.stopPropagation(); // Prevent card click when clicking external link
    };

    // Toggle favorite status
    const toggleFavorite = async (e) => {
        e.stopPropagation();

        if (!token) {
            return alert("Please sign in to favorite articles.");
        }

        try {
            if (isFaved) {
                // DELETE request to remove favorite
                const response = await fetch(`${API_URL}/api/favorites/${article._id}`, {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });

                if (!response.ok) {
                    throw new Error(`Failed to remove favorite: ${response.statusText}`);
                }

                setIsFaved(false);
                
                // Call the update callback if provided (for FavoritesPage)
                if (onFavoriteUpdate) {
                    onFavoriteUpdate();
                }
            } else {
                // POST request to add favorite
                const response = await fetch(`${API_URL}/api/favorites/${article._id}`, {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ article }),
                });

                if (!response.ok) {
                    throw new Error(`Failed to add favorite: ${response.statusText}`);
                }

                setIsFaved(true);
            }
        } catch (err) {
            console.error("Error toggling favorite:", err);
        }
    };

    // Format the published time
    const formatPublishedTime = (timePublished) => {
        if (!timePublished) return 'Unknown';
        
        // Assuming format like "20250923T123000"
        const year = timePublished.substring(0, 4);
        const month = timePublished.substring(4, 6);
        const day = timePublished.substring(6, 8);
        const hour = timePublished.substring(9, 11);
        const minute = timePublished.substring(11, 13);
        
        return `${month}/${day}/${year} ${hour}:${minute}`;
    };

    // Get sentiment color
    const getSentimentColor = (sentiment) => {
        switch (sentiment?.toLowerCase()) {
            case 'bullish':
            case 'somewhat-bullish':
            case 'positive':
                return 'sentiment-positive';
            case 'bearish':
            case 'somewhat-bearish':
            case 'negative':
                return 'sentiment-negative';
            case 'neutral':
                return 'sentiment-neutral';
            default:
                return 'sentiment-unknown';
        }
    };

    const handleCardClick = () => {
        navigate(`/article/${article._id}`);
    };

    return (
        <div className="article-card" onClick={handleCardClick}>
            {/* Favorite Button */}
            <button 
                className={`absolute top-2 right-2 px-2 py-1 rounded-full transition ${
                    isFaved
                        ? "bg-yellow-600 text-white"
                        : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                }`}
                onClick={(e) => {
                    handleLinkClick(e);
                    toggleFavorite(e);
                }}
                aria-label={isFaved ? "Remove from favorites" : "Add to favorites"}
            >
                {isFaved ? "⭐" : "☆"}
            </button>

            {/* Article Header */}
            <div className="article-header">
                <h3 className="article-title">
                    <span className="article-title-text">{article.title}</span>
                </h3>
                <div className="article-meta">
                    <span className="article-source">{article.source}</span>
                    <span className="article-time">{formatPublishedTime(article.time_published)}</span>
                </div>
            </div>

            {/* Article Image */}
            {article.banner_image && (
                <div className="article-image">
                    <img src={article.banner_image} alt={article.title} />
                </div>
            )}

            {/* Article Summary */}
            {article.summary && (
                <div className="article-summary">
                    <p>{article.summary}</p>
                </div>
            )}

            {/* Article Footer */}
            <div className="article-footer">
                {/* Sentiment */}
                {article.overall_sentiment_label && (
                    <div className={`sentiment ${getSentimentColor(article.overall_sentiment_label)}`}>
                        <span className="sentiment-label">{article.overall_sentiment_label}</span>
                        {article.overall_sentiment_score && (
                            <span className="sentiment-score">
                                ({article.overall_sentiment_score.toFixed(2)})
                            </span>
                        )}
                    </div>
                )}

                {/* Tickers */}
                {article.ticker_sentiment && article.ticker_sentiment.length > 0 && (
                    <div className="tickers">
                        <span className="tickers-label">Tickers:</span>
                        {article.ticker_sentiment.slice(0, 5).map((ticker, index) => (
                            <span key={index} className="ticker">
                                {ticker.ticker}
                            </span>
                        ))}
                    </div>
                )}

                {/* Authors */}
                {article.authors && article.authors.length > 0 && (
                    <div className="authors">
                        <span className="authors-label">Written By:</span>
                        <span className="authors-list">{article.authors.join(', ')}</span>
                    </div>
                )}
            </div>

            {/* External Link and Details Button */}
            <div className="article-actions">
                <a 
                    href={article.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="external-link-btn"
                    onClick={handleLinkClick}
                >
                    Source
                </a>
                <span className="details-hint">Click card for details →</span>
            </div>
        </div>
    );
};

export default ArticleCard;