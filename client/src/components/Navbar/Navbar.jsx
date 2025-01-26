import React, { useEffect, useRef, useState } from "react";
import "./Navbar.css";
import logo from "../../assets/logo.png";
import search_icon from "../../assets/search_icon.svg";
import bell_icon from "../../assets/bell_icon.svg";
import profile_img from "../../assets/profile_img.png";
import caret_icon from "../../assets/caret_icon.svg";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { toast } from "react-toastify";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const navRef = useRef();
  const [user, setUser] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef(null);
  
  useEffect(() => {
    // 從 localStorage 讀取用戶資訊
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        setUser(userData);
      } catch (error) {
        console.error('解析用戶資料時發生錯誤:', error);
      }
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (navRef.current) {
        if (window.scrollY >= 80) {
          navRef.current.classList.add("nav-dark");
        } else {
          navRef.current.classList.remove("nav-dark");
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    // 當搜尋框顯示時，自動聚焦
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearch]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    toast.success('已成功登出');
    navigate('/login');
  };

  const toggleSearch = () => {
    setShowSearch(!showSearch);
    if (!showSearch) {
      setSearchQuery("");
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearch(false);
    }
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Escape') {
      setShowSearch(false);
    }
  };

  return (
    <div className="navbar" ref={navRef}>
      <div className="navbar-left">
        <Link to="/">
          <img src={logo} alt="netflix logo" />
        </Link>
        <ul>
          <li>
            <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
              首頁
            </Link>
          </li>
          <li>節目</li>
          <li>電影</li>
          <li>最新熱門</li>
          <li>
            <Link to="/my-list" className={location.pathname === '/my-list' ? 'active' : ''}>
              我的片單
            </Link>
          </li>
          <li>依語言瀏覽</li>
        </ul>
      </div>
      <div className="navbar-right">
        <div className={`search-container ${showSearch ? 'active' : ''}`}>
          <img 
            src={search_icon} 
            alt="搜尋" 
            className="icons search-icon" 
            onClick={toggleSearch}
          />
          {showSearch && (
            <form onSubmit={handleSearch} className="search-form">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="搜尋電影..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyPress}
              />
            </form>
          )}
        </div>
        <p>兒童專區</p>
        <img src={bell_icon} alt="" className="icons" />
        <div className="navbar-profile">
          <img 
            src={profile_img} 
            alt={user?.name || "User"} 
            className="profile"
            title={user?.name || "User"} 
          />
          <img src={caret_icon} alt="" />
          <div className="dropdown">
            {user && (
              <>
                <p className="user-info">
                  {user.name}
                  <span className="user-email">{user.email}</span>
                </p>
                <div className="dropdown-divider"></div>
              </>
            )}
            <p onClick={handleLogout}>
              登出 Netflix
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
