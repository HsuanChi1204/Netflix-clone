import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import Search from '../Search';

// Mock translations
const mockTranslations = {
  'common.loading': '載入中...',
  'search.noResults': '找不到相關結果',
  'search.enterKeyword': '請輸入搜尋關鍵字',
  'common.error': '搜尋時發生錯誤',
  'search.loading': '載入中...'
};

// Mock modules
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  useSearchParams: () => [new URLSearchParams({ q: 'test' }), jest.fn()]
}));

jest.mock('axios');

jest.mock('react-toastify', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn()
  }
}));

// Mock LanguageContext
jest.mock('../../../contexts/LanguageContext', () => ({
  useLanguage: () => ({
    t: (key) => mockTranslations[key] || key,
    currentLanguage: 'zh-TW'
  })
}));

describe('Search Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem('token', 'test-token');
  });

  it('renders loading state', async () => {
    axios.get.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({
        data: {
          results: [{
            id: 1,
            title: '測試電影',
            overview: '測試簡介',
            release_date: '2024-01-01',
            backdrop_path: '/test.jpg'
          }]
        }
      }), 100))
    );

    render(
      <BrowserRouter>
        <Search />
      </BrowserRouter>
    );
    
    expect(screen.getByText('載入中...')).toBeInTheDocument();
  });

  it('displays search results on successful API call', async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        results: [{
          id: 1,
          title: '測試電影',
          overview: '測試簡介',
          release_date: '2024-01-01',
          backdrop_path: '/test.jpg'
        }]
      }
    });

    render(
      <BrowserRouter>
        <Search />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('測試電影')).toBeInTheDocument();
    });
  });

  it('handles API error gracefully', async () => {
    axios.get.mockRejectedValueOnce(new Error('API Error'));

    render(
      <BrowserRouter>
        <Search />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('搜尋時發生錯誤');
    });
  });

  it('shows no results message when API returns empty array', async () => {
    axios.get.mockResolvedValueOnce({ data: { results: [] } });

    render(
      <BrowserRouter>
        <Search />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('找不到相關結果')).toBeInTheDocument();
    });
  });

  it('displays prompt message when no search query', async () => {
    jest.spyOn(require('react-router-dom'), 'useSearchParams')
      .mockReturnValue([new URLSearchParams(), jest.fn()]);

    render(
      <BrowserRouter>
        <Search />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('請輸入搜尋關鍵字')).toBeInTheDocument();
    });
  });
}); 