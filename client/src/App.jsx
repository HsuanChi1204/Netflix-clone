import React, { useEffect } from "react";
import Home from "./pages/Home/Home";
import { Routes, Route, useNavigate } from "react-router-dom";
import Login from "./pages/Login/Login";
import Player from "./pages/Player/Player";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import MyList from "./pages/MyList/MyList";
import Search from "./pages/Search/Search";

const App = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // 檢查本地存儲的 token
    const token = localStorage.getItem('token');
    if (token) {
      // 設置 axios 默認標頭
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // 驗證 token
      axios.get('http://localhost:5001/api/auth/me')
        .then(() => {
          // 保持在當前頁面，不強制導航
          if (window.location.pathname === '/login') {
            navigate('/');
          }
        })
        .catch(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
        });
    } else {
      navigate('/login');
    }
  }, [navigate]);

  return (
    <>
      <ToastContainer theme="dark" />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/player/:id" element={<Player />} />
        <Route path="/my-list" element={<MyList />} />
        <Route path="/search" element={<Search />} />
      </Routes>
    </>
  );
};

export default App;
