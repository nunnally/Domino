export type PeriodFilter = 'today' | '30d' | 'all'

export interface Player {
  id: string
  name: string
  photoUrl: string
  catchphrase?: string
  active: boolean
  createdAt: string
}

export const isGuestPlayer = (player: Pick<Player, 'id' | 'name'>) =>
  player.id === 'convidado' || player.name.trim().toLocaleLowerCase('pt-BR').startsWith('convidado')

export const playerDisplayName = (player: Pick<Player, 'id' | 'name'>) =>
  isGuestPlayer(player) ? 'Convidado' : player.name

export interface Game {
  id: string
  playedAt: string
  winnerIds: [string, string]
  loserIds: [string, string]
  winnerScore?: number
  loserScore?: number
  gabuadaIds?: string[]
  senaIds?: string[]
  latitude?: number
  longitude?: number
  createdAt: string
}

export interface IndividualStat {
  playerId: string
  name: string
  photoUrl: string
  catchphrase?: string
  games: number
  wins: number
  losses: number
  gabuadas: number
  senas: number
  winRate: number
  score: number
  minimumGames: number
  isQualified: boolean
  maxWinStreak: number
  maxLossStreak: number
}

export interface PairStat {
  pairKey: string
  playerIds: [string, string]
  names: [string, string]
  label: string
  photoUrls: [string, string]
  games: number
  wins: number
  losses: number
  winRate: number
  maxWinStreak: number
  maxLossStreak: number
  sampleSize: 'small' | 'established'
}

export interface HeadToHeadStat {
  matchupKey: string
  pairLabels: [string, string]
  games: number
  scoreByPair: Record<string, number>
  leaderLabel: string
  leaderWins: number
  trailerWins: number
  rivalryLabel: 'Primeiro confronto' | 'Duelo aberto' | 'Carrasco da rodada'
}

export interface PlayerScorePoint {
  gameId: string
  playedAt: string
  score: number
  result: 'win' | 'loss'
  opponentNames: string[]
  partnerName?: string
  gabuada: boolean
  sena: boolean
}

export interface PlayerRelationship {
  playerId: string
  name: string
  photoUrl: string
  games: number
  wins: number
  losses: number
}

export interface PlayerRelationships {
  mostWinsWith: PlayerRelationship[]
  mostLossesWith: PlayerRelationship[]
  mostWinsAgainst: PlayerRelationship[]
}
