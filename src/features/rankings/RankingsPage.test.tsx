import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { seedGames, seedPlayers } from '../../lib/seed'
import { RankingsPage } from './RankingsPage'

describe('RankingsPage', () => {
  it('mostra vitórias, derrotas e aproveitamento individual', () => {
    render(<RankingsPage players={seedPlayers} games={seedGames} />)

    expect(screen.getByRole('row', { name: /césar, 5 vitórias, 1 derrotas, 83.3%/i })).toBeInTheDocument()
  })

  it('mostra o ranking de gabuadas', () => {
    const games = [
      { ...seedGames[0], gabuadaIds: ['cesar'] as string[] },
      { ...seedGames[1], gabuadaIds: ['cesar'] as string[] },
    ]
    render(<RankingsPage players={seedPlayers} games={games} />)

    const ranking = screen.getByRole('region', { name: /ranking de gabuadas/i })
    expect(within(ranking).getByText('César')).toBeInTheDocument()
    expect(within(ranking).getByText('2')).toBeInTheDocument()
  })

  it('identifica duplas com amostra pequena', async () => {
    const user = userEvent.setup()
    render(<RankingsPage players={seedPlayers} games={seedGames} />)

    await user.click(screen.getByRole('tab', { name: /duplas/i }))
    expect(screen.getByText('Emanoel & Vinícius')).toBeInTheDocument()
    expect(screen.getAllByText('Amostra pequena').length).toBeGreaterThan(0)
  })

  it('mostra os recordes históricos de sequências individuais e de duplas', async () => {
    const user = userEvent.setup()
    render(<RankingsPage players={seedPlayers} games={seedGames} />)

    const individualRecords = screen.getByRole('region', { name: 'Recordes individuais' })
    expect(within(individualRecords).getByText('Maior sequência de vitórias')).toBeInTheDocument()
    expect(within(individualRecords).getByText('Maior sequência de derrotas')).toBeInTheDocument()
    expect(within(individualRecords).getByText('César · Vinícius')).toBeInTheDocument()
    expect(within(individualRecords).getByText('Emanoel')).toBeInTheDocument()

    await user.click(screen.getByRole('tab', { name: /duplas/i }))
    const pairRecords = screen.getByRole('region', { name: 'Recordes de duplas' })
    expect(within(pairRecords).getByText('Maior sequência de vitórias')).toBeInTheDocument()
    expect(within(pairRecords).getByText('Maior sequência de derrotas')).toBeInTheDocument()
  })

  it('não inventa recordistas quando ainda não há partidas', async () => {
    const user = userEvent.setup()
    render(<RankingsPage players={seedPlayers} games={[]} />)

    expect(within(screen.getByRole('region', { name: 'Recordes individuais' })).getAllByText('Sem partidas ainda')).toHaveLength(2)
    await user.click(screen.getByRole('tab', { name: /duplas/i }))
    expect(within(screen.getByRole('region', { name: 'Recordes de duplas' })).getAllByText('Sem partidas ainda')).toHaveLength(2)
  })
})
