/* eslint-disable no-unused-vars */
import React from 'react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate, Link } from 'react-router-dom';
import { AiOutlineHeart, AiFillHeart, AiOutlineClose, AiOutlineInfoCircle, AiOutlinePlayCircle, AiFillStar, AiOutlineStar } from "react-icons/ai";
import { useLanguage } from '../../contexts/LanguageContext';
import './MyList.css';

const MyList = () => {
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMovie, setSelectedMovie] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [trailerKey, setTrailerKey] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [rating, setRating] = useState(0);
    const navigate = useNavigate();
    const { t, currentLanguage } = useLanguage();

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
                    toast.error(t('auth.sessionExpired'));
                    navigate('/login');
                } else {
                    toast.error(t('common.error'));
                }
            } finally {
                setLoading(false);
            }
        };

        fetchFavorites();
    }, [navigate, t]);

    const handleRemoveFavorite = async (event, movieId) => {
        event.preventDefault();
        event.stopPropagation();
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5001/api/favorites/${movieId}`);
            setFavorites(favorites.filter(fav => fav.movieId !== movieId));
            toast.success(t('movie.removedFromList'));
        } catch (error) {
            console.error('移除收藏失敗:', error);
            if (error.response?.status === 401) {
                toast.error(t('auth.sessionExpired'));
                navigate('/login');
            } else {
                toast.error(t('common.error'));
            }
        }
    };

    const fetchTrailer = async (movieId) => {
        try {
            const options = {
                method: "GET",
                headers: {
                    accept: "application/json",
                    Authorization: "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhMWYxN2FlYTUzODFhZWI2YjgzYjUxYWEwNzg1YmI3MSIsIm5iZiI6MTczMTA2MjA4MC43NzQxNzc4LCJzdWIiOiI2NzJkZTg1YmQ5OGJiYzM5NzdhZDUwZGQiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.ehPZsqGQ4dEinJHjl8iSTmHT4tt_J2e07Jywn0cLCHE",
                },
            };

            // 先嘗試獲取當前語言的預告片
            const response = await axios.get(
                `https://api.themoviedb.org/3/movie/${movieId}/videos`,
                {
                    ...options,
                    params: {
                        language: currentLanguage === 'zh-TW' ? 'zh-TW' : 'en-US'
                    }
                }
            );
            
            let trailer = null;
            if (response.data && response.data.results) {
                trailer = response.data.results.find(
                    video => video && (video.type === "Trailer" || video.type === "Teaser")
                );
            }

            // 如果找不到當前語言的預告片，嘗試獲取英文預告片
            if (!trailer && currentLanguage === 'zh-TW') {
                const enResponse = await axios.get(
                    `https://api.themoviedb.org/3/movie/${movieId}/videos`,
                    {
                        ...options,
                        params: {
                            language: 'en-US'
                        }
                    }
                );
                
                if (enResponse.data && enResponse.data.results) {
                    trailer = enResponse.data.results.find(
                        video => video && (video.type === "Trailer" || video.type === "Teaser")
                    );
                }
            }
            
            if (trailer) {
                setTrailerKey(trailer.key);
            } else {
                toast.warning(t('movie.trailerNotFound'));
                setTrailerKey(null);
            }
        } catch (error) {
            console.error('獲取預告片失敗:', error);
            toast.error(t('movie.trailerError'));
            setTrailerKey(null);
        }
    };

    const fetchMovieDetails = async (movieId) => {
        try {
            const options = {
                method: "GET",
                headers: {
                    accept: "application/json",
                    Authorization: "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhMWYxN2FlYTUzODFhZWI2YjgzYjUxYWEwNzg1YmI3MSIsIm5iZiI6MTczMTA2MjA4MC43NzQxNzc4LCJzdWIiOiI2NzJkZTg1YmQ5OGJiYzM5NzdhZDUwZGQiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.ehPZsqGQ4dEinJHjl8iSTmHT4tt_J2e07Jywn0cLCHE",
                },
            };

            const response = await axios.get(
                `https://api.themoviedb.org/3/movie/${movieId}?language=${currentLanguage === 'zh-TW' ? 'zh-TW' : 'en-US'}`,
                options
            );
            return response.data;
        } catch (err) {
            console.error(err);
            toast.error(t('common.error'));
            return null;
        }
    };

    const fetchComments = async (movieId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `http://localhost:5001/api/comments/${movieId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            setComments(response.data);
        } catch (error) {
            console.error('獲取評論失敗:', error);
            toast.error(t('comments.fetchError'));
        }
    };

    const handleInfoClick = async (e, movie) => {
        e.preventDefault();
        e.stopPropagation();
        
        setLoadingDetails(true);
        try {
            const movieDetails = await fetchMovieDetails(movie.movieId);
            if (movieDetails) {
                setSelectedMovie(movieDetails);
                await Promise.all([
                    fetchTrailer(movie.movieId),
                    fetchComments(movie.movieId)
                ]);
            }
        } catch (err) {
            console.error(err);
            toast.error(t('common.error'));
        } finally {
            setLoadingDetails(false);
        }
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!rating) {
            toast.error(t('comments.ratingRequired'));
            return;
        }
        if (!newComment.trim()) {
            toast.error(t('comments.contentRequired'));
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await axios.post(
                'http://localhost:5001/api/comments',
                {
                    movieId: selectedMovie.id,
                    content: newComment.trim(),
                    rating
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            // 重新獲取評論
            await fetchComments(selectedMovie.id);
            
            // 重置表單
            setNewComment('');
            setRating(0);
            
            toast.success(t('comments.addSuccess'));
        } catch (error) {
            console.error('添加評論失敗:', error);
            if (error.response?.status === 401) {
                toast.error(t('auth.sessionExpired'));
                navigate('/login');
            } else {
                toast.error(t('comments.addError'));
            }
        }
    };

    const renderStars = (value, isInput = false) => {
        return [...Array(5)].map((_, index) => {
            const starValue = index + 1;
            return (
                <div
                    key={index}
                    onClick={isInput ? () => setRating(starValue) : undefined}
                    style={{ cursor: isInput ? 'pointer' : 'default' }}
                >
                    {starValue <= value ? (
                        <AiFillStar className="star-icon" />
                    ) : (
                        <AiOutlineStar className="star-icon" />
                    )}
                </div>
            );
        });
    };

    const closeModal = () => {
        const iframes = document.querySelectorAll('.modal-trailer iframe');
        iframes.forEach(iframe => {
            iframe.src = '';
        });
        setSelectedMovie(null);
        setTrailerKey(null);
        setComments([]);
        setNewComment('');
        setRating(0);
    };

    if (loading) {
        return (
            <div className="my-list loading">
                <div className="loading-spinner">{t('common.loading')}</div>
            </div>
        );
    }

    return (
        <div className="my-list">
            <div className="my-list-content">
                <h1>{t('navbar.myList')}</h1>
                {favorites.length === 0 ? (
                    <div className="no-favorites">
                        <p>{t('myList.empty')}</p>
                    </div>
                ) : (
                    <div className="favorites-grid">
                        {favorites.map((favorite) => (
                            <div 
                                key={favorite.movieId} 
                                className="favorite-item"
                            >
                                <Link to={`/player/${favorite.movieId}`} data-testid={`movie-link-${favorite.movieId}`}>
                                    <img
                                        src={`https://image.tmdb.org/t/p/w500${favorite.posterPath}`}
                                        alt={favorite.title}
                                    />
                                    <div className="title-overlay">{favorite.title}</div>
                                </Link>
                                <button
                                    className="info-button"
                                    onClick={(e) => handleInfoClick(e, favorite)}
                                >
                                    <AiOutlineInfoCircle />
                                    {' '}
                                    {t('movie.learnMore')}
                                </button>
                                <button
                                    className="favorite-button"
                                    data-testid="favorite-button"
                                    onClick={(e) => handleRemoveFavorite(e, favorite.movieId)}
                                >
                                    <AiFillHeart className="heart-icon" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {selectedMovie && (
                <>
                    <div className="modal-overlay active" />
                    <div className="movie-modal active">
                        {loadingDetails ? (
                            <div data-testid="loading-indicator" className="loading-indicator">
                                <div className="loading-spinner"></div>
                                <p>{t('common.loading')}</p>
                            </div>
                        ) : (
                            <div className="modal-content">
                                <div className="modal-image">
                                    {trailerKey ? (
                                        <div className="modal-trailer">
                                            <iframe
                                                width="100%"
                                                height="315"
                                                src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=1`}
                                                title="YouTube video player"
                                                frameBorder="0"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                            ></iframe>
                                        </div>
                                    ) : (
                                        <img
                                            src={`https://image.tmdb.org/t/p/w500${selectedMovie.backdrop_path}`}
                                            alt={selectedMovie.title}
                                        />
                                    )}
                                </div>
                                <div className="modal-header">
                                    <h3 className="modal-title">{selectedMovie.title}</h3>
                                    <button className="modal-close" onClick={closeModal}>
                                        <AiOutlineClose />
                                    </button>
                                </div>
                                <div className="modal-body">
                                    <div className="modal-details">
                                        <span>{t('movie.releaseYear')}: </span>
                                        <span>{selectedMovie.release_date?.split('-')[0]}</span>
                                    </div>
                                    <p className="movie-description">{selectedMovie.overview}</p>
                                    <div className="modal-buttons">
                                        <Link to={`/player/${selectedMovie.id}`} className="play-button">
                                            <AiOutlinePlayCircle /> {t('movie.play')}
                                        </Link>
                                        <button 
                                            className="favorite-button-large"
                                            onClick={(e) => handleRemoveFavorite(e, selectedMovie.id)}
                                        >
                                            <AiFillHeart className="heart-icon" />
                                            {t('movie.removeFromList')}
                                        </button>
                                    </div>
                                    <div className="modal-comments">
                                        <h4>{t('comments.title')}</h4>
                                        <div className="comment-form">
                                            <div className="rating-input">
                                                <span>{t('comments.rating')}：</span>
                                                {renderStars(rating, true)}
                                            </div>
                                            <form onSubmit={handleCommentSubmit}>
                                                <textarea
                                                    value={newComment}
                                                    onChange={(e) => setNewComment(e.target.value)}
                                                    placeholder={t('comments.placeholder')}
                                                    required
                                                />
                                                <button type="submit" className="comment-submit">
                                                    {t('comments.submit')}
                                                </button>
                                            </form>
                                        </div>
                                        <div className="comments-list" data-testid="comments-list">
                                            {comments.map((comment) => (
                                                <div key={comment._id} className="comment-item">
                                                    <div className="comment-header">
                                                        <span className="comment-user">{comment.username}</span>
                                                        <span className="comment-time">
                                                            {new Date(comment.createdAt).toLocaleString()}
                                                        </span>
                                                    </div>
                                                    <div className="comment-rating">
                                                        {renderStars(comment.rating)}
                                                    </div>
                                                    <p className="comment-content">{comment.content}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default MyList; 