/* eslint-disable no-unused-vars */
import React from 'react';
import { useEffect, useState } from "react";
import "./Player.css";
import { useNavigate, useParams } from "react-router-dom";
import back_arrow from "../../assets/back_arrow_icon.png";
import { useLanguage } from '../../contexts/LanguageContext';

const Player = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [videoKey, setVideoKey] = useState("");
  const { currentLanguage, t } = useLanguage();

  useEffect(() => {
    const language = currentLanguage === 'zh-TW' ? 'zh-TW' : 'en-US';
    fetch(
      `https://api.themoviedb.org/3/movie/${id}/videos?language=${language}`,
      {
        method: "GET",
        headers: {
          accept: "application/json",
          Authorization:
            "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhMWYxN2FlYTUzODFhZWI2YjgzYjUxYWEwNzg1YmI3MSIsIm5iZiI6MTczMTA2MjA4MC43NzQxNzc4LCJzdWIiOiI2NzJkZTg1YmQ5OGJiYzM5NzdhZDUwZGQiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.ehPZsqGQ4dEinJHjl8iSTmHT4tt_J2e07Jywn0cLCHE",
        },
      }
    )
      .then((res) => res.json())
      .then((res) => {
        const trailer = res.results.find(
          (video) => video.type === "Trailer" || video.type === "Teaser"
        );
        if (trailer) {
          setVideoKey(trailer.key);
        }
      })
      .catch((err) => console.error(err));
  }, [id, currentLanguage]);

  const handleBack = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(-1);
  };

  return (
    <div className="player">
      <div className="back" onClick={handleBack}>
        <img 
          src={back_arrow} 
          alt={t('movie.back')}
          title={t('movie.back')}
        />
      </div>
      {videoKey ? (
        <iframe
          src={`https://www.youtube.com/embed/${videoKey}?autoplay=1&controls=1&modestbranding=1&origin=${window.location.origin}`}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      ) : (
        <div className="loading">{t('common.loading')}</div>
      )}
    </div>
  );
};

export default Player;
