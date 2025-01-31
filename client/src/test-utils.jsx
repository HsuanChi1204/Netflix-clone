import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { LanguageProvider } from 'contexts/LanguageContext';
import { AuthProvider } from 'contexts/AuthContext';
import PropTypes from 'prop-types';

const mockTranslations = {
  'zh-TW': {
    'common.error': '發生錯誤',
    'common.loading': '載入中',
    'auth.loginRequired': '請先登入',
    'movie.popularMovies': '熱門電影',
    'movie.addToFavorites': '加入收藏',
    'movie.removeFromFavorites': '移除收藏',
  },
  'en-US': {
    'common.error': 'An error occurred',
    'common.loading': 'Loading',
    'auth.loginRequired': 'Please login first',
    'movie.popularMovies': 'Popular Movies',
    'movie.addToFavorites': 'Add to Favorites',
    'movie.removeFromFavorites': 'Remove from Favorites',
  },
};

const AllTheProviders = ({ children }) => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

AllTheProviders.propTypes = {
  children: PropTypes.node.isRequired
};

const customRender = (ui, options) =>
  render(ui, { wrapper: AllTheProviders, ...options });

// 重新導出所有 testing-library/react 的內容
export * from '@testing-library/react';

// 覆蓋 render 方法
export { customRender as render }; 