import React, {useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';

// Component to display individual article
const ArticleCard = ({ article }) => {
    const navigate = useNavigate();
    const [isFaved, setIsFaved] = useState(false);

    // load fourites from local storage
    useEffect(() => {
        const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        setIsFaved(favorites.some(fav => fav._id === article._id));
    },[article._id]);

    // Toggle favorite status
    const toggleFavorite = () => {
        let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        // remove from favorites
        if (isFaved) {
            favorites = favorites.filter(fav => fav._id !== article._id);
            setIsFaved(false);
        } else {
            // add to favorites
            favorites.push(article);
            setIsFaved(true);
        }
        localStorage.setItem('favorites', JSON.stringify(favorites));
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

    const handleLinkClick = (e) => {
        e.stopPropagation(); // Prevent card click when clicking external link
    };

    return (
        <div className="article-card" onClick={handleCardClick}>
            {/* Favorite Button */}
            <button 
                className={`favorite-btn ${isFaved ? "faved" : ""}`} 
                onClick={(e) => {
                e.stopPropagation();
                toggleFavorite();
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
