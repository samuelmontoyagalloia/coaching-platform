import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import StreakCard from './StreakCard'

describe('StreakCard', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

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

  it('renders Mon–Sat weekday labels (excludes Sunday)', () => {
    vi.setSystemTime(new Date('2026-06-22T12:00:00'))
    render(<StreakCard days={23} />)
    expect(screen.getByText('L')).toBeInTheDocument()
    expect(screen.getAllByText('M')).toHaveLength(2)
    expect(screen.getByText('J')).toBeInTheDocument()
    expect(screen.getByText('V')).toBeInTheDocument()
    expect(screen.getByText('S')).toBeInTheDocument()
    expect(screen.queryByText('D')).not.toBeInTheDocument()
  })

  it('renders 6 day columns (each has a container)', () => {
    const { container } = render(<StreakCard days={23} />)
    const dayCells = container.querySelectorAll('.w-7.h-7')
    expect(dayCells.length).toBe(6)
  })

  it('marks past days with check icons on Saturday', () => {
    vi.setSystemTime(new Date('2026-06-27T12:00:00'))
    const { container } = render(<StreakCard days={10} />)
    const svgs = container.querySelectorAll('svg')
    expect(svgs.length).toBe(7)
  })

  it('marks past days with check icons on Wednesday', () => {
    vi.setSystemTime(new Date('2026-06-24T12:00:00'))
    const { container } = render(<StreakCard days={10} />)
    const svgs = container.querySelectorAll('svg')
    expect(svgs.length).toBe(4)
  })

  it('highlights today with border on weekday', () => {
    vi.setSystemTime(new Date('2026-06-24T12:00:00'))
    const { container } = render(<StreakCard days={10} />)
    const dayCells = container.querySelectorAll('.w-7.h-7')
    expect(dayCells[2].className).toContain('border-2')
    expect(dayCells[2].className).toContain('border-[var(--white)]')
  })

  it('shows all days as future on Sunday (no border highlight)', () => {
    vi.setSystemTime(new Date('2026-06-28T12:00:00'))
    const { container } = render(<StreakCard days={10} />)
    const dayCells = container.querySelectorAll('.w-7.h-7')
    dayCells.forEach((cell) => {
      expect(cell.className).not.toContain('border-2')
    })
  })

  it('applies future styling to all days on Sunday', () => {
    vi.setSystemTime(new Date('2026-06-28T12:00:00'))
    const { container } = render(<StreakCard days={10} />)
    const dayCells = container.querySelectorAll('.w-7.h-7')
    dayCells.forEach((cell) => {
      expect(cell.className).toContain('/15')
    })
  })

  it('renders inline fires icons', () => {
    render(<StreakCard days={7} />)
    expect(screen.getByText('7')).toBeInTheDocument()
  })

  it('applies reduced opacity when loading', () => {
    const { container } = render(<StreakCard days={0} loading />)
    const section = container.querySelector('section')
    expect(section?.className).toContain('opacity-30')
    expect(section?.className).toContain('scale-[0.97]')
  })

  it('renders at full opacity when not loading', () => {
    const { container } = render(<StreakCard days={23} loading={false} />)
    const section = container.querySelector('section')
    expect(section?.className).toContain('opacity-100')
    expect(section?.className).toContain('scale-100')
  })

  it('defaults to full opacity when loading prop is not provided', () => {
    const { container } = render(<StreakCard days={23} />)
    const section = container.querySelector('section')
    expect(section?.className).toContain('opacity-100')
  })
})
