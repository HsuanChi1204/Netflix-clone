import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { AuthWrapper } from '../AuthWrapper';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn()
}));

// Mock axios
jest.mock('axios');

describe('AuthWrapper Component', () => {
  const navigate = jest.fn();
  const mockChildren = <div>Test Children</div>;

  beforeEach(() => {
    jest.clearAllMocks();
    useNavigate.mockImplementation(() => navigate);
    
    // Reset localStorage
    localStorage.clear();
    
    // Reset axios defaults
    delete axios.defaults.headers.common['Authorization'];
  });

  it('redirects to login when no token exists', async () => {
    render(<AuthWrapper>{mockChildren}</AuthWrapper>);
    
    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith('/login');
    });
  });

  it('removes token and redirects to login when API call fails', async () => {
    // Setup localStorage with invalid token
    localStorage.setItem('token', 'invalid-token');
    localStorage.setItem('user', JSON.stringify({ name: 'Test User' }));
    
    // Mock failed API call
    axios.get.mockRejectedValueOnce(new Error('Invalid token'));
    
    render(<AuthWrapper>{mockChildren}</AuthWrapper>);
    
    await waitFor(() => {
      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
      expect(navigate).toHaveBeenCalledWith('/login');
    });
  });

  it('sets authorization header and renders children when token is valid', async () => {
    // Setup localStorage with valid token
    const validToken = 'valid-token';
    localStorage.setItem('token', validToken);
    
    // Mock successful API call
    axios.get.mockResolvedValueOnce({ data: { name: 'Test User' } });
    
    const { getByText } = render(<AuthWrapper>{mockChildren}</AuthWrapper>);
    
    await waitFor(() => {
      expect(axios.defaults.headers.common['Authorization']).toBe(`Bearer ${validToken}`);
      expect(getByText('Test Children')).toBeInTheDocument();
    });
  });
}); 