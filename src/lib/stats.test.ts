import { describe, expect, it } from 'vitest'

import { seedGames, seedPlayers } from './seed'
import {
  filterGamesByPeriod,
  getHeadToHeadStats,
  getIndividualStats,
  getPairStats,
} from './stats'

describe('estatísticas das sete partidas iniciais', () => {
  it('contabiliza gabuadas por jogador e expõe o ranking de gabuadas', () => {
    const games = [
      { ...seedGames[0], gabuadaIds: ['cesar'] as string[], senaIds: ['emanoel'] as string[] },
      { ...seedGames[1], gabuadaIds: ['cesar'] as string[] },
      { ...seedGames[2], senaIds: ['emanoel'] as string[] },
    ]

    const cesar = getIndividualStats(seedPlayers, games).find(({ playerId }) => playerId === 'cesar')
    const emanoel = getIndividualStats(seedPlayers, games).find(({ playerId }) => playerId === 'emanoel')

    expect(cesar).toMatchObject({ gabuadas: 2, senas: 0 })
    expect(emanoel).toMatchObject({ gabuadas: 0, senas: 2 })
  })

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
      { name: 'César', games: 6, wins: 5, losses: 1, winRate: 83.3, maxWinStreak: 4, maxLossStreak: 1 },
      { name: 'Joice', games: 2, wins: 2, losses: 0, winRate: 100, maxWinStreak: 2, maxLossStreak: 0 },
      { name: 'Vinícius', games: 7, wins: 5, losses: 2, winRate: 71.4, maxWinStreak: 4, maxLossStreak: 2 },
      { name: 'Gustavo', games: 6, wins: 3, losses: 3, winRate: 50, maxWinStreak: 2, maxLossStreak: 2 },
      { name: 'Machilas', games: 6, wins: 3, losses: 3, winRate: 50, maxWinStreak: 2, maxLossStreak: 2 },
      { name: 'David', games: 4, wins: 0, losses: 4, winRate: 0, maxWinStreak: 0, maxLossStreak: 4 },
      { name: 'Emanoel', games: 5, wins: 0, losses: 5, winRate: 0, maxWinStreak: 0, maxLossStreak: 5 },
    ])
  })

  it('calcula score com volume, penaliza Sena perdida e marca amostras provisórias', () => {
    const games = [
      { ...seedGames[0], id: 'score-1', winnerIds: ['cesar', 'gustavo'] as [string, string], loserIds: ['vinicius', 'machilas'] as [string, string], senaIds: ['vinicius'] },
      { ...seedGames[1], id: 'score-2', winnerIds: ['cesar', 'gustavo'] as [string, string], loserIds: ['vinicius', 'machilas'] as [string, string], senaIds: ['vinicius'] },
    ]

    const stats = getIndividualStats(seedPlayers, games)
    const cesar = stats.find(({ playerId }) => playerId === 'cesar')!
    const vinicius = stats.find(({ playerId }) => playerId === 'vinicius')!

    expect(cesar.score).toBe(64.1)
    expect(vinicius.score).toBe(35.9)
    expect(vinicius.score).toBeLessThan(50)
    expect(cesar.isQualified).toBe(false)
  })

  it('aplica o mínimo de jogos configurado para o ranking válido', () => {
    const stats = getIndividualStats(seedPlayers, seedGames)

    expect(stats.find(({ playerId }) => playerId === 'cesar')?.minimumGames).toBe(10)
    expect(stats.find(({ playerId }) => playerId === 'joice')?.isQualified).toBe(false)
  })

  it('não inclui o convidado nos rankings', () => {
    const stats = getIndividualStats(seedPlayers, seedGames)

    expect(stats.some(({ name }) => name === 'Convidado')).toBe(false)
  })

it('leva a frase opcional do jogador para o ranking', () => {
  const playersWithCatchphrase = seedPlayers.map((player) =>
    player.id === 'cesar'
      ? { ...player, catchphrase: 'O bem prevalece.' }
      : player,
  )

  expect(
    getIndividualStats(playersWithCatchphrase, seedGames)[0],
  ).toMatchObject({
    name: 'César',
    catchphrase: 'O bem prevalece.',
  })
})

  it('desempata partidas do mesmo minuto pela criação e pelo id', () => {
    const playedAt = '2026-09-02T14:00:00-03:00'
    const makeGame = (id: string, createdAt: string, cesarWon: boolean) => ({
      ...seedGames[0],
      id,
      playedAt,
      createdAt,
      winnerIds: cesarWon ? ['cesar', 'vinicius'] as [string, string] : ['david', 'emanoel'] as [string, string],
      loserIds: cesarWon ? ['david', 'emanoel'] as [string, string] : ['cesar', 'vinicius'] as [string, string],
    })
    const games = [
      makeGame('a', '2026-09-02T14:01:00-03:00', true),
      makeGame('c', '2026-09-02T14:03:00-03:00', false),
      makeGame('b', '2026-09-02T14:02:00-03:00', true),
      makeGame('d', '2026-09-02T14:04:00-03:00', false),
    ]

    expect(getIndividualStats(seedPlayers, games).find(({ playerId }) => playerId === 'cesar')).toMatchObject({
      maxWinStreak: 2,
      maxLossStreak: 2,
    })
    expect(getPairStats(seedPlayers, games).find(({ label }) => label === 'César & Vinícius')).toMatchObject({
      maxWinStreak: 2,
      maxLossStreak: 2,
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
      { label: 'Gustavo & Machilas', games: 6, wins: 3, losses: 3, winRate: 50, sampleSize: 'established', maxWinStreak: 2, maxLossStreak: 2 },
      { label: 'César & Joice', games: 1, wins: 1, losses: 0, winRate: 100, sampleSize: 'small', maxWinStreak: 1, maxLossStreak: 0 },
      { label: 'Joice & Vinícius', games: 1, wins: 1, losses: 0, winRate: 100, sampleSize: 'small', maxWinStreak: 1, maxLossStreak: 0 },
      { label: 'David & Emanoel', games: 4, wins: 0, losses: 4, winRate: 0, sampleSize: 'established', maxWinStreak: 0, maxLossStreak: 4 },
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
