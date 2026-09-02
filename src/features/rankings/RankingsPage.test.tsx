import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { seedGames, seedPlayers } from '../../lib/seed'
import { RankingsPage } from './RankingsPage'

describe('RankingsPage', () => {
  it('mostra vitórias, derrotas e aproveitamento individual', () => {
    render(<RankingsPage players={seedPlayers} games={seedGames} />)

    expect(screen.getByRole('row', { name: /césar, 4 vitórias, 1 derrotas, 80%/i })).toBeInTheDocument()
  })

  it('identifica duplas com amostra pequena', async () => {
    const user = userEvent.setup()
    render(<RankingsPage players={seedPlayers} games={seedGames} />)

    await user.click(screen.getByRole('tab', { name: /duplas/i }))
    expect(screen.getByText('Emanoel & Vinícius')).toBeInTheDocument()
    expect(screen.getByText('Amostra pequena')).toBeInTheDocument()
  })

  it('mostra os recordes históricos de sequências individuais e de duplas', async () => {
    const user = userEvent.setup()
    render(<RankingsPage players={seedPlayers} games={seedGames} />)

    const individualRecords = screen.getByRole('region', { name: 'Recordes individuais' })
    expect(within(individualRecords).getByText('Sequência de vitórias')).toBeInTheDocument()
    expect(within(individualRecords).getByText('Sequência de derrotas')).toBeInTheDocument()
    expect(within(individualRecords).getByText('César · Vinícius')).toBeInTheDocument()
    expect(within(individualRecords).getByText('Emanoel')).toBeInTheDocument()

    await user.click(screen.getByRole('tab', { name: /duplas/i }))
    const pairRecords = screen.getByRole('region', { name: 'Recordes de duplas' })
    expect(within(pairRecords).getByText('Sequência de vitórias')).toBeInTheDocument()
    expect(within(pairRecords).getByText('Sequência de derrotas')).toBeInTheDocument()
  })

  it('não inventa recordistas quando ainda não há partidas', async () => {
    const user = userEvent.setup()
    render(<RankingsPage players={seedPlayers} games={[]} />)

    expect(within(screen.getByRole('region', { name: 'Recordes individuais' })).getAllByText('Sem partidas ainda')).toHaveLength(2)
    await user.click(screen.getByRole('tab', { name: /duplas/i }))
    expect(within(screen.getByRole('region', { name: 'Recordes de duplas' })).getAllByText('Sem partidas ainda')).toHaveLength(2)
  })
})
