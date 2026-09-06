import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { seedPlayers } from '../../lib/seed'
import { GameForm } from './GameForm'
import { PinGate } from './PinGate'

describe('GameForm', () => {
  it('envia uma partida com quatro jogadores distintos', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn()
    render(<GameForm players={seedPlayers} onSave={onSave} onCancel={() => {}} locate={async () => ({ latitude: -23.5505, longitude: -46.6333 })} />)

    await user.selectOptions(screen.getByLabelText('Vencedor 1'), 'cesar')
    await user.selectOptions(screen.getByLabelText('Vencedor 2'), 'vinicius')
    await user.selectOptions(screen.getByLabelText('Perdedor 1'), 'david')
    await user.selectOptions(screen.getByLabelText('Perdedor 2'), 'emanoel')
    await user.click(screen.getByRole('button', { name: /salvar partida/i }))

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith(expect.objectContaining({
        winnerIds: ['cesar', 'vinicius'],
        loserIds: ['david', 'emanoel'],
        latitude: -23.5505,
        longitude: -46.6333,
      }))
    })
  })

  it('salva normalmente quando a localização não está disponível', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn()
    render(<GameForm players={seedPlayers} onSave={onSave} onCancel={() => {}} locate={async () => undefined} />)

    await user.selectOptions(screen.getByLabelText('Vencedor 1'), 'cesar')
    await user.selectOptions(screen.getByLabelText('Vencedor 2'), 'vinicius')
    await user.selectOptions(screen.getByLabelText('Perdedor 1'), 'david')
    await user.selectOptions(screen.getByLabelText('Perdedor 2'), 'emanoel')
    await user.click(screen.getByRole('button', { name: /salvar partida/i }))

    await waitFor(() => expect(onSave).toHaveBeenCalledOnce())
    expect(onSave.mock.calls[0][0]).not.toHaveProperty('latitude')
    expect(onSave.mock.calls[0][0]).not.toHaveProperty('longitude')
  })

  it('envia gabuada e sena opcionais dos jogadores selecionados', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn()
    render(<GameForm players={seedPlayers} onSave={onSave} onCancel={() => {}} locate={async () => undefined} />)

    await user.selectOptions(screen.getByLabelText('Vencedor 1'), 'cesar')
    await user.selectOptions(screen.getByLabelText('Vencedor 2'), 'vinicius')
    await user.selectOptions(screen.getByLabelText('Perdedor 1'), 'david')
    await user.selectOptions(screen.getByLabelText('Perdedor 2'), 'emanoel')
    await user.click(screen.getByRole('checkbox', { name: /gabuada.*césar/i }))
    await user.click(screen.getByRole('checkbox', { name: /sena.*emanoel/i }))
    await user.click(screen.getByRole('button', { name: /salvar partida/i }))

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith(expect.objectContaining({
        gabuadaIds: ['cesar'],
        senaIds: ['emanoel'],
      }))
    })
  })

  it('abre o seletor customizado com avatar e nome', async () => {
    const user = userEvent.setup()
    render(<GameForm players={seedPlayers} onSave={() => {}} onCancel={() => {}} />)

    await user.click(screen.getByRole('button', { name: /vencedor 1: escolher jogador/i }))

    const menu = screen.getByRole('listbox', { name: /opções de vencedor 1/i })
    expect(within(menu).getByRole('option', { name: /césar/i })).toBeInTheDocument()
    expect(within(menu).getByRole('option', { name: /foto de césar.*césar/i })).toBeInTheDocument()
  })

  it('permite apenas uma gabuada e uma sena por partida', async () => {
    const user = userEvent.setup()
    render(<GameForm players={seedPlayers} onSave={() => {}} onCancel={() => {}} />)

    await user.selectOptions(screen.getByLabelText('Vencedor 1'), 'cesar')
    await user.selectOptions(screen.getByLabelText('Vencedor 2'), 'vinicius')
    await user.selectOptions(screen.getByLabelText('Perdedor 1'), 'david')
    await user.selectOptions(screen.getByLabelText('Perdedor 2'), 'emanoel')
    const cesarBonus = screen.getByRole('checkbox', { name: /gabuada.*césar/i })
    const viniciusBonus = screen.getByRole('checkbox', { name: /gabuada.*vinícius/i })
    const cesarSena = screen.getByRole('checkbox', { name: /sena.*césar/i })
    const davidBonus = screen.getByRole('checkbox', { name: /sena.*david/i })
    const emanoelBonus = screen.getByRole('checkbox', { name: /sena.*emanoel/i })

    await user.click(cesarBonus)
    await user.click(viniciusBonus)
    await user.click(cesarSena)
    await user.click(davidBonus)
    await user.click(emanoelBonus)

    expect(cesarBonus).not.toBeChecked()
    expect(viniciusBonus).toBeChecked()
    expect(cesarSena).not.toBeChecked()
    expect(davidBonus).not.toBeChecked()
    expect(emanoelBonus).toBeChecked()
  })

  it('salva sem localização quando o provedor falha', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn()
    render(<GameForm players={seedPlayers} onSave={onSave} onCancel={() => {}} locate={async () => { throw new Error('permissão bloqueada') }} />)

    await user.selectOptions(screen.getByLabelText('Vencedor 1'), 'cesar')
    await user.selectOptions(screen.getByLabelText('Vencedor 2'), 'vinicius')
    await user.selectOptions(screen.getByLabelText('Perdedor 1'), 'david')
    await user.selectOptions(screen.getByLabelText('Perdedor 2'), 'emanoel')
    await user.click(screen.getByRole('button', { name: /salvar partida/i }))

    await waitFor(() => expect(onSave).toHaveBeenCalledOnce())
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
    const { container } = render(<PinGate expectedPin="1234" onUnlock={onUnlock} />)

    await user.type(container.querySelector('input[type="password"]')!, '1234')
    await user.click(screen.getByRole('button', { name: /liberar cadastro/i }))

    expect(onUnlock).toHaveBeenCalledOnce()
  })
})
