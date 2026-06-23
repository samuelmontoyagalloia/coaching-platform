import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import AdminPage from './AdminPage'

describe('AdminPage', () => {
  it('renders administration panel title', () => {
    render(<AdminPage />)
    expect(screen.getByText('Panel de administración')).toBeInTheDocument()
  })

  it('renders Admin heading', () => {
    render(<AdminPage />)
    expect(screen.getByText('Admin')).toBeInTheDocument()
  })

  it('shows under construction message', () => {
    render(<AdminPage />)
    expect(screen.getByText('En construcción.')).toBeInTheDocument()
  })
})
