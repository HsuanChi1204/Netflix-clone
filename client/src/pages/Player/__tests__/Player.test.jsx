import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, useNavigate, useParams } from 'react-router-dom';
import { useLanguage } from '../../../contexts/LanguageContext';
import Player from '../Player';

// Mock modules
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
  useParams: jest.fn(),
}));

jest.mock('../../../contexts/LanguageContext', () => ({
  useLanguage: jest.fn(),
}));

// Mock images
jest.mock('../../../assets/back_arrow_icon.png', () => 'test-file-stub');

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('Player Component', () => {
  const mockNavigate = jest.fn();
  const mockVideoData = {
    results: [
      {
        key: 'test-video-key',
        type: 'Trailer',
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useNavigate.mockReturnValue(mockNavigate);
    useParams.mockReturnValue({ id: '123' });
    useLanguage.mockReturnValue({
      currentLanguage: 'zh-TW',
      t: (key) => ({
        'movie.back': '返回',
        'common.loading': '載入中...',
      }[key]),
    });
    mockFetch.mockResolvedValue({
      json: () => Promise.resolve(mockVideoData),
    });
    // Mock console.error
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore console.error
    console.error.mockRestore();
  });

  const renderWithRouter = () => {
    return render(
      <BrowserRouter>
        <Player />
      </BrowserRouter>
    );
  };

  it('renders loading state initially', () => {
    renderWithRouter();
    expect(screen.getByText('載入中...')).toBeInTheDocument();
  });

  it('renders video player when data is loaded', async () => {
    renderWithRouter();
    
    await waitFor(() => {
      const iframe = screen.getByTitle('YouTube video player');
      expect(iframe).toBeInTheDocument();
      expect(iframe).toHaveAttribute(
        'src',
        expect.stringContaining('test-video-key')
      );
    });
  });

  it('handles back button click', () => {
    renderWithRouter();
    
    const backButton = screen.getByAltText('返回');
    fireEvent.click(backButton);
    
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it('updates video when language changes', async () => {
    // First render with Chinese
    renderWithRouter();
    
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.themoviedb.org/3/movie/123/videos?language=zh-TW',
        expect.any(Object)
      );
    });
    
    // Change language to English
    useLanguage.mockReturnValue({
      currentLanguage: 'en-US',
      t: (key) => ({
        'movie.back': 'Back',
        'common.loading': 'Loading...',
      }[key]),
    });
    
    // Re-render
    renderWithRouter();
    
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.themoviedb.org/3/movie/123/videos?language=en-US',
        expect.any(Object)
      );
    });
  });

  it('handles API error gracefully', async () => {
    // Mock API error
    const testError = new Error('API Error');
    mockFetch.mockRejectedValueOnce(testError);
    
    renderWithRouter();
    
    // Should still show loading state
    expect(screen.getByText('載入中...')).toBeInTheDocument();
    
    // Should log error
    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith(testError);
    });
  });

  it('handles empty video results', async () => {
    // Mock empty results
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ results: [] }),
    });
    
    renderWithRouter();
    
    // Should show loading state when no video is available
    await waitFor(() => {
      expect(screen.getByText('載入中...')).toBeInTheDocument();
    });
  });
}); 