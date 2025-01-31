/* eslint-disable no-unused-vars */
import React from 'react';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AuthWrapper from '../AuthWrapper';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn()
}));

// Mock axios
jest.mock('axios');

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

describe('AuthWrapper Component', () => {
  const mockNavigate = jest.fn();
  const mockChildren = <div>Test Children</div>;

  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
    });
    useNavigate.mockImplementation(() => mockNavigate);
    
    // Reset localStorage
    mockLocalStorage.clear();
    
    // Reset axios defaults
    delete axios.defaults.headers.common['Authorization'];
  });

  it('should redirect to login if no token in localStorage', async () => {
    mockLocalStorage.getItem.mockReturnValue(null);
    render(<AuthWrapper>{mockChildren}</AuthWrapper>, { wrapper: BrowserRouter });
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  it('should render children if token exists in localStorage', async () => {
    mockLocalStorage.getItem.mockReturnValue('valid-token');
    axios.get.mockResolvedValueOnce({ data: { name: 'Test User' } });
    
    const { container } = render(
      <AuthWrapper>
        <div data-testid="test-child">Test Child</div>
      </AuthWrapper>,
      { wrapper: BrowserRouter }
    );
    
    await waitFor(() => {
      expect(screen.getByTestId('test-child')).toBeInTheDocument();
      expect(container).toBeInTheDocument();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  it('should handle API error correctly', async () => {
    mockLocalStorage.getItem.mockReturnValue('invalid-token');
    axios.get.mockRejectedValueOnce(new Error('Invalid token'));
    
    render(<AuthWrapper>{mockChildren}</AuthWrapper>, { wrapper: BrowserRouter });
    
    await waitFor(() => {
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('token');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('user');
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  it('sets authorization header when token is valid', async () => {
    const validToken = 'valid-token';
    mockLocalStorage.getItem.mockReturnValue(validToken);
    axios.get.mockResolvedValueOnce({ data: { name: 'Test User' } });
    
    render(<AuthWrapper>{mockChildren}</AuthWrapper>);
    
    await waitFor(() => {
      expect(axios.defaults.headers.common['Authorization']).toBe(`Bearer ${validToken}`);
      expect(screen.getByText('Test Children')).toBeInTheDocument();
    });
  });
}); 