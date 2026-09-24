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

import {
  clearStoredLiveGame,
  getStoredLiveGame,
  saveStoredLiveGame,
  type MatchEvent,
  type MatchMoment,
  type MomentContent,
  type StoredLiveGame,
  type TeamId,
} from "./liveGameStorage";

interface GabuadaCelebration {
  playerName: string;
  teamName: string;
}

interface LiveGameProps {
  players: Player[];

  teamA: LiveTeam;

  teamB: LiveTeam;

  onSave: (
    draft: GameDraft,
  ) =>
    | void
    | Promise<void>;

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

const momentContent: Record<
  MatchMoment,
  MomentContent[]
> = {
  point: [
    {
      kicker: "Ponto!",
      title:
        "A mesa continua.",
    },

    {
      kicker: "Na conta!",
      title:
        "Mais um para a dupla.",
    },

    {
      kicker: "Bateu!",
      title:
        "O placar se mexe de novo.",
    },

    {
      kicker: "Valeu!",
      title:
        "A pressão muda de lado.",
    },

    {
      kicker: "Mais um!",
      title:
        "O jogo segue quente.",
    },

    {
      kicker:
        "Pedra certa",
      title:
        "Jogada convertida em ponto.",
    },

    {
      kicker:
        "Sem conversa",
      title:
        "Ponto confirmado na mesa.",
    },

    {
      kicker:
        "Tá valendo!",
      title:
        "A disputa ganha mais um capítulo.",
    },

    {
      kicker: "Boa!",
      title:
        "Mais um anotado na súmula.",
    },

    {
      kicker:
        "Foi pra conta",
      title:
        "O placar não perdoa.",
    },
  ],

  tie: [
    {
      kicker:
        "Tudo igual",
      title:
        "Ninguém abre vantagem.",
    },

    {
      kicker: "Empatou!",
      title:
        "Voltamos à estaca zero.",
    },

    {
      kicker:
        "Lá e cá",
      title:
        "O placar não escolhe lado.",
    },

    {
      kicker:
        "Zerou a vantagem",
      title:
        "Agora é braço de ferro.",
    },

    {
      kicker: "Igualou!",
      title:
        "A mesa ficou pequena para os dois lados.",
    },
  ],

  close: [
    {
      kicker:
        "Partida acirrada",
      title:
        "Agora ninguém pisca.",
    },

    {
      kicker: "Colado!",
      title:
        "Uma rodada separa as duplas.",
    },

    {
      kicker:
        "No detalhe",
      title:
        "Qualquer vacilo custa caro.",
    },

    {
      kicker:
        "Jogo quente",
      title:
        "A mesa apertou de vez.",
    },

    {
      kicker:
        "Tá pegando fogo",
      title:
        "Ninguém consegue escapar.",
    },
  ],

  comeback: [
    {
      kicker: "Virou!",
      title:
        "A mesa mudou de lado.",
    },

    {
      kicker:
        "Passou na frente!",
      title:
        "Quem perseguia agora lidera.",
    },

    {
      kicker:
        "Reação completa",
      title:
        "A virada está no placar.",
    },

    {
      kicker:
        "De trás pra frente",
      title:
        "A vantagem trocou de dono.",
    },

    {
      kicker:
        "Que virada!",
      title:
        "O jogo mudou completamente.",
    },
  ],

  "match-point": [
    {
      kicker:
        "Ponto decisivo",
      title:
        "Uma mão pode acabar com tudo.",
    },

    {
      kicker:
        "Na boca da vitória",
      title:
        "Falta só mais um.",
    },

    {
      kicker: "É agora!",
      title:
        "Um ponto separa a dupla da vitória.",
    },

    {
      kicker:
        "Sem margem",
      title:
        "A próxima pode fechar a conta.",
    },

    {
      kicker:
        "Vale tudo agora",
      title:
        "Mais um ponto e acabou.",
    },
  ],

  gabuada: [
    {
      kicker: "Gabuada!",
      title:
        "Pode registrar na súmula.",
    },

    {
      kicker: "GABUADA!",
      title:
        "A mesa sentiu essa.",
    },

    {
      kicker:
        "Foi de gabuada!",
      title:
        "Pode fechar a conta.",
    },

    {
      kicker:
        "Sem piedade!",
      title:
        "Gabuada registrada.",
    },
  ],

  "gabuada-opening": [
    {
      kicker:
        "Começou assim?!",
      title:
        "Gabuada logo de saída.",
    },

    {
      kicker:
        "Nem deu tempo!",
      title:
        "A partida mal começou e já terminou assim.",
    },

    {
      kicker: "Que isso?!",
      title:
        "Gabuada antes da mesa esquentar.",
    },

    {
      kicker:
        "Foi rápido!",
      title:
        "A gabuada veio cedo demais.",
    },
  ],

  "gabuada-comeback": [
    {
      kicker:
        "Gabuada na reação!",
      title:
        "A pressão mudou de lado.",
    },

    {
      kicker:
        "Virada com requintes!",
      title:
        "A reação terminou em gabuada.",
    },

    {
      kicker:
        "Não é possível!",
      title:
        "Buscou o jogo e terminou de gabuada.",
    },

    {
      kicker:
        "Que reação!",
      title:
        "Saiu de trás para fechar com gabuada.",
    },
  ],

  victory: [
    {
      kicker: "Vitória!",
      title:
        "Tem dupla vencedora.",
    },

    {
      kicker: "Acabou!",
      title:
        "A mesa já tem seus vencedores.",
    },

    {
      kicker:
        "Fechou a conta!",
      title:
        "Vitória confirmada.",
    },

    {
      kicker:
        "Fim de jogo!",
      title:
        "Pode colocar na história.",
    },

    {
      kicker: "Deu eles!",
      title:
        "A dupla fecha a partida.",
    },
  ],

  dominant: [
    {
      kicker: "4 × 0",
      title:
        "Não deixou nem respirar.",
    },

    {
      kicker: "PASSEIO!",
      title:
        "A outra dupla não viu a cor da bola.",
    },

    {
      kicker:
        "Sem resposta!",
      title:
        "Quatro pontos e nenhum do outro lado.",
    },

    {
      kicker: "Dominante!",
      title:
        "Foi do começo ao fim.",
    },

    {
      kicker: "Atropelou!",
      title:
        "A súmula terminou em 4 × 0.",
    },
  ],
};

const locateCurrentGame =
  () =>
    new Promise<
      | {
          latitude: number;
          longitude: number;
        }
      | undefined
    >((resolve) => {
      if (
        !navigator.geolocation
      ) {
        resolve(undefined);

        return;
      }

      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          resolve({
            latitude:
              coords.latitude,

            longitude:
              coords.longitude,
          });
        },

        () =>
          resolve(
            undefined,
          ),

        {
          enableHighAccuracy:
            false,

          timeout: 3_000,

          maximumAge:
            60_000,
        },
      );
    });

const sameTeam = (
  storedTeam:
    readonly string[],

  currentTeam:
    readonly string[],
) =>
  [...storedTeam]
    .sort()
    .join("|") ===
  [...currentTeam]
    .sort()
    .join("|");

const chooseMomentContent = (
  moment: MatchMoment,

  previous?:
    | MomentContent
    | null,
): MomentContent => {
  const options =
    momentContent[moment];

  if (
    options.length === 1
  ) {
    return options[0];
  }

  const availableOptions =
    previous
      ? options.filter(
          (option) =>
            option.kicker !==
              previous.kicker ||
            option.title !==
              previous.title,
        )
      : options;

  const choices =
    availableOptions.length >
    0
      ? availableOptions
      : options;

  const index =
    Math.floor(
      Math.random() *
        choices.length,
    );

  return choices[index];
};

export function LiveGame({
  players,
  teamA,
  teamB,
  onSave,
  onCancel,
  locate = locateCurrentGame,
}: LiveGameProps) {
  /*
   * =====================================================
   * RECUPERAÇÃO
   * =====================================================
   */

  const [restoredGame] =
    useState<
      StoredLiveGame | null
    >(() => {
      const stored =
        getStoredLiveGame();

      if (!stored) {
        return null;
      }

      /*
       * Só restaura a partida se forem
       * exatamente as mesmas duplas.
       */
      if (
        !sameTeam(
          stored.teamA,
          teamA,
        ) ||
        !sameTeam(
          stored.teamB,
          teamB,
        )
      ) {
        return null;
      }

      return stored;
    });

  const startedAtRef =
    useRef<string | null>(
      restoredGame?.startedAt ??
        null,
    );

  const victoryPanelRef =
    useRef<HTMLElement | null>(
      null,
    );

  const gabuadaAnimationTimerRef =
    useRef<number | null>(
      null,
    );

  /*
   * Evita que um useEffect grave novamente
   * uma partida que acabou de ser descartada.
   */
  const discardingRef =
    useRef(false);

  /*
   * Proteção extra contra dois cliques
   * simultâneos em "Salvar".
   */
  const saveInFlightRef =
    useRef(false);

  /*
   * =====================================================
   * ESTADOS DA PARTIDA
   * =====================================================
   */

  const [scoreA, setScoreA] =
    useState(
      restoredGame?.scoreA ??
        0,
    );

  const [scoreB, setScoreB] =
    useState(
      restoredGame?.scoreB ??
        0,
    );

  const [events, setEvents] =
    useState<MatchEvent[]>(
      restoredGame?.events ??
        [],
    );

  const [
    showAbandonConfirm,
    setShowAbandonConfirm,
  ] = useState(false);

  const [moment, setMoment] =
    useState<
      MatchMoment | null
    >(
      restoredGame?.moment ??
        null,
    );

  const [
    momentTeam,
    setMomentTeam,
  ] =
    useState<TeamId | null>(
      restoredGame?.momentTeam ??
        null,
    );

  const [
    currentMomentContent,
    setCurrentMomentContent,
  ] =
    useState<
      MomentContent | null
    >(
      restoredGame?.momentContent ??
        null,
    );

  const [
    gabuadaTeam,
    setGabuadaTeam,
  ] =
    useState<TeamId | null>(
      null,
    );

  const [
    gabuadaCelebration,
    setGabuadaCelebration,
  ] =
    useState<
      GabuadaCelebration | null
    >(null);

  const [saving, setSaving] =
    useState(false);

  const [saved, setSaved] =
    useState(false);

  const [
    saveError,
    setSaveError,
  ] = useState("");

  /*
   * =====================================================
   * JOGADORES
   * =====================================================
   */

  const teamAPlayers =
    useMemo(
      () =>
        teamA
          .map((id) =>
            players.find(
              (player) =>
                player.id === id,
            ),
          )
          .filter(
            (
              player,
            ): player is Player =>
              Boolean(player),
          ),

      [players, teamA],
    );

  const teamBPlayers =
    useMemo(
      () =>
        teamB
          .map((id) =>
            players.find(
              (player) =>
                player.id === id,
            ),
          )
          .filter(
            (
              player,
            ): player is Player =>
              Boolean(player),
          ),

      [players, teamB],
    );

  /*
   * =====================================================
   * ESTADO DERIVADO
   * =====================================================
   */

  const finished =
    scoreA >=
      WINNING_SCORE ||
    scoreB >=
      WINNING_SCORE;

  const winningTeam:
    | TeamId
    | null =
    scoreA >= WINNING_SCORE
      ? "A"
      : scoreB >=
          WINNING_SCORE
        ? "B"
        : null;

  const hasProgress =
    events.length > 0 ||
    scoreA > 0 ||
    scoreB > 0;

  /*
   * Enquanto joga, mostra a próxima rodada.
   *
   * Depois que termina, mostra a rodada em
   * que a partida efetivamente terminou.
   */
  const roundNumber =
    finished
      ? Math.max(
          events.length,
          1,
        )
      : events.length + 1;

  const exitButtonLabel =
    saved
      ? "Sair"
      : finished
        ? "Descartar"
        : "Desistir";

  /*
   * =====================================================
   * HELPERS DE TIME
   * =====================================================
   */

  const getTeamPlayers = (
    team: TeamId,
  ) =>
    team === "A"
      ? teamAPlayers
      : teamBPlayers;

  const teamName = (
    team: TeamId,
  ) =>
    getTeamPlayers(team)
      .map(
        (player) =>
          player.name,
      )
      .join(" + ");

  const ensureStartedAt =
    () => {
      if (
        !startedAtRef.current
      ) {
        startedAtRef.current =
          new Date().toISOString();
      }

      return startedAtRef.current;
    };

  /*
   * =====================================================
   * PERSISTÊNCIA AUTOMÁTICA
   * =====================================================
   */

  useEffect(() => {
    if (
      discardingRef.current ||
      saved
    ) {
      clearStoredLiveGame();

      return;
    }

    const gameToStore: StoredLiveGame =
      {
        version: 1,

        teamA:
          Array.from(teamA),

        teamB:
          Array.from(teamB),

        scoreA,

        scoreB,

        events,

        moment,

        momentTeam,

        momentContent:
          currentMomentContent,

        startedAt:
          startedAtRef.current,

        updatedAt:
          new Date().toISOString(),
      };

    saveStoredLiveGame(
      gameToStore,
    );
  }, [
    teamA,
    teamB,
    scoreA,
    scoreB,
    events,
    moment,
    momentTeam,
    currentMomentContent,
    saved,
  ]);

  /*
   * =====================================================
   * SCROLL PARA RESULTADO
   * =====================================================
   */

  useEffect(() => {
    if (!finished) {
      return;
    }

    const timer =
      window.setTimeout(
        () => {
          victoryPanelRef.current?.scrollIntoView(
            {
              behavior:
                "smooth",

              block:
                "center",
            },
          );
        },

        650,
      );

    return () => {
      window.clearTimeout(
        timer,
      );
    };
  }, [finished]);

  /*
   * =====================================================
   * LIMPEZA DA ANIMAÇÃO
   * =====================================================
   */

  useEffect(() => {
    return () => {
      if (
        gabuadaAnimationTimerRef.current
      ) {
        window.clearTimeout(
          gabuadaAnimationTimerRef.current,
        );
      }
    };
  }, []);

  /*
   * ESC fecha o modal de desistência.
   */
  useEffect(() => {
    if (
      !showAbandonConfirm
    ) {
      return;
    }

    const handleKeyDown = (
      event: KeyboardEvent,
    ) => {
      if (
        event.key ===
        "Escape"
      ) {
        setShowAbandonConfirm(
          false,
        );
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [
    showAbandonConfirm,
  ]);

  /*
   * =====================================================
   * HISTÓRICO DA PARTIDA
   * =====================================================
   */

  const hadDeficit = (
    team: TeamId,
    minimumDeficit = 1,
  ) => {
    let a = 0;
    let b = 0;

    for (
      const event of events
    ) {
      if (
        event.type !==
        "point"
      ) {
        continue;
      }

      if (
        event.team === "A"
      ) {
        a += 1;
      } else {
        b += 1;
      }

      if (
        team === "A" &&
        b - a >=
          minimumDeficit
      ) {
        return true;
      }

      if (
        team === "B" &&
        a - b >=
          minimumDeficit
      ) {
        return true;
      }
    }

    return false;
  };

  /*
   * =====================================================
   * DETECÇÃO DO MOMENTO
   * =====================================================
   */

  const detectPointMoment = (
    team: TeamId,

    previousA: number,

    previousB: number,

    nextA: number,

    nextB: number,
  ): MatchMoment => {
    /*
     * Vitória sempre tem prioridade.
     */
    if (
      nextA ===
        WINNING_SCORE ||
      nextB ===
        WINNING_SCORE
    ) {
      const loserScore =
        nextA ===
        WINNING_SCORE
          ? nextB
          : nextA;

      if (
        loserScore === 0
      ) {
        return "dominant";
      }

      return "victory";
    }

    const scoringTeamNowAhead =
      team === "A"
        ? nextA > nextB
        : nextB > nextA;

    /*
     * Agora a virada funciona:
     *
     * 1 × 2
     * 2 × 2
     * 3 × 2
     * ↑ virada
     */
    if (
      scoringTeamNowAhead &&
      hadDeficit(team)
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
      nextA ===
        WINNING_SCORE - 1 ||
      nextB ===
        WINNING_SCORE - 1
    ) {
      return "match-point";
    }

    if (
      Math.abs(
        nextA - nextB,
      ) === 1 &&
      Math.max(
        nextA,
        nextB,
      ) >= 2
    ) {
      return "close";
    }

    /*
     * Mantemos esses valores usados
     * para leitura do contexto da jogada,
     * mesmo que uma condição específica
     * não os utilize diretamente depois.
     */
    void previousA;
    void previousB;

    return "point";
  };

  /*
   * =====================================================
   * ANIMAÇÃO DE GABUADA
   * =====================================================
   */

  const triggerGabuadaCelebration =
    (
      playerName: string,

      selectedTeam:
        TeamId,
    ) => {
      if (
        gabuadaAnimationTimerRef.current
      ) {
        window.clearTimeout(
          gabuadaAnimationTimerRef.current,
        );
      }

      setGabuadaCelebration(
        {
          playerName,

          teamName:
            teamName(
              selectedTeam,
            ),
        },
      );

      gabuadaAnimationTimerRef.current =
        window.setTimeout(
          () => {
            setGabuadaCelebration(
              null,
            );
          },

          2200,
        );
    };

  /*
   * =====================================================
   * ADICIONAR PONTO
   * =====================================================
   */

  const addPoint = (
    team: TeamId,
  ) => {
    if (
      finished ||
      saving ||
      saved
    ) {
      return;
    }

    ensureStartedAt();

    const previousA =
      scoreA;

    const previousB =
      scoreB;

    const nextA =
      team === "A"
        ? Math.min(
            scoreA + 1,
            WINNING_SCORE,
          )
        : scoreA;

    const nextB =
      team === "B"
        ? Math.min(
            scoreB + 1,
            WINNING_SCORE,
          )
        : scoreB;

    const nextMoment =
      detectPointMoment(
        team,

        previousA,

        previousB,

        nextA,

        nextB,
      );

    const nextContent =
      chooseMomentContent(
        nextMoment,

        currentMomentContent,
      );

    const pointEvent: MatchEvent =
      {
        id:
          crypto.randomUUID(),

        type: "point",

        team,

        createdAt:
          new Date().toISOString(),

        /*
         * Salva o estado anterior para
         * que "Desfazer" restaure também
         * o banner.
         */
        previousMoment:
          moment,

        previousMomentTeam:
          momentTeam,

        previousMomentContent:
          currentMomentContent,
      };

    setScoreA(nextA);

    setScoreB(nextB);

    setEvents(
      (current) => [
        ...current,
        pointEvent,
      ],
    );

    setMoment(
      nextMoment,
    );

    setMomentTeam(team);

    setCurrentMomentContent(
      nextContent,
    );

    setGabuadaTeam(null);

    setSaveError("");
  };

  /*
   * =====================================================
   * GABUADA
   * =====================================================
   */

  const registerGabuada = (
    team: TeamId,

    playerId: string,
  ) => {
    if (
      finished ||
      saving ||
      saved
    ) {
      return;
    }

    const player =
      players.find(
        (
          currentPlayer,
        ) =>
          currentPlayer.id ===
          playerId,
      );

    if (!player) {
      return;
    }

    ensureStartedAt();

    const previousScoreA =
      scoreA;

    const previousScoreB =
      scoreB;

    const totalPoints =
      scoreA + scoreB;

    let nextMoment:
      MatchMoment =
      "gabuada";

    if (
      totalPoints <= 1
    ) {
      nextMoment =
        "gabuada-opening";
    } else if (
      /*
       * Aqui mantemos o critério
       * mais forte: recuperação
       * após ficar pelo menos
       * dois pontos atrás.
       */
      hadDeficit(team, 2)
    ) {
      nextMoment =
        "gabuada-comeback";
    }

    const nextContent =
      chooseMomentContent(
        nextMoment,

        currentMomentContent,
      );

    const event: MatchEvent =
      {
        id:
          crypto.randomUUID(),

        type:
          "gabuada",

        team,

        playerId,

        createdAt:
          new Date().toISOString(),

        previousScoreA,

        previousScoreB,

        previousMoment:
          moment,

        previousMomentTeam:
          momentTeam,

        previousMomentContent:
          currentMomentContent,
      };

    if (
      team === "A"
    ) {
      setScoreA(
        WINNING_SCORE,
      );
    } else {
      setScoreB(
        WINNING_SCORE,
      );
    }

    setEvents(
      (current) => [
        ...current,
        event,
      ],
    );

    setMoment(
      nextMoment,
    );

    setMomentTeam(team);

    setCurrentMomentContent(
      nextContent,
    );

    setGabuadaTeam(null);

    setSaveError("");

    triggerGabuadaCelebration(
      player.name,

      team,
    );
  };

  /*
   * =====================================================
   * DESFAZER
   * =====================================================
   */

  const undoLastEvent =
    () => {
      if (
        saving ||
        saved
      ) {
        return;
      }

      const lastEvent =
        events.at(-1);

      if (!lastEvent) {
        return;
      }

      if (
        lastEvent.type ===
        "point"
      ) {
        if (
          lastEvent.team ===
          "A"
        ) {
          setScoreA(
            (current) =>
              Math.max(
                0,
                current - 1,
              ),
          );
        } else {
          setScoreB(
            (current) =>
              Math.max(
                0,
                current - 1,
              ),
          );
        }
      }

      if (
        lastEvent.type ===
        "gabuada"
      ) {
        setScoreA(
          lastEvent.previousScoreA ??
            0,
        );

        setScoreB(
          lastEvent.previousScoreB ??
            0,
        );

        if (
          gabuadaAnimationTimerRef.current
        ) {
          window.clearTimeout(
            gabuadaAnimationTimerRef.current,
          );

          gabuadaAnimationTimerRef.current =
            null;
        }

        setGabuadaCelebration(
          null,
        );
      }

      /*
       * Remove somente o último evento.
       */
      setEvents(
        (current) =>
          current.slice(
            0,
            -1,
          ),
      );

      /*
       * Agora restaura a mensagem anterior
       * em vez de simplesmente apagá-la.
       */
      setMoment(
        lastEvent.previousMoment ??
          null,
      );

      setMomentTeam(
        lastEvent.previousMomentTeam ??
          null,
      );

      setCurrentMomentContent(
        lastEvent.previousMomentContent ??
          null,
      );

      setGabuadaTeam(null);

      setSaveError("");
    };

  /*
   * =====================================================
   * DESISTÊNCIA
   * =====================================================
   */

  const abandonGame =
    () => {
      if (saving) {
        return;
      }

      /*
       * Não houve nenhum ponto.
       * Pode sair sem confirmação.
       */
      if (
        !hasProgress &&
        !finished
      ) {
        discardingRef.current =
          true;

        clearStoredLiveGame();

        onCancel();

        return;
      }

      setShowAbandonConfirm(
        true,
      );
    };

  const confirmAbandonGame =
    () => {
      discardingRef.current =
        true;

      clearStoredLiveGame();

      if (
        gabuadaAnimationTimerRef.current
      ) {
        window.clearTimeout(
          gabuadaAnimationTimerRef.current,
        );

        gabuadaAnimationTimerRef.current =
          null;
      }

      startedAtRef.current =
        null;

      setScoreA(0);

      setScoreB(0);

      setEvents([]);

      setMoment(null);

      setMomentTeam(null);

      setCurrentMomentContent(
        null,
      );

      setGabuadaTeam(null);

      setGabuadaCelebration(
        null,
      );

      setSaveError("");

      setShowAbandonConfirm(
        false,
      );

      onCancel();
    };

  /*
   * A partida já foi salva oficialmente.
   * Aqui podemos simplesmente sair.
   */
  const leaveSavedGame =
    () => {
      discardingRef.current =
        true;

      clearStoredLiveGame();

      onCancel();
    };

  const handleExit =
    () => {
      if (saved) {
        leaveSavedGame();

        return;
      }

      abandonGame();
    };

  /*
   * =====================================================
   * GEOLOCALIZAÇÃO
   * =====================================================
   */

  const getLocationForSave =
    async () => {
      try {
        return await Promise.race(
          [
            locate(),

            new Promise<
              undefined
            >(
              (resolve) => {
                window.setTimeout(
                  () =>
                    resolve(
                      undefined,
                    ),

                  1800,
                );
              },
            ),
          ],
        );
      } catch {
        return undefined;
      }
    };

  /*
   * =====================================================
   * SALVAMENTO DEFINITIVO
   * =====================================================
   */

  const saveFinishedGame =
    async () => {
      if (
        !winningTeam ||
        saving ||
        saved ||
        saveInFlightRef.current
      ) {
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

      const lastGabuada =
        [...events]
          .reverse()
          .find(
            (event) =>
              event.type ===
                "gabuada" &&
              Boolean(
                event.playerId,
              ),
          );

      const validGabuadaId =
        lastGabuada?.playerId &&
        winnerIds.includes(
          lastGabuada.playerId,
        )
          ? lastGabuada.playerId
          : undefined;

      const draft: GameDraft =
        {
          winnerIds,

          loserIds,

          winnerScore,

          loserScore,

          playedAt:
            startedAtRef.current ??
            new Date().toISOString(),

          gabuadaIds:
            validGabuadaId
              ? [
                  validGabuadaId,
                ]
              : [],

          senaIds: [],
        };

      const guestIds =
        new Set(
          players
            .filter(
              isGuestPlayer,
            )
            .map(
              ({ id }) =>
                id,
            ),
        );

      const errors =
        validateGameDraft(
          draft,

          {
            allowDuplicatePlayerIds:
              guestIds,
          },
        );

      if (
        Object.keys(
          errors,
        ).length > 0
      ) {
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

      saveInFlightRef.current =
        true;

      setSaving(true);

      setSaveError("");

      try {
        const location =
          await getLocationForSave();

        /*
         * Somente aqui a partida vai
         * para o Supabase.
         */
        await onSave({
          ...draft,

          ...location,
        });

        /*
         * O banco confirmou.
         *
         * Agora sim podemos apagar
         * a cópia temporária.
         */
        clearStoredLiveGame();

        setSaved(true);
      } catch (error) {
        console.error(
          "Erro ao salvar partida ao vivo:",

          error,
        );

        /*
         * NÃO limpa localStorage.
         *
         * Assim o usuário pode tentar
         * novamente mesmo se o Supabase
         * estiver indisponível.
         */
        setSaveError(
          "Não foi possível salvar a partida. Tente novamente.",
        );
      } finally {
        saveInFlightRef.current =
          false;

        setSaving(false);
      }
    };

  /*
   * =====================================================
   * AVATARES
   * =====================================================
   */

  const renderTeamAvatars = (
    team: TeamId,
  ) => (
    <div className="live-team-players">
      {getTeamPlayers(
        team,
      ).map(
        (player) => (
          <div
            className="live-team-player"
            key={player.id}
          >
            <PlayerAvatar
              name={
                player.name
              }
              photoUrl={
                player.photoUrl
              }
              mood="serious"
            />

            <span>
              {player.name}
            </span>
          </div>
        ),
      )}
    </div>
  );

  /*
   * =====================================================
   * MODAL DE GABUADA
   * =====================================================
   */

  const renderGabuadaPicker =
    () => {
      if (!gabuadaTeam) {
        return null;
      }

      return (
        <div
          className="gabuada-picker-backdrop"
          onClick={() =>
            setGabuadaTeam(
              null,
            )
          }
        >
          <div
            className="gabuada-picker"
            role="dialog"
            aria-modal="true"
            aria-label="Marcar Gabuada"
            onClick={(
              event,
            ) => {
              event.stopPropagation();
            }}
          >
            <div className="gabuada-picker-icon">
              <Bomb
                size={30}
                strokeWidth={
                  2.7
                }
              />
            </div>

            <span className="eyebrow">
              Gabuada
            </span>

            <h2>
              Quem aplicou?
            </h2>

            <p>
              {teamName(
                gabuadaTeam,
              )}
            </p>

            <div className="gabuada-player-options">
              {getTeamPlayers(
                gabuadaTeam,
              ).map(
                (
                  player,
                  index,
                ) => (
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
                      name={
                        player.name
                      }
                      photoUrl={
                        player.photoUrl
                      }
                      mood="serious"
                    />

                    <strong>
                      {
                        player.name
                      }
                    </strong>
                  </button>
                ),
              )}
            </div>

            <button
              className="button"
              type="button"
              onClick={() =>
                setGabuadaTeam(
                  null,
                )
              }
            >
              Cancelar
            </button>
          </div>
        </div>
      );
    };

  /*
   * =====================================================
   * ÍCONE DO MOMENTO
   * =====================================================
   */

  const MomentIcon =
    moment === "dominant"
      ? Zap
      : moment ===
          "victory"
        ? Trophy
        : moment?.startsWith(
              "gabuada",
            )
          ? Bomb
          : moment ===
              "comeback"
            ? Flame
            : moment ===
                  "close" ||
                moment ===
                  "tie"
              ? Swords
              : Sparkles;

  const displayedMomentContent =
    moment
      ? currentMomentContent ??
        momentContent[
          moment
        ][0]
      : null;

  /*
   * =====================================================
   * VIEW
   * =====================================================
   */

  return (
    <section className="live-game-page">
      <div className="page-wrap live-game-shell">
        <header className="live-game-topbar">
          <button
            className="back-button"
            type="button"
            disabled={
              saving
            }
            onClick={
              handleExit
            }
          >
            <ArrowLeft
              size={19}
            />

            {
              exitButtonLabel
            }
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
                {
                  roundNumber
                }
              </strong>

              <span>
                Rodada
              </span>
            </div>
          </div>

          <div className="live-scoreboard">
            <section
              className={[
                "live-team",

                "live-team-a",

                momentTeam ===
                "A"
                  ? "moment-team"
                  : "",
              ].join(" ")}
            >
              <span className="sticker sticker-yellow">
                Dupla 01
              </span>

              {renderTeamAvatars(
                "A",
              )}

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
                  addPoint(
                    "A",
                  )
                }
              >
                +1 ponto
              </button>
            </section>

            <div className="live-score-versus">
              <Swords
                size={24}
                strokeWidth={
                  3
                }
              />

              <strong>
                VS.
              </strong>
            </div>

            <section
              className={[
                "live-team",

                "live-team-b",

                momentTeam ===
                "B"
                  ? "moment-team"
                  : "",
              ].join(" ")}
            >
              <span className="sticker sticker-violet">
                Dupla 02
              </span>

              {renderTeamAvatars(
                "B",
              )}

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
                  addPoint(
                    "B",
                  )
                }
              >
                +1 ponto
              </button>
            </section>
          </div>

          {moment &&
            displayedMomentContent && (
              <div
                className={`live-moment-banner live-moment-banner-${moment}`}
              >
                <MomentIcon
                  size={31}
                  strokeWidth={
                    2.7
                  }
                />

                <div>
                  <span>
                    {
                      displayedMomentContent.kicker
                    }
                  </span>

                  <strong>
                    {
                      displayedMomentContent.title
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
                  setGabuadaTeam(
                    "A",
                  )
                }
              >
                <Bomb
                  size={20}
                />

                Gabuada

                <small>
                  Dupla 01
                </small>
              </button>

              <button
                className="gabuada-button"
                type="button"
                onClick={() =>
                  setGabuadaTeam(
                    "B",
                  )
                }
              >
                <Bomb
                  size={20}
                />

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
                ref={
                  victoryPanelRef
                }
              >
                <Crown
                  className="live-victory-crown"
                  size={47}
                  strokeWidth={
                    2.5
                  }
                />

                <span>
                  Partida
                  encerrada
                </span>

                <h2>
                  {teamName(
                    winningTeam,
                  )}
                </h2>

                <strong>
                  {scoreA} ×{" "}
                  {scoreB}
                </strong>

                <p>
                  A súmula não
                  mente.
                </p>

                {!saved && (
                  <button
                    className="button button-primary live-save-button"
                    type="button"
                    disabled={
                      saving
                    }
                    onClick={() => {
                      void saveFinishedGame();
                    }}
                  >
                    <Check
                      size={19}
                    />

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
                    {
                      saveError
                    }
                  </p>
                )}

                {saved && (
                  <p className="live-save-success">
                    <Check
                      size={20}
                    />

                    Partida
                    registrada nos
                    resultados.
                  </p>
                )}
              </section>
            )}

          <section className="live-match-log">
            <div className="live-match-log-heading">
              <span>
                Últimas
                rodadas
              </span>

              <button
                type="button"
                disabled={
                  events.length ===
                    0 ||
                  saving ||
                  saved
                }
                onClick={
                  undoLastEvent
                }
              >
                <Undo2
                  size={16}
                />

                Desfazer
              </button>
            </div>

            {events.length ===
            0 ? (
              <p className="live-log-empty">
                A primeira
                rodada ainda não
                foi marcada.
              </p>
            ) : (
              <div className="live-log-list">
                {[...events]
                  .reverse()
                  .slice(
                    0,
                    5,
                  )
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
                          key={
                            event.id
                          }
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
                  events.length ===
                  0
                }
                onClick={
                  undoLastEvent
                }
              >
                <RotateCcw
                  size={18}
                />

                Desfazer última
              </button>
            </footer>
          )}
        </main>
      </div>

      {/* =================================================
          MODAL DE DESISTÊNCIA / DESCARTE
      ================================================= */}

      {showAbandonConfirm && (
        <div
          className="abandon-game-backdrop"
          onClick={() =>
            setShowAbandonConfirm(
              false,
            )
          }
        >
          <div
            className="abandon-game-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="abandon-game-title"
            aria-describedby="abandon-game-description"
            onClick={(
              event,
            ) =>
              event.stopPropagation()
            }
          >
            <div className="abandon-game-icon">
              <Bomb
                size={34}
                strokeWidth={
                  2.7
                }
              />
            </div>

            <span className="eyebrow">
              {finished
                ? "Resultado não salvo"
                : "Desistir da partida"}
            </span>

            <h2 id="abandon-game-title">
              {finished
                ? "Descartar resultado?"
                : "Ihhhh... arregou?"}
            </h2>

            {finished ? (
              <>
                <p>
                  A partida
                  terminou em{" "}
                  <strong>
                    {scoreA} ×{" "}
                    {scoreB}
                  </strong>
                  .
                </p>

                <p
                  id="abandon-game-description"
                  className="abandon-game-warning"
                >
                  Esse resultado
                  ainda não foi
                  salvo. Se
                  descartar
                  agora, ele será
                  perdido.
                </p>
              </>
            ) : (
              <>
                <p>
                  O placar está
                  em{" "}
                  <strong>
                    {scoreA} ×{" "}
                    {scoreB}
                  </strong>
                  .
                </p>

                <p
                  id="abandon-game-description"
                  className="abandon-game-warning"
                >
                  Se desistir
                  agora, todo o
                  andamento desta
                  partida será
                  apagado.
                </p>
              </>
            )}

            <div className="abandon-game-actions">
              <button
                className="button button-secondary"
                type="button"
                onClick={() =>
                  setShowAbandonConfirm(
                    false,
                  )
                }
              >
                {finished
                  ? "Voltar ao resultado"
                  : "Voltar pra mesa"}
              </button>

              <button
                className="button abandon-game-confirm"
                type="button"
                onClick={
                  confirmAbandonGame
                }
              >
                {finished
                  ? "Descartar"
                  : "Arreguei"}
              </button>
            </div>
          </div>
        </div>
      )}

      {renderGabuadaPicker()}

      {/* =================================================
          ANIMAÇÃO DE GABUADA
      ================================================= */}

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