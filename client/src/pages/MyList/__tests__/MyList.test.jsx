import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import MyList from '../MyList';

// Mock translations
const mockTranslations = {
  'common.loading': 'Loading...',
  'common.error': 'An error occurred',
  'auth.sessionExpired': 'Session expired',
  'movie.removedFromList': 'Removed from list',
  'movie.trailerNotFound': 'Trailer not found',
  'movie.trailerError': 'Failed to get trailer',
  'movie.learnMore': 'Learn More',
  'movie.removeFromFavorites': 'Remove from Favorites'
};

// Mock modules
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn()
}));

jest.mock('axios');

jest.mock('react-toastify', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
    warning: jest.fn()
  }
}));

// Mock LanguageContext
jest.mock('../../../contexts/LanguageContext', () => ({
  useLanguage: () => ({
    t: (key) => mockTranslations[key] || key,
    currentLanguage: 'en-US'
  })
}));

describe('MyList Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('token', 'mock-token');
  });

  it('should show loading state initially', () => {
    axios.get.mockImplementationOnce(() => new Promise(() => {}));
    render(
      <BrowserRouter>
        <MyList />
      </BrowserRouter>
    );
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should handle API error and show error message', async () => {
    const error = new Error('API Error');
    error.response = { status: 500 };
    axios.get.mockRejectedValueOnce(error);

    render(
      <BrowserRouter>
        <MyList />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('An error occurred');
    });
  });

  it('should handle session expiration', async () => {
    const error = new Error('Unauthorized');
    error.response = { status: 401 };
    axios.get.mockRejectedValueOnce(error);

    const navigate = jest.fn();
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockReturnValue(navigate);

    render(
      <BrowserRouter>
        <MyList />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Session expired');
      expect(navigate).toHaveBeenCalledWith('/login');
    });
  });

  it('should handle successful favorite removal', async () => {
    const mockFavorites = [
      { movieId: 1, title: 'Test Movie' }
    ];
    
    axios.get.mockResolvedValueOnce({ data: mockFavorites });
    axios.delete.mockResolvedValueOnce({});

    render(
      <BrowserRouter>
        <MyList />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Movie')).toBeInTheDocument();
    });

    const removeButton = screen.getByRole('button', { name: 'Remove from Favorites' });
    fireEvent.click(removeButton);

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Removed from list');
      expect(axios.delete).toHaveBeenCalledWith('http://localhost:5001/api/favorites/1');
    });
  });
}); 