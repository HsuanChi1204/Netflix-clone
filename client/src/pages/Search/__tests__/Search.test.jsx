import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { LanguageProvider } from '../../../contexts/LanguageContext';
import { toast } from 'react-toastify';
import Search from '../Search';

// Mock modules
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => jest.fn(),
    useSearchParams: () => [new URLSearchParams({ q: 'test' })]
}));

jest.mock('axios');
jest.mock('react-toastify');

const renderWithProviders = (component) => {
    return render(
        <LanguageProvider>
            <BrowserRouter>
                {component}
            </BrowserRouter>
        </LanguageProvider>
    );
};

describe('Search Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders loading state', async () => {
        const { getByText } = renderWithProviders(<Search />);
        expect(getByText('載入中...')).toBeInTheDocument();
    });

    it('displays search results on successful API call', async () => {
        const mockResults = {
            data: {
                results: [{
                    id: 1,
                    title: '測試電影',
                    overview: '測試簡介',
                    release_date: '2024-01-01',
                    backdrop_path: '/test.jpg'
                }]
            }
        };

        require('axios').get.mockResolvedValueOnce(mockResults);

        renderWithProviders(<Search />);

        await waitFor(() => {
            const movieTitle = screen.getByText('測試電影');
            expect(movieTitle).toBeInTheDocument();
        });
    });

    it('navigates to player when movie card is clicked', async () => {
        const mockResults = {
            data: {
                results: [{
                    id: 1,
                    title: '測試電影',
                    overview: '測試簡介',
                    release_date: '2024-01-01',
                    backdrop_path: '/test.jpg'
                }]
            }
        };

        const navigate = jest.fn();
        jest.spyOn(require('react-router-dom'), 'useNavigate').mockReturnValue(navigate);
        require('axios').get.mockResolvedValueOnce(mockResults);

        renderWithProviders(<Search />);

        await waitFor(() => {
            const movieCard = screen.getByText('測試電影').closest('.movie-card');
            fireEvent.click(movieCard);
        });

        expect(navigate).toHaveBeenCalledWith('/player/1');
    });

    it('handles API error gracefully', async () => {
        require('axios').get.mockRejectedValueOnce(new Error('API Error'));

        renderWithProviders(<Search />);

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('搜尋時發生錯誤');
        });
    });

    it('shows no results message when API returns empty array', async () => {
        require('axios').get.mockResolvedValueOnce({ data: { results: [] } });

        renderWithProviders(<Search />);

        await waitFor(() => {
            expect(screen.getByText('找不到相關結果')).toBeInTheDocument();
        });
    });

    it('displays prompt message when no search query', async () => {
        jest.spyOn(require('react-router-dom'), 'useSearchParams')
            .mockReturnValue([new URLSearchParams()]);

        renderWithProviders(<Search />);

        await waitFor(() => {
            expect(screen.getByText('請輸入搜尋關鍵字')).toBeInTheDocument();
        });
    });
}); 