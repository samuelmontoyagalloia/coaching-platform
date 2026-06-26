import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import PlanProgress from './PlanProgress'

describe('PlanProgress', () => {
  it('renders Proyecto a 10 años heading', () => {
    render(<PlanProgress streak={365} />)
    expect(screen.getByText('Proyecto a 10 años')).toBeInTheDocument()
  })

  it('displays 1.0 year for 365 days streak', () => {
    render(<PlanProgress streak={365} />)
    expect(screen.getByText('1.0')).toBeInTheDocument()
  })

  it('displays 0.0 for 0 streak', () => {
    render(<PlanProgress streak={0} />)
    expect(screen.getByText('0.0')).toBeInTheDocument()
  })

  it('displays 2.5 for 912 days streak (≈2.5 years)', () => {
    render(<PlanProgress streak={912} />)
    expect(screen.getByText('2.5')).toBeInTheDocument()
  })

  it('displays remaining years', () => {
    render(<PlanProgress streak={365} />)
    expect(screen.getByText('9.0 años restantes')).toBeInTheDocument()
  })

  it('shows Años de proyecto label', () => {
    render(<PlanProgress streak={365} />)
    expect(screen.getByText('Años de proyecto')).toBeInTheDocument()
  })

  it('renders Ver plan button', () => {
    render(<PlanProgress streak={365} />)
    expect(screen.getByText('Ver plan')).toBeInTheDocument()
  })

  it('shows 10.0 años restantes at 0 streak', () => {
    render(<PlanProgress streak={0} />)
    expect(screen.getByText('10.0 años restantes')).toBeInTheDocument()
  })

  it('shows 0.0 años restantes at 3650 streak (10 years)', () => {
    render(<PlanProgress streak={3650} />)
    expect(screen.getByText('0.0 años restantes')).toBeInTheDocument()
  })

  it('caps remaining years at 0 for streak beyond 3650', () => {
    render(<PlanProgress streak={4000} />)
    expect(screen.getByText('0.0 años restantes')).toBeInTheDocument()
  })
})
