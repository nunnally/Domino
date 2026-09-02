import { render, screen } from '@testing-library/react'
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
})
