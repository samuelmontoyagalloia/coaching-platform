import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'

function setupLocalStorage(token: string | null) {
  if (token) {
    localStorage.setItem('auth_token', token)
  } else {
    localStorage.removeItem('auth_token')
  }
}

function renderWithRouter(element: React.ReactElement, initialEntries = ['/']) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>{element}</MemoryRouter>
  )
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('redirects to /login when no token', () => {
    setupLocalStorage(null)
    renderWithRouter(
      <ProtectedRoute role="client">
        <div>Protected content</div>
      </ProtectedRoute>
    )
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument()
  })

  it('redirects to /login when token is expired', () => {
    const expiredToken =
      'eyJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiY2xpZW50IiwiZXhwIjoxNzAwMDAwMDAwfQ.invalid'
    setupLocalStorage(expiredToken)
    renderWithRouter(
      <ProtectedRoute role="client">
        <div>Protected content</div>
      </ProtectedRoute>
    )
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument()
  })

  it('redirects to /login when token is malformed', () => {
    setupLocalStorage('not-a-jwt')
    renderWithRouter(
      <ProtectedRoute role="client">
        <div>Protected content</div>
      </ProtectedRoute>
    )
    expect(localStorage.getItem('auth_token')).toBeNull()
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument()
  })

  it('renders children for client role with valid client token', () => {
    const future = Math.floor(Date.now() / 1000) + 3600
    const payload = btoa(JSON.stringify({ userId: 'u1', role: 'client', exp: future }))
    const token = `header.${payload}.signature`
    setupLocalStorage(token)
    renderWithRouter(
      <ProtectedRoute role="client">
        <div>Protected content</div>
      </ProtectedRoute>
    )
    expect(screen.getByText('Protected content')).toBeInTheDocument()
  })

  it('renders children for admin role with valid admin token', () => {
    const future = Math.floor(Date.now() / 1000) + 3600
    const payload = btoa(JSON.stringify({ userId: 'a1', role: 'admin', exp: future }))
    const token = `header.${payload}.signature`
    setupLocalStorage(token)
    renderWithRouter(
      <ProtectedRoute role="admin">
        <div>Admin content</div>
      </ProtectedRoute>
    )
    expect(screen.getByText('Admin content')).toBeInTheDocument()
  })

  it('redirects client user to /dashboard when accessing admin route', () => {
    const future = Math.floor(Date.now() / 1000) + 3600
    const payload = btoa(JSON.stringify({ userId: 'u1', role: 'client', exp: future }))
    const token = `header.${payload}.signature`
    setupLocalStorage(token)
    renderWithRouter(
      <ProtectedRoute role="admin">
        <div>Admin only</div>
      </ProtectedRoute>
    )
    expect(screen.queryByText('Admin only')).not.toBeInTheDocument()
  })

  it('redirects admin user to /admin when accessing client route', () => {
    const future = Math.floor(Date.now() / 1000) + 3600
    const payload = btoa(JSON.stringify({ userId: 'a1', role: 'admin', exp: future }))
    const token = `header.${payload}.signature`
    setupLocalStorage(token)
    renderWithRouter(
      <ProtectedRoute role="client">
        <div>Client only</div>
      </ProtectedRoute>
    )
    expect(screen.queryByText('Client only')).not.toBeInTheDocument()
  })
})
