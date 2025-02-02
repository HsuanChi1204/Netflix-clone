/* eslint-disable no-unused-vars */
import React from 'react';
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import "./TitleCards.css";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { AiOutlineHeart, AiFillHeart, AiOutlineClose, AiOutlineInfoCircle, AiOutlinePlayCircle, AiFillStar, AiOutlineStar } from "react-icons/ai";
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext.jsx';
import PropTypes from 'prop-types';

// 設置 axios 基礎 URL
axios.defaults.baseURL = 'http://localhost:5001';

const TitleCards = ({ title = '', category }) => {
	const navigate = useNavigate();
	const [data, setData] = useState([]);
	const [loading, setLoading] = useState(true);
	const [loadingDetails, setLoadingDetails] = useState(false);
	const [hasMore, setHasMore] = useState(true);
	const [favorites, setFavorites] = useState({});
	const [selectedMovie, setSelectedMovie] = useState(null);
	const [trailerKey, setTrailerKey] = useState(null);
	const [comments, setComments] = useState([]);
	const [newComment, setNewComment] = useState('');
	const [rating, setRating] = useState(0);
	const cardsRef = useRef();
	const { currentLanguage, t } = useLanguage();
	const { isAuthenticated } = useAuth();

	const options = useMemo(() => ({
		method: "GET",
		headers: {
			accept: "application/json",
			Authorization: "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhMWYxN2FlYTUzODFhZWI2YjgzYjUxYWEwNzg1YmI3MSIsIm5iZiI6MTczMTA2MjA4MC43NzQxNzc4LCJzdWIiOiI2NzJkZTg1YmQ5OGJiYzM5NzdhZDUwZGQiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.ehPZsqGQ4dEinJHjl8iSTmHT4tt_J2e07Jywn0cLCHE",
		},
	}), []);

	const fetchFavorites = useCallback(async () => {
		if (!isAuthenticated) return;
		
		try {
			const token = localStorage.getItem('token');
			const response = await axios.get('/api/favorites', {
				headers: {
					Authorization: `Bearer ${token}`
				}
			});
			
			// 將收藏資料轉換為 map 格式
			const newFavorites = {};
			response.data.forEach(favorite => {
				newFavorites[favorite.movieId] = true;
			});
			setFavorites(newFavorites);
		} catch (error) {
			console.error('獲取收藏清單失敗:', error);
		}
	}, [isAuthenticated]);

	useEffect(() => {
		fetchFavorites();
	}, [fetchFavorites, isAuthenticated]);

	const fetchData = useCallback(async (pageNumber = 1) => {
		try {
			setLoading(true);
			const response = await fetch(
				`https://api.themoviedb.org/3/movie/${category}?language=${currentLanguage === 'zh-TW' ? 'zh-TW' : 'en-US'}&page=${pageNumber}`,
				options
			);
			const responseData = await response.json();
			
			const results = Array.isArray(responseData.results) ? responseData.results : [];
			
			if (pageNumber === 1) {
				setData(results);
			} else {
				setData(prev => [...prev, ...results]);
			}
			
			setHasMore(responseData.page < (responseData.total_pages || 1));
		} catch (err) {
			console.error(err);
			toast.error(t('common.error'));
			setData([]);
		} finally {
			setLoading(false);
		}
	}, [category, currentLanguage, options, t]);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	const handleWheel = useCallback((event) => {
		const delta = event.deltaY;
		if (cardsRef.current) {
			cardsRef.current.scrollLeft += delta;
		}
	}, []);

	const toggleFavorite = async (event, movie) => {
		event.preventDefault();
		event.stopPropagation();

		const token = localStorage.getItem('token');
		if (!token) {
			toast.error(t('auth.loginRequired'));
			navigate('/login');
			return;
		}

		try {
			const movieId = movie.id.toString();
			const isFavorited = favorites[movieId];

			if (isFavorited) {
				// 取消收藏
				await axios.delete(`/api/favorites/${movieId}`, {
					headers: { Authorization: `Bearer ${token}` }
				});
				
				setFavorites(prev => {
					const newFavorites = { ...prev };
					delete newFavorites[movieId];
					return newFavorites;
				});
				
				toast.success(t('movie.removedFromList'));
			} else {
				// 新增收藏
				const movieData = {
					movieId,
					title: movie.title,
					posterPath: movie.poster_path || movie.backdrop_path,
					mediaType: 'movie'
				};
				
				await axios.post('/api/favorites', movieData, {
					headers: { Authorization: `Bearer ${token}` }
				});
				
				setFavorites(prev => ({
					...prev,
					[movieId]: true
				}));
				
				toast.success(t('movie.addedToList'));
			}
		} catch (error) {
			console.error('收藏操作失敗:', error);
			if (error.response?.status === 401) {
				localStorage.removeItem('token');
				localStorage.removeItem('user');
				toast.error(t('auth.sessionExpired'));
				navigate('/login');
			} else {
				toast.error(t('common.error'));
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
			
			let trailer = null;
			if (response.data && response.data.results) {
				trailer = response.data.results.find(
					video => video && (video.type === "Trailer" || video.type === "Teaser")
				);
			}

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
				`/api/comments/${movieId}`,
				{
					headers: {
						Authorization: `Bearer ${token}`
					}
				}
			);
			setComments(response.data);
		} catch (error) {
			if (error.response?.status === 401) {
				toast.error(t('auth.sessionExpired'));
				navigate('/login');
			} else {
				console.error('獲取評論失敗:', error);
				toast.error(t('comments.fetchError'));
			}
		}
	};

	const handleInfoClick = async (e, movie) => {
		e.preventDefault();
		e.stopPropagation();
		
		setLoadingDetails(true);
		try {
			const movieDetails = await fetchMovieDetails(movie.id);
			if (movieDetails) {
				setSelectedMovie(movieDetails);
				await Promise.all([
					fetchTrailer(movie.id),
					fetchComments(movie.id)
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

		const token = localStorage.getItem('token');
		if (!token) {
			toast.error(t('auth.sessionExpired'));
			navigate('/login');
			return;
		}

		if (!rating) {
			toast.error(t('comments.ratingRequired'));
			return;
		}
		if (!newComment.trim()) {
			toast.error(t('comments.contentRequired'));
			return;
		}

		try {
			await axios.post(
				'/api/comments',
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

	const closeModal = useCallback(() => {
		const iframes = document.querySelectorAll('.modal-trailer iframe');
		iframes.forEach(iframe => {
			iframe.src = '';
		});
		setSelectedMovie(null);
		setTrailerKey(null);
		setComments([]);
		setNewComment('');
		setRating(0);
	}, []);

	const handleScroll = useCallback(() => {
		if (!cardsRef.current || loading || !hasMore || !data) return;

		const { scrollLeft, scrollWidth, clientWidth } = cardsRef.current;
		if (scrollWidth - scrollLeft - clientWidth < 100) {
			const currentPage = Math.floor((data.length || 0) / 20) + 1;
			fetchData(currentPage + 1);
		}
	}, [loading, hasMore, fetchData, data]);

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
	}, [loading, hasMore, handleScroll, handleWheel]);

	return (
		<div className="title-cards">
			<h2>{title || t('movie.popularMovies')}</h2>
			{loading ? (
				<div data-testid="loading-skeleton" className="loading-skeleton">
					<div className="skeleton-card"></div>
					<div className="skeleton-card"></div>
					<div className="skeleton-card"></div>
				</div>
			) : (
				<div className="card-list" ref={cardsRef} onWheel={handleWheel}>
					{data.map((movie, index) => (
						<div key={movie.id} className="card" data-testid={`movie-card-${index}`}>
							<Link to={`/player/${movie.id}`}>
								<img
									src={`https://image.tmdb.org/t/p/w500${movie.backdrop_path}`}
									alt={movie.title}
								/>
								<div className="title-overlay">{movie.title}</div>
							</Link>
							<button
								className="info-button"
								data-testid={`info-button-${index}`}
								onClick={(e) => handleInfoClick(e, movie)}
							>
								<AiOutlineInfoCircle />
								{' '}
								{t('movie.learnMore')}
							</button>
							<button
								className="favorite-button"
								onClick={(e) => toggleFavorite(e, movie)}
							>
								{favorites[movie.id.toString()] ? (
									<AiFillHeart className="heart-icon" />
								) : (
									<AiOutlineHeart className="heart-icon" />
								)}
							</button>
						</div>
					))}
				</div>
			)}

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
											onClick={(e) => toggleFavorite(e, selectedMovie)}
										>
											{favorites[selectedMovie.id.toString()] ? (
												<AiFillHeart className="heart-icon" />
											) : (
												<AiOutlineHeart className="heart-icon" />
											)}
											{favorites[selectedMovie.id.toString()] ? t('movie.removeFromList') : t('movie.addToList')}
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

TitleCards.propTypes = {
	title: PropTypes.string,
	category: PropTypes.string.isRequired,
};

export default TitleCards;