export type TeamId = "A" | "B";

export type MatchMoment =
  | "point"
  | "tie"
  | "epic-tie"
  | "close"
  | "comeback"
  | "match-point"
  | "gabuada"
  | "gabuada-opening"
  | "gabuada-comeback"
  | "victory"
  | "dominant";

export interface MomentContent {
  kicker: string;
  title: string;
}

export interface MatchEvent {
  id: string;

  type: "point" | "gabuada";

  team: TeamId;

  playerId?: string;

  createdAt: string;

  /*
   * Usados principalmente pela Gabuada.
   *
   * Como a Gabuada encerra imediatamente a partida,
   * precisamos saber qual era o placar antes dela
   * para que o botão "Desfazer" consiga restaurar
   * corretamente a partida.
   */
  previousScoreA?: number;

  previousScoreB?: number;

  /*
   * Guarda o momento que estava sendo exibido
   * antes deste evento.
   *
   * Isso permite que "Desfazer" restaure também
   * o banner anterior da partida.
   */
  previousMoment?: MatchMoment | null;

  previousMomentTeam?: TeamId | null;

  previousMomentContent?: MomentContent | null;
}

export interface StoredLiveGame {
  /*
   * Versão da estrutura salva no localStorage.
   *
   * Se no futuro a estrutura mudar de forma
   * incompatível, podemos aumentar esta versão.
   */
  version: 1;

  /*
   * IDs dos jogadores de cada dupla.
   */
  teamA: string[];

  teamB: string[];

  /*
   * Placar atual.
   */
  scoreA: number;

  scoreB: number;

  /*
   * Histórico dos acontecimentos da partida.
   */
  events: MatchEvent[];

  /*
   * Momento atualmente exibido no banner.
   *
   * Exemplos:
   *
   * point
   * tie
   * epic-tie
   * comeback
   * match-point
   * gabuada
   * victory
   */
  moment: MatchMoment | null;

  /*
   * Dupla responsável pelo momento atual.
   */
  momentTeam: TeamId | null;

  /*
   * Texto sorteado para o banner atual.
   *
   * Salvamos isso para evitar que, ao atualizar
   * a página, outra frase seja escolhida.
   */
  momentContent: MomentContent | null;

  /*
   * Momento em que a partida começou.
   */
  startedAt: string | null;

  /*
   * Última atualização da cópia temporária.
   */
  updatedAt: string;
}

const LIVE_GAME_STORAGE_KEY =
  "domino-live-game";

/*
 * =====================================================
 * VALIDADORES
 * =====================================================
 */

const isTeamId = (
  value: unknown,
): value is TeamId =>
  value === "A" || value === "B";

const isMatchMoment = (
  value: unknown,
): value is MatchMoment =>
  value === "point" ||
  value === "tie" ||
  value === "epic-tie" ||
  value === "close" ||
  value === "comeback" ||
  value === "match-point" ||
  value === "gabuada" ||
  value === "gabuada-opening" ||
  value === "gabuada-comeback" ||
  value === "victory" ||
  value === "dominant";

const isMomentContent = (
  value: unknown,
): value is MomentContent => {
  if (
    !value ||
    typeof value !== "object"
  ) {
    return false;
  }

  const candidate =
    value as Partial<MomentContent>;

  return (
    typeof candidate.kicker ===
      "string" &&
    typeof candidate.title ===
      "string"
  );
};

const isMatchEvent = (
  value: unknown,
): value is MatchEvent => {
  if (
    !value ||
    typeof value !== "object"
  ) {
    return false;
  }

  const candidate =
    value as Partial<MatchEvent>;

  if (
    typeof candidate.id !==
      "string" ||
    (candidate.type !== "point" &&
      candidate.type !==
        "gabuada") ||
    !isTeamId(candidate.team) ||
    typeof candidate.createdAt !==
      "string"
  ) {
    return false;
  }

  if (
    candidate.playerId !==
      undefined &&
    typeof candidate.playerId !==
      "string"
  ) {
    return false;
  }

  if (
    candidate.previousScoreA !==
      undefined &&
    typeof candidate.previousScoreA !==
      "number"
  ) {
    return false;
  }

  if (
    candidate.previousScoreB !==
      undefined &&
    typeof candidate.previousScoreB !==
      "number"
  ) {
    return false;
  }

  if (
    candidate.previousMoment !==
      undefined &&
    candidate.previousMoment !==
      null &&
    !isMatchMoment(
      candidate.previousMoment,
    )
  ) {
    return false;
  }

  if (
    candidate.previousMomentTeam !==
      undefined &&
    candidate.previousMomentTeam !==
      null &&
    !isTeamId(
      candidate.previousMomentTeam,
    )
  ) {
    return false;
  }

  if (
    candidate.previousMomentContent !==
      undefined &&
    candidate.previousMomentContent !==
      null &&
    !isMomentContent(
      candidate.previousMomentContent,
    )
  ) {
    return false;
  }

  return true;
};

const isStoredLiveGame = (
  value: unknown,
): value is StoredLiveGame => {
  if (
    !value ||
    typeof value !== "object"
  ) {
    return false;
  }

  const candidate =
    value as Partial<StoredLiveGame>;

  if (candidate.version !== 1) {
    return false;
  }

  if (
    !Array.isArray(candidate.teamA) ||
    !candidate.teamA.every(
      (id) => typeof id === "string",
    )
  ) {
    return false;
  }

  if (
    !Array.isArray(candidate.teamB) ||
    !candidate.teamB.every(
      (id) => typeof id === "string",
    )
  ) {
    return false;
  }

  if (
    typeof candidate.scoreA !==
      "number" ||
    typeof candidate.scoreB !==
      "number"
  ) {
    return false;
  }

  if (
    !Array.isArray(candidate.events) ||
    !candidate.events.every(
      isMatchEvent,
    )
  ) {
    return false;
  }

  if (
    candidate.moment !== null &&
    candidate.moment !== undefined &&
    !isMatchMoment(candidate.moment)
  ) {
    return false;
  }

  if (
    candidate.momentTeam !== null &&
    candidate.momentTeam !==
      undefined &&
    !isTeamId(candidate.momentTeam)
  ) {
    return false;
  }

  if (
    candidate.momentContent !== null &&
    candidate.momentContent !==
      undefined &&
    !isMomentContent(
      candidate.momentContent,
    )
  ) {
    return false;
  }

  if (
    candidate.startedAt !== null &&
    candidate.startedAt !==
      undefined &&
    typeof candidate.startedAt !==
      "string"
  ) {
    return false;
  }

  if (
    typeof candidate.updatedAt !==
    "string"
  ) {
    return false;
  }

  return true;
};

/*
 * =====================================================
 * SALVAR
 * =====================================================
 */

export const saveStoredLiveGame = (
  game: StoredLiveGame,
) => {
  try {
    window.localStorage.setItem(
      LIVE_GAME_STORAGE_KEY,
      JSON.stringify(game),
    );
  } catch (error) {
    console.warn(
      "Não foi possível salvar a partida em andamento:",
      error,
    );
  }
};

/*
 * =====================================================
 * RECUPERAR
 * =====================================================
 */

export const getStoredLiveGame =
  (): StoredLiveGame | null => {
    try {
      const stored =
        window.localStorage.getItem(
          LIVE_GAME_STORAGE_KEY,
        );

      if (!stored) {
        return null;
      }

      const parsed: unknown =
        JSON.parse(stored);

      if (!isStoredLiveGame(parsed)) {
        console.warn(
          "Partida salva possui formato inválido. O registro temporário será removido.",
        );

        clearStoredLiveGame();

        return null;
      }

      return parsed;
    } catch (error) {
      console.warn(
        "Não foi possível recuperar a partida em andamento:",
        error,
      );

      clearStoredLiveGame();

      return null;
    }
  };


export const clearStoredLiveGame =
  () => {
    try {
      window.localStorage.removeItem(
        LIVE_GAME_STORAGE_KEY,
      );
    } catch (error) {
      console.warn(
        "Não foi possível remover a partida em andamento:",
        error,
      );
    }
  };