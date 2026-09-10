import { seedGames, seedPlayers } from './seed'
import type { DominoRepository } from './repository'
import { isGuestPlayer, playerDisplayName } from './types'
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

  const readPlayers = () => {
    const players = read<Player[]>(PLAYERS_KEY, seedPlayers)
    let migrated = false
    let nextPlayers = players.map((player) => {
      if (isGuestPlayer(player) && player.name !== 'Convidado') {
        migrated = true
        return { ...player, name: playerDisplayName(player) }
      }
      if (player.id === 'cesar' && player.catchphrase === undefined) {
        migrated = true
        return { ...player, catchphrase: 'O bem prevalece.' }
      }
      if (player.id === 'machilas' && player.photoUrl.includes('dicebear.com/9.x/thumbs/svg?seed=Machilas')) {
        migrated = true
        return { ...player, photoUrl: 'assets/machilas.png' }
      }
      if (player.id === 'joice' && player.photoUrl.includes('dicebear.com')) {
        migrated = true
        return { ...player, photoUrl: 'assets/joice.jpg' }
      }
      return player
    })
    if (!nextPlayers.some((player) => player.id === 'joice')) {
      const joice = seedPlayers.find((player) => player.id === 'joice')
      if (joice) {
        nextPlayers = [...nextPlayers, joice]
        migrated = true
      }
    }
    if (!nextPlayers.some(isGuestPlayer)) {
      const guest = seedPlayers.find(isGuestPlayer)
      if (guest) {
        nextPlayers = [...nextPlayers, guest]
        migrated = true
      }
    }
    if (migrated) write(PLAYERS_KEY, nextPlayers)
    return nextPlayers
  }

  return {
    async listPlayers() {
      return clone(readPlayers())
    },
    async listGames() {
      const games = read<Game[]>(GAMES_KEY, seedGames)
      let migrated = false
      const nextGames = games.map((game) => {
        const seeded = seedGames.find(({ id }) => id === game.id)
        if (!seeded) return game
        const next = {
          ...game,
          ...(seeded.gabuadaIds && !game.gabuadaIds ? { gabuadaIds: seeded.gabuadaIds } : {}),
          ...(seeded.senaIds && !game.senaIds ? { senaIds: seeded.senaIds } : {}),
        }
        migrated ||= next.gabuadaIds !== game.gabuadaIds || next.senaIds !== game.senaIds
        return next
      })
      for (const seeded of seedGames) {
        if (!nextGames.some(({ id }) => id === seeded.id) && (seeded.id === 'seed-8' || seeded.id === 'seed-9')) {
          nextGames.push(seeded)
          migrated = true
        }
      }
      if (migrated) write(GAMES_KEY, nextGames)
      return clone(nextGames)
    },
    async addGame(game) {
      const games = read<Game[]>(GAMES_KEY, seedGames)
      write(GAMES_KEY, [game, ...games.filter(({ id }) => id !== game.id)])
      return clone(game)
    },
    async addPlayer(player) {
      const players = readPlayers()
      if (players.some(({ name }) => name.localeCompare(player.name, 'pt-BR', { sensitivity: 'base' }) === 0)) {
        throw new Error('Já existe um jogador com esse nome.')
      }
      write(PLAYERS_KEY, [...players, player])
      return clone(player)
    },
    async updatePlayer(id, changes) {
      const players = readPlayers()
      const current = players.find((player) => player.id === id)
      if (!current) throw new Error('Jogador não encontrado.')
      const normalizedChanges = changes.catchphrase === undefined
        ? changes
        : { ...changes, catchphrase: changes.catchphrase.trim() }
      const updated = { ...current, ...normalizedChanges }
      write(PLAYERS_KEY, players.map((player) => player.id === id ? updated : player))
      return clone(updated)
    },
  }
}
