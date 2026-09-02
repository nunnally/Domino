import { describe, expect, it } from 'vitest'

import { seedGames, seedPlayers } from './seed'
import {
  filterGamesByPeriod,
  getHeadToHeadStats,
  getIndividualStats,
  getPairStats,
} from './stats'

describe('estatísticas das sete partidas iniciais', () => {
  it('calcula vitórias, derrotas e aproveitamento individual', () => {
    const stats = getIndividualStats(seedPlayers, [...seedGames].reverse())

    expect(stats.map(({ name, games, wins, losses, winRate, maxWinStreak, maxLossStreak }) => ({
      name,
      games,
      wins,
      losses,
      winRate,
      maxWinStreak,
      maxLossStreak,
    }))).toEqual([
      { name: 'César', games: 5, wins: 4, losses: 1, winRate: 80, maxWinStreak: 4, maxLossStreak: 1 },
      { name: 'Vinícius', games: 6, wins: 4, losses: 2, winRate: 66.7, maxWinStreak: 4, maxLossStreak: 2 },
      { name: 'Gustavo', games: 5, wins: 3, losses: 2, winRate: 60, maxWinStreak: 2, maxLossStreak: 2 },
      { name: 'Machilas', games: 5, wins: 3, losses: 2, winRate: 60, maxWinStreak: 2, maxLossStreak: 2 },
      { name: 'David', games: 3, wins: 0, losses: 3, winRate: 0, maxWinStreak: 0, maxLossStreak: 3 },
      { name: 'Emanoel', games: 4, wins: 0, losses: 4, winRate: 0, maxWinStreak: 0, maxLossStreak: 4 },
    ])
  })

  it('leva a frase opcional do jogador para o ranking', () => {
    expect(getIndividualStats(seedPlayers, seedGames)[0]).toMatchObject({
      name: 'César',
      catchphrase: 'O bem prevalece.',
    })
  })

  it('trata a ordem dos parceiros como a mesma dupla', () => {
    const stats = getPairStats(seedPlayers, seedGames)

    expect(stats.map(({ label, games, wins, losses, winRate, sampleSize, maxWinStreak, maxLossStreak }) => ({
      label,
      games,
      wins,
      losses,
      winRate,
      sampleSize,
      maxWinStreak,
      maxLossStreak,
    }))).toEqual([
      { label: 'César & Vinícius', games: 5, wins: 4, losses: 1, winRate: 80, sampleSize: 'established', maxWinStreak: 4, maxLossStreak: 1 },
      { label: 'Gustavo & Machilas', games: 5, wins: 3, losses: 2, winRate: 60, sampleSize: 'established', maxWinStreak: 2, maxLossStreak: 2 },
      { label: 'David & Emanoel', games: 3, wins: 0, losses: 3, winRate: 0, sampleSize: 'established', maxWinStreak: 0, maxLossStreak: 3 },
      { label: 'Emanoel & Vinícius', games: 1, wins: 0, losses: 1, winRate: 0, sampleSize: 'small', maxWinStreak: 0, maxLossStreak: 1 },
    ])
  })

  it('agrega o placar entre duas duplas', () => {
    const confrontation = getHeadToHeadStats(seedPlayers, seedGames).find(
      ({ pairLabels }) => pairLabels.includes('César & Vinícius') && pairLabels.includes('Gustavo & Machilas'),
    )

    expect(confrontation).toMatchObject({
      games: 3,
      leaderLabel: 'César & Vinícius',
      leaderWins: 2,
      trailerWins: 1,
      rivalryLabel: 'Carrasco da rodada',
    })
  })

  it('filtra partidas de hoje sem alterar o histórico completo', () => {
    const now = new Date('2026-09-02T15:00:00-03:00')
    const games = [
      { ...seedGames[0], id: 'today', playedAt: '2026-09-02T10:00:00-03:00' },
      { ...seedGames[1], id: 'old', playedAt: '2026-07-01T10:00:00-03:00' },
    ]

    expect(filterGamesByPeriod(games, 'today', now).map(({ id }) => id)).toEqual(['today'])
    expect(filterGamesByPeriod(games, 'all', now)).toHaveLength(2)
  })
})
