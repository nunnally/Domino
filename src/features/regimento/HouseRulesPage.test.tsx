import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { seedPlayers } from '../../lib/seed'

import { HouseRulesPage } from './HouseRulesPage'

describe('HouseRulesPage', () => {
  it('apresenta o regimento e os cinco ministros da casa', () => {
    render(<HouseRulesPage players={seedPlayers} />)

    expect(screen.getByRole('heading', { level: 1, name: /superior tribunal do dominó/i })).toBeInTheDocument()

    const ministers = screen.getByRole('region', { name: /ministros em exercício/i })
    expect(within(ministers).getByText('César')).toBeInTheDocument()
    expect(within(ministers).getByText('David')).toBeInTheDocument()
    expect(within(ministers).getByText('Emanoel')).toBeInTheDocument()
    expect(within(ministers).getByText('Machilas (Marcelo)')).toBeInTheDocument()
    expect(within(ministers).getByText('Vinícius')).toBeInTheDocument()
  })

  it('mostra as regras fundamentais da mesa', () => {
    render(<HouseRulesPage players={seedPlayers} />)

    expect(screen.getByText('Constituição da mesa')).toBeInTheDocument()
    expect(screen.getByText(/dois vencedores e dois perdedores diferentes/i)).toBeInTheDocument()
    expect(screen.getByText(/a súmula vale mais que a memória/i)).toBeInTheDocument()
  })
})
