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
      ...Array.from({ length: 6 }, (_, index) => game(`with-second-${index}`, ['cesar', 'david'], ['machilas', 'gustavo'])),
      ...Array.from({ length: 6 }, (_, index) => game(`without-second-${index}`, ['machilas', 'gustavo'], ['emanoel', 'david'])),
      game('guest', ['convidado', 'joice'], ['machilas', 'gustavo']),
    ]

    const rankings = getPartnerImpactRankings(seedPlayers, games)

    expect(rankings.positive[0]).toMatchObject({ playerId: 'cesar', comparedGames: 12, partnerCount: 2 })
    expect(rankings.positive[0].impactPercentagePoints).toBe(60)
    expect(rankings.negative[0]).toMatchObject({ playerId: 'emanoel', comparedGames: 12, partnerCount: 2 })
    expect(rankings.negative[0].impactPercentagePoints).toBe(-60)
    expect(rankings.positive).toHaveLength(1)
    expect(rankings.negative).toHaveLength(1)
    expect(rankings.positive.every((row) => !rankings.negative.some((other) => other.playerId === row.playerId))).toBe(true)
    expect([...rankings.positive, ...rankings.negative].some((row) => row.playerId === 'convidado')).toBe(false)
  })

  it('exige 10 jogos comparáveis e duas duplas distintas', () => {
    const onlyOnePartner = [
      ...Array.from({ length: 10 }, (_, index) => game(`with-${index}`, ['cesar', 'vinicius'], ['machilas', 'gustavo'])),
      ...Array.from({ length: 10 }, (_, index) => game(`without-${index}`, ['machilas', 'gustavo'], ['emanoel', 'vinicius'])),
    ]
    const nineGamesTwoPartners = [
      ...Array.from({ length: 5 }, (_, index) => game(`with-a-${index}`, ['cesar', 'vinicius'], ['machilas', 'gustavo'])),
      ...Array.from({ length: 5 }, (_, index) => game(`without-a-${index}`, ['machilas', 'gustavo'], ['emanoel', 'vinicius'])),
      ...Array.from({ length: 4 }, (_, index) => game(`with-b-${index}`, ['cesar', 'david'], ['machilas', 'gustavo'])),
      ...Array.from({ length: 4 }, (_, index) => game(`without-b-${index}`, ['machilas', 'gustavo'], ['emanoel', 'david'])),
    ]

    expect(getPartnerImpactRankings(seedPlayers, onlyOnePartner).positive).toEqual([])
    expect(getPartnerImpactRankings(seedPlayers, nineGamesTwoPartners).positive).toEqual([])
    expect(getPartnerImpactRankings(seedPlayers, [
      ...nineGamesTwoPartners,
      game('tenth-a', ['cesar', 'david'], ['machilas', 'gustavo']),
      game('tenth-b', ['machilas', 'gustavo'], ['emanoel', 'david']),
    ]).positive[0]).toMatchObject({ playerId: 'cesar', comparedGames: 10, partnerCount: 2 })
  })
})
