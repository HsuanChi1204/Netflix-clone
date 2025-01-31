import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Home from '../Home';
import '@testing-library/jest-dom';
import { LanguageContext } from '../../../contexts/LanguageContext';
import { AuthContext } from '../../../contexts/AuthContext';

// Mock images
jest.mock('../../../assets/hero_banner.jpg', () => 'hero-banner-mock');
jest.mock('../../../assets/hero_title.png', () => 'hero-title-mock');
jest.mock('../../../assets/play_icon.png', () => 'play-icon-mock');
jest.mock('../../../assets/info_icon.png', () => 'info-icon-mock');

// Mock components
jest.mock('../../../components/Navbar/Navbar', () => {
  return function MockNavbar() {
    return <div data-testid="mock-navbar">Navbar</div>;
  };
});

jest.mock('../../../components/Footer/Footer', () => {
  return function MockFooter() {
    return <div data-testid="mock-footer">Footer</div>;
  };
});

jest.mock('../../../components/TitleCards/TitleCards', () => {
  return function MockTitleCards({ category }) {
    return <div data-testid="mock-title-cards">{category}</div>;
  };
});

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

// Mock translations
const mockTranslations = {
  'home.hero.title': '熱門電影',
  'home.hero.description': '觀看最新、最熱門的電影',
  'common.play': '播放',
  'common.moreInfo': '更多資訊',
  'movie.categories.popular': '熱門電影',
  'movie.categories.topRated': '最高評分',
  'movie.categories.upcoming': '即將上映',
  'movie.categories.nowPlaying': '現正熱映'
};

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

describe('Home Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderHome = () => {
    return render(
      <BrowserRouter>
        <LanguageContext.Provider value={mockLanguageContext}>
          <AuthContext.Provider value={mockAuthContext}>
            <Home />
          </AuthContext.Provider>
        </LanguageContext.Provider>
      </BrowserRouter>
    );
  };

  it('renders hero section correctly', () => {
    renderHome();

    expect(screen.getByTestId('hero-section')).toBeInTheDocument();
    expect(screen.getByText(mockTranslations['home.hero.description'])).toBeInTheDocument();
    expect(screen.getByText(mockTranslations['common.play'])).toBeInTheDocument();
    expect(screen.getByText(mockTranslations['common.moreInfo'])).toBeInTheDocument();
  });

  it('navigates to player when play button is clicked', async () => {
    renderHome();
    
    const playButton = screen.getByTestId('play-button');
    fireEvent.click(playButton);
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/player/1');
    });
  });

  it('renders all required components', () => {
    renderHome();

    expect(screen.getByTestId('mock-navbar')).toBeInTheDocument();
    expect(screen.getByTestId('mock-footer')).toBeInTheDocument();
    expect(screen.getAllByTestId('mock-title-cards').length).toBeGreaterThan(0);
  });
}); 