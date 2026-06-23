import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import LoginPage from './index'

vi.mock('@simplewebauthn/browser', () => ({
  startAuthentication: vi.fn(),
}))

function renderWithRouter(initialRoute = '/login') {
  window.history.pushState({}, '', initialRoute)
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <LoginPage />
    </MemoryRouter>
  )
}

describe('LoginPage (app/login)', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.useFakeTimers()
    vi.stubGlobal('fetch', vi.fn())
    vi.stubGlobal('location', { href: '' })
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('shows first access view by default', () => {
    renderWithRouter()
    expect(screen.getByText('Encuentra tu')).toBeInTheDocument()
    expect(screen.getByText('negocio')).toBeInTheDocument()
    expect(screen.getByText('Continuar con Google')).toBeInTheDocument()
  })

  it('shows biometric login for returning users', () => {
    localStorage.setItem('sc_returning', 'true')
    localStorage.setItem('user_name', 'Samuel')
    renderWithRouter()
    expect(screen.getByText('Bienvenido de nuevo')).toBeInTheDocument()
    expect(screen.getByText('Samuel')).toBeInTheDocument()
  })

  it('shows biometric login when has_passkey is set', () => {
    localStorage.setItem('has_passkey', 'true')
    localStorage.setItem('user_email', 'samuel@test.com')
    renderWithRouter()
    expect(screen.getByText('Bienvenido de nuevo')).toBeInTheDocument()
  })

  it('shows access denied with WhatsApp link from URL param', () => {
    renderWithRouter('/login?error=access_denied')
    expect(screen.getByText('Escribirle a Samuel')).toBeInTheDocument()
    expect(screen.getByText('Tu inicio de sesión fue denegado.')).toBeInTheDocument()
  })

  it('shows unauthorized error message', () => {
    renderWithRouter('/login?error=unauthorized')
    expect(screen.getByText('Este acceso es exclusivo para clientes del proceso de coaching.')).toBeInTheDocument()
  })

  it('displays first name from user_name', () => {
    localStorage.setItem('sc_returning', 'true')
    localStorage.setItem('user_name', 'Samuel Montoya')
    renderWithRouter()
    expect(screen.getByText('Samuel')).toBeInTheDocument()
  })

  it('displays email prefix when user_name has @', () => {
    localStorage.setItem('sc_returning', 'true')
    localStorage.setItem('user_name', '')
    localStorage.setItem('user_email', 'samuel@test.com')
    renderWithRouter()
    expect(screen.getByText('samuel')).toBeInTheDocument()
  })

  it('shows fallback initial ? when no photo or name', () => {
    localStorage.setItem('sc_returning', 'true')
    renderWithRouter()
    expect(screen.getByText('?')).toBeInTheDocument()
  })

  it('redirects to Google OAuth on button click', () => {
    renderWithRouter()
    fireEvent.click(screen.getByText('Continuar con Google'))
    expect(window.location.href).toContain('/auth/google')
  })

  it('switches from biometric back to first access', () => {
    localStorage.setItem('sc_returning', 'true')
    localStorage.setItem('user_name', 'Samuel')
    renderWithRouter()
    fireEvent.click(screen.getByText('Usar otra cuenta'))
    expect(screen.getByText('Continuar con Google')).toBeInTheDocument()
  })

  it('switches from access_denied to first access', () => {
    renderWithRouter('/login?error=access_denied')
    fireEvent.click(screen.getByText('Intentar con otra cuenta'))
    expect(screen.getByText('Continuar con Google')).toBeInTheDocument()
  })

  it('shows footer pillars on first access', () => {
    renderWithRouter()
    expect(screen.getByText('Propósito')).toBeInTheDocument()
    expect(screen.getByText('Negocio')).toBeInTheDocument()
    expect(screen.getByText('Plan')).toBeInTheDocument()
    expect(screen.getByText('Ejecución')).toBeInTheDocument()
  })

  it('shows Coaching 1:1 wordmark', () => {
    renderWithRouter()
    expect(screen.getByText('Coaching')).toBeInTheDocument()
    expect(screen.getByText('1:1')).toBeInTheDocument()
  })
})
