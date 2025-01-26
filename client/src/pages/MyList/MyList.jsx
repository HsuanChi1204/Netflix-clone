import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import './MyList.css';
import Navbar from '../../components/Navbar/Navbar';

const MyList = () => {
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchFavorites = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:5001/api/favorites', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setFavorites(response.data);
            } catch (error) {
                console.error('獲取收藏清單失敗:', error);
                if (error.response?.status === 401) {
                    toast.error('登入已過期，請重新登入');
                    navigate('/login');
                } else {
                    toast.error('無法載入收藏清單');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchFavorites();
    }, [navigate]);

    const handleRemoveFavorite = async (event, movieId) => {
        event.stopPropagation(); // 防止觸發父元素的點擊事件
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5001/api/favorites/${movieId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setFavorites(favorites.filter(fav => fav.movieId !== movieId));
            toast.success('已從收藏清單中移除');
        } catch (error) {
            console.error('移除收藏失敗:', error);
            if (error.response?.status === 401) {
                toast.error('登入已過期，請重新登入');
                navigate('/login');
            } else {
                toast.error('移除收藏失敗');
            }
        }
    };

    const handlePlayMovie = (movieId) => {
        navigate(`/player/${movieId}`);
    };

    if (loading) {
        return (
            <div className="my-list loading">
                <Navbar />
                <div className="loading-spinner">載入中...</div>
            </div>
        );
    }

    return (
        <div className="my-list">
            <Navbar />
            <div className="my-list-content">
                <h1>我的收藏清單</h1>
                {favorites.length === 0 ? (
                    <div className="no-favorites">
                        <p>您還沒有收藏任何影片</p>
                    </div>
                ) : (
                    <div className="favorites-grid">
                        {favorites.map((favorite) => (
                            <div 
                                key={favorite.movieId} 
                                className="favorite-item"
                                onClick={() => handlePlayMovie(favorite.movieId)}
                            >
                                <img
                                    src={`https://image.tmdb.org/t/p/w500${favorite.posterPath}`}
                                    alt={favorite.title}
                                />
                                <div className="favorite-overlay">
                                    <h3>{favorite.title}</h3>
                                    <button
                                        onClick={(e) => handleRemoveFavorite(e, favorite.movieId)}
                                        className="remove-button"
                                    >
                                        移除收藏
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyList; 