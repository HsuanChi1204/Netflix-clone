/* eslint-disable no-unused-vars */
import React from "react";
import "./Home.css";
import Navbar from "../../components/Navbar/Navbar";
import hero_banner from "../../assets/hero_banner.jpg";
import hero_title from "../../assets/hero_title.png";
import play_icon from "../../assets/play_icon.png";
import info_icon from "../../assets/info_icon.png";
import TitleCards from "../../components/TitleCards/TitleCards";
import Footer from "../../components/Footer/Footer";
import { useLanguage } from '../../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { BsFillPlayFill } from 'react-icons/bs';

const Home = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handlePlayClick = () => {
    // Implementation of handlePlayClick function
  };

  return (
    <div className="home">
      <Navbar />
      <div className="hero" data-testid="hero-section">
        <img
          src={hero_banner}
          alt=""
          className="banner-img"
          data-testid="hero-banner"
        />
        <div className="hero-caption" data-testid="hero-caption">
          <img
            src={hero_title}
            alt=""
            className="caption-img"
          />
          <p>{t('home.hero.description')}</p>
          <div className="hero-btns">
            <button 
              className="btn" 
              data-testid="play-button"
              onClick={() => navigate('/player/1')}
            >
              <BsFillPlayFill />
              {t('home.play')}
            </button>
            <button className="btn dark-btn">
              <img src={info_icon} alt="" />
              {t('common.moreInfo')}
            </button>
          </div>
          <TitleCards category="popular" title={t('home.categories.popular')} />
        </div>
      </div>
      <div className="more-cards">
        <TitleCards category="top_rated" title={t('home.categories.topRated')} />
        <TitleCards category="upcoming" title={t('home.categories.upcoming')} />
        <TitleCards category="now_playing" title={t('home.categories.nowPlaying')} />
      </div>
      <Footer />
    </div>
  );
};

export default Home;
