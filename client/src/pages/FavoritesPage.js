import React, { useEffect, useState } from "react";
import ArticleCard from "../components/ArticleCard";

const FavoritesPage = () => {
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const API_URL = process.env.REACT_APP_SERVER_URL;

    const fetchFavorites = async () => {
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
    };

    useEffect(() => {
        fetchFavorites();
    }, [API_URL]);

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
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                <h2>Error loading favorites</h2>
                <p>{error}</p>
                <button 
                    onClick={handleRetry}
                    style={{
                        marginTop: '1rem',
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
            </div>
        );
    }

    if (favorites.length === 0) {
        return (
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                <h2>No favorite articles yet</h2>
                <p>Start adding favorites by clicking the star icon on articles!</p>
            </div>
        );
    }

    return (
        <div className="favorites-page">
            <h1>Your Favorite Articles ({favorites.length})</h1>
            <div className="articles-grid">
                {favorites.map(article => (
                    <ArticleCard key={article._id} article={article} />
                ))}
            </div>
        </div>
    );
};

export default FavoritesPage;