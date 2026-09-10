import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  ArrowLeft,
  Bomb,
  Check,
  Crown,
  Flame,
  RotateCcw,
  Sparkles,
  Swords,
  Trophy,
  Undo2,
  Zap,
} from "lucide-react";

import { PlayerAvatar } from "../../components/PlayerAvatar";

import {
  isGuestPlayer,
  type Player,
} from "../../lib/types";

import {
  validateGameDraft,
  type GameDraft,
} from "../../lib/validation";

import type { LiveTeam } from "./LiveGameSetup";

type TeamId = "A" | "B";

type MatchEventType = "point" | "gabuada";

interface MatchEvent {
  id: string;
  type: MatchEventType;
  team: TeamId;
  playerId?: string;
  createdAt: string;
  previousScoreA?: number;
  previousScoreB?: number;
}

type MatchMoment =
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

interface GabuadaCelebration {
  playerName: string;
  teamName: string;
}

interface LiveGameProps {
  players: Player[];
  teamA: LiveTeam;
  teamB: LiveTeam;
  onSave: (draft: GameDraft) => void | Promise<void>;
  onCancel: () => void;
  locate?: () => Promise<
    | {
        latitude: number;
        longitude: number;
      }
    | undefined
  >;
}

const WINNING_SCORE = 4;

const locateCurrentGame = () =>
  new Promise<
    | {
        latitude: number;
        longitude: number;
      }
    | undefined
  >((resolve) => {
    if (!navigator.geolocation) {
      resolve(undefined);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        resolve({
          latitude: coords.latitude,
          longitude: coords.longitude,
        });
      },
      () => resolve(undefined),
      {
        enableHighAccuracy: false,
        timeout: 3_000,
        maximumAge: 60_000,
      },
    );
  });

const momentContent: Record<
  MatchMoment,
  {
    kicker: string;
    title: string;
  }
> = {
  point: {
    kicker: "Ponto!",
    title: "A mesa continua.",
  },
  tie: {
    kicker: "Tudo igual",
    title: "Ninguém abre vantagem.",
  },
  close: {
    kicker: "Partida acirrada",
    title: "Agora ninguém pisca.",
  },
  comeback: {
    kicker: "Virou!",
    title: "A mesa mudou de lado.",
  },
  "match-point": {
    kicker: "Ponto decisivo",
    title: "Uma mão pode acabar com tudo.",
  },
  gabuada: {
    kicker: "Gabuada!",
    title: "Pode registrar na súmula.",
  },
  "gabuada-opening": {
    kicker: "Começou assim?!",
    title: "Gabuada logo de saída.",
  },
  "gabuada-comeback": {
    kicker: "Gabuada na reação!",
    title: "A pressão mudou de lado.",
  },
  victory: {
    kicker: "Vitória!",
    title: "Tem dupla vencedora.",
  },
  dominant: {
    kicker: "4 × 0",
    title: "Não deixou nem respirar.",
  },
};

export function LiveGame({
  players,
  teamA,
  teamB,
  onSave,
  onCancel,
  locate = locateCurrentGame,
}: LiveGameProps) {
  const startedAtRef = useRef<string | null>(null);

  const victoryPanelRef = useRef<HTMLElement | null>(null);

  const gabuadaAnimationTimerRef = useRef<number | null>(null);

  const [scoreA, setScoreA] = useState(0);
  const [scoreB, setScoreB] = useState(0);

  const [events, setEvents] = useState<MatchEvent[]>([]);

  const [moment, setMoment] = useState<MatchMoment | null>(null);

  const [momentTeam, setMomentTeam] = useState<TeamId | null>(null);

  const [gabuadaTeam, setGabuadaTeam] = useState<TeamId | null>(null);

  const [gabuadaCelebration, setGabuadaCelebration] =
    useState<GabuadaCelebration | null>(null);

  const [saving, setSaving] = useState(false);

  const [saved, setSaved] = useState(false);

  const [saveError, setSaveError] = useState("");

  const teamAPlayers = useMemo(
    () =>
      teamA
        .map((id) => players.find((player) => player.id === id))
        .filter((player): player is Player => Boolean(player)),
    [players, teamA],
  );

  const teamBPlayers = useMemo(
    () =>
      teamB
        .map((id) => players.find((player) => player.id === id))
        .filter((player): player is Player => Boolean(player)),
    [players, teamB],
  );

  const finished =
    scoreA >= WINNING_SCORE ||
    scoreB >= WINNING_SCORE;

  const winningTeam: TeamId | null =
    scoreA >= WINNING_SCORE
      ? "A"
      : scoreB >= WINNING_SCORE
        ? "B"
        : null;

  const pointEventsCount = events.filter(
    (event) => event.type === "point",
  ).length;

  const getTeamPlayers = (team: TeamId) =>
    team === "A" ? teamAPlayers : teamBPlayers;

  const teamName = (team: TeamId) =>
    getTeamPlayers(team)
      .map((player) => player.name)
      .join(" + ");

  const ensureStartedAt = () => {
    if (!startedAtRef.current) {
      startedAtRef.current = new Date().toISOString();
    }

    return startedAtRef.current;
  };

  useEffect(() => {
    if (!finished) {
      return;
    }

    const timer = window.setTimeout(() => {
      victoryPanelRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 650);

    return () => {
      window.clearTimeout(timer);
    };
  }, [finished]);

  useEffect(() => {
    return () => {
      if (gabuadaAnimationTimerRef.current) {
        window.clearTimeout(gabuadaAnimationTimerRef.current);
      }
    };
  }, []);

  const hadLargeDeficit = (team: TeamId) => {
    let a = 0;
    let b = 0;

    for (const event of events) {
      if (event.type !== "point") {
        continue;
      }

      if (event.team === "A") {
        a += 1;
      } else {
        b += 1;
      }

      if (team === "A" && b - a >= 2) {
        return true;
      }

      if (team === "B" && a - b >= 2) {
        return true;
      }
    }

    return false;
  };

  const detectPointMoment = (
    team: TeamId,
    previousA: number,
    previousB: number,
    nextA: number,
    nextB: number,
  ): MatchMoment => {
    if (
      nextA === WINNING_SCORE ||
      nextB === WINNING_SCORE
    ) {
      const loserScore =
        nextA === WINNING_SCORE
          ? nextB
          : nextA;

      if (loserScore === 0) {
        return "dominant";
      }

      return "victory";
    }

    const scoringTeamWasLosing =
      team === "A"
        ? previousA < previousB
        : previousB < previousA;

    const scoringTeamNowAhead =
      team === "A"
        ? nextA > nextB
        : nextB > nextA;

    if (
      scoringTeamWasLosing &&
      scoringTeamNowAhead
    ) {
      return "comeback";
    }

    if (
      nextA === nextB &&
      nextA >= 2
    ) {
      return "tie";
    }

    if (
      nextA === WINNING_SCORE - 1 ||
      nextB === WINNING_SCORE - 1
    ) {
      return "match-point";
    }

    if (
      Math.abs(nextA - nextB) === 1 &&
      Math.max(nextA, nextB) >= 2
    ) {
      return "close";
    }

    return "point";
  };

  const triggerGabuadaCelebration = (
    playerName: string,
    selectedTeam: TeamId,
  ) => {
    if (gabuadaAnimationTimerRef.current) {
      window.clearTimeout(
        gabuadaAnimationTimerRef.current,
      );
    }

    setGabuadaCelebration({
      playerName,
      teamName: teamName(selectedTeam),
    });

    gabuadaAnimationTimerRef.current =
      window.setTimeout(() => {
        setGabuadaCelebration(null);
      }, 2200);
  };

  const addPoint = (team: TeamId) => {
    if (finished || saving || saved) {
      return;
    }

    ensureStartedAt();

    const previousA = scoreA;
    const previousB = scoreB;

    const nextA =
      team === "A"
        ? Math.min(scoreA + 1, WINNING_SCORE)
        : scoreA;

    const nextB =
      team === "B"
        ? Math.min(scoreB + 1, WINNING_SCORE)
        : scoreB;

    const nextMoment = detectPointMoment(
      team,
      previousA,
      previousB,
      nextA,
      nextB,
    );

    const pointEvent: MatchEvent = {
      id: crypto.randomUUID(),
      type: "point",
      team,
      createdAt: new Date().toISOString(),
    };

    setScoreA(nextA);
    setScoreB(nextB);

    setEvents((current) => [
      ...current,
      pointEvent,
    ]);

    setMoment(nextMoment);
    setMomentTeam(team);
    setGabuadaTeam(null);
    setSaveError("");
  };

  const registerGabuada = (
    team: TeamId,
    playerId: string,
  ) => {
    if (finished || saving || saved) {
      return;
    }

    const player = players.find(
      (currentPlayer) =>
        currentPlayer.id === playerId,
    );

    if (!player) {
      return;
    }

    ensureStartedAt();

    const previousScoreA = scoreA;
    const previousScoreB = scoreB;

    const totalPoints = scoreA + scoreB;

    let nextMoment: MatchMoment = "gabuada";

    if (totalPoints <= 1) {
      nextMoment = "gabuada-opening";
    } else if (hadLargeDeficit(team)) {
      nextMoment = "gabuada-comeback";
    }

    const event: MatchEvent = {
      id: crypto.randomUUID(),
      type: "gabuada",
      team,
      playerId,
      createdAt: new Date().toISOString(),
      previousScoreA,
      previousScoreB,
    };

    if (team === "A") {
      setScoreA(WINNING_SCORE);
    } else {
      setScoreB(WINNING_SCORE);
    }

    setEvents((current) => [
      ...current,
      event,
    ]);

    setMoment(nextMoment);
    setMomentTeam(team);
    setGabuadaTeam(null);
    setSaveError("");

    triggerGabuadaCelebration(
      player.name,
      team,
    );
  };

  const undoLastEvent = () => {
    if (saving || saved) {
      return;
    }

    const lastEvent = events.at(-1);

    if (!lastEvent) {
      return;
    }

    if (lastEvent.type === "point") {
      if (lastEvent.team === "A") {
        setScoreA((current) =>
          Math.max(0, current - 1),
        );
      } else {
        setScoreB((current) =>
          Math.max(0, current - 1),
        );
      }
    }

    if (lastEvent.type === "gabuada") {
      setScoreA(
        lastEvent.previousScoreA ?? 0,
      );

      setScoreB(
        lastEvent.previousScoreB ?? 0,
      );

      if (gabuadaAnimationTimerRef.current) {
        window.clearTimeout(
          gabuadaAnimationTimerRef.current,
        );

        gabuadaAnimationTimerRef.current = null;
      }

      setGabuadaCelebration(null);
    }

    setEvents((current) =>
      current.slice(0, -1),
    );

    setMoment(null);
    setMomentTeam(null);
    setGabuadaTeam(null);
    setSaveError("");
  };

  const getLocationForSave = async () => {
    try {
      return await Promise.race([
        locate(),
        new Promise<undefined>((resolve) => {
          window.setTimeout(
            () => resolve(undefined),
            1800,
          );
        }),
      ]);
    } catch {
      return undefined;
    }
  };

  const saveFinishedGame = async () => {
    if (!winningTeam || saving || saved) {
      return;
    }

    const winnerIds =
      winningTeam === "A"
        ? teamA
        : teamB;

    const loserIds =
      winningTeam === "A"
        ? teamB
        : teamA;

    const winnerScore =
      winningTeam === "A"
        ? scoreA
        : scoreB;

    const loserScore =
      winningTeam === "A"
        ? scoreB
        : scoreA;

    const lastGabuada = [...events]
      .reverse()
      .find(
        (event) =>
          event.type === "gabuada" &&
          Boolean(event.playerId),
      );

    const validGabuadaId =
      lastGabuada?.playerId &&
      winnerIds.includes(
        lastGabuada.playerId,
      )
        ? lastGabuada.playerId
        : undefined;

    const draft: GameDraft = {
      winnerIds,
      loserIds,
      winnerScore,
      loserScore,
      playedAt:
        startedAtRef.current ??
        new Date().toISOString(),
      gabuadaIds: validGabuadaId
        ? [validGabuadaId]
        : [],
      senaIds: [],
    };
const guestIds = new Set(
  players
    .filter(isGuestPlayer)
    .map(({ id }) => id),
);

const errors = validateGameDraft(draft, {
  allowDuplicatePlayerIds: guestIds,
});
    

    if (Object.keys(errors).length > 0) {
      console.error(
        "Erro de validação ao salvar partida ao vivo:",
        errors,
        draft,
      );

      setSaveError(
        errors.players ??
          errors.score ??
          errors.date ??
          "Não foi possível validar os dados da partida.",
      );

      return;
    }

    setSaving(true);
    setSaveError("");

    try {
      const location =
        await getLocationForSave();

      await onSave({
        ...draft,
        ...location,
      });

      setSaved(true);
    } catch (error) {
      console.error(
        "Erro ao salvar partida ao vivo:",
        error,
      );

      setSaveError(
        "Não foi possível salvar a partida. Tente novamente.",
      );
    } finally {
      setSaving(false);
    }
  };

  const renderTeamAvatars = (
    team: TeamId,
  ) => (
    <div className="live-team-players">
      {getTeamPlayers(team).map(
        (player) => (
          <div
            className="live-team-player"
            key={player.id}
          >
            <PlayerAvatar
              name={player.name}
              photoUrl={player.photoUrl}
              mood="serious"
            />

            <span>{player.name}</span>
          </div>
        ),
      )}
    </div>
  );

  const renderGabuadaPicker = () => {
    if (!gabuadaTeam) {
      return null;
    }

    return (
      <div
        className="gabuada-picker-backdrop"
        onClick={() =>
          setGabuadaTeam(null)
        }
      >
        <div
          className="gabuada-picker"
          role="dialog"
          aria-modal="true"
          aria-label="Marcar Gabuada"
          onClick={(event) => {
            event.stopPropagation();
          }}
        >
          <div className="gabuada-picker-icon">
            <Bomb
              size={30}
              strokeWidth={2.7}
            />
          </div>

          <span className="eyebrow">
            Gabuada
          </span>

          <h2>Quem aplicou?</h2>

          <p>
            {teamName(gabuadaTeam)}
          </p>

          <div className="gabuada-player-options">
 {getTeamPlayers(
  gabuadaTeam,
).map((player, index) => (
  <button
    type="button"
    className="gabuada-player-option"
    key={`${gabuadaTeam}-${player.id}-${index}`}
                onClick={() =>
                  registerGabuada(
                    gabuadaTeam,
                    player.id,
                  )
                }
              >
                <PlayerAvatar
                  name={player.name}
                  photoUrl={player.photoUrl}
                  mood="serious"
                />

                <strong>
                  {player.name}
                </strong>
              </button>
            ))}
          </div>

          <button
            className="button"
            type="button"
            onClick={() =>
              setGabuadaTeam(null)
            }
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  };

  const MomentIcon =
    moment === "dominant"
      ? Zap
      : moment === "victory"
        ? Trophy
        : moment?.startsWith(
              "gabuada",
            )
          ? Bomb
          : moment === "comeback"
            ? Flame
            : moment === "close" ||
                moment === "tie"
              ? Swords
              : Sparkles;

  return (
    <section className="live-game-page">
      <div className="page-wrap live-game-shell">
        <header className="live-game-topbar">
          <button
            className="back-button"
            type="button"
            onClick={onCancel}
          >
            <ArrowLeft size={19} />
            Sair
          </button>

          <span className="live-indicator">
            <span />
            Ao vivo
          </span>
        </header>

        <main
          className={[
            "live-score-card",
            moment
              ? `live-moment-${moment}`
              : "",
          ].join(" ")}
        >
          <div className="live-score-heading">
            <div>
              <p className="eyebrow">
                Partida ao vivo
              </p>

              <h1>
                Placar da mesa
              </h1>
            </div>

            <div className="live-round-count">
              <strong>
                {pointEventsCount + 1}
              </strong>

              <span>Rodada</span>
            </div>
          </div>

          <div className="live-scoreboard">
            <section
              className={[
                "live-team",
                "live-team-a",
                momentTeam === "A"
                  ? "moment-team"
                  : "",
              ].join(" ")}
            >
              <span className="sticker sticker-yellow">
                Dupla 01
              </span>

              {renderTeamAvatars("A")}

              <strong className="live-score-number">
                {scoreA}
              </strong>

              <button
                className="live-point-button"
                type="button"
                disabled={
                  finished ||
                  saving ||
                  saved
                }
                onClick={() =>
                  addPoint("A")
                }
              >
                +1 ponto
              </button>
            </section>

            <div className="live-score-versus">
              <Swords
                size={24}
                strokeWidth={3}
              />

              <strong>VS.</strong>
            </div>

            <section
              className={[
                "live-team",
                "live-team-b",
                momentTeam === "B"
                  ? "moment-team"
                  : "",
              ].join(" ")}
            >
              <span className="sticker sticker-violet">
                Dupla 02
              </span>

              {renderTeamAvatars("B")}

              <strong className="live-score-number">
                {scoreB}
              </strong>

              <button
                className="live-point-button"
                type="button"
                disabled={
                  finished ||
                  saving ||
                  saved
                }
                onClick={() =>
                  addPoint("B")
                }
              >
                +1 ponto
              </button>
            </section>
          </div>

          {moment && (
            <div
              className={`live-moment-banner live-moment-banner-${moment}`}
            >
              <MomentIcon
                size={31}
                strokeWidth={2.7}
              />

              <div>
                <span>
                  {
                    momentContent[
                      moment
                    ].kicker
                  }
                </span>

                <strong>
                  {
                    momentContent[
                      moment
                    ].title
                  }
                </strong>

                {momentTeam && (
                  <small>
                    {teamName(
                      momentTeam,
                    )}
                  </small>
                )}
              </div>
            </div>
          )}

          {!finished && (
            <div className="live-gabuada-actions">
              <button
                className="gabuada-button"
                type="button"
                onClick={() =>
                  setGabuadaTeam("A")
                }
              >
                <Bomb size={20} />
                Gabuada
                <small>
                  Dupla 01
                </small>
              </button>

              <button
                className="gabuada-button"
                type="button"
                onClick={() =>
                  setGabuadaTeam("B")
                }
              >
                <Bomb size={20} />
                Gabuada
                <small>
                  Dupla 02
                </small>
              </button>
            </div>
          )}

          {finished &&
            winningTeam && (
              <section
                className="live-victory-panel"
                ref={victoryPanelRef}
              >
                <Crown
                  className="live-victory-crown"
                  size={47}
                  strokeWidth={2.5}
                />

                <span>
                  Partida encerrada
                </span>

                <h2>
                  {teamName(
                    winningTeam,
                  )}
                </h2>

                <strong>
                  {scoreA} × {scoreB}
                </strong>

                <p>
                  A súmula não mente.
                </p>

                {!saved && (
                  <button
                    className="button button-primary live-save-button"
                    type="button"
                    disabled={saving}
                    onClick={() => {
                      void saveFinishedGame();
                    }}
                  >
                    <Check size={19} />

                    {saving
                      ? "Salvando…"
                      : saveError
                        ? "Tentar salvar novamente"
                        : "Salvar nos resultados"}
                  </button>
                )}

                {saveError && (
                  <p
                    className="form-error live-save-error"
                    role="alert"
                  >
                    {saveError}
                  </p>
                )}

                {saved && (
                  <p className="live-save-success">
                    <Check size={20} />
                    Partida registrada nos resultados.
                  </p>
                )}
              </section>
            )}

          <section className="live-match-log">
            <div className="live-match-log-heading">
              <span>
                Últimas rodadas
              </span>

              <button
                type="button"
                disabled={
                  events.length === 0 ||
                  saving ||
                  saved
                }
                onClick={undoLastEvent}
              >
                <Undo2 size={16} />
                Desfazer
              </button>
            </div>

            {events.length === 0 ? (
              <p className="live-log-empty">
                A primeira rodada ainda não foi marcada.
              </p>
            ) : (
              <div className="live-log-list">
                {[...events]
                  .reverse()
                  .slice(0, 5)
                  .map(
                    (
                      event,
                      index,
                    ) => {
                      const player =
                        event.playerId
                          ? players.find(
                              (
                                currentPlayer,
                              ) =>
                                currentPlayer.id ===
                                event.playerId,
                            )
                          : null;

                      return (
                        <div
                          className="live-log-item"
                          key={event.id}
                        >
                          <span className="live-log-number">
                            {String(
                              events.length -
                                index,
                            ).padStart(
                              2,
                              "0",
                            )}
                          </span>

                          <div>
                            <strong>
                              {event.type ===
                              "gabuada"
                                ? `Gabuada — ${
                                    player?.name ??
                                    teamName(
                                      event.team,
                                    )
                                  }`
                                : `${teamName(
                                    event.team,
                                  )} marcou`}
                            </strong>

                            <span>
                              {event.type ===
                              "gabuada"
                                ? "💥 Gabuada"
                                : "+1 ponto"}
                            </span>
                          </div>
                        </div>
                      );
                    },
                  )}
              </div>
            )}
          </section>

          {!finished && (
            <footer className="live-game-footer">
              <button
                className="button"
                type="button"
                disabled={
                  events.length === 0
                }
                onClick={undoLastEvent}
              >
                <RotateCcw size={18} />
                Desfazer última
              </button>
            </footer>
          )}
        </main>
      </div>

      {renderGabuadaPicker()}

      {gabuadaCelebration && (
        <div
          className="gabuada-celebration"
          aria-live="assertive"
          aria-label="Gabuada"
        >
          <div className="gabuada-explosion">
            <span />
            <span />
            <span />
            <span />
          </div>

          <div className="gabuada-aaah">
            <span>A</span>
            <span>A</span>
            <span>A</span>
            <span>A</span>
            <span>H</span>
            <span>!</span>
            <span>!</span>
          </div>

          <div className="gabuada-big-title">
            GABUADA!
          </div>

          <div className="gabuada-celebration-player">
            {
              gabuadaCelebration.playerName
            }
          </div>

          <div className="gabuada-celebration-team">
            {
              gabuadaCelebration.teamName
            }
          </div>

          <Bomb
            className="gabuada-celebration-bomb"
            size={66}
            strokeWidth={3}
          />
        </div>
      )}
    </section>
  );
}