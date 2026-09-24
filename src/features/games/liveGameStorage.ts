export type TeamId = "A" | "B";

export type MatchEventType =
  | "point"
  | "gabuada";

export type MatchMoment =
  | "point"
  | "tie"
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

  type: MatchEventType;

  team: TeamId;

  playerId?: string;

  createdAt: string;

  previousScoreA?: number;
  previousScoreB?: number;

  /*
   * Permite restaurar corretamente o banner
   * anterior ao usar "Desfazer".
   */
  previousMoment?: MatchMoment | null;

  previousMomentTeam?: TeamId | null;

  previousMomentContent?: MomentContent | null;
}

export interface StoredLiveGame {
  version: 1;

  teamA: string[];
  teamB: string[];

  scoreA: number;
  scoreB: number;

  events: MatchEvent[];

  moment: MatchMoment | null;

  momentTeam: TeamId | null;

  momentContent: MomentContent | null;

  startedAt: string | null;

  updatedAt: string;
}

export const LIVE_GAME_STORAGE_KEY =
  "domino-zaaaap:live-game:v1";

const MATCH_MOMENTS: MatchMoment[] = [
  "point",
  "tie",
  "close",
  "comeback",
  "match-point",
  "gabuada",
  "gabuada-opening",
  "gabuada-comeback",
  "victory",
  "dominant",
];

const isTeamId = (
  value: unknown,
): value is TeamId =>
  value === "A" ||
  value === "B";

const isMatchMoment = (
  value: unknown,
): value is MatchMoment =>
  typeof value === "string" &&
  MATCH_MOMENTS.includes(
    value as MatchMoment,
  );

const isMomentContent = (
  value: unknown,
): value is MomentContent => {
  if (
    !value ||
    typeof value !== "object"
  ) {
    return false;
  }

  const content =
    value as MomentContent;

  return (
    typeof content.kicker ===
      "string" &&
    typeof content.title ===
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

  const event =
    value as MatchEvent;

  return (
    typeof event.id ===
      "string" &&
    (event.type === "point" ||
      event.type === "gabuada") &&
    isTeamId(event.team) &&
    typeof event.createdAt ===
      "string"
  );
};

export const getStoredLiveGame =
  (): StoredLiveGame | null => {
    if (
      typeof window ===
      "undefined"
    ) {
      return null;
    }

    try {
      const raw =
        window.localStorage.getItem(
          LIVE_GAME_STORAGE_KEY,
        );

      if (!raw) {
        return null;
      }

      const parsed = JSON.parse(
        raw,
      ) as Partial<StoredLiveGame>;

      if (
        parsed.version !== 1
      ) {
        return null;
      }

      if (
        !Array.isArray(
          parsed.teamA,
        ) ||
        !Array.isArray(
          parsed.teamB,
        )
      ) {
        return null;
      }

      if (
        !parsed.teamA.every(
          (id) =>
            typeof id ===
            "string",
        ) ||
        !parsed.teamB.every(
          (id) =>
            typeof id ===
            "string",
        )
      ) {
        return null;
      }

      if (
        typeof parsed.scoreA !==
          "number" ||
        !Number.isFinite(
          parsed.scoreA,
        ) ||
        typeof parsed.scoreB !==
          "number" ||
        !Number.isFinite(
          parsed.scoreB,
        )
      ) {
        return null;
      }

      const events =
        Array.isArray(
          parsed.events,
        )
          ? parsed.events.filter(
              isMatchEvent,
            )
          : [];

      const moment =
        parsed.moment &&
        isMatchMoment(
          parsed.moment,
        )
          ? parsed.moment
          : null;

      const momentTeam =
        isTeamId(
          parsed.momentTeam,
        )
          ? parsed.momentTeam
          : null;

      const momentContent =
        isMomentContent(
          parsed.momentContent,
        )
          ? parsed.momentContent
          : null;

      return {
        version: 1,

        teamA:
          parsed.teamA,

        teamB:
          parsed.teamB,

        scoreA: Math.max(
          0,
          parsed.scoreA,
        ),

        scoreB: Math.max(
          0,
          parsed.scoreB,
        ),

        events,

        moment,

        momentTeam,

        momentContent,

        startedAt:
          typeof parsed.startedAt ===
          "string"
            ? parsed.startedAt
            : null,

        updatedAt:
          typeof parsed.updatedAt ===
          "string"
            ? parsed.updatedAt
            : new Date().toISOString(),
      };
    } catch (error) {
      console.warn(
        "Não foi possível recuperar a partida salva:",
        error,
      );

      return null;
    }
  };

export const saveStoredLiveGame = (
  game: StoredLiveGame,
) => {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  try {
    window.localStorage.setItem(
      LIVE_GAME_STORAGE_KEY,
      JSON.stringify(game),
    );
  } catch (error) {
    console.warn(
      "Não foi possível salvar a partida localmente:",
      error,
    );
  }
};

export const clearStoredLiveGame =
  () => {
    if (
      typeof window ===
      "undefined"
    ) {
      return;
    }

    try {
      window.localStorage.removeItem(
        LIVE_GAME_STORAGE_KEY,
      );
    } catch (error) {
      console.warn(
        "Não foi possível limpar a partida salva:",
        error,
      );
    }
  };