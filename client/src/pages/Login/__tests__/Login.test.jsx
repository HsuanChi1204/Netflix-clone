import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import Login from '../Login';

// Mock modules
jest.mock('axios');
jest.mock('react-toastify');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

// Mock images
jest.mock('../../../assets/netflix_spinner.gif', () => 'test-file-stub');
jest.mock('../../../assets/logo.png', () => 'test-file-stub');

describe('Login Component', () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    useNavigate.mockReturnValue(mockNavigate);
  });

  const renderWithRouter = () => {
    return render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
  };

  it('renders login form initially', () => {
    renderWithRouter();
    
    // Check logo
    const logo = screen.getByAltText('');
    expect(logo).toHaveAttribute('src', 'test-file-stub');
    expect(logo).toHaveClass('login-logo');
    
    // Check form elements
    expect(screen.getByRole('heading', { name: 'Sign In' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
    expect(screen.getByText('Remember Me')).toBeInTheDocument();
    expect(screen.getByText('Need Help?')).toBeInTheDocument();
  });

  it('switches between sign in and sign up forms', () => {
    renderWithRouter();
    
    // Initially in sign in mode
    expect(screen.getByRole('heading', { name: 'Sign In' })).toBeInTheDocument();
    expect(screen.queryByPlaceholderText('Your Name')).not.toBeInTheDocument();
    
    // Switch to sign up
    fireEvent.click(screen.getByText('Sign Up Now'));
    
    // Check sign up form elements
    expect(screen.getByRole('heading', { name: 'Sign Up' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Your Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign Up' })).toBeInTheDocument();
  });

  it('handles successful login', async () => {
    const mockResponse = { data: { token: 'test-token', user: { name: 'Test User' } } };
    axios.post.mockResolvedValueOnce(mockResponse);
    
    renderWithRouter();
    
    // Fill form
    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'password123' },
    });
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));
    
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:5001/api/auth/login',
        {
          email: 'test@example.com',
          password: 'password123',
        }
      );
      expect(localStorage.getItem('token')).toBe('test-token');
      expect(localStorage.getItem('user')).toBe(JSON.stringify({ name: 'Test User' }));
      expect(toast.success).toHaveBeenCalledWith('登錄成功！');
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('handles successful registration', async () => {
    const mockResponse = { data: { token: 'test-token', user: { name: 'New User' } } };
    axios.post.mockResolvedValueOnce(mockResponse);
    
    renderWithRouter();
    
    // Switch to sign up
    fireEvent.click(screen.getByText('Sign Up Now'));
    
    // Fill form
    fireEvent.change(screen.getByPlaceholderText('Your Name'), {
      target: { value: 'New User' },
    });
    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'newuser@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'password123' },
    });
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: 'Sign Up' }));
    
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:5001/api/auth/register',
        {
          name: 'New User',
          email: 'newuser@example.com',
          password: 'password123',
        }
      );
      expect(localStorage.getItem('token')).toBe('test-token');
      expect(localStorage.getItem('user')).toBe(JSON.stringify({ name: 'New User' }));
      expect(toast.success).toHaveBeenCalledWith('註冊成功！');
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('handles login error', async () => {
    const errorMessage = '登入失敗';
    axios.post.mockRejectedValueOnce({ response: { data: { message: errorMessage } } });
    
    renderWithRouter();
    
    // Fill form
    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'wrongpassword' },
    });
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(errorMessage);
    });
  });

  it('shows loading spinner during authentication', async () => {
    renderWithRouter();
    
    const signInButton = screen.getByRole('button', { name: 'Sign In' });
    fireEvent.click(signInButton);
    
    const spinner = screen.getByAltText('');
    expect(spinner).toHaveAttribute('src', 'test-file-stub');
    expect(spinner.parentElement).toHaveClass('login');
  });
}); 