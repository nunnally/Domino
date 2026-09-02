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
    await repository.updatePlayer('novo', { active: false })

    expect((await repository.listPlayers()).find(({ id }) => id === 'novo')).toMatchObject({
      name: 'Novo jogador',
      active: false,
    })
  })
})
