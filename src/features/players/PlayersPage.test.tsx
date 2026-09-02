import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { seedPlayers } from '../../lib/seed'
import { PlayersPage } from './PlayersPage'

describe('PlayersPage', () => {
  it('permite editar a frase de um jogador', async () => {
    const user = userEvent.setup()
    const onUpdatePlayer = vi.fn()
    render(
      <PlayersPage
        players={seedPlayers}
        editable
        onAddPlayer={async () => {}}
        onUpdatePlayer={onUpdatePlayer}
      />,
    )

    await user.click(screen.getByRole('button', { name: /editar frase de césar/i }))
    const input = screen.getByLabelText('Frase de César')
    await user.clear(input)
    await user.type(input, 'A mesa é justa.')
    await user.click(screen.getByRole('button', { name: /salvar frase de césar/i }))

    expect(onUpdatePlayer).toHaveBeenCalledWith(seedPlayers[0], { catchphrase: 'A mesa é justa.' })
  })
})
