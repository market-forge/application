import React from 'react';
import { useNavigate } from 'react-router-dom';

// Component to display the daily summary
const SummaryCard = ({ summary, date }) => {
    const navigate = useNavigate();

    const handleCardClick = () => {
        // Make sure date is in YYYY-MM-DD format
        navigate(`/summary/${date}`);
    };

    const formatDateForDisplay = (dateString) => {
        try {
            // dateString should be in YYYY-MM-DD format
            const date = new Date(dateString + 'T00:00:00');
            return date.toLocaleDateString('en-UK', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (error) {
            return dateString;
        }
    };

    if (!summary) {
        return (
            <div className="summary-card no-summary clickable-summary" onClick={handleCardClick}>
                <h2>Daily Market Summary</h2>
                <p className="no-data">No summary available for {formatDateForDisplay(date)}</p>
                <div className="summary-actions">
                    <span className="view-details-hint">Click to view details →</span>
                </div>
            </div>
        );
    }

    return (
        <div className="summary-card clickable-summary" onClick={handleCardClick}>
            <div className="summary-header">
                <h2>Daily Market Summary</h2>
                <span className="summary-date">{formatDateForDisplay(date)}</span>
            </div>
            <div className="summary-content">
                <p>{summary.combined_summary.substring(0, 300)}...</p>
            </div>
            <div className="summary-footer">
                <div className="summary-meta">
                    <small>Generated: {new Date(summary.created_at).toLocaleString()}</small>
                </div>
                <div className="summary-actions">
                    <span className="view-details-hint">Click to view full summary & comments →</span>
                </div>
            </div>
        </div>
    );
};

export default SummaryCard;