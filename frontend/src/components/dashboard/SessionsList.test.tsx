import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import SessionsList from './SessionsList'

describe('SessionsList', () => {
  it('renders Sesiones heading', () => {
    render(<SessionsList />)
    expect(screen.getByText('Sesiones')).toBeInTheDocument()
  })

  it('renders all four session cards', () => {
    render(<SessionsList />)
    expect(screen.getByText('Ikigai — Fundamentos')).toBeInTheDocument()
    expect(screen.getByText('Sistema y negocio')).toBeInTheDocument()
    expect(screen.getByText('La oferta que vende')).toBeInTheDocument()
    expect(screen.getByText('Ejecución y momentum')).toBeInTheDocument()
  })
})
