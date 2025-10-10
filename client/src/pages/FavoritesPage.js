import React, {useEffect, useState} from "react";
import ArticleCard from "../components/ArticleCard";

const FavoritesPage = () => {
    const [favorites, setFavorites] = useState([]);

    useEffect(() => {
        const favs = JSON.parse(localStorage.getItem("favorites")) || [];
        setFavorites(favs);
    }, []);

    if (favorites.length === 0) {
        return <h2 style={{ textAlign: 'center', marginTop: '2rem' }}>No favorite articles yet </h2>;
    }

    return (
        <div className="favorites-page">
            <h1>Your Favorite Articles</h1>
            <div className="articles-grid">
                {favorites.map(article => (
                <ArticleCard key={article._id} article={article} />
                ))}
            </div>
        </div>
    );
};

export default FavoritesPage;
