/* eslint-disable no-unused-vars */
import React from 'react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import axios from 'axios';

// 確保 axios 基礎 URL 設置
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const AuthWrapper = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      axios.get('/api/auth/me')
        .catch(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
        });
    } else {
      navigate('/login');
    }
  }, [navigate]);

  return children;
};

AuthWrapper.propTypes = {
  children: PropTypes.node.isRequired
};

export default AuthWrapper;