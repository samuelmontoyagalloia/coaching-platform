import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import WelcomeSection from './WelcomeSection'

describe('WelcomeSection', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders welcome text', () => {
    render(<WelcomeSection name="" />)
    expect(screen.getByText('Bienvenido de vuelta')).toBeInTheDocument()
  })

  it('shows Hola with the given name', () => {
    render(<WelcomeSection name="Samuel" />)
    expect(screen.getByText('Samuel.')).toBeInTheDocument()
    expect(screen.getByText(/Hola,/)).toBeInTheDocument()
  })

  it('shows first name only from full name', () => {
    render(<WelcomeSection name="Samuel Montoya" />)
    expect(screen.getByText('Samuel.')).toBeInTheDocument()
  })

  it('shows email prefix when name is an email', () => {
    render(<WelcomeSection name="samuel@test.com" />)
    expect(screen.getByText('samuel.')).toBeInTheDocument()
  })

  it('shows empty name when name is empty', () => {
    render(<WelcomeSection name="" />)
    expect(screen.getByText('.')).toBeInTheDocument()
  })

  it('renders the subtitle', () => {
    render(<WelcomeSection name="Samuel" />)
    expect(screen.getByText('Ya tienes las herramientas. Ahora ejecuta.')).toBeInTheDocument()
  })
})
