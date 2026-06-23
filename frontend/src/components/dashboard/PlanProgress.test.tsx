import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import PlanProgress from './PlanProgress'

describe('PlanProgress', () => {
  it('renders Plan de 90 días heading', () => {
    render(<PlanProgress progress={67} />)
    expect(screen.getByText('Plan de 90 días')).toBeInTheDocument()
  })

  it('displays the progress percentage', () => {
    render(<PlanProgress progress={67} />)
    expect(screen.getByText('67%')).toBeInTheDocument()
  })

  it('displays remaining days', () => {
    render(<PlanProgress progress={67} />)
    expect(screen.getByText('30 días restantes')).toBeInTheDocument()
  })

  it('shows Construyendo label', () => {
    render(<PlanProgress progress={67} />)
    expect(screen.getByText('Construyendo')).toBeInTheDocument()
  })

  it('renders Ver plan button', () => {
    render(<PlanProgress progress={67} />)
    expect(screen.getByText('Ver plan')).toBeInTheDocument()
  })

  it('calculates remaining days correctly at 0%', () => {
    render(<PlanProgress progress={0} />)
    expect(screen.getByText('90 días restantes')).toBeInTheDocument()
  })

  it('calculates remaining days correctly at 100%', () => {
    render(<PlanProgress progress={100} />)
    expect(screen.getByText('0 días restantes')).toBeInTheDocument()
  })
})
