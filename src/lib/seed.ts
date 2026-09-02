import type { Game, Player } from './types'

const createdAt = '2026-09-02T08:00:00-03:00'

export const seedPlayers: Player[] = [
  { id: 'cesar', name: 'César', photoUrl: 'https://api.dicebear.com/10.x/thumbs/svg?seed=Cesar', active: true, createdAt },
  { id: 'vinicius', name: 'Vinícius', photoUrl: 'https://api.dicebear.com/10.x/thumbs/svg?seed=Vinicius', active: true, createdAt },
  { id: 'machilas', name: 'Máchilas', photoUrl: 'https://api.dicebear.com/10.x/thumbs/svg?seed=Machilas', active: true, createdAt },
  { id: 'gustavo', name: 'Gustavo', photoUrl: 'https://api.dicebear.com/10.x/thumbs/svg?seed=Gustavo', active: true, createdAt },
  { id: 'david', name: 'David', photoUrl: 'https://api.dicebear.com/10.x/thumbs/svg?seed=David', active: true, createdAt },
  { id: 'emanoel', name: 'Emanoel', photoUrl: 'https://api.dicebear.com/10.x/thumbs/svg?seed=Emanoel', active: true, createdAt },
]

const seedGame = (
  id: string,
  time: string,
  winnerIds: [string, string],
  loserIds: [string, string],
): Game => ({
  id,
  playedAt: `2026-09-02T${time}:00-03:00`,
  winnerIds,
  loserIds,
  createdAt,
})

export const seedGames: Game[] = [
  seedGame('seed-1', '09:00', ['machilas', 'gustavo'], ['david', 'emanoel']),
  seedGame('seed-2', '09:30', ['cesar', 'vinicius'], ['machilas', 'gustavo']),
  seedGame('seed-3', '10:00', ['cesar', 'vinicius'], ['david', 'emanoel']),
  seedGame('seed-4', '10:30', ['cesar', 'vinicius'], ['machilas', 'gustavo']),
  seedGame('seed-5', '11:00', ['cesar', 'vinicius'], ['david', 'emanoel']),
  seedGame('seed-6', '11:30', ['machilas', 'gustavo'], ['cesar', 'vinicius']),
  seedGame('seed-7', '12:00', ['machilas', 'gustavo'], ['emanoel', 'vinicius']),
]

