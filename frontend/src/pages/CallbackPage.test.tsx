import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import CallbackPage from './CallbackPage'

vi.mock('@simplewebauthn/browser', () => ({
  startRegistration: vi.fn().mockResolvedValue({ id: 'mock-cred' }),
}))

function renderWithRouter(initialRoute = '/') {
  window.history.pushState({}, '', initialRoute)
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <CallbackPage />
    </MemoryRouter>
  )
}

describe('CallbackPage', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.useFakeTimers()
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('stores token and sc_returning in localStorage', () => {
    renderWithRouter('/auth/callback?token=valid-jwt')
    expect(localStorage.getItem('auth_token')).toBe('valid-jwt')
    expect(localStorage.getItem('sc_returning')).toBe('true')
  })

  it('shows success screen with token present', () => {
    renderWithRouter('/auth/callback?token=valid-jwt')
    expect(screen.getByText('Acceso concedido')).toBeInTheDocument()
    expect(screen.getByText('Entrando a tu espacio')).toBeInTheDocument()
  })

  it('clears localStorage and shows loading when no token', () => {
    renderWithRouter('/auth/callback')
    expect(screen.getByText('Iniciando sesión…')).toBeInTheDocument()
  })

  it('fetches user info via /auth/me', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ email: 'user@test.com', name: 'User', photo_url: null }),
    })
    vi.stubGlobal('fetch', mockFetch)

    renderWithRouter('/auth/callback?token=jwt')
    act(() => { vi.advanceTimersByTime(100) })

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/auth/me'),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer jwt' }),
      })
    )
  })
})
