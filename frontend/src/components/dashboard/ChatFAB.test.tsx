import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ChatFAB from './ChatFAB'

describe('ChatFAB', () => {
  it('renders the chat icon', () => {
    const { container } = render(<ChatFAB />)
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  it('renders the notification badge with 3', () => {
    render(<ChatFAB />)
    expect(screen.getByText('3')).toBeInTheDocument()
  })
})
