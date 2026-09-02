import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { seedPlayers } from '../../lib/seed'
import { GameForm } from './GameForm'
import { PinGate } from './PinGate'

describe('GameForm', () => {
  it('envia uma partida com quatro jogadores distintos', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn()
    render(<GameForm players={seedPlayers} onSave={onSave} onCancel={() => {}} />)

    await user.selectOptions(screen.getByLabelText('Vencedor 1'), 'cesar')
    await user.selectOptions(screen.getByLabelText('Vencedor 2'), 'vinicius')
    await user.selectOptions(screen.getByLabelText('Perdedor 1'), 'david')
    await user.selectOptions(screen.getByLabelText('Perdedor 2'), 'emanoel')
    await user.click(screen.getByRole('button', { name: /salvar partida/i }))

    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({
      winnerIds: ['cesar', 'vinicius'],
      loserIds: ['david', 'emanoel'],
    }))
  })

  it('mostra o erro quando um jogador aparece nas duas duplas', async () => {
    const user = userEvent.setup()
    render(<GameForm players={seedPlayers} onSave={() => {}} onCancel={() => {}} />)

    await user.selectOptions(screen.getByLabelText('Vencedor 1'), 'cesar')
    await user.selectOptions(screen.getByLabelText('Vencedor 2'), 'vinicius')
    await user.selectOptions(screen.getByLabelText('Perdedor 1'), 'cesar')
    await user.selectOptions(screen.getByLabelText('Perdedor 2'), 'emanoel')
    await user.click(screen.getByRole('button', { name: /salvar partida/i }))

    expect(screen.getByRole('alert')).toHaveTextContent('Escolha quatro jogadores diferentes.')
  })

  it('mostra o erro quando a data é apagada', async () => {
    const user = userEvent.setup()
    render(<GameForm players={seedPlayers} onSave={() => {}} onCancel={() => {}} />)

    await user.selectOptions(screen.getByLabelText('Vencedor 1'), 'cesar')
    await user.selectOptions(screen.getByLabelText('Vencedor 2'), 'vinicius')
    await user.selectOptions(screen.getByLabelText('Perdedor 1'), 'david')
    await user.selectOptions(screen.getByLabelText('Perdedor 2'), 'emanoel')
    await user.clear(screen.getByLabelText('Quando foi?'))
    await user.click(screen.getByRole('button', { name: /salvar partida/i }))

    expect(screen.getByRole('alert')).toHaveTextContent('Informe uma data válida.')
  })
})

describe('PinGate', () => {
  it('libera a edição com o PIN compartilhado', async () => {
    const user = userEvent.setup()
    const onUnlock = vi.fn()
    render(<PinGate expectedPin="1234" onUnlock={onUnlock} />)

    await user.type(screen.getByLabelText('PIN da mesa'), '1234')
    await user.click(screen.getByRole('button', { name: /liberar cadastro/i }))

    expect(onUnlock).toHaveBeenCalledOnce()
  })
})
