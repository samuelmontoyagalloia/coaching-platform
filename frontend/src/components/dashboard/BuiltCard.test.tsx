import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Compass } from '@phosphor-icons/react'
import BuiltCard from './BuiltCard'

describe('BuiltCard', () => {
  const props = {
    icon: Compass,
    label: 'IKIGAI',
    title: 'Tu propósito y dirección',
    description: 'Encontraste el cruce entre lo que amas y lo que el mundo necesita.',
  }

  it('renders the label', () => {
    render(<BuiltCard {...props} />)
    expect(screen.getByText('IKIGAI')).toBeInTheDocument()
  })

  it('renders the title', () => {
    render(<BuiltCard {...props} />)
    expect(screen.getByText('Tu propósito y dirección')).toBeInTheDocument()
  })

  it('renders the description', () => {
    render(<BuiltCard {...props} />)
    expect(
      screen.getByText('Encontraste el cruce entre lo que amas y lo que el mundo necesita.')
    ).toBeInTheDocument()
  })
})
