import React, { useEffect, useRef, useState } from "react";
import "./TitleCards.css";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { AiOutlineHeart, AiFillHeart, AiOutlineClose, AiOutlineInfoCircle, AiOutlinePlayCircle, AiFillStar, AiOutlineStar } from "react-icons/ai";

// 設置 axios 基礎 URL
axios.defaults.baseURL = 'http://localhost:5001';

const TitleCards = ({ title, category }) => {
  const navigate = useNavigate();
  const [apiData, setApiData] = useState([]);
  const [favorites, setFavorites] = useState({});
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [trailerKey, setTrailerKey] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [rating, setRating] = useState(0);
  const cardsRef = useRef();

  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization:
        "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhMWYxN2FlYTUzODFhZWI2YjgzYjUxYWEwNzg1YmI3MSIsIm5iZiI6MTczMTA2MjA4MC43NzQxNzc4LCJzdWIiOiI2NzJkZTg1YmQ5OGJiYzM5NzdhZDUwZGQiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.ehPZsqGQ4dEinJHjl8iSTmHT4tt_J2e07Jywn0cLCHE",
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
        toast.error('登入已過期，請重新登入');
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
      toast.error('請先登入');
      navigate('/login');
      return;
    }

    try {
      console.log('正在切換電影 ID:', movie.id, '的收藏狀態');
      if (favorites[movie.id]) {
        console.log('正在取消收藏');
        await axios.delete(`/api/favorites/${movie.id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setFavorites(prev => ({
          ...prev,
          [movie.id]: false
        }));
        toast.success('已從收藏清單中移除');
      } else {
        console.log('正在新增收藏');
        const movieData = {
          movieId: movie.id.toString(),
          title: movie.original_title || movie.title,
          posterPath: movie.backdrop_path,
          mediaType: 'movie'
        };
        console.log('傳送的電影資料:', movieData);
        
        await axios.post('/api/favorites', movieData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        setFavorites(prev => ({
          ...prev,
          [movie.id]: true
        }));
        toast.success('已加入收藏清單');
      }
    } catch (error) {
      console.error('更新收藏狀態失敗:', {
        status: error.response?.status,
        message: error.response?.data?.message,
        error: error.message
      });
      if (error.response?.status === 401) {
        toast.error('登入已過期，請重新登入');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      } else {
        toast.error(error.response?.data?.message || '操作失敗，請稍後重試');
      }
    }
  };

  const fetchTrailer = async (movieId) => {
    try {
      const response = await axios.get(
        `https://api.themoviedb.org/3/movie/${movieId}/videos?language=en-US`,
        options
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

  const handleInfoClick = async (e, movie) => {
    e.preventDefault();
    setSelectedMovie(movie);
    await fetchTrailer(movie.id);
    await fetchComments(movie.id);
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `https://api.themoviedb.org/3/movie/${
            category ? category : "now_playing"
          }?language=zh-TW&page=1`,
          options
        );
        const data = await response.json();
        setApiData(data.results);
        
        const token = localStorage.getItem('token');
        if (token) {
          data.results.forEach(movie => {
            checkFavoriteStatus(movie.id);
          });
        }
      } catch (err) {
        console.error(err);
        toast.error('載入影片資料失敗');
      }
    };

    fetchData();

    const handleWheelEvent = (event) => {
      if (cardsRef.current) {
        handleWheel(event);
      }
    };

    cardsRef.current?.addEventListener("wheel", handleWheelEvent);
    
    return () => {
      cardsRef.current?.removeEventListener("wheel", handleWheelEvent);
    };
  }, [category]);

  return (
    <div className="title-cards">
      <h2>{title ? title : "熱門影片"}</h2>
      <div className="card-list" ref={cardsRef}>
        {apiData.map((movie) => (
          <div className="card" key={movie.id}>
            <Link to={`/player/${movie.id}`}>
              <img
                src={`https://image.tmdb.org/t/p/w500${movie.backdrop_path}`}
                alt={movie.title}
              />
              <div className="title-overlay">{movie.title}</div>
            </Link>
            <button 
              className="info-button"
              onClick={(e) => handleInfoClick(e, movie)}
            >
              <AiOutlineInfoCircle /> 了解更多
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
                  <span>{new Date(selectedMovie.release_date).getFullYear()}</span>
                  <span>評分: {selectedMovie.vote_average.toFixed(1)}</span>
                </div>
                <p className="modal-overview">{selectedMovie.overview || '暫無簡介'}</p>
                <div className="modal-buttons">
                  <Link to={`/player/${selectedMovie.id}`} className="play-button">
                    <AiOutlinePlayCircle /> 播放
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
                    {favorites[selectedMovie.id] ? '取消收藏' : '加入收藏'}
                  </button>
                </div>
              </div>
              <div className="modal-comments">
                <h4>觀眾評論</h4>
                <div className="comment-form">
                  <div className="rating-input">
                    <span>評分：</span>
                    {renderStars(rating, true)}
                  </div>
                  <form onSubmit={handleCommentSubmit}>
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="分享你的想法..."
                      required
                    />
                    <button type="submit" className="comment-submit">
                      發布評論
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
