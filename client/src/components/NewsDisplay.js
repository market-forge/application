import React, { useState, useEffect } from 'react';
import ApiService from '../services/api';
import SummaryCard from './SummaryCard';
import ArticleCard from './ArticleCard';
import DatePicker from './DatePicker';

// Main component that handles the news display
const NewsDisplay = () => {
    const [selectedDate, setSelectedDate] = useState(
        new Date().toISOString().split('T')[0] // Today's date in YYYY-MM-DD format
    );
    const [data, setData] = useState({
        summary: null,
        articles: [],
        total_articles: 0
    });
    const [availableDates, setAvailableDates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Load available dates on component mount
    useEffect(() => {
        loadAvailableDates();
    }, []);

    // Load data when selected date changes
    useEffect(() => {
        loadDataForDate(selectedDate);
    }, [selectedDate]);

    // Load available dates for the date picker
    const loadAvailableDates = async () => {
        try {
            const summaries = await ApiService.getAllSummaries();
            setAvailableDates(summaries);
        } catch (error) {
            console.error('Error loading available dates:', error);
        }
    };

    // Load combined data for the selected date
    const loadDataForDate = async (date) => {
        setLoading(true);
        setError(null);

        try {
            // Try the combined endpoint first
            try {
                const combinedData = await ApiService.getCombinedDataByDate(date);
                
                setData({
                    summary: combinedData.summary,
                    articles: combinedData.articles || [],
                    total_articles: combinedData.total_articles || 0
                });
                
                return; // Success, exit early
                
            } catch (combinedError) {
                console.error('Combined error:', combinedError.message);
                
                // If combined endpoint fails, fetch separately
                const [summaryData, articlesData] = await Promise.allSettled([
                    ApiService.getSummaryByDate(date),
                    ApiService.getArticlesByDate(date)
                ]);

                let summary = null;
                let articles = [];

                // Handle summary result
                if (summaryData.status === 'fulfilled') {
                    summary = summaryData.value;
                } 

                // Handle articles result
                if (articlesData.status === 'fulfilled') {
                    articles = articlesData.value;
                }

                setData({
                    summary,
                    articles,
                    total_articles: articles.length
                });
            }

        } catch (error) {
            console.error('Error loading data:', error);
            setError(`Failed to load data: ${error.message}`);
            setData({ summary: null, articles: [], total_articles: 0 });
        } finally {
            setLoading(false);
        }
    };

    // Handle date change
    const handleDateChange = (newDate) => {
        setSelectedDate(newDate);
    };

    // Refresh current date data
    const handleRefresh = () => {
        loadDataForDate(selectedDate);
    };

    // Debug data display
    const debugInfo = () => {
        if (process.env.NODE_ENV === 'development') {
            return (
                <div style={{ 
                    background: '#f8f9fa', 
                    padding: '10px', 
                    margin: '10px 0', 
                    borderRadius: '5px',
                    fontSize: '12px',
                    fontFamily: 'monospace'
                }}>
                    <strong>Debug Info:</strong><br/>
                    Selected Date: {selectedDate}<br/>
                    Loading: {loading.toString()}<br/>
                    Error: {error || 'None'}<br/>
                    Summary: {data.summary ? 'Found' : 'Not found'}<br/>
                    Articles: {data.articles.length}<br/>
                    Available Dates: {availableDates.length}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="news-display">
            {/* Header */}
            <div className="news-display-header">
                <h1>Market Forge - Financial News</h1>
                <button onClick={handleRefresh} className="refresh-btn" disabled={loading}>
                    {loading ? 'Loading...' : 'Refresh'}
                </button>
            </div>

            {/* Debug Info (only in development) */}
            {debugInfo()}

            {/* Date Picker */}
            <DatePicker
                selectedDate={selectedDate}
                onDateChange={handleDateChange}
                availableDates={availableDates}
            />

            {/* Error Display */}
            {error && (
                <div className="error-message">
                    <h3>Error</h3>
                    <p>{error}</p>
                    <button onClick={handleRefresh} className="retry-btn">
                        Try Again
                    </button>
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="loading-state">
                    <h3>Loading...</h3>
                    <p>Fetching market data for {selectedDate}...</p>
                </div>
            )}

            {/* Content */}
            {!loading && !error && (
                <div className="news-content">
                    {/* Summary Section */}
                    <SummaryCard 
                        summary={data.summary} 
                        date={selectedDate}
                    />

                    {/* Articles Section */}
                    <div className="articles-section">
                        <div className="articles-header">
                            <h2>Articles ({data.total_articles})</h2>
                            {data.total_articles === 0 && (
                                <p style={{ color: '#6c757d', fontStyle: 'italic' }}>
                                    No articles found for {selectedDate}. Try selecting a different date.
                                </p>
                            )}
                        </div>
                        
                        {data.articles.length > 0 ? (
                            <div className="articles-grid">
                                {data.articles.map((article, index) => (
                                                                        <ArticleCard 
                                        key={article._id || article.url || index} 
                                        article={article} 
                                    />
                                ))}
                            </div>
                        ) : (
                            !loading && (
                                <div className="no-articles">
                                    <p>No articles found for {selectedDate}</p>
                                    <p style={{ fontSize: '0.9rem', color: '#6c757d' }}>
                                        Try selecting a different date or check if data exists for this date.
                                    </p>
                                </div>
                            )
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NewsDisplay;