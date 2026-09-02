import { seedGames, seedPlayers } from './seed'
import type { DominoRepository } from './repository'
import type { Game, Player } from './types'

const PLAYERS_KEY = 'domino-zaaaap:players:v1'
const GAMES_KEY = 'domino-zaaaap:games:v1'

export interface StorageLike {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

const clone = <T>(value: T): T => structuredClone(value)

export function createLocalRepository(storage: StorageLike): DominoRepository {
  const read = <T>(key: string, seed: T): T => {
    const stored = storage.getItem(key)
    if (stored) return JSON.parse(stored) as T
    storage.setItem(key, JSON.stringify(seed))
    return clone(seed)
  }

  const write = <T>(key: string, value: T) => storage.setItem(key, JSON.stringify(value))

  return {
    async listPlayers() {
      return clone(read<Player[]>(PLAYERS_KEY, seedPlayers))
    },
    async listGames() {
      return clone(read<Game[]>(GAMES_KEY, seedGames))
    },
    async addGame(game) {
      const games = read<Game[]>(GAMES_KEY, seedGames)
      write(GAMES_KEY, [game, ...games.filter(({ id }) => id !== game.id)])
      return clone(game)
    },
    async addPlayer(player) {
      const players = read<Player[]>(PLAYERS_KEY, seedPlayers)
      if (players.some(({ name }) => name.localeCompare(player.name, 'pt-BR', { sensitivity: 'base' }) === 0)) {
        throw new Error('Já existe um jogador com esse nome.')
      }
      write(PLAYERS_KEY, [...players, player])
      return clone(player)
    },
    async updatePlayer(id, changes) {
      const players = read<Player[]>(PLAYERS_KEY, seedPlayers)
      const current = players.find((player) => player.id === id)
      if (!current) throw new Error('Jogador não encontrado.')
      const updated = { ...current, ...changes }
      write(PLAYERS_KEY, players.map((player) => player.id === id ? updated : player))
      return clone(updated)
    },
  }
}

