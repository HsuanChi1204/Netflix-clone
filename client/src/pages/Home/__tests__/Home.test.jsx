import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import Home from '../Home';
import { LanguageProvider } from '../../../contexts/LanguageContext';

// Mock the components that are not being tested
jest.mock('../../../components/Navbar/Navbar', () => {
  const DummyNavbar = () => <div data-testid="mock-navbar">Navbar</div>;
  return DummyNavbar;
});

jest.mock('../../../components/Footer/Footer', () => {
  const DummyFooter = () => <div data-testid="mock-footer">Footer</div>;
  return DummyFooter;
});

// Mock TitleCards component
const MockTitleCards = ({ title, category }) => (
  <div data-testid={`mock-titlecards-${category}`}>
    {title} - {category}
  </div>
);

MockTitleCards.propTypes = {
  title: PropTypes.string.isRequired,
  category: PropTypes.string.isRequired,
};

jest.mock('../../../components/TitleCards/TitleCards', () => {
  return function MockTitleCards({ title, category }) {
    return (
      <div data-testid={`mock-titlecards-${category}`}>
        {title} - {category}
      </div>
    );
  };
});

// Mock images
jest.mock('../../../assets/hero_banner.jpg', () => 'hero-banner-path');
jest.mock('../../../assets/hero_title.png', () => 'hero-title-path');
jest.mock('../../../assets/play_icon.png', () => 'play-icon-path');
jest.mock('../../../assets/info_icon.png', () => 'info-icon-path');

describe('Home Component', () => {
  const renderWithProviders = (component) => {
    return render(
      <BrowserRouter>
        <LanguageProvider>
          {component}
        </LanguageProvider>
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the home page with all components', () => {
    const { container } = renderWithProviders(<Home />);
    
    // Check if Navbar is rendered
    expect(screen.getByTestId('mock-navbar')).toBeInTheDocument();
    
    // Check if hero section is rendered
    const bannerImg = container.querySelector('.banner-img');
    expect(bannerImg).toBeInTheDocument();
    expect(bannerImg).toHaveAttribute('src', 'hero-banner-path');
    
    // Check if buttons are rendered
    expect(screen.getByText('Play')).toBeInTheDocument();
    expect(screen.getByText('More Info')).toBeInTheDocument();
    
    // Check if TitleCards sections are rendered
    expect(screen.getByTestId('mock-titlecards-hero')).toBeInTheDocument();
    expect(screen.getByTestId('mock-titlecards-top_rated')).toBeInTheDocument();
    expect(screen.getByTestId('mock-titlecards-popular')).toBeInTheDocument();
    expect(screen.getByTestId('mock-titlecards-upcoming')).toBeInTheDocument();
    expect(screen.getByTestId('mock-titlecards-now_playing')).toBeInTheDocument();
    
    // Check if Footer is rendered
    expect(screen.getByTestId('mock-footer')).toBeInTheDocument();
  });

  it('displays translated movie categories', () => {
    renderWithProviders(<Home />);
    
    // Check if movie category titles are translated
    expect(screen.getByTestId('mock-titlecards-top_rated')).toHaveTextContent('最高評分 - top_rated');
    expect(screen.getByTestId('mock-titlecards-popular')).toHaveTextContent('Netflix 獨家 - popular');
    expect(screen.getByTestId('mock-titlecards-upcoming')).toHaveTextContent('即將上映 - upcoming');
    expect(screen.getByTestId('mock-titlecards-now_playing')).toHaveTextContent('為您推薦 - now_playing');
  });

  it('renders hero section with correct content', () => {
    renderWithProviders(<Home />);
    
    // Check hero section content
    expect(screen.getByText(/Displaying his ties to a secret ancient order/)).toBeInTheDocument();
    
    // Check hero buttons
    const playButton = screen.getByText('Play').closest('button');
    const moreInfoButton = screen.getByText('More Info').closest('button');
    
    expect(playButton).toHaveClass('btn');
    expect(moreInfoButton).toHaveClass('btn', 'dark-btn');
  });
}); 