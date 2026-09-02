export interface GameDraft {
  winnerIds: [string, string]
  loserIds: [string, string]
  playedAt: string
  winnerScore?: number
  loserScore?: number
}

export type ValidationErrors = Partial<Record<'players' | 'date' | 'score', string>>

export function validateGameDraft(draft: GameDraft): ValidationErrors {
  const ids = [...draft.winnerIds, ...draft.loserIds]
  if (ids.some((id) => !id)) return { players: 'Complete as duas duplas.' }
  if (new Set(ids).size !== 4) return { players: 'Escolha quatro jogadores diferentes.' }
  if (!draft.playedAt || Number.isNaN(new Date(draft.playedAt).getTime())) {
    return { date: 'Informe uma data válida.' }
  }

  const hasWinnerScore = draft.winnerScore !== undefined
  const hasLoserScore = draft.loserScore !== undefined
  if (hasWinnerScore !== hasLoserScore) return { score: 'Preencha os dois placares.' }
  if (hasWinnerScore && hasLoserScore && draft.winnerScore! <= draft.loserScore!) {
    return { score: 'O placar vencedor precisa ser maior.' }
  }

  return {}
}

