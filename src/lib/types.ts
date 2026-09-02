export type PeriodFilter = 'today' | '30d' | 'all'

export interface Player {
  id: string
  name: string
  photoUrl: string
  catchphrase?: string
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
  winRate: number
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
