export interface GameDraft {
  winnerIds: [string, string]
  loserIds: [string, string]
  playedAt: string
  winnerScore?: number
  loserScore?: number
  gabuadaIds?: string[]
  senaIds?: string[]
  latitude?: number
  longitude?: number
}

export type ValidationErrors = Partial<Record<'players' | 'date' | 'score', string>>

interface GameValidationOptions {
  allowDuplicatePlayerIds?: ReadonlySet<string>
}

export function validateGameDraft(
  draft: GameDraft,
  options: GameValidationOptions = {},
): ValidationErrors {
  const ids = [...draft.winnerIds, ...draft.loserIds]
  if (ids.some((id) => !id)) return { players: 'Complete as duas duplas.' }
  const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index)
  if (duplicateIds.some((id) => !options.allowDuplicatePlayerIds?.has(id))) {
    return { players: 'Escolha quatro jogadores diferentes.' }
  }
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
