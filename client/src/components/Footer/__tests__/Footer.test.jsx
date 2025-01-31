import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import React from 'react';
import { render, screen } from '@testing-library/react';
import Footer from '../Footer';

// Mock all image imports
jest.mock('../../../assets/youtube_icon.png', () => 'test-file-stub');
jest.mock('../../../assets/twitter_icon.png', () => 'test-file-stub');
jest.mock('../../../assets/instagram_icon.png', () => 'test-file-stub');
jest.mock('../../../assets/facebook_icon.png', () => 'test-file-stub');

describe('Footer Component', () => {
  beforeEach(() => {
    render(<Footer />);
  });

  it('renders social media icons', () => {
    const icons = document.querySelectorAll('.footer-icons img');
    expect(icons).toHaveLength(4);
    
    // Verify that all icons are rendered with the test stub
    const iconSources = Array.from(icons).map(icon => icon.getAttribute('src'));
    expect(iconSources).toEqual(Array(4).fill('test-file-stub'));
  });

  it('renders all footer links', () => {
    const expectedLinks = [
      'Audio Description',
      'Help Center',
      'Gift Cards',
      'Media Center',
      'Investor Relations',
      'Jobs',
      'Terms of Use',
      'Privacy',
      'Legal Notices',
      'Cookis Preferences',
      'Corporate Information',
      'Contact Us'
    ];

    expectedLinks.forEach(link => {
      expect(screen.getByText(link)).toBeInTheDocument();
    });
  });

  it('renders copyright text', () => {
    expect(screen.getByText(/©1997-2023 Netflix, Inc./)).toBeInTheDocument();
  });

  it('has correct CSS classes', () => {
    expect(screen.getByRole('list')).toBeInTheDocument();
    expect(document.querySelector('.footer')).toBeInTheDocument();
    expect(document.querySelector('.footer-icons')).toBeInTheDocument();
    expect(document.querySelector('.copyright-text')).toBeInTheDocument();
  });
}); 