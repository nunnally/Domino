import { describe, expect, it } from 'vitest'

import { seedPlayers } from './seed'
import { getPartnerImpactRankings } from './stats'
import type { Game } from './types'

const game = (id: string, winners: [string, string], losers: [string, string]): Game => ({
  id,
  winnerIds: winners,
  loserIds: losers,
  playedAt: '2026-09-16T12:00:00-03:00',
  createdAt: '2026-09-16T12:00:00-03:00',
})

describe('impacto de um jogador sobre seus parceiros', () => {
  it('compara vitórias do parceiro com e sem a dupla, sem repetir nomes entre os rankings', () => {
    const games = [
      ...Array.from({ length: 6 }, (_, index) => game(`with-${index}`, ['cesar', 'vinicius'], ['machilas', 'gustavo'])),
      ...Array.from({ length: 6 }, (_, index) => game(`without-${index}`, ['machilas', 'gustavo'], ['emanoel', 'vinicius'])),
    ]

    const rankings = getPartnerImpactRankings(seedPlayers, games)

    expect(rankings.positive[0]).toMatchObject({ playerId: 'cesar', comparedGames: 6, partnerCount: 1 })
    expect(rankings.positive[0].impactPercentagePoints).toBe(48)
    expect(rankings.negative[0]).toMatchObject({ playerId: 'emanoel', comparedGames: 6, partnerCount: 1 })
    expect(rankings.negative[0].impactPercentagePoints).toBe(-48)
    expect(rankings.positive).toHaveLength(1)
    expect(rankings.negative).toHaveLength(1)
    expect(rankings.positive.every((row) => !rankings.negative.some((other) => other.playerId === row.playerId))).toBe(true)
  })

  it('reduz o efeito de poucos jogos e ignora convidados ou parceiros sem histórico comparável', () => {
    const rankings = getPartnerImpactRankings(seedPlayers, [
      game('with', ['cesar', 'vinicius'], ['machilas', 'gustavo']),
      game('without', ['machilas', 'gustavo'], ['emanoel', 'vinicius']),
      game('guest', ['convidado', 'joice'], ['david', 'cesar']),
    ])

    expect(rankings.positive.find((row) => row.playerId === 'cesar')?.impactPercentagePoints).toBe(12)
    expect(rankings.negative.find((row) => row.playerId === 'emanoel')?.impactPercentagePoints).toBe(-12)
    expect([...rankings.positive, ...rankings.negative].some((row) => row.playerId === 'convidado')).toBe(false)
  })
})
