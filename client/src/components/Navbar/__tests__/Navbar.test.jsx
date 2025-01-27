import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import { render } from '../../../test-utils';
import Navbar from '../Navbar';
import { useNavigate } from 'react-router-dom';

// Mock react-router-dom's useNavigate
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
  useLocation: () => ({ pathname: '/' })
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

describe('Navbar Component', () => {
  const navigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useNavigate.mockImplementation(() => navigate);
    
    // Setup localStorage mock
    mockLocalStorage.getItem.mockImplementation((key) => {
      if (key === 'user') {
        return JSON.stringify({
          name: 'Test User',
          email: 'test@example.com'
        });
      }
      return null;
    });
  });

  it('renders correctly', () => {
    const { container } = render(<Navbar />);
    // 檢查基本導航項目
    expect(screen.getByText('首頁')).toBeInTheDocument();
    expect(screen.getByText('我的片單')).toBeInTheDocument();
    
    // 檢查搜尋按鈕
    const searchContainer = container.querySelector('.search-container');
    expect(searchContainer).toBeInTheDocument();
    const searchButton = searchContainer.querySelector('.search-icon');
    expect(searchButton).toBeInTheDocument();
    
    // 檢查語言切換按鈕
    const languageButton = container.querySelector('.language-button');
    expect(languageButton).toBeInTheDocument();
    expect(languageButton).toHaveTextContent('中文');
  });

  it('toggles language when language button is clicked', () => {
    const { container } = render(<Navbar />);
    const languageButton = container.querySelector('.language-button');
    fireEvent.click(languageButton);
    expect(languageButton).toHaveTextContent('EN');
  });

  it('handles search functionality', () => {
    const { container } = render(<Navbar />);
    const searchButton = container.querySelector('.search-icon');
    fireEvent.click(searchButton);
    
    const searchInput = screen.getByPlaceholderText(/搜尋/i);
    fireEvent.change(searchInput, { target: { value: 'test movie' } });
    fireEvent.submit(container.querySelector('.search-form'));
    
    expect(navigate).toHaveBeenCalledWith('/search?q=test%20movie');
  });

  it('handles logout correctly', () => {
    render(<Navbar />);
    const profileImg = screen.getByAltText('Test User');
    fireEvent.click(profileImg);
    const logoutButton = screen.getByText('登出');
    fireEvent.click(logoutButton);
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('user');
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('token');
    expect(navigate).toHaveBeenCalledWith('/login');
  });
}); 