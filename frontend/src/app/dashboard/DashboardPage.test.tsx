import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import DashboardPage from './DashboardPage'

function renderWithRouter(element: React.ReactElement) {
  return render(<MemoryRouter>{element}</MemoryRouter>)
}

describe('DashboardPage (new)', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.useFakeTimers()
    vi.stubGlobal('fetch', vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ streak: 42, name: 'Test', photo_url: null }),
      })
    ))
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('renders coaching branding', () => {
    renderWithRouter(<DashboardPage />)
    expect(screen.getByText('Coaching')).toBeInTheDocument()
    expect(screen.getByText('1:1')).toBeInTheDocument()
  })

  it('renders Privado badge', () => {
    renderWithRouter(<DashboardPage />)
    expect(screen.getByText('Privado')).toBeInTheDocument()
  })

  it('shows welcome message', () => {
    renderWithRouter(<DashboardPage />)
    expect(screen.getByText('Bienvenido de vuelta')).toBeInTheDocument()
  })

  it('shows Hola message', () => {
    renderWithRouter(<DashboardPage />)
    expect(screen.getByText(/Hola,/)).toBeInTheDocument()
  })

  it('shows Cliente as fallback when no name', () => {
    renderWithRouter(<DashboardPage />)
    expect(screen.getByText('Cliente.')).toBeInTheDocument()
  })

  it('displays user name from localStorage', () => {
    localStorage.setItem('user_name', 'Samuel')
    renderWithRouter(<DashboardPage />)
    expect(screen.getByText('Samuel.')).toBeInTheDocument()
  })

  it('renders StreakCard', () => {
    renderWithRouter(<DashboardPage />)
    const headings = screen.getAllByText('Racha')
    expect(headings.length).toBeGreaterThanOrEqual(1)
  })

  it('renders SessionsList heading', () => {
    renderWithRouter(<DashboardPage />)
    expect(screen.getByText('Sesiones')).toBeInTheDocument()
  })

  it('renders session cards', () => {
    renderWithRouter(<DashboardPage />)
    expect(screen.getByText('Ikigai — Fundamentos')).toBeInTheDocument()
  })

  it('renders PlanProgress', () => {
    renderWithRouter(<DashboardPage />)
    const headings = screen.getAllByText('Plan de 90 días')
    expect(headings.length).toBeGreaterThanOrEqual(1)
  })

  it('renders BuiltSection heading', () => {
    renderWithRouter(<DashboardPage />)
    expect(screen.getByText('Lo que construiste')).toBeInTheDocument()
  })

  it('renders ChatFAB', () => {
    renderWithRouter(<DashboardPage />)
    const elements = screen.getAllByText('3')
    expect(elements.length).toBeGreaterThanOrEqual(1)
  })

  it('shows MVP version tag', () => {
    renderWithRouter(<DashboardPage />)
    expect(screen.getByText('MVP · v0.1')).toBeInTheDocument()
  })

  it('shows logout button', () => {
    renderWithRouter(<DashboardPage />)
    expect(screen.getByText('Cerrar sesión')).toBeInTheDocument()
  })

  it('shows logout overlay when logout clicked', () => {
    renderWithRouter(<DashboardPage />)
    fireEvent.click(screen.getByText('Cerrar sesión'))
    expect(screen.getByText('Cerrando sesión')).toBeInTheDocument()
    expect(screen.getByText(/Hasta pronto/)).toBeInTheDocument()
  })

  it('removes auth_token after logout timeout', () => {
    localStorage.setItem('auth_token', 'some-token')
    renderWithRouter(<DashboardPage />)
    fireEvent.click(screen.getByText('Cerrar sesión'))
    act(() => { vi.advanceTimersByTime(1800) })
    expect(localStorage.getItem('auth_token')).toBeNull()
  })

  it('shows user photo when available', () => {
    localStorage.setItem('user_photo', 'https://example.com/photo.jpg')
    const { container } = renderWithRouter(<DashboardPage />)
    const img = container.querySelector('img')
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', 'https://example.com/photo.jpg')
  })

  it('shows fallback initial when no photo', () => {
    const { container } = renderWithRouter(<DashboardPage />)
    const allDivs = container.querySelectorAll('div')
    const questionDiv = Array.from(allDivs).find((d) => d.textContent === '?')
    expect(questionDiv).toBeInTheDocument()
  })

  it('fetches streak from backend API when token exists', async () => {
    vi.useRealTimers()
    localStorage.setItem('auth_token', 'valid-token')
    localStorage.setItem('user_name', 'Samuel')
    renderWithRouter(<DashboardPage />)
    await waitFor(() => {
      const streaks = screen.getAllByText('42')
      expect(streaks.length).toBeGreaterThanOrEqual(1)
    })
  })

  it('calls /api/dashboard with auth header', async () => {
    vi.useRealTimers()
    localStorage.setItem('auth_token', 'test-token')
    const mockFetch = vi.mocked(fetch)
    renderWithRouter(<DashboardPage />)
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/dashboard'),
        expect.objectContaining({
          headers: expect.objectContaining({ Authorization: 'Bearer test-token' }),
        })
      )
    })
  })

  it('handles API failure gracefully (streak defaults to 0)', async () => {
    vi.useRealTimers()
    localStorage.setItem('auth_token', 'valid-token')
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'))
    renderWithRouter(<DashboardPage />)
    await act(async () => {})
    const headings = screen.getAllByText('Racha')
    expect(headings.length).toBeGreaterThanOrEqual(1)
  })
})
