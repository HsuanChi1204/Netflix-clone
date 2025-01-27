import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import TitleCards from '../TitleCards';
import { LanguageProvider } from '../../../contexts/LanguageContext';
import fetchMock from 'jest-fetch-mock';
import { useLanguage } from '../../../contexts/LanguageContext';

// Enable fetch mocking
fetchMock.enableMocks();

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
  Link: ({ children, to }) => <a href={to}>{children}</a>
}));

// Mock axios
jest.mock('axios');

// Mock react-toastify
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn()
  }
}));

const mockMovies = [
  {
    id: 1,
    title: 'Test Movie 1',
    backdrop_path: '/test1.jpg'
  },
  {
    id: 2,
    title: 'Test Movie 2',
    backdrop_path: '/test2.jpg'
  }
];

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

const mockMovieDetailsEn = {
  id: 1,
  title: 'Test Movie 1',
  overview: 'Test movie description',
  backdrop_path: '/test1.jpg',
  vote_average: 8.5,
  vote_count: 100,
  release_date: '2024-01-01',
  comments: []
};

const mockMovieDetailsZh = {
  id: 1,
  title: '測試電影 1',
  overview: '測試電影描述',
  backdrop_path: '/test1.jpg',
  vote_average: 8.5,
  vote_count: 100,
  release_date: '2024-01-01',
  comments: []
};

const mockTrailer = {
  results: [
    {
      key: 'test-trailer-key',
      type: 'Trailer'
    }
  ]
};

describe('TitleCards Component', () => {
  const navigate = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    useNavigate.mockImplementation(() => navigate);
    fetchMock.resetMocks();
    
    // Reset localStorage
    localStorage.clear();
    
    // Mock successful API responses
    axios.get.mockImplementation((url) => {
      if (url.includes('/api/favorites/check/')) {
        return Promise.resolve({ data: { isFavorite: false } });
      }
      if (url.includes('api.themoviedb.org/3/movie') && url.includes('/videos')) {
        return Promise.resolve({ data: mockTrailer });
      }
      if (url.includes('api.themoviedb.org/3/movie') && !url.includes('/videos')) {
        return Promise.resolve({ data: mockMovieDetails });
      }
      if (url.includes('api.themoviedb.org')) {
        return Promise.resolve({ data: { results: mockMovies } });
      }
      return Promise.resolve({ data: mockMovies });
    });

    // Mock fetch responses
    fetchMock.mockResponseOnce(JSON.stringify({ results: mockMovies }));
  });

  it('renders movie cards correctly', async () => {
    const { getByText, container } = render(
      <LanguageProvider>
        <TitleCards title="Test Category" category="popular" />
      </LanguageProvider>
    );

    // 檢查標題是否正確渲染
    expect(getByText('Test Category')).toBeInTheDocument();

    // 等待電影卡片渲染
    await waitFor(() => {
      const movieCards = container.querySelectorAll('.card');
      expect(movieCards.length).toBe(mockMovies.length);
      expect(getByText('Test Movie 1')).toBeInTheDocument();
      expect(getByText('Test Movie 2')).toBeInTheDocument();
    });
  });

  it('handles favorite toggle correctly when logged in', async () => {
    // 模擬用戶已登入
    localStorage.setItem('token', 'test-token');
    
    const { container } = render(
      <LanguageProvider>
        <TitleCards title="Test Category" category="popular" />
      </LanguageProvider>
    );

    await waitFor(() => {
      const favoriteButtons = container.querySelectorAll('.favorite-button');
      expect(favoriteButtons.length).toBe(mockMovies.length);
    });

    // 模擬添加收藏
    axios.post.mockResolvedValueOnce({ data: { message: 'Added to favorites' } });
    const favoriteButtons = container.querySelectorAll('.favorite-button');
    fireEvent.click(favoriteButtons[0]);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        '/api/favorites',
        expect.any(Object),
        expect.any(Object)
      );
      expect(toast.success).toHaveBeenCalled();
    });

    // 模擬移除收藏
    axios.delete.mockResolvedValueOnce({ data: { message: 'Removed from favorites' } });
    fireEvent.click(favoriteButtons[0]);

    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalled();
    });
  });

  it('redirects to login when trying to favorite while logged out', async () => {
    const { container } = render(
      <LanguageProvider>
        <TitleCards title="Test Category" category="popular" />
      </LanguageProvider>
    );

    await waitFor(() => {
      const favoriteButtons = container.querySelectorAll('.favorite-button');
      expect(favoriteButtons.length).toBe(mockMovies.length);
      fireEvent.click(favoriteButtons[0]);
    });

    expect(toast.error).toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith('/login');
  });

  describe('Movie Details Functionality', () => {
    it('shows movie details when info button is clicked', async () => {
      const { container, getByText, getAllByText } = render(
        <LanguageProvider>
          <TitleCards title="Test Category" category="popular" />
        </LanguageProvider>
      );

      // 等待卡片渲染
      await waitFor(() => {
        expect(container.querySelectorAll('.card').length).toBe(mockMovies.length);
      });

      // 點擊資訊按鈕
      const infoButtons = container.querySelectorAll('.info-button');
      fireEvent.click(infoButtons[0]);

      // 驗證詳情內容
      await waitFor(() => {
        const movieModal = container.querySelector('.movie-modal');
        expect(movieModal).toBeInTheDocument();
        expect(getByText(mockMovieDetails.overview)).toBeInTheDocument();
      });
    });

    it('loads and displays trailer when movie details are opened', async () => {
      const { container } = render(
        <LanguageProvider>
          <TitleCards title="Test Category" category="popular" />
        </LanguageProvider>
      );

      // 等待卡片渲染
      await waitFor(() => {
        expect(container.querySelectorAll('.card').length).toBe(mockMovies.length);
      });

      // 點擊資訊按鈕
      const infoButtons = container.querySelectorAll('.info-button');
      fireEvent.click(infoButtons[0]);

      // 驗證預告片載入
      await waitFor(() => {
        const iframe = container.querySelector('iframe');
        expect(iframe).toBeInTheDocument();
        expect(iframe.src).toContain(mockTrailer.results[0].key);
      });
    });

    it('closes movie details modal when close button is clicked', async () => {
      const { container, getByText, queryByText } = render(
        <LanguageProvider>
          <TitleCards title="Test Category" category="popular" />
        </LanguageProvider>
      );

      // 等待卡片渲染
      await waitFor(() => {
        expect(container.querySelectorAll('.card').length).toBe(mockMovies.length);
      });

      // 點擊資訊按鈕
      const infoButtons = container.querySelectorAll('.info-button');
      fireEvent.click(infoButtons[0]);

      // 等待詳情顯示
      await waitFor(() => {
        const movieModal = container.querySelector('.movie-modal');
        expect(movieModal).toBeInTheDocument();
      });

      // 點擊關閉按鈕
      const closeButton = container.querySelector('.modal-close');
      fireEvent.click(closeButton);

      // 驗證詳情已關閉
      await waitFor(() => {
        const movieModal = container.querySelector('.movie-modal');
        expect(movieModal).not.toBeInTheDocument();
      });
    });
  });

  describe('Comments Functionality', () => {
    const mockComments = [
      {
        _id: '1',
        content: 'Great movie!',
        rating: 5,
        user: {
          name: 'Test User'
        },
        createdAt: '2024-01-01T00:00:00.000Z'
      }
    ];

    beforeEach(() => {
      axios.get.mockImplementation((url) => {
        if (url.includes('/api/comments/')) {
          return Promise.resolve({ data: mockComments });
        }
        if (url.includes('api.themoviedb.org/3/movie') && url.includes('/videos')) {
          return Promise.resolve({ data: mockTrailer });
        }
        if (url.includes('api.themoviedb.org/3/movie') && !url.includes('/videos')) {
          return Promise.resolve({ data: mockMovieDetails });
        }
        return Promise.resolve({ data: mockMovies });
      });
    });

    it('loads and displays comments when movie details are opened', async () => {
      const { container, getByText } = render(
        <LanguageProvider>
          <TitleCards title="Test Category" category="popular" />
        </LanguageProvider>
      );

      // 等待卡片渲染
      await waitFor(() => {
        expect(container.querySelectorAll('.card').length).toBe(mockMovies.length);
      });

      // 點擊資訊按鈕
      const infoButtons = container.querySelectorAll('.info-button');
      fireEvent.click(infoButtons[0]);

      // 驗證評論內容
      await waitFor(() => {
        const movieModal = container.querySelector('.movie-modal');
        expect(movieModal).toBeInTheDocument();
        const commentsList = container.querySelector('.comments-list');
        expect(commentsList).toBeInTheDocument();
        expect(commentsList.textContent).toContain('Great movie!');
      });
    });

    it('handles comment submission correctly when logged in', async () => {
      localStorage.setItem('token', 'test-token');
      
      const { container } = render(
        <LanguageProvider>
          <TitleCards title="Test Category" category="popular" />
        </LanguageProvider>
      );

      // 等待卡片渲染並打開詳情
      await waitFor(() => {
        expect(container.querySelectorAll('.card').length).toBe(mockMovies.length);
      });

      const infoButtons = container.querySelectorAll('.info-button');
      fireEvent.click(infoButtons[0]);

      await waitFor(() => {
        const movieModal = container.querySelector('.movie-modal');
        expect(movieModal).toBeInTheDocument();
      });

      // 模擬評分
      const stars = container.querySelectorAll('.star-icon');
      fireEvent.click(stars[4]); // 5星評分

      // 輸入評論
      const commentInput = container.querySelector('textarea');
      fireEvent.change(commentInput, { target: { value: 'New test comment' } });

      // 模擬提交評論
      axios.post.mockResolvedValueOnce({
        data: {
          _id: '2',
          content: 'New test comment',
          rating: 5,
          user: {
            name: 'Test User'
          },
          createdAt: new Date().toISOString()
        }
      });

      const form = container.querySelector('form');
      fireEvent.submit(form);

      // 驗證評論提交
      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith(
          '/api/comments',
          {
            movieId: mockMovieDetails.id.toString(),
            content: 'New test comment',
            rating: 5
          },
          expect.any(Object)
        );
        expect(toast.success).toHaveBeenCalled();
      });
    });

    it('redirects to login when trying to comment while logged out', async () => {
      const { container } = render(
        <LanguageProvider>
          <TitleCards title="Test Category" category="popular" />
        </LanguageProvider>
      );

      // 等待卡片渲染並打開詳情
      await waitFor(() => {
        expect(container.querySelectorAll('.card').length).toBe(mockMovies.length);
      });

      const infoButtons = container.querySelectorAll('.info-button');
      fireEvent.click(infoButtons[0]);

      await waitFor(() => {
        const movieModal = container.querySelector('.movie-modal');
        expect(movieModal).toBeInTheDocument();
      });

      // 嘗試提交評論
      const commentInput = container.querySelector('textarea');
      fireEvent.change(commentInput, { target: { value: 'Test comment' } });

      const form = container.querySelector('form');
      fireEvent.submit(form);

      // 驗證重定向到登入頁面
      expect(toast.error).toHaveBeenCalled();
      expect(navigate).toHaveBeenCalledWith('/login');
    });
  });

  describe('Scroll Functionality', () => {
    it('handles horizontal scroll correctly', async () => {
      const { container } = render(
        <LanguageProvider>
          <TitleCards title="Test Category" category="popular" />
        </LanguageProvider>
      );

      // 等待卡片渲染
      await waitFor(() => {
        expect(container.querySelectorAll('.card').length).toBe(mockMovies.length);
      });

      const cardList = container.querySelector('.card-list');
      expect(cardList).toBeInTheDocument();

      // 初始滾動位置應該是 0
      expect(cardList.scrollLeft).toBe(0);

      // 模擬滾輪事件
      fireEvent.wheel(cardList, { deltaY: 100 });

      // 驗證滾動位置有變化
      expect(cardList.scrollLeft).toBe(100);
    });

    it('loads more movies when scrolling to the end', async () => {
      // 模擬更多電影數據
      const moreMovies = [
        {
          id: 3,
          title: 'Test Movie 3',
          backdrop_path: '/test3.jpg'
        },
        {
          id: 4,
          title: 'Test Movie 4',
          backdrop_path: '/test4.jpg'
        }
      ];

      // Mock fetch API response
      global.fetch = jest.fn().mockImplementation((url) => {
        if (url.includes('page=1')) {
          return Promise.resolve({
            json: () => Promise.resolve({
              results: mockMovies,
              page: 1,
              total_pages: 2
            })
          });
        } else if (url.includes('page=2')) {
          return Promise.resolve({
            json: () => Promise.resolve({
              results: moreMovies,
              page: 2,
              total_pages: 2
            })
          });
        }
        return Promise.resolve({ json: () => Promise.resolve({ results: [] }) });
      });

      const { container } = render(
        <LanguageProvider>
          <TitleCards title="Test Category" category="popular" />
        </LanguageProvider>
      );

      // 等待初始卡片渲染
      await waitFor(() => {
        expect(container.querySelectorAll('.card').length).toBe(mockMovies.length);
      });

      const cardList = container.querySelector('.card-list');
      
      // 模擬滾動到底部
      Object.defineProperty(cardList, 'scrollLeft', { 
        value: cardList.scrollWidth - cardList.clientWidth,
        configurable: true,
        writable: true 
      });
      Object.defineProperty(cardList, 'scrollWidth', { 
        value: cardList.clientWidth * 2,
        configurable: true,
        writable: true 
      });
      Object.defineProperty(cardList, 'clientWidth', { 
        value: 500,
        configurable: true,
        writable: true 
      });
      
      // 觸發滾動事件
      fireEvent.scroll(cardList);

      // 等待加載更多電影
      await waitFor(() => {
        const cards = container.querySelectorAll('.card');
        expect(cards.length).toBe(mockMovies.length + moreMovies.length);
        expect(container.textContent).toContain('Test Movie 3');
        expect(container.textContent).toContain('Test Movie 4');
      }, { timeout: 3000 });
    });

    it('maintains scroll position when window is resized', async () => {
      const { container } = render(
        <LanguageProvider>
          <TitleCards title="Test Category" category="popular" />
        </LanguageProvider>
      );

      // 等待卡片渲染
      await waitFor(() => {
        expect(container.querySelectorAll('.card').length).toBe(mockMovies.length);
      });

      const cardList = container.querySelector('.card-list');
      
      // 設置初始滾動位置
      Object.defineProperty(cardList, 'scrollLeft', { value: 100 });
      
      // 模擬視窗大小改變
      fireEvent(window, new Event('resize'));

      // 驗證滾動位置保持不變
      expect(cardList.scrollLeft).toBe(100);
    });
  });

  describe('Language Support', () => {
    beforeEach(() => {
      localStorage.setItem('language', 'zh-TW');
      
      global.fetch = jest.fn((url) => {
        const isEnglish = url.includes('language=en-US');
        const movies = isEnglish ? [
          { id: 1, title: 'Test Movie 1', backdrop_path: '/test1.jpg' }
        ] : [
          { id: 1, title: '測試電影 1', backdrop_path: '/test1.jpg' }
        ];
        
        return Promise.resolve({
          json: () => Promise.resolve({
            results: movies,
            page: 1,
            total_pages: 2
          })
        });
      });

      axios.get.mockImplementation((url) => {
        if (url.includes('/movie/1')) {
          const isEnglish = url.includes('language=en-US');
          return Promise.resolve({ data: isEnglish ? mockMovieDetailsEn : mockMovieDetailsZh });
        }
        return Promise.resolve({ data: [] });
      });
    });

    const TestWrapper = ({ children }) => {
      const { toggleLanguage } = useLanguage();
      return (
        <div>
          <button onClick={toggleLanguage} data-testid="language-toggle">
            Toggle Language
          </button>
          {children}
        </div>
      );
    };

    it('displays content in Chinese by default', async () => {
      const { getByText } = render(
        <LanguageProvider>
          <TitleCards category="popular" />
        </LanguageProvider>
      );

      await waitFor(() => {
        expect(getByText('測試電影 1')).toBeInTheDocument();
      });
    });

    it('updates content when language is changed', async () => {
      const { getByText, getByTestId } = render(
        <LanguageProvider>
          <TestWrapper>
            <TitleCards category="popular" />
          </TestWrapper>
        </LanguageProvider>
      );

      // 等待中文內容渲染
      await waitFor(() => {
        expect(getByText('測試電影 1')).toBeInTheDocument();
      });

      // 使用測試按鈕切換語言
      fireEvent.click(getByTestId('language-toggle'));

      // 等待英文內容渲染
      await waitFor(() => {
        expect(getByText('Test Movie 1')).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('displays movie details in correct language', async () => {
      const { getByText, getByTestId, container } = render(
        <LanguageProvider>
          <TestWrapper>
            <TitleCards category="popular" />
          </TestWrapper>
        </LanguageProvider>
      );

      // 等待電影卡片渲染
      await waitFor(() => {
        expect(getByText('測試電影 1')).toBeInTheDocument();
      });

      // 點擊資訊按鈕
      const infoButton = container.querySelector('.info-button');
      fireEvent.click(infoButton);

      // 驗證中文詳情內容
      await waitFor(() => {
        expect(getByText('測試電影描述')).toBeInTheDocument();
      });

      // 使用測試按鈕切換語言
      fireEvent.click(getByTestId('language-toggle'));

      // 驗證英文詳情內容
      await waitFor(() => {
        expect(getByText('Test movie description')).toBeInTheDocument();
      });
    });
  });
}); 