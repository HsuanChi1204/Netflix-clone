import React from 'react';
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import './Search.css';
import Navbar from '../../components/Navbar/Navbar';
import { useLanguage } from '../../contexts/LanguageContext';

const Search = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const query = searchParams.get('q');
    const { t } = useLanguage();

    useEffect(() => {
        const searchMovies = async () => {
            if (!query) {
                setResults([]);
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const response = await axios.get(
                    `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(query)}&language=zh-TW`,
                    {
                        headers: {
                            Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhMWYxN2FlYTUzODFhZWI2YjgzYjUxYWEwNzg1YmI3MSIsIm5iZiI6MTczMTA2MjA4MC43NzQxNzc4LCJzdWIiOiI2NzJkZTg1YmQ5OGJiYzM5NzdhZDUwZGQiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.ehPZsqGQ4dEinJHjl8iSTmHT4tt_J2e07Jywn0cLCHE'
                        }
                    }
                );
                
                if (!response.data || !response.data.results) {
                    throw new Error('Invalid response data');
                }
                
                setResults(response.data.results);
            } catch (error) {
                console.error('搜尋失敗:', error);
                toast.error(t('common.error'));
                setResults([]);
            } finally {
                setLoading(false);
            }
        };

        searchMovies();
    }, [query, t]);

    const handleMovieClick = (movieId) => {
        navigate(`/player/${movieId}`);
    };

    return (
        <div className="search-page">
            <Navbar />
            <div className="search-content">
                <h1>搜尋結果: {query}</h1>
                {loading ? (
                    <div className="loading">{t('search.loading')}</div>
                ) : results.length === 0 ? (
                    <div className="no-results">
                        <p>{query ? t('search.noResults') : t('search.enterKeyword')}</p>
                    </div>
                ) : (
                    <div className="results-grid">
                        {results.map((movie) => (
                            <div
                                key={movie.id}
                                className="movie-card"
                                onClick={() => handleMovieClick(movie.id)}
                            >
                                {movie.backdrop_path ? (
                                    <img
                                        src={`https://image.tmdb.org/t/p/w500${movie.backdrop_path}`}
                                        alt={movie.title}
                                    />
                                ) : (
                                    <div className="no-image">無海報</div>
                                )}
                                <div className="movie-info">
                                    <h3>{movie.title}</h3>
                                    <p className="release-date">
                                        {movie.release_date ? new Date(movie.release_date).getFullYear() : '未知年份'}
                                    </p>
                                    <p className="overview">{movie.overview || '無簡介'}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Search; 