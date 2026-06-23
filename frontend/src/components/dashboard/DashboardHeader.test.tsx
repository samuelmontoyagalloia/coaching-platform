import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import DashboardHeader from './DashboardHeader'

describe('DashboardHeader', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders coaching branding', () => {
    render(<DashboardHeader userName="" userPhoto="" />)
    expect(screen.getByText('Coaching')).toBeInTheDocument()
    expect(screen.getByText('1:1')).toBeInTheDocument()
  })

  it('renders Privado badge', () => {
    render(<DashboardHeader userName="" userPhoto="" />)
    expect(screen.getByText('Privado')).toBeInTheDocument()
  })

  it('displays the user first name', () => {
    render(<DashboardHeader userName="Samuel" userPhoto="" />)
    expect(screen.getByText('Samuel')).toBeInTheDocument()
  })

  it('displays first name only from full name', () => {
    render(<DashboardHeader userName="Samuel Montoya" userPhoto="" />)
    expect(screen.getByText('Samuel')).toBeInTheDocument()
  })

  it('displays email prefix when name is an email', () => {
    render(<DashboardHeader userName="samuel@test.com" userPhoto="" />)
    expect(screen.getByText('samuel')).toBeInTheDocument()
  })

  it('shows user initial when no photo', () => {
    render(<DashboardHeader userName="Samuel" userPhoto="" />)
    expect(screen.getByText('S')).toBeInTheDocument()
  })

  it('shows question mark when no name or photo', () => {
    render(<DashboardHeader userName="" userPhoto="" />)
    expect(screen.getByText('?')).toBeInTheDocument()
  })

  it('renders user image when photo is provided', () => {
    const { container } = render(
      <DashboardHeader userName="Samuel" userPhoto="https://example.com/photo.jpg" />
    )
    const img = container.querySelector('img')
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', 'https://example.com/photo.jpg')
  })

  it('shows initial fallback when image fails to load', () => {
    const { container } = render(
      <DashboardHeader userName="Samuel" userPhoto="https://example.com/photo.jpg" />
    )
    const img = container.querySelector('img')!
    fireEvent.error(img)
    expect(screen.getByText('S')).toBeInTheDocument()
  })
})
