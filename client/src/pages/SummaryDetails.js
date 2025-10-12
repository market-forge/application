import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ApiService from '../services/api';
import CommentSection from '../components/CommentSection';

const SummaryDetails = () => {
    const { date } = useParams();
    const navigate = useNavigate();
    const [summary, setSummary] = useState(null);
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadSummaryDetails();
    }, [date]);

    const loadSummaryDetails = async () => {
        setLoading(true);
        setError(null);

        try {
            const combinedData = await ApiService.getCombinedDataByDate(date);
            setSummary(combinedData.summary);
            setArticles(combinedData.articles || []);
        } catch (error) {
            console.error('Error loading summary details:', error);
            setError(`Failed to load summary: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const formatDisplayDate = (dateString) => {
        if (!dateString) return 'Unknown Date';
        
        const date = new Date(dateString + 'T00:00:00');
        return date.toLocaleDateString('en-UK', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="loading-state">
                <h3>Loading summary details...</h3>
                <p>Please wait while we fetch the summary information.</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-message">
                <h3>Error Loading Summary</h3>
                <p>{error}</p>
                <button onClick={loadSummaryDetails} className="retry-btn">
                    Try Again
                </button>
                <button onClick={() => navigate(-1)} className="retry-btn" style={{marginLeft: '10px', background: '#6c757d'}}>
                    Go Back
                </button>
            </div>
        );
    }

    if (!summary) {
        return (
            <div className="error-message">
                <h3>Summary Not Found</h3>
                <p>No summary was found for {formatDisplayDate(date)}.</p>
                <button onClick={() => navigate(-1)} className="retry-btn">
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="summary-details-page">
            <div className="summary-details-header">
                <button 
                    onClick={() => navigate(-1)} 
                    className="back-btn"
                >
                    ← Back to News
                </button>
                <div className="summary-date-info">
                    <span className="summary-date-label">Daily Summary</span>
                    <span className="summary-date-value">{formatDisplayDate(date)}</span>
                </div>
            </div>

            <div className="summary-details-content">
                <div className="summary-details-card">
                    <div className="summary-details-header-info">
                        <h1 className="summary-details-title">Market Summary</h1>
                        <div className="summary-meta">
                            <span className="summary-generated">
                                Generated: {new Date(summary.created_at).toLocaleString()}
                            </span>
                        </div>
                    </div>

                    <div className="summary-content-text">
                        <p>{summary.combined_summary}</p>
                    </div>

                    {articles.length > 0 && (
                        <div className="summary-articles-info">
                            <p className="articles-count">
                                Based on {articles.length} news article{articles.length !== 1 ? 's' : ''} from {formatDisplayDate(date)}
                            </p>
                            <button 
                                onClick={() => navigate(`/?date=${date}`)}
                                className="view-articles-btn"
                            >
                                View All Articles
                            </button>
                        </div>
                    )}
                </div>

                <CommentSection 
                    summaryDate={date}
                    summaryExists={!!summary}
                />
            </div>
        </div>
    );
};

export default SummaryDetails;