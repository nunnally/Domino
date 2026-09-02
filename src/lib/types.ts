export type PeriodFilter = 'today' | '30d' | 'all'

export interface Player {
  id: string
  name: string
  photoUrl: string
  active: boolean
  createdAt: string
}

export interface Game {
  id: string
  playedAt: string
  winnerIds: [string, string]
  loserIds: [string, string]
  winnerScore?: number
  loserScore?: number
  createdAt: string
}

export interface IndividualStat {
  playerId: string
  name: string
  photoUrl: string
  games: number
  wins: number
  losses: number
  winRate: number
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

