import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { render } from '../../../test-utils';
import Navbar from '../Navbar';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

// Mock translations
const mockTranslations = {
  'zh-TW': {
    'nav.home': '首頁',
    'nav.myList': '我的片單',
    'nav.search': '搜尋',
    'nav.logout': '登出',
    'nav.login': '登入',
    'nav.profile': '個人資料'
  },
  'en-US': {
    'nav.home': 'Home',
    'nav.myList': 'My List',
    'nav.search': 'Search',
    'nav.logout': 'Logout',
    'nav.login': 'Login',
    'nav.profile': 'Profile'
  }
};

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
  useLocation: () => ({ pathname: '/' })
}));

// Mock react-toastify
jest.mock('react-toastify', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn()
  }
}));

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

// Mock LanguageContext
jest.mock('../../../contexts/LanguageContext', () => ({
  useLanguage: () => ({
    currentLanguage: 'zh-TW',
    t: (key) => mockTranslations['zh-TW'][key] || key,
    toggleLanguage: jest.fn()
  })
}));

describe('Navbar Component', () => {
  const navigate = jest.fn();
  const mockUser = {
    name: 'Test User',
    email: 'test@example.com'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useNavigate.mockImplementation(() => navigate);
    
    // Setup localStorage mock
    mockLocalStorage.getItem.mockImplementation((key) => {
      if (key === 'user') {
        return JSON.stringify(mockUser);
      }
      if (key === 'token') {
        return 'test-token';
      }
      return null;
    });
  });

  it('renders correctly when user is logged in', () => {
    const { container } = render(<Navbar />);
    expect(screen.getByText('首頁')).toBeInTheDocument();
    expect(screen.getByText('我的片單')).toBeInTheDocument();
    
    const searchContainer = container.querySelector('.search-container');
    expect(searchContainer).toBeInTheDocument();
    
    const profileImg = screen.getByAltText('Test User');
    expect(profileImg).toBeInTheDocument();
  });

  it('renders correctly when user is not logged in', () => {
    mockLocalStorage.getItem.mockImplementation(() => null);
    render(<Navbar />);
    expect(screen.getByText('登入')).toBeInTheDocument();
  });

  it('toggles language correctly', async () => {
    const { container } = render(<Navbar />);
    const languageButton = container.querySelector('.language-button');
    
    fireEvent.click(languageButton);
    
    await waitFor(() => {
      expect(languageButton).toHaveTextContent('EN');
    });
  });

  it('handles search with empty query', () => {
    const { container } = render(<Navbar />);
    const searchButton = container.querySelector('.search-icon');
    fireEvent.click(searchButton);
    
    const searchForm = container.querySelector('.search-form');
    fireEvent.submit(searchForm);
    
    expect(toast.error).toHaveBeenCalled();
  });

  it('handles search with valid query', () => {
    const { container } = render(<Navbar />);
    const searchButton = container.querySelector('.search-icon');
    fireEvent.click(searchButton);
    
    const searchInput = screen.getByPlaceholderText(/搜尋/i);
    fireEvent.change(searchInput, { target: { value: 'test movie' } });
    fireEvent.submit(container.querySelector('.search-form'));
    
    expect(navigate).toHaveBeenCalledWith('/search?q=test%20movie');
  });

  it('handles logout correctly', async () => {
    render(<Navbar />);
    const profileImg = screen.getByAltText('Test User');
    fireEvent.click(profileImg);
    
    const logoutButton = screen.getByText('登出');
    fireEvent.click(logoutButton);
    
    await waitFor(() => {
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('user');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('token');
      expect(navigate).toHaveBeenCalledWith('/login');
    });
  });

  it('handles profile menu toggle', () => {
    render(<Navbar />);
    const profileImg = screen.getByAltText('Test User');
    
    fireEvent.click(profileImg);
    expect(screen.getByText('登出')).toBeVisible();
    
    fireEvent.click(profileImg);
    expect(screen.queryByText('登出')).not.toBeVisible();
  });

  it('navigates to my list when clicked', () => {
    render(<Navbar />);
    const myListLink = screen.getByText('我的片單');
    fireEvent.click(myListLink);
    expect(navigate).toHaveBeenCalledWith('/my-list');
  });

  it('handles search input focus and blur', () => {
    const { container } = render(<Navbar />);
    const searchButton = container.querySelector('.search-icon');
    fireEvent.click(searchButton);
    
    const searchInput = screen.getByPlaceholderText(/搜尋/i);
    fireEvent.focus(searchInput);
    expect(container.querySelector('.search-container')).toHaveClass('focused');
    
    fireEvent.blur(searchInput);
    expect(container.querySelector('.search-container')).not.toHaveClass('focused');
  });
}); 