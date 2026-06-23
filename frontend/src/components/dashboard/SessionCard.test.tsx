import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import SessionCard from './SessionCard'

describe('SessionCard', () => {
  const props = {
    number: 1,
    title: 'Ikigai — Fundamentos',
    description: 'El cruce entre lo que amas y el mundo necesita.',
  }

  it('renders the session number', () => {
    render(<SessionCard {...props} />)
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('renders the session title', () => {
    render(<SessionCard {...props} />)
    expect(screen.getByText('Ikigai — Fundamentos')).toBeInTheDocument()
  })

  it('renders the session description', () => {
    render(<SessionCard {...props} />)
    expect(
      screen.getByText('El cruce entre lo que amas y el mundo necesita.')
    ).toBeInTheDocument()
  })

  it('renders a play button', () => {
    const { container } = render(<SessionCard {...props} />)
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  it('renders as a button element', () => {
    render(<SessionCard {...props} />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })
})
