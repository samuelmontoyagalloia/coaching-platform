import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

function setupLocalStorage(token: string | null) {
  if (token) {
    localStorage.setItem('auth_token', token)
  } else {
    localStorage.removeItem('auth_token')
  }
}

describe('App routing', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.stubGlobal('fetch', vi.fn())
  })

  it('renders login page at /login', async () => {
    window.history.pushState({}, '', '/login')
    const App = (await import('./App')).default
    render(<App />)
    const text = await screen.findByText('Tu espacio de ejecución', {}, { timeout: 3000 })
    expect(text).toBeInTheDocument()
  })

  it('renders login page at / when no token', async () => {
    const App = (await import('./App')).default
    render(<App />)
    const text = await screen.findByText('Tu espacio de ejecución', {}, { timeout: 3000 })
    expect(text).toBeInTheDocument()
  })

  it('redirects / to /login with expired token', async () => {
    const past = Math.floor(Date.now() / 1000) - 3600
    const payload = btoa(JSON.stringify({ userId: 'u1', role: 'client', exp: past }))
    setupLocalStorage(`header.${payload}.sig`)
    const App = (await import('./App')).default
    render(<App />)
    const text = await screen.findByText('Tu espacio de ejecución', {}, { timeout: 3000 })
    expect(text).toBeInTheDocument()
  })

  it('renders callback page at /auth/callback', async () => {
    window.history.pushState({}, '', '/auth/callback?token=test-token')
    const App = (await import('./App')).default
    render(<App />)
    const text = await screen.findByText('Acceso concedido', {}, { timeout: 3000 })
    expect(text).toBeInTheDocument()
  })
})
