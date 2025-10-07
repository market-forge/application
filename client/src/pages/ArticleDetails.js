import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ApiService from '../services/api';

const ArticleDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [article, setArticle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [relatedArticles, setRelatedArticles] = useState([]);
    const [iframeLoaded, setIframeLoaded] = useState(false);

    useEffect(() => {
        loadArticleDetails();
    }, [id]);

    useEffect(() => {
        if (article) {
            loadRelatedArticles();
        }
    }, [article]);

    const loadArticleDetails = async () => {
        setLoading(true);
        setError(null);

        try {
            const articleData = await ApiService.getArticleById(id);
            setArticle(articleData);
        } catch (error) {
            console.error('Error loading article details:', error);
            setError(`Failed to load article: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const formatPublishedTime = (timePublished) => {
        if (!timePublished) return 'Unknown';
        
        const year = timePublished.substring(0, 4);
        const month = timePublished.substring(4, 6);
        const day = timePublished.substring(6, 8);
        const hour = timePublished.substring(9, 11);
        const minute = timePublished.substring(11, 13);
        
        const date = new Date(`${year}-${month}-${day}T${hour}:${minute}:00`);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

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

    const getSentimentIcon = (sentiment) => {
        switch (sentiment?.toLowerCase()) {
            case 'bullish':
            case 'somewhat-bullish':
            case 'positive':
                return '📈';
            case 'bearish':
            case 'somewhat-bearish':
            case 'negative':
                return '📉';
            case 'neutral':
                return '➡️';
            default:
                return '❓';
        }
    };

    const loadRelatedArticles = async () => {
        if (!article) return;
        
        try {
            // Get related articles (publisehd on the same day)
            const dateString = article.time_published.substring(0, 8);
            const relatedData = await ApiService.getArticlesByDate(
                `${dateString.substring(0, 4)}-${dateString.substring(4, 6)}-${dateString.substring(6, 8)}`
            );
            
            // Filter out current article and limit to 3
            const related = relatedData
                .filter(art => art._id !== article._id)
                .slice(0, 3);
                
                setRelatedArticles(related);
        } catch (error) {
            console.error('Error loading related articles:', error);
        }
    };

    if (loading) {
        return (
            <div className="loading-state">
                <h3>Loading article details...</h3>
                <p>Please wait while we fetch the article information.</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-message">
                <h3>Error Loading Article</h3>
                <p>{error}</p>
                <button onClick={loadArticleDetails} className="retry-btn">
                    Try Again
                </button>
                <button onClick={() => navigate(-1)} className="retry-btn" style={{marginLeft: '10px', background: '#6c757d'}}>
                    Go Back
                </button>
            </div>
        );
    }

    if (!article) {
        return (
            <div className="error-message">
                <h3>Article Not Found</h3>
                <p>The requested article could not be found.</p>
                <button onClick={() => navigate(-1)} className="retry-btn">
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="article-details-page">
            {/* Header */}
            <div className="article-details-header">
                <button onClick={() => navigate(-1)} className="back-btn">
                    ← Back to News
                </button>
                <div className="article-source-info">
                    <span className="article-source">{article.source}</span>
                    <span className="article-domain">{article.source_domain}</span>
                </div>
            </div>

            <div className="article-details-layout">
                <div className={`iframe-wrapper ${iframeLoaded ? "iframe-visible" : ""}`}>
                    <iframe
                        src={`http://localhost:8000/api/proxy?url=${encodeURIComponent(article.url)}`}
                        title="External Article"
                        sandbox="allow-scripts allow-same-origin"
                        style={{
                            width: "100%",
                            height: "85vh",
                            border: "none",
                            opacity: iframeLoaded ? 1 : 0,
                            transform: iframeLoaded ? "translateX(0)" : "translateX(-40px)",
                            transition: "all 0.6s ease-in-out",
                            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                            borderRadius: "12px",
                            backgroundColor: "#fff",
                        }}
                        onLoad={() => setIframeLoaded(true)}
                    />
                </div>


                <div className="article-details-content">
                    <h1 className="article-details-title">{article.title}</h1>

                    <div className="article-details-meta">
                        <div className="article-time">🗓️ {formatPublishedTime(article.time_published)}</div>
                        {article.authors && article.authors.length > 0 && (
                            <div className="article-authors">~ By {article.authors.join(", ")}</div>
                        )}
                    </div>

                    {article.banner_image && (
                        <div className="article-details-image">
                            <img src={article.banner_image} alt={article.title} />
                        </div>
                    )}

                    {article.summary && (
                        <div className="article-details-summary">
                            <h2>Summary</h2>
                            <p>{article.summary}</p>
                        </div>
                    )}

                    {/* Sentiment */}
                    <div className="article-details-sentiment">
                        <h2>Market Sentiment</h2>
                        <div className={`sentiment-display ${getSentimentColor(article.overall_sentiment_label)}`}>
          <span className="sentiment-icon">
            {getSentimentIcon(article.overall_sentiment_label)}
          </span>
                            <div className="sentiment-info">
                                <span className="sentiment-label">{article.overall_sentiment_label}</span>
                                <span className="sentiment-score">
              Score: {article.overall_sentiment_score?.toFixed(3)}
            </span>
                            </div>
                        </div>
                    </div>

                    {/* Tickers */}
                    {article.ticker_sentiment?.length > 0 && (
                        <div className="article-details-tickers">
                            <h2>Stock Tickers & Sentiment</h2>
                            <div className="tickers-grid">
                                {article.ticker_sentiment.map((ticker, index) => (
                                    <div key={index} className="ticker-card">
                                        <div className="ticker-symbol">{ticker.ticker}</div>
                                        <div className="ticker-details">
                                            <div
                                                className={`ticker-sentiment ${getSentimentColor(
                                                    ticker.ticker_sentiment_label
                                                )}`}
                                            >
                                                {getSentimentIcon(ticker.ticker_sentiment_label)}{" "}
                                                {ticker.ticker_sentiment_label}
                                            </div>
                                            <div className="ticker-scores">
                    <span>
                      Relevance: {(parseFloat(ticker.relevance_score) * 100).toFixed(1)}%
                    </span>
                                                <span>
                      Sentiment: {parseFloat(ticker.ticker_sentiment_score).toFixed(3)}
                    </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Topics */}
                    {article.topics?.length > 0 && (
                        <div className="article-details-topics">
                            <h2>Topics</h2>
                            <div className="topics-list">
                                {article.topics.map((topic, index) => (
                                    <div key={index} className="topic-item">
                                        <span className="topic-name">{topic.topic}</span>
                                        <span className="topic-relevance">
                  {(parseFloat(topic.relevance_score) * 100).toFixed(1)}%
                </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {article.category_within_source && (
                        <div className="article-details-category">
                            <h2>Category</h2>
                            <span className="category-tag">{article.category_within_source}</span>
                        </div>
                    )}

                    <div className="article-details-actions">
                        <a
                            href={article.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="read-full-article-btn"
                        >
                            Read Full Article on {article.source}
                        </a>
                    </div>

                    {relatedArticles.length > 0 && (
                        <div className="article-details-related">
                            <h2>Related Articles</h2>
                            <div className="related-articles-grid">
                                {relatedArticles.map((relatedArticle) => (
                                    <div
                                        key={relatedArticle._id}
                                        className="related-article-card"
                                        onClick={() => navigate(`/article/${relatedArticle._id}`)}
                                    >
                                        {relatedArticle.banner_image && (
                                            <img
                                                src={relatedArticle.banner_image}
                                                alt={relatedArticle.title}
                                                className="related-article-image"
                                            />
                                        )}
                                        <div className="related-article-content">
                                            <h4 className="related-article-title">{relatedArticle.title}</h4>
                                            <div className="related-article-meta">
                    <span className="related-article-source">
                      {relatedArticle.source}
                    </span>
                                                <span
                                                    className={`related-article-sentiment ${getSentimentColor(
                                                        relatedArticle.overall_sentiment_label
                                                    )}`}
                                                >
                      {getSentimentIcon(relatedArticle.overall_sentiment_label)}{" "}
                                                    {relatedArticle.overall_sentiment_label}
                    </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ArticleDetails;