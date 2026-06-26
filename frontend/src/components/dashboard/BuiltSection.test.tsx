import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import BuiltSection from './BuiltSection'

describe('BuiltSection', () => {
  it('renders the section heading', () => {
    render(<BuiltSection />)
    expect(screen.getByText('Lo que construiste')).toBeInTheDocument()
  })

  it('renders all three built cards', () => {
    render(<BuiltSection />)
    expect(screen.getByText('IKIGAI')).toBeInTheDocument()
    expect(screen.getByText('NEGOCIO')).toBeInTheDocument()
    expect(screen.getByText('OFERTA')).toBeInTheDocument()
  })

  it('renders each card title', () => {
    render(<BuiltSection />)
    expect(screen.getByText('Encontrar el Norte')).toBeInTheDocument()
    expect(screen.getByText('Investigación de mercado y negocio')).toBeInTheDocument()
    expect(screen.getByText('La oferta irresistible')).toBeInTheDocument()
  })
})
