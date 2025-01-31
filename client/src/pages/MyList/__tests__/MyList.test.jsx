import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import MyList from '../MyList';
import { LanguageContext } from '../../../contexts/LanguageContext';
import { AuthContext } from '../../../contexts/AuthContext';

// Mock translations
const mockTranslations = {
  'common.loading': 'Loading...',
  'common.error': 'An error occurred',
  'auth.sessionExpired': 'Session expired',
  'movie.removedFromList': '收藏已移除',
  'movie.trailerNotFound': 'Trailer not found',
  'movie.trailerError': 'Failed to get trailer',
  'movie.learnMore': 'Learn More',
  'movie.removeFromFavorites': 'Remove from Favorites'
};

// Mock modules
jest.mock('react-toastify');
jest.mock('axios');

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  Link: ({ children, to }) => <a href={to} data-testid="movie-link">{children}</a>
}));

const mockLanguageContext = {
  currentLanguage: 'zh-TW',
  t: (key) => mockTranslations[key] || key,
  toggleLanguage: jest.fn()
};

const mockAuthContext = {
  isAuthenticated: true,
  user: { id: 'test-user' },
  token: 'test-token',
  logout: jest.fn()
};

jest.mock('../../../contexts/LanguageContext', () => ({
  LanguageContext: {
    Provider: ({ children, value }) => (
      <div data-testid="language-provider">{children}</div>
    )
  },
  useLanguage: () => mockLanguageContext
}));

jest.mock('../../../contexts/AuthContext', () => ({
  AuthContext: {
    Provider: ({ children, value }) => (
      <div data-testid="auth-provider">{children}</div>
    )
  },
  useAuth: () => mockAuthContext
}));

const mockFavorites = [
  {
    movieId: 1,
    title: 'Test Movie',
    overview: 'Test Overview',
    poster_path: '/test.jpg'
  }
];

describe('MyList Component', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('token', 'test-token');
    jest.clearAllMocks();
    
    // Mock successful API responses
    axios.get.mockImplementation((url) => {
      if (url.includes('/api/favorites')) {
        return Promise.resolve({ data: mockFavorites });
      }
      return Promise.resolve({ data: {} });
    });

    axios.delete.mockImplementation((url) => {
      if (url.includes('/api/favorites/')) {
        return Promise.resolve({ data: { success: true } });
      }
      return Promise.reject(new Error('Not found'));
    });
  });

  const renderMyList = () => {
    return render(
      <BrowserRouter>
        <LanguageContext.Provider value={mockLanguageContext}>
          <AuthContext.Provider value={mockAuthContext}>
            <MyList />
          </AuthContext.Provider>
        </LanguageContext.Provider>
      </BrowserRouter>
    );
  };

  it('should show loading state initially', () => {
    axios.get.mockImplementationOnce(() => new Promise(() => {}));
    renderMyList();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should handle API error', async () => {
    const error = { response: { status: 401 } };
    axios.get.mockRejectedValueOnce(error);
    renderMyList();

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Session expired');
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  it('should handle successful favorite removal', async () => {
    axios.delete.mockImplementation(() => Promise.resolve({ data: { success: true } }));
    renderMyList();

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    const favoriteButton = screen.getByTestId('favorite-button');
    fireEvent.click(favoriteButton);

    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalledWith('http://localhost:5001/api/favorites/1');
      expect(toast.success).toHaveBeenCalledWith('收藏已移除');
    });
  });

  it('should navigate to player when movie is clicked', async () => {
    renderMyList();
    
    const movieLink = screen.getByTestId('movie-link-1');
    fireEvent.click(movieLink);
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/player/1');
    });
  });
}); 