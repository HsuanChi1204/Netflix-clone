import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react';
import { useNavigate, useParams } from 'react-router-dom';
import Player from '../Player';
import { LanguageProvider } from '../../../contexts/LanguageContext';
import fetchMock from 'jest-fetch-mock';
import { useLanguage } from '../../../contexts/LanguageContext';

// Enable fetch mocking
fetchMock.enableMocks();

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
  useParams: jest.fn()
}));

const mockTrailer = {
  results: [
    {
      key: 'test-trailer-key',
      type: 'Trailer'
    }
  ]
};

describe('Player Component', () => {
  const navigate = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    useNavigate.mockImplementation(() => navigate);
    useParams.mockImplementation(() => ({ id: '123' }));
    fetchMock.resetMocks();
    
    // Mock successful API response
    fetchMock.mockResponse(JSON.stringify(mockTrailer));

    // Reset localStorage
    localStorage.clear();
    localStorage.setItem('language', 'zh-TW');
  });

  it('renders loading state initially', () => {
    const { getByText } = render(
      <LanguageProvider>
        <Player />
      </LanguageProvider>
    );
    
    expect(getByText('載入中...')).toBeInTheDocument();
  });

  it('loads and displays trailer when available', async () => {
    const { container } = render(
      <LanguageProvider>
        <Player />
      </LanguageProvider>
    );

    await waitFor(() => {
      const iframe = container.querySelector('iframe');
      expect(iframe).toBeInTheDocument();
      expect(iframe.src).toContain('test-trailer-key');
    });
  });

  it('navigates back when back button is clicked', () => {
    const { container } = render(
      <LanguageProvider>
        <Player />
      </LanguageProvider>
    );

    const backButton = container.querySelector('.back');
    fireEvent.click(backButton);

    expect(navigate).toHaveBeenCalledWith(-1);
  });

  it('updates trailer based on language change', async () => {
    const TestComponent = () => {
      const { currentLanguage, toggleLanguage } = useLanguage();
      return (
        <div>
          <button onClick={toggleLanguage} data-testid="language-toggle">
            {currentLanguage}
          </button>
          <Player />
        </div>
      );
    };

    const { getByTestId, container } = render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );

    // 等待初始預告片載入
    await waitFor(() => {
      const iframe = container.querySelector('iframe');
      expect(iframe).toBeInTheDocument();
    });

    // 切換語言前重置 mock
    fetchMock.resetMocks();
    fetchMock.mockResponse(JSON.stringify({
      ...mockTrailer,
      results: [
        {
          key: 'test-trailer-key-en',
          type: 'Trailer'
        }
      ]
    }));

    // 切換語言
    await act(async () => {
      fireEvent.click(getByTestId('language-toggle'));
    });

    // 驗證是否重新獲取預告片
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
      const lastCall = fetchMock.mock.calls[fetchMock.mock.calls.length - 1][0];
      expect(lastCall).toContain('language=en-US');
    });

    // 驗證預告片是否更新
    await waitFor(() => {
      const iframe = container.querySelector('iframe');
      expect(iframe.src).toContain('test-trailer-key-en');
    });
  });
}); 