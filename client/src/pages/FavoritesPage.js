import React, { useEffect, useState, useCallback } from "react";
import ArticleCard from "../components/ArticleCard";
import { Link } from "react-router-dom";

const FavoritesPage = () => {
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const API_URL = process.env.REACT_APP_SERVER_URL;

    const fetchFavorites = useCallback(async () => {
        try {
            const token = localStorage.getItem("token");
            
            if (!token) {
                setError("Please sign in to view favorites");
                setLoading(false);
                return;
            }

            const response = await fetch(`${API_URL}/api/favorites`, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.status === 401) {
                localStorage.removeItem("token");
                setError("Session expired. Please sign in again.");
                return;
            }

            if (!response.ok) {
                throw new Error(`Failed to fetch favorites: ${response.status}`);
            }

            const favoritesData = await response.json();
            
            if (!Array.isArray(favoritesData)) {
                throw new Error("Invalid response format from server");
            }

            const favoriteArticles = favoritesData.map(fav => fav.article);
            setFavorites(favoriteArticles);
            
        } catch (err) {
            console.error("Error fetching favorites:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [API_URL]); // Add API_URL as dependency since it's used inside

    useEffect(() => {
        fetchFavorites();
    }, [fetchFavorites]); // Now fetchFavorites is stable due to useCallback

    // Callback function to refresh favorites when an article is unfavorited
    const handleFavoriteUpdate = useCallback(() => {
        fetchFavorites(); // Refresh the favorites list
    }, [fetchFavorites]);

    const handleRetry = () => {
        setLoading(true);
        setError(null);
        fetchFavorites();
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                <h2>Loading favorites...</h2>
                <p>Please wait while we fetch your favorite articles.</p>
                <Link 
                    to="/"
                    style={{
                        display: 'inline-block',
                        marginTop: '1rem',
                        padding: '0.5rem 1rem',
                        backgroundColor: '#6c757d',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    ← Back to Home
                </Link>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                <h2>Error loading favorites</h2>
                <p>{error}</p>
                <div style={{ marginTop: '1rem', display: 'flex', gap: '10px', justifyContent: 'center' }}>
                    <button 
                        onClick={handleRetry}
                        style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Try Again
                    </button>
                    <Link 
                        to="/"
                        style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: '#6c757d',
                            color: 'white',
                            textDecoration: 'none',
                            borderRadius: '4px',
                            display: 'inline-block'
                        }}
                    >
                        ← Back to Home
                    </Link>
                </div>
            </div>
        );
    }

    if (favorites.length === 0) {
        return (
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                <h2>No favorite articles yet</h2>
                <p>Start adding favorites by clicking the star icon on articles!</p>
                <Link 
                    to="/"
                    style={{
                        display: 'inline-block',
                        marginTop: '1rem',
                        padding: '0.5rem 1rem',
                        backgroundColor: '#007bff',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    ← Back to Home
                </Link>
            </div>
        );
    }

    return (
        <div className="favorites-page">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6 mb-8">
                {/* Title Section */}
                <div className="flex flex-col">
                    <div className="flex items-center gap-4 mb-2">
                        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
                            Favorite Articles
                        </h1>
                        <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
                            {favorites.length}
                        </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-lg">
                        Your personalized collection of saved articles
                    </p>
                </div>

                {/* Back to Home Button */}
                <Link 
                    to="/"
                    className="flex items-center justify-center gap-2 px-6 py-3 text-blue-700 bg-white font-medium hover:bg-gray-50 hover:shadow-md transition-all duration-200 w-full lg:w-auto"
                >
                    <span className="text-xl">←</span>
                    Back to Home
                </Link>
            </div>
            <div className="articles-grid">
                {favorites.map(article => (
                    <ArticleCard key={article._id} article={article} onFavoriteUpdate={handleFavoriteUpdate} />
                ))}
            </div>  
        </div>      
    );
};

export default FavoritesPage;