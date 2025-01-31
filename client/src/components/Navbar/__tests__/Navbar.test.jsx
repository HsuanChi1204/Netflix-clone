import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Navbar from '../Navbar';
import { LanguageContext } from '../../../contexts/LanguageContext';
import { AuthContext } from '../../../contexts/AuthContext';

// Mock translations
const mockTranslations = {
  'navbar.home': '首頁',
  'navbar.myList': '我的片單',
  'navbar.search': '搜尋',
  'auth.logout': '登出',
  'navbar.tvShows': '電視節目',
  'navbar.movies': '電影',
  'navbar.trending': '熱門',
  'navbar.browseByLanguage': '依語言瀏覽'
};

jest.mock('../../../contexts/LanguageContext', () => ({
  LanguageContext: {
    Provider: ({ children, value }) => (
      <div data-testid="language-provider">{children}</div>
    )
  },
  useLanguage: () => mockLanguageContext
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  Link: ({ children, to, className }) => (
    <a href={to} className={className} data-testid={`nav-link-${to.replace('/', '')}`}>
      {children}
    </a>
  ),
  useLocation: () => ({ pathname: '/' })
}));

const mockAuthContext = {
  isAuthenticated: true,
  user: { id: 'test-user' },
  token: 'test-token',
  logout: jest.fn()
};

const mockLanguageContext = {
  currentLanguage: 'zh-TW',
  t: (key) => mockTranslations[key] || key,
  toggleLanguage: jest.fn()
};

jest.mock('../../../contexts/AuthContext', () => ({
  AuthContext: {
    Provider: ({ children, value }) => (
      <div data-testid="auth-provider">{children}</div>
    )
  },
  useAuth: () => mockAuthContext
}));

describe('Navbar Component', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('token', 'test-token');
  });

  afterEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  const renderNavbar = () => {
    return render(
      <BrowserRouter>
        <LanguageContext.Provider value={mockLanguageContext}>
          <AuthContext.Provider value={mockAuthContext}>
            <Navbar />
          </AuthContext.Provider>
        </LanguageContext.Provider>
      </BrowserRouter>
    );
  };

  it('renders navigation links', () => {
    renderNavbar();
    expect(screen.getByText(mockTranslations['navbar.home'])).toBeInTheDocument();
    expect(screen.getByText(mockTranslations['navbar.myList'])).toBeInTheDocument();
    expect(screen.getByTestId('search-button')).toBeInTheDocument();
  });

  it('handles navigation correctly', async () => {
    renderNavbar();
    
    const homeLink = screen.getByTestId('nav-home');
    fireEvent.click(homeLink);
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    const myListLink = screen.getByTestId('nav-link-my-list');
    fireEvent.click(myListLink);
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/my-list');
    });

    const searchButton = screen.getByTestId('search-button');
    fireEvent.click(searchButton);
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/search');
    });
  });

  it('handles logout', () => {
    renderNavbar();
    
    fireEvent.click(screen.getByText('登出'));
    expect(localStorage.getItem('token')).toBeNull();
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });
}); 