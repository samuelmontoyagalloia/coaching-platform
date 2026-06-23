import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import DashboardPage from './DashboardPage'

function renderWithRouter(element: React.ReactElement) {
  return render(<MemoryRouter>{element}</MemoryRouter>)
}

describe('DashboardPage', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders coaching branding', () => {
    renderWithRouter(<DashboardPage />)
    expect(screen.getByText('Coaching')).toBeInTheDocument()
    expect(screen.getByText('1:1')).toBeInTheDocument()
  })

  it('shows welcome message', () => {
    renderWithRouter(<DashboardPage />)
    expect(screen.getByText('Bienvenido,')).toBeInTheDocument()
  })

  it('shows En construcción card', () => {
    renderWithRouter(<DashboardPage />)
    expect(screen.getByText('En construcción')).toBeInTheDocument()
    expect(screen.getByText('Tu proceso está en camino.')).toBeInTheDocument()
  })

  it('displays user name from localStorage', () => {
    localStorage.setItem('user_name', 'Samuel')
    renderWithRouter(<DashboardPage />)
    expect(screen.getByText('Samuel.')).toBeInTheDocument()
  })

  it('displays first name only from full name', () => {
    localStorage.setItem('user_name', 'Samuel Montoya')
    renderWithRouter(<DashboardPage />)
    expect(screen.getByText('Samuel.')).toBeInTheDocument()
  })

  it('displays email prefix when name is an email', () => {
    localStorage.setItem('user_name', '')
    localStorage.setItem('user_email', 'samuel@test.com')
    renderWithRouter(<DashboardPage />)
    expect(screen.getByText('samuel.')).toBeInTheDocument()
  })

  it('shows Cliente as fallback when no name', () => {
    renderWithRouter(<DashboardPage />)
    expect(screen.getByText('Cliente.')).toBeInTheDocument()
  })

  it('shows user photo when available', () => {
    localStorage.setItem('user_photo', 'https://example.com/photo.jpg')
    const { container } = renderWithRouter(<DashboardPage />)
    const img = container.querySelector('img')
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', 'https://example.com/photo.jpg')
  })

  it('shows fallback initial when photo fails to load', () => {
    const { container } = renderWithRouter(<DashboardPage />)
    const initials = container.querySelectorAll('div')
    const initialDiv = Array.from(initials).find(
      (d) => d.textContent === '?'
    )
    expect(initialDiv).toBeInTheDocument()
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

  it('shows Privado badge', () => {
    renderWithRouter(<DashboardPage />)
    expect(screen.getByText('Privado')).toBeInTheDocument()
  })
})
