import React, { useEffect, useRef, useState } from "react";
import "./TitleCards.css";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { AiOutlineHeart, AiFillHeart, AiOutlineClose, AiOutlineInfoCircle, AiOutlinePlayCircle, AiFillStar, AiOutlineStar } from "react-icons/ai";
import { useLanguage } from '../../contexts/LanguageContext';

// 設置 axios 基礎 URL
axios.defaults.baseURL = 'http://localhost:5001';

const TitleCards = ({ title, category }) => {
  const navigate = useNavigate();
  const [apiData, setApiData] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [favorites, setFavorites] = useState({});
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [trailerKey, setTrailerKey] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [rating, setRating] = useState(0);
  const cardsRef = useRef();
  const { currentLanguage, t } = useLanguage();

  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhMWYxN2FlYTUzODFhZWI2YjgzYjUxYWEwNzg1YmI3MSIsIm5iZiI6MTczMTA2MjA4MC43NzQxNzc4LCJzdWIiOiI2NzJkZTg1YmQ5OGJiYzM5NzdhZDUwZGQiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.ehPZsqGQ4dEinJHjl8iSTmHT4tt_J2e07Jywn0cLCHE",
    },
  };

  const handleWheel = (event) => {
    event.preventDefault();
    cardsRef.current.scrollLeft += event.deltaY;
  };

  // 檢查影片是否已收藏
  const checkFavoriteStatus = async (movieId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get(`/api/favorites/check/${movieId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setFavorites(prev => ({
        ...prev,
        [movieId]: response.data.isFavorite
      }));
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error(t('auth.sessionExpired'));
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      }
    }
  };

  // 切換收藏狀態
  const toggleFavorite = async (event, movie) => {
    event.preventDefault();
    event.stopPropagation();
    
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error(t('auth.pleaseLogin'));
      navigate('/login');
      return;
    }

    try {
      if (favorites[movie.id]) {
        await axios.delete(`/api/favorites/${movie.id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setFavorites(prev => ({
          ...prev,
          [movie.id]: false
        }));
        toast.success(t('movie.removedFromList'));
      } else {
        const movieData = {
          movieId: movie.id.toString(),
          title: movie.title,
          posterPath: movie.backdrop_path,
          mediaType: 'movie'
        };
        
        await axios.post('/api/favorites', movieData, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setFavorites(prev => ({
          ...prev,
          [movie.id]: true
        }));
        toast.success(t('movie.addedToList'));
      }
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error(t('auth.sessionExpired'));
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      } else {
        toast.error(error.response?.data?.message || t('common.error'));
      }
    }
  };

  const fetchTrailer = async (movieId) => {
    try {
      const response = await axios.get(
        `https://api.themoviedb.org/3/movie/${movieId}/videos`,
        {
          ...options,
          params: {
            language: currentLanguage === 'zh-TW' ? 'zh-TW' : 'en-US'
          }
        }
      );
      const trailer = response.data.results.find(
        video => video.type === "Trailer" || video.type === "Teaser"
      );
      if (trailer) {
        setTrailerKey(trailer.key);
      }
    } catch (error) {
      console.error('獲取預告片失敗:', error);
    }
  };

  const fetchMovieDetails = async (movieId) => {
    try {
      const response = await axios.get(
        `https://api.themoviedb.org/3/movie/${movieId}?language=${currentLanguage === 'zh-TW' ? 'zh-TW' : 'en-US'}`,
        options
      );
      return response.data;
    } catch (error) {
      console.error('獲取電影詳情失敗:', error);
      return null;
    }
  };

  const handleInfoClick = async (e, movie) => {
    e.preventDefault();
    const movieDetails = await fetchMovieDetails(movie.id);
    if (movieDetails) {
      setSelectedMovie(movieDetails);
      await fetchTrailer(movie.id);
      await fetchComments(movie.id);
    }
  };

  const fetchComments = async (movieId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/comments/${movieId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setComments(response.data);
    } catch (error) {
      console.error('獲取評論失敗:', error);
      if (error.response?.status === 401) {
        toast.error('登入已過期，請重新登入');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      } else {
        toast.error('獲取評論失敗，請稍後重試');
      }
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('請先登入');
      navigate('/login');
      return;
    }

    if (!rating) {
      toast.error('請選擇評分');
      return;
    }

    if (!newComment.trim()) {
      toast.error('請輸入評論內容');
      return;
    }

    try {
      const response = await axios.post('/api/comments', {
        movieId: selectedMovie.id.toString(),
        content: newComment.trim(),
        rating: rating
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setComments(prevComments => [response.data, ...prevComments]);
      setNewComment('');
      setRating(0);
      toast.success('評論發布成功');
    } catch (error) {
      console.error('發布評論失敗:', error);
      if (error.response?.status === 401) {
        toast.error('登入已過期，請重新登入');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      } else if (error.response?.status === 400) {
        toast.error(error.response.data.message || '您已經評論過這部電影了');
      } else {
        toast.error('發布評論失敗，請稍後重試');
      }
    }
  };

  const renderStars = (count, isInput = false) => {
    return [...Array(5)].map((_, index) => (
      <span
        key={index}
        onClick={isInput ? () => setRating(index + 1) : undefined}
        style={{ cursor: isInput ? 'pointer' : 'default' }}
      >
        {index < count ? (
          <AiFillStar className="star-icon filled" />
        ) : (
          <AiOutlineStar className="star-icon" />
        )}
      </span>
    ));
  };

  const closeModal = () => {
    setSelectedMovie(null);
    setTrailerKey(null);
  };

  const fetchData = async (pageNumber = 1) => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://api.themoviedb.org/3/movie/${category ? category : "now_playing"}?language=${currentLanguage === 'zh-TW' ? 'zh-TW' : 'en-US'}&page=${pageNumber}`,
        options
      );
      const data = await response.json();
      if (pageNumber === 1) {
        setApiData(data.results);
      } else {
        setApiData(prev => [...prev, ...data.results]);
      }
      setHasMore(data.page < data.total_pages);
      
      const token = localStorage.getItem('token');
      if (token) {
        data.results.forEach(movie => {
          checkFavoriteStatus(movie.id);
        });
      }
    } catch (err) {
      console.error(err);
      toast.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleScroll = () => {
    if (!cardsRef.current || loading || !hasMore) return;

    const { scrollLeft, scrollWidth, clientWidth } = cardsRef.current;
    if (scrollWidth - scrollLeft - clientWidth < 100) {
      setPage(prev => prev + 1);
    }
  };

  useEffect(() => {
    fetchData();
  }, [category, currentLanguage]);

  useEffect(() => {
    if (page > 1) {
      fetchData(page);
    }
  }, [page]);

  // 當語言改變時重新獲取電影詳情
  useEffect(() => {
    if (selectedMovie) {
      fetchMovieDetails(selectedMovie.id).then(details => {
        if (details) {
          setSelectedMovie(details);
        }
      });
    }
  }, [currentLanguage]);

  useEffect(() => {
    const handleWheelEvent = (event) => {
      if (cardsRef.current) {
        handleWheel(event);
      }
    };

    const handleScrollEvent = () => {
      handleScroll();
    };

    const currentRef = cardsRef.current;
    if (currentRef) {
      currentRef.addEventListener("wheel", handleWheelEvent);
      currentRef.addEventListener("scroll", handleScrollEvent);
    }
    
    return () => {
      if (currentRef) {
        currentRef.removeEventListener("wheel", handleWheelEvent);
        currentRef.removeEventListener("scroll", handleScrollEvent);
      }
    };
  }, [loading, hasMore]);

  return (
    <div className="title-cards">
      <h2>{title ? t(title) : t('movie.popularMovies')}</h2>
      <div className="card-list" ref={cardsRef}>
        {apiData.map((movie) => (
          <div className="card" key={movie.id}>
            <Link to={`/player/${movie.id}`}>
              <img
                src={`https://image.tmdb.org/t/p/w500${movie.backdrop_path}`}
                alt={movie.title}
              />
              <div className="title-overlay">{movie.title || movie.name}</div>
            </Link>
            <button 
              className="info-button"
              onClick={(e) => handleInfoClick(e, movie)}
            >
              <AiOutlineInfoCircle /> {t('movie.learnMore')}
            </button>
            <button 
              className="favorite-button"
              onClick={(e) => toggleFavorite(e, movie)}
            >
              {favorites[movie.id] ? (
                <AiFillHeart className="heart-icon filled" />
              ) : (
                <AiOutlineHeart className="heart-icon" />
              )}
            </button>
          </div>
        ))}
      </div>

      {selectedMovie && (
        <>
          <div className="modal-overlay" onClick={closeModal}></div>
          <div className="movie-modal active">
            <div className="modal-content">
              {trailerKey ? (
                <div className="modal-trailer">
                  <iframe
                    src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=1&controls=1&modestbranding=1&origin=${window.location.origin}`}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    loading="lazy"
                  ></iframe>
                </div>
              ) : (
                <div className="modal-image">
                  <img
                    src={`https://image.tmdb.org/t/p/w500${selectedMovie.backdrop_path}`}
                    alt={selectedMovie.title}
                  />
                </div>
              )}
              <div className="modal-header">
                <h3 className="modal-title">{selectedMovie.title}</h3>
                <button className="modal-close" onClick={closeModal}>
                  <AiOutlineClose />
                </button>
              </div>
              <div className="modal-body">
                <div className="modal-details">
                  <span>{t('movie.releaseYear')}: {new Date(selectedMovie.release_date).getFullYear()}</span>
                  <span>{t('movie.rating')}: {selectedMovie.vote_average.toFixed(1)}</span>
                </div>
                <p className="modal-overview">{selectedMovie.overview || t('movie.noOverview')}</p>
                <div className="modal-buttons">
                  <Link to={`/player/${selectedMovie.id}`} className="play-button">
                    <AiOutlinePlayCircle /> {t('movie.play')}
                  </Link>
                  <button 
                    className="favorite-button-large"
                    onClick={(e) => toggleFavorite(e, selectedMovie)}
                  >
                    {favorites[selectedMovie.id] ? (
                      <AiFillHeart className="heart-icon" />
                    ) : (
                      <AiOutlineHeart className="heart-icon" />
                    )}
                    {favorites[selectedMovie.id] ? t('movie.removeFromList') : t('movie.addToList')}
                  </button>
                </div>
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
                <div className="comments-list">
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
        </>
      )}
    </div>
  );
};

export default TitleCards;
