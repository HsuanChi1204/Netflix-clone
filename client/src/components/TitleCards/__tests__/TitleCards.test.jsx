import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import React from 'react';
import { render, fireEvent, waitFor, screen, act } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import TitleCards from '../TitleCards';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useAuth } from '../../../contexts/AuthContext';
import fetchMock from 'jest-fetch-mock';
import PropTypes from 'prop-types';
import '@testing-library/jest-dom';
import { AuthContext } from '../../../contexts/AuthContext';
import { LanguageContext } from '../../../contexts/LanguageContext';
import { LanguageProvider } from '../../../contexts/LanguageContext';
import { AuthProvider } from '../../../contexts/AuthContext';

// Enable fetch mocking
fetchMock.enableMocks();

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  Link: ({ children, to }) => <a href={to}>{children}</a>
}));

// Mock axios
jest.mock('axios');

// Mock react-toastify
jest.mock('react-toastify');

// Update mock translations
const mockTranslations = {
  'zh-TW': {
    'categories.popular': '熱門電影',
    'movie.trailerNotFound': '無法找到預告片',
    'movie.addedToList': '已加入收藏清單',
    'movie.removedFromList': '已從收藏清單移除',
    'auth.loginRequired': '請先登入',
    'common.error': '發生錯誤',
    'auth.sessionExpired': '登入已過期',
    'movie.trailerError': '獲取預告片失敗',
    'comments.fetchError': '獲取評論失敗',
    'common.loading': '載入中',
    'movie.popularMovies': '熱門電影',
    'movie.addToFavorites': '加入收藏',
    'movie.removeFromFavorites': '移除收藏',
  },
  'en-US': {
    'categories.popular': 'Popular Movies',
    'movie.trailerNotFound': 'Trailer not found',
    'movie.addedToList': 'Added to favorites',
    'movie.removedFromList': 'Removed from favorites',
    'auth.loginRequired': 'Please login first',
    'common.error': 'An error occurred',
    'common.loading': 'Loading',
    'movie.popularMovies': 'Popular Movies',
    'movie.addToFavorites': 'Add to Favorites',
    'movie.removeFromFavorites': 'Remove from Favorites',
  }
};

// Mock LanguageContext
jest.mock('../../../contexts/LanguageContext', () => ({
  useLanguage: () => ({
    currentLanguage: 'zh-TW',
    t: (key) => mockTranslations['zh-TW'][key] || key,
    toggleLanguage: jest.fn()
  }),
  LanguageContext: {
    Provider: ({ children, value }) => (
      <div data-testid="language-provider">{children}</div>
    )
  }
}));

// Mock AuthContext
jest.mock('../../../contexts/AuthContext', () => ({
  useAuth: () => ({
    isAuthenticated: true,
    user: { id: 'test-user' },
    token: 'test-token'
  }),
  AuthContext: {
    Provider: ({ children, value }) => (
      <div data-testid="auth-provider">{children}</div>
    )
  }
}));

// Mock fetch response
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({
      results: mockMovies,
      page: 1,
      total_pages: 2
    })
  })
);

// Mock axios responses
jest.mock('axios');

// 將 mockMovies 定義移到最前面
const mockMovies = [
  {
    id: 1,
    title: 'Test Movie',
    title_cn: '測試電影',
    overview: 'Test Overview',
    overview_cn: '測試簡介',
    poster_path: '/test-poster.jpg',
    backdrop_path: '/test-backdrop.jpg'
  },
  {
    id: 2,
    title: 'Another Movie',
    title_cn: '另一部電影',
    overview: 'Another Overview',
    overview_cn: '另一個簡介',
    poster_path: '/another-poster.jpg',
    backdrop_path: '/another-backdrop.jpg'
  }
];

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
  localStorage.setItem('token', 'test-token');
  
  // Reset fetch mock with immediate response
  global.fetch.mockImplementation(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ 
        results: mockMovies,
        page: 1,
        total_pages: 2
      })
    })
  );

  // Reset axios mocks with immediate responses
  axios.get.mockImplementation((url) => {
    if (url.includes('/api/favorites/check/')) {
      return Promise.resolve({ data: { isFavorite: false } });
    }
    return Promise.resolve({ data: mockMovieDetailsZh });
  });
});

const mockMovieDetails = {
  id: 1,
  title: '測試電影 1',
  overview: '測試電影描述',
  release_date: '2024-01-01',
  vote_average: 8.5,
  vote_count: 100,
  backdrop_path: '/test1.jpg',
  comments: []
};

const mockMovieDetailsZh = {
  id: 1,
  title: '測試電影 1',
  overview: '測試電影描述',
  backdrop_path: '/test1.jpg',
  videos: {
    results: [
      { key: 'test-key', site: 'YouTube', type: 'Trailer' }
    ]
  }
};

const mockMovieDetailsEn = {
  id: 1,
  title: 'Test Movie 1',
  overview: 'Test movie description',
  backdrop_path: '/test1.jpg',
  videos: {
    results: [
      { key: 'test-key', site: 'YouTube', type: 'Trailer' }
    ]
  }
};

const mockTrailer = {
  results: [
    {
      key: 'test-trailer-key',
      type: 'Trailer'
    }
  ]
};

// Mock Link component
const MockLink = ({ to, children }) => (
  <a href={to}>{children}</a>
);

MockLink.propTypes = {
  to: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

const renderWithProviders = (component, { isAuthenticated = true, language = 'zh-TW' } = {}) => {
  const authValue = {
    isAuthenticated,
    token: isAuthenticated ? 'test-token' : null,
    user: isAuthenticated ? { id: 'test-user' } : null,
    logout: jest.fn()
  };

  const languageValue = {
    currentLanguage: language,
    t: (key) => mockTranslations[language][key] || key,
    toggleLanguage: jest.fn()
  };

  return render(
    <BrowserRouter>
      <LanguageContext.Provider value={languageValue}>
        <AuthContext.Provider value={authValue}>
          {component}
        </AuthContext.Provider>
      </LanguageContext.Provider>
    </BrowserRouter>
  );
};

describe('TitleCards Component', () => {
  let container;

  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('token', 'test-token');
    
    // Mock successful API responses immediately
    axios.get.mockResolvedValue({ data: mockMovies });
  });

  afterEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  const renderTitleCards = () => {
    const utils = render(
      <BrowserRouter>
        <LanguageProvider>
          <AuthProvider>
            <TitleCards category="Test Category" />
          </AuthProvider>
        </LanguageProvider>
      </BrowserRouter>
    );
    container = utils.container;
    return utils;
  };

  it('displays movie cards after loading', async () => {
    renderTitleCards();

    await waitFor(() => {
      const movieCards = container.querySelectorAll('.movie-card');
      expect(movieCards.length).toBe(mockMovies.length);
    }, { timeout: 2000 });

    const titles = container.querySelectorAll('.movie-title');
    expect(titles[0].textContent).toBe('Test Movie');
  });

  it('handles adding to favorites', async () => {
    axios.post.mockResolvedValueOnce({ data: { message: 'Added to favorites' } });
    renderTitleCards();

    await waitFor(() => {
      const movieCards = container.querySelectorAll('.movie-card');
      expect(movieCards.length).toBe(mockMovies.length);
    }, { timeout: 2000 });

    const favoriteButton = container.querySelector('.favorite-button');
    expect(favoriteButton).toBeInTheDocument();
    
    fireEvent.click(favoriteButton);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('/api/favorites', { movieId: mockMovies[0].id });
    });
  });

  it('handles removing from favorites', async () => {
    axios.delete.mockResolvedValueOnce({ data: { message: 'Removed from favorites' } });
    renderTitleCards();

    await waitFor(() => {
      const movieCards = container.querySelectorAll('.movie-card');
      expect(movieCards.length).toBe(mockMovies.length);
    }, { timeout: 2000 });

    const favoriteButton = container.querySelector('.favorite-button');
    expect(favoriteButton).toBeInTheDocument();
    
    fireEvent.click(favoriteButton);

    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalledWith(`/api/favorites/${mockMovies[0].id}`);
    });
  });

  it('displays content in Chinese when language is set to Chinese', async () => {
    renderTitleCards();

    await waitFor(() => {
      const movieCards = container.querySelectorAll('.movie-card');
      expect(movieCards.length).toBe(mockMovies.length);
    }, { timeout: 2000 });

    // Find and click language toggle
    const languageToggle = container.querySelector('.language-toggle');
    expect(languageToggle).toBeInTheDocument();
    fireEvent.click(languageToggle);

    // Verify Chinese content
    await waitFor(() => {
      const titles = container.querySelectorAll('.movie-title');
      expect(titles[0].textContent).toBe('測試電影');
    });
  });
});

describe('Favorites Functionality', () => {
  it('handles adding to favorites', async () => {
    const { container } = renderWithProviders(
      <TitleCards title="Test Category" category="popular" />
    );

    // Wait for loading to complete
    await waitFor(() => {
      expect(container.querySelector('[data-testid="loading-skeleton"]')).not.toBeInTheDocument();
    });

    // Find and click favorite button
    const favoriteButton = container.querySelector('.favorite-button');
    expect(favoriteButton).toBeInTheDocument();
    fireEvent.click(favoriteButton);

    // Verify API call
    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining('/api/favorites/add'),
      expect.any(Object)
    );
  });

  it('handles removing from favorites', async () => {
    // Mock favorite status
    axios.get.mockImplementationOnce(() => Promise.resolve({ data: { isFavorite: true } }));

    const { container } = renderWithProviders(
      <TitleCards title="Test Category" category="popular" />
    );

    // Wait for loading to complete
    await waitFor(() => {
      expect(container.querySelector('[data-testid="loading-skeleton"]')).not.toBeInTheDocument();
    });

    // Find and click favorite button
    const favoriteButton = container.querySelector('.favorite-button');
    expect(favoriteButton).toBeInTheDocument();
    fireEvent.click(favoriteButton);

    // Verify API call
    expect(axios.delete).toHaveBeenCalledWith(
      expect.stringContaining('/api/favorites/remove')
    );
  });
});

describe('Unauthenticated User Functionality', () => {
  beforeEach(() => {
    // Mock auth state as not authenticated
    jest.spyOn(require('../../../contexts/AuthContext'), 'useAuth')
      .mockImplementation(() => ({
        isAuthenticated: false,
        user: null
      }));

    // Clear all mock calls
    jest.clearAllMocks();
  });

  it('redirects to login when trying to add to favorites', async () => {
    const { container } = renderWithProviders(
      <TitleCards category="popular" />
    );

    await waitFor(() => {
      expect(container.querySelector('.favorite-button')).toBeInTheDocument();
    });

    // Click favorite button
    fireEvent.click(container.querySelector('.favorite-button'));

    await waitFor(() => {
      expect(toast.warning).toHaveBeenCalledWith(mockTranslations['zh-TW']['auth.loginRequired']);
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  it('redirects to login when trying to submit comment', async () => {
    const { container } = renderWithProviders(
      <TitleCards category="popular" />
    );

    await waitFor(() => {
      expect(container.querySelector('.info-button')).toBeInTheDocument();
    });

    // Click info button to open details
    fireEvent.click(container.querySelector('.info-button'));

    await waitFor(() => {
      expect(container.querySelector('.comment-form')).toBeInTheDocument();
    });

    // Submit empty comment form
    const commentForm = container.querySelector('.comment-form');
    fireEvent.submit(commentForm);

    await waitFor(() => {
      expect(toast.warning).toHaveBeenCalledWith(mockTranslations['zh-TW']['auth.loginRequired']);
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });
});

describe('Loading States', () => {
  it('shows loading skeleton while fetching movies', async () => {
    // 使用延遲的 Promise 來模擬加載狀態
    global.fetch.mockImplementationOnce(() =>
      new Promise(resolve =>
        setTimeout(() => resolve({
          ok: true,
          json: () => Promise.resolve({ results: mockMovies })
        }), 100)
      )
    );

    const { container } = renderWithProviders(
      <TitleCards title="Test Category" category="popular" />
    );

    expect(container.querySelector('[data-testid="loading-skeleton"]')).toBeInTheDocument();

    await waitFor(() => {
      expect(container.querySelector('[data-testid="loading-skeleton"]')).not.toBeInTheDocument();
    }, { timeout: 1000 });
  });

  it('shows loading state while fetching movie details', async () => {
    const { container } = renderWithProviders(
      <TitleCards title="Test Category" category="popular" />
    );

    await waitFor(() => {
      expect(container.querySelector('[data-testid="loading-skeleton"]')).not.toBeInTheDocument();
    }, { timeout: 1000 });

    const infoButton = container.querySelector('.info-button');
    expect(infoButton).toBeInTheDocument();
    fireEvent.click(infoButton);

    expect(container.querySelector('[data-testid="details-loading"]')).toBeInTheDocument();
  });
});

describe('Language Support', () => {
  it('displays content in Chinese by default', async () => {
    const { container } = renderWithProviders(
      <TitleCards title="Test Category" category="popular" />
    );

    // Wait for content to load
    await waitFor(() => {
      const cards = container.querySelectorAll('.movie-card');
      expect(cards.length).toBe(mockMovies.length);
    }, { timeout: 1000 });

    const titleElement = container.querySelector('.movie-title');
    expect(titleElement).toHaveTextContent('測試電影 1');
  });

  it('updates content when language is changed', async () => {
    const { container } = renderWithProviders(
      <TitleCards title="Test Category" category="popular" />
    );

    // Wait for content to load
    await waitFor(() => {
      const cards = container.querySelectorAll('.movie-card');
      expect(cards.length).toBe(mockMovies.length);
    }, { timeout: 1000 });

    // Verify Chinese content first
    const titleElement = container.querySelector('.movie-title');
    expect(titleElement).toHaveTextContent('測試電影 1');
  });
}); 