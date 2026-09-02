import { describe, expect, it } from 'vitest'

import { createMemoryStorage } from '../test/memory-storage'
import { createLocalRepository } from './local-repository'
import type { Game } from './types'

const extraGame: Game = {
  id: 'extra-game',
  playedAt: '2026-09-02T14:00:00-03:00',
  winnerIds: ['david', 'emanoel'],
  loserIds: ['cesar', 'vinicius'],
  createdAt: '2026-09-02T14:00:00-03:00',
}

describe('local repository', () => {
  it('inicializa os seis jogadores e sete partidas', async () => {
    const repository = createLocalRepository(createMemoryStorage())

    expect(await repository.listPlayers()).toHaveLength(6)
    expect(await repository.listGames()).toHaveLength(7)
  })

  it('mantém a partida salva ao criar outra instância', async () => {
    const storage = createMemoryStorage()
    const first = createLocalRepository(storage)
    await first.addGame(extraGame)

    const second = createLocalRepository(storage)
    expect((await second.listGames()).some(({ id }) => id === extraGame.id)).toBe(true)
  })

  it('cadastra e arquiva um jogador sem apagar o registro', async () => {
    const repository = createLocalRepository(createMemoryStorage())
    await repository.addPlayer({
      id: 'novo',
      name: 'Novo jogador',
      photoUrl: 'https://example.com/novo.jpg',
      active: true,
      createdAt: '2026-09-02T14:00:00-03:00',
    })
    await repository.updatePlayer('novo', { active: false, catchphrase: 'Cheguei na mesa.' })

    expect((await repository.listPlayers()).find(({ id }) => id === 'novo')).toMatchObject({
      name: 'Novo jogador',
      active: false,
      catchphrase: 'Cheguei na mesa.',
    })
  })

  it('atualiza dados locais antigos com a frase do César sem apagar personalizações', async () => {
    const storage = createMemoryStorage()
    const oldPlayers = [
      { id: 'cesar', name: 'César', photoUrl: 'https://example.com/cesar.jpg', active: true, createdAt: '2026-09-02T08:00:00-03:00' },
    ]
    storage.setItem('domino-zaaaap:players:v1', JSON.stringify(oldPlayers))

    const [cesar] = await createLocalRepository(storage).listPlayers()

    expect(cesar).toMatchObject({
      photoUrl: 'https://example.com/cesar.jpg',
      catchphrase: 'O bem prevalece.',
    })
  })
})
