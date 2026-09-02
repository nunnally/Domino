import { describe, expect, it } from 'vitest'

import type { GameDraft } from './validation'
import { validateGameDraft } from './validation'

const validDraft: GameDraft = {
  winnerIds: ['cesar', 'vinicius'],
  loserIds: ['david', 'emanoel'],
  playedAt: '2026-09-02T12:00:00-03:00',
}

describe('validateGameDraft', () => {
  it('aceita quatro jogadores distintos', () => {
    expect(validateGameDraft(validDraft)).toEqual({})
  })

  it('rejeita jogador repetido entre as duplas', () => {
    expect(validateGameDraft({
      ...validDraft,
      loserIds: ['david', 'cesar'],
    })).toEqual({ players: 'Escolha quatro jogadores diferentes.' })
  })

  it('rejeita campos de jogador vazios', () => {
    expect(validateGameDraft({
      ...validDraft,
      winnerIds: ['cesar', ''],
    })).toHaveProperty('players', 'Complete as duas duplas.')
  })

  it('exige placar vencedor maior quando os dois placares existem', () => {
    expect(validateGameDraft({
      ...validDraft,
      winnerScore: 5,
      loserScore: 5,
    })).toHaveProperty('score', 'O placar vencedor precisa ser maior.')
  })
})

