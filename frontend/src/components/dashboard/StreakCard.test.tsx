import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import StreakCard from './StreakCard'

describe('StreakCard', () => {
  it('renders Racha heading', () => {
    render(<StreakCard days={23} />)
    expect(screen.getByText('Racha')).toBeInTheDocument()
  })

  it('displays the number of days', () => {
    render(<StreakCard days={23} />)
    expect(screen.getByText('23')).toBeInTheDocument()
  })

  it('displays different day values', () => {
    render(<StreakCard days={5} />)
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('renders the subtitle', () => {
    render(<StreakCard days={23} />)
    expect(screen.getByText('Días consecutivos ejecutando')).toBeInTheDocument()
  })

  it('renders all weekday labels', () => {
    render(<StreakCard days={23} />)
    expect(screen.getByText('L')).toBeInTheDocument()
    expect(screen.getAllByText('M')).toHaveLength(2)
    expect(screen.getByText('J')).toBeInTheDocument()
    expect(screen.getByText('V')).toBeInTheDocument()
    expect(screen.getByText('S')).toBeInTheDocument()
  })
})
