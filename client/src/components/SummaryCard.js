import React from 'react';

// Component to display the daily summary
const SummaryCard = ({ summary, date }) => {
    if (!summary) {
        return (
            <div className="summary-card no-summary">
                <h2>Daily Market Summary</h2>
                <p className="no-data">No summary available for {date}</p>
            </div>
        );
    }

    return (
        <div className="summary-card">
            <div className="summary-header">
                <h2>Daily Market Summary</h2>
                <span className="summary-date">{date}</span>
            </div>
            <div className="summary-content">
                <p>{summary.combined_summary}</p>
            </div>
            <div className="summary-footer">
                <small>Generated: {new Date(summary.created_at).toLocaleString()}</small>
            </div>
        </div>
    );
};

export default SummaryCard;
