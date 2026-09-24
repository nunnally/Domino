import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { getIndividualStats } from '../../lib/stats'
import { seedGames, seedPlayers } from '../../lib/seed'
import { LeaderCard } from './LeaderCard'

describe('LeaderCard', () => {
  it('não anuncia um destaque provisório como líder oficial', () => {
    const provisional = getIndividualStats(seedPlayers, [seedGames[0]])
      .find(({ playerId }) => playerId === 'gustavo')!

    render(<LeaderCard players={[provisional]} />)

    expect(screen.getByText('Destaque provisório')).toBeInTheDocument()
    expect(screen.queryByLabelText('Líder')).not.toBeInTheDocument()
  })
})
