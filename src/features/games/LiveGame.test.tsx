import {
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";

import userEvent from "@testing-library/user-event";

import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import type { Player } from "../../lib/types";

import type { GameDraft } from "../../lib/validation";

import { LiveGame } from "./LiveGame";

import type { LiveTeam } from "./LiveGameSetup";

import {
  clearStoredLiveGame,
  getStoredLiveGame,
  saveStoredLiveGame,
  type StoredLiveGame,
} from "./liveGameStorage";

/*
 * =========================================================
 * DADOS
 * =========================================================
 */

const players: Player[] = [
  {
    id: "player-1",
    name: "César",
    photoUrl: "",
    active: true,
    createdAt: "2026-09-10T12:00:00.000Z",
  },
  {
    id: "player-2",
    name: "Vinícius",
    photoUrl: "",
    active: true,
    createdAt: "2026-09-10T12:00:00.000Z",
  },
  {
    id: "player-3",
    name: "David",
    photoUrl: "",
    active: true,
    createdAt: "2026-09-10T12:00:00.000Z",
  },
  {
    id: "player-4",
    name: "Emanoel",
    photoUrl: "",
    active: true,
    createdAt: "2026-09-10T12:00:00.000Z",
  },
];

const teamA: LiveTeam = [
  "player-1",
  "player-2",
];

const teamB: LiveTeam = [
  "player-3",
  "player-4",
];

type TeamLabel =
  | "Dupla 01"
  | "Dupla 02";

type LocateResult =
  | {
      latitude: number;
      longitude: number;
    }
  | undefined;

type SaveHandler = (
  draft: GameDraft,
) => void | Promise<void>;

type CancelHandler =
  () => void;

type LocateHandler =
  () => Promise<LocateResult>;

interface RenderGameOverrides {
  onSave?: SaveHandler;
  onCancel?: CancelHandler;
  locate?: LocateHandler;
}

/*
 * =========================================================
 * RENDER
 * =========================================================
 */

const renderGame = (
  overrides: RenderGameOverrides = {},
) => {
  const user =
    userEvent.setup();

  const defaultOnSave =
    vi.fn<SaveHandler>();

  const defaultOnCancel =
    vi.fn<CancelHandler>();

  const defaultLocate =
    vi.fn<LocateHandler>(
      async () => undefined,
    );

  const onSave =
    overrides.onSave ??
    defaultOnSave;

  const onCancel =
    overrides.onCancel ??
    defaultOnCancel;

  const locate =
    overrides.locate ??
    defaultLocate;

  render(
    <LiveGame
      players={players}
      teamA={teamA}
      teamB={teamB}
      onSave={onSave}
      onCancel={onCancel}
      locate={locate}
    />,
  );

  return {
    user,
    onSave,
    onCancel,
    locate,
  };
};

/*
 * =========================================================
 * HELPERS
 * =========================================================
 */

const getTeamSection = (
  teamLabel: TeamLabel,
) => {
  const label =
    screen.getByText(
      teamLabel,
      {
        selector: ".sticker",
      },
    );

  const section =
    label.closest(
      ".live-team",
    );

  if (
    !(
      section instanceof
      HTMLElement
    )
  ) {
    throw new Error(
      `Não foi possível encontrar ${teamLabel}`,
    );
  }

  return section;
};

const getScore = (
  teamLabel: TeamLabel,
) => {
  const section =
    getTeamSection(
      teamLabel,
    );

  const score =
    section.querySelector(
      ".live-score-number",
    );

  if (!score) {
    throw new Error(
      `Não foi possível encontrar o placar de ${teamLabel}`,
    );
  }

  return (
    score.textContent ?? ""
  ).trim();
};

const addPoint = async (
  user: ReturnType<
    typeof userEvent.setup
  >,
  teamLabel: TeamLabel,
) => {
  const section =
    getTeamSection(
      teamLabel,
    );

  const button =
    within(
      section,
    ).getByRole(
      "button",
      {
        name: /\+1 ponto/i,
      },
    );

  await user.click(
    button,
  );
};

const undoLast = async (
  user: ReturnType<
    typeof userEvent.setup
  >,
) => {
  const button =
    screen.getByRole(
      "button",
      {
        name: /^desfazer$/i,
      },
    );

  await user.click(
    button,
  );
};

const registerGabuada = async (
  user: ReturnType<
    typeof userEvent.setup
  >,
  teamLabel: TeamLabel,
  playerName: string,
) => {
  const buttons =
    screen.queryAllByRole(
      "button",
      {
        name: /gabuada/i,
      },
    );

  const teamButton =
    buttons.find(
      (button) =>
        button.textContent?.includes(
          teamLabel,
        ),
    );

  if (!teamButton) {
    throw new Error(
      `Não foi possível encontrar o botão de Gabuada de ${teamLabel}`,
    );
  }

  await user.click(
    teamButton,
  );

  const dialog =
    screen.getByRole(
      "dialog",
      {
        name: /marcar gabuada/i,
      },
    );

  const playerButton =
    within(
      dialog,
    ).getByRole(
      "button",
      {
        name: new RegExp(
          playerName,
          "i",
        ),
      },
    );

  await user.click(
    playerButton,
  );
};

const finishNormalGame = async (
  user: ReturnType<
    typeof userEvent.setup
  >,
) => {
  /*
   * Resultado:
   *
   * Dupla 01 = 4
   * Dupla 02 = 3
   */

  await addPoint(
    user,
    "Dupla 01",
  );

  await addPoint(
    user,
    "Dupla 02",
  );

  await addPoint(
    user,
    "Dupla 01",
  );

  await addPoint(
    user,
    "Dupla 02",
  );

  await addPoint(
    user,
    "Dupla 01",
  );

  await addPoint(
    user,
    "Dupla 02",
  );

  await addPoint(
    user,
    "Dupla 01",
  );
};

/*
 * =========================================================
 * TESTES
 * =========================================================
 */

describe(
  "LiveGame",
  () => {
    /*
     * O LiveGame agora persiste a partida.
     *
     * Por isso cada teste precisa
     * começar completamente limpo.
     */
    beforeEach(() => {
      clearStoredLiveGame();

      vi.clearAllMocks();
    });

    it(
      "inicia a partida com o placar zerado",
      () => {
        renderGame();

        expect(
          getScore(
            "Dupla 01",
          ),
        ).toBe("0");

        expect(
          getScore(
            "Dupla 02",
          ),
        ).toBe("0");

        expect(
          screen.getByText(
            "César",
          ),
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            "Vinícius",
          ),
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            "David",
          ),
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            "Emanoel",
          ),
        ).toBeInTheDocument();
      },
    );

    it(
      "adiciona um ponto para uma dupla",
      async () => {
        const {
          user,
        } = renderGame();

        await addPoint(
          user,
          "Dupla 01",
        );

        expect(
          getScore(
            "Dupla 01",
          ),
        ).toBe("1");

        expect(
          getScore(
            "Dupla 02",
          ),
        ).toBe("0");
      },
    );

    it(
      "salva o andamento da partida no localStorage",
      async () => {
        const {
          user,
        } = renderGame();

        await addPoint(
          user,
          "Dupla 01",
        );

        await addPoint(
          user,
          "Dupla 02",
        );

        await addPoint(
          user,
          "Dupla 01",
        );

        await waitFor(
          () => {
            const stored =
              getStoredLiveGame();

            expect(
              stored,
            ).not.toBeNull();

            expect(
              stored?.scoreA,
            ).toBe(2);

            expect(
              stored?.scoreB,
            ).toBe(1);

            expect(
              stored?.events,
            ).toHaveLength(
              3,
            );
          },
        );
      },
    );

    it(
      "restaura uma partida existente no localStorage",
      () => {
        const storedGame: StoredLiveGame =
          {
            version: 1,

            teamA: [
              "player-1",
              "player-2",
            ],

            teamB: [
              "player-3",
              "player-4",
            ],

            scoreA: 3,

            scoreB: 2,

            events: [
              {
                id: "event-1",
                type: "point",
                team: "A",
                createdAt:
                  "2026-09-23T18:00:00.000Z",
              },
              {
                id: "event-2",
                type: "point",
                team: "B",
                createdAt:
                  "2026-09-23T18:01:00.000Z",
              },
              {
                id: "event-3",
                type: "point",
                team: "A",
                createdAt:
                  "2026-09-23T18:02:00.000Z",
              },
              {
                id: "event-4",
                type: "point",
                team: "B",
                createdAt:
                  "2026-09-23T18:03:00.000Z",
              },
              {
                id: "event-5",
                type: "point",
                team: "A",
                createdAt:
                  "2026-09-23T18:04:00.000Z",
              },
            ],

            moment:
              "match-point",

            momentTeam:
              "A",

            momentContent: {
              kicker:
                "Ponto decisivo",

              title:
                "Uma mão pode acabar com tudo.",
            },

            startedAt:
              "2026-09-23T18:00:00.000Z",

            updatedAt:
              "2026-09-23T18:04:00.000Z",
          };

        saveStoredLiveGame(
          storedGame,
        );

        renderGame();

        expect(
          getScore(
            "Dupla 01",
          ),
        ).toBe("3");

        expect(
          getScore(
            "Dupla 02",
          ),
        ).toBe("2");

        expect(
          screen.getByText(
            "Ponto decisivo",
          ),
        ).toBeInTheDocument();
      },
    );

    it(
      "desfaz um ponto normalmente",
      async () => {
        const {
          user,
        } = renderGame();

        await addPoint(
          user,
          "Dupla 01",
        );

        expect(
          getScore(
            "Dupla 01",
          ),
        ).toBe("1");

        await undoLast(
          user,
        );

        expect(
          getScore(
            "Dupla 01",
          ),
        ).toBe("0");

        expect(
          getScore(
            "Dupla 02",
          ),
        ).toBe("0");
      },
    );

    it(
      "restaura o momento anterior ao desfazer um ponto",
      async () => {
        const {
          user,
        } = renderGame();

        /*
         * 1 × 0
         */
        await addPoint(
          user,
          "Dupla 01",
        );

        /*
         * 1 × 1
         */
        await addPoint(
          user,
          "Dupla 02",
        );

        /*
         * 2 × 1
         */
        await addPoint(
          user,
          "Dupla 01",
        );

        /*
         * 2 × 2
         */
        await addPoint(
          user,
          "Dupla 02",
        );

        expect(
          document.querySelector(
            ".live-moment-banner-tie",
          ),
        ).not.toBeNull();

        /*
         * 3 × 2
         */
        await addPoint(
          user,
          "Dupla 01",
        );

        /*
         * Desfaz:
         *
         * 2 × 2
         */
        await undoLast(
          user,
        );

        expect(
          getScore(
            "Dupla 01",
          ),
        ).toBe("2");

        expect(
          getScore(
            "Dupla 02",
          ),
        ).toBe("2");

        expect(
          document.querySelector(
            ".live-moment-banner-tie",
          ),
        ).not.toBeNull();
      },
    );

    it(
      "encerra normalmente quando uma dupla chega a quatro pontos",
      async () => {
        const onSave =
          vi.fn<SaveHandler>();

        const {
          user,
        } = renderGame({
          onSave,
        });

        await addPoint(
          user,
          "Dupla 01",
        );

        await addPoint(
          user,
          "Dupla 01",
        );

        await addPoint(
          user,
          "Dupla 01",
        );

        await addPoint(
          user,
          "Dupla 01",
        );

        expect(
          getScore(
            "Dupla 01",
          ),
        ).toBe("4");

        expect(
          getScore(
            "Dupla 02",
          ),
        ).toBe("0");

        expect(
          screen.getByText(
            "Partida encerrada",
          ),
        ).toBeInTheDocument();

        /*
         * Chegar a quatro não
         * salva automaticamente.
         */
        expect(
          onSave,
        ).not.toHaveBeenCalled();
      },
    );

    it(
      "não salva automaticamente ao chegar aos quatro pontos",
      async () => {
        const onSave =
          vi.fn<SaveHandler>();

        const {
          user,
        } = renderGame({
          onSave,
        });

        await finishNormalGame(
          user,
        );

        expect(
          getScore(
            "Dupla 01",
          ),
        ).toBe("4");

        expect(
          getScore(
            "Dupla 02",
          ),
        ).toBe("3");

        expect(
          onSave,
        ).not.toHaveBeenCalled();

        expect(
          screen.getByRole(
            "button",
            {
              name: /salvar nos resultados/i,
            },
          ),
        ).toBeInTheDocument();
      },
    );

    it(
      "permite desfazer depois que uma dupla chega a quatro pontos",
      async () => {
        const onSave =
          vi.fn<SaveHandler>();

        const {
          user,
        } = renderGame({
          onSave,
        });

        await finishNormalGame(
          user,
        );

        expect(
          getScore(
            "Dupla 01",
          ),
        ).toBe("4");

        await undoLast(
          user,
        );

        expect(
          getScore(
            "Dupla 01",
          ),
        ).toBe("3");

        expect(
          getScore(
            "Dupla 02",
          ),
        ).toBe("3");

        expect(
          screen.queryByText(
            "Partida encerrada",
          ),
        ).not.toBeInTheDocument();

        expect(
          within(
            getTeamSection(
              "Dupla 01",
            ),
          ).getByRole(
            "button",
            {
              name: /\+1 ponto/i,
            },
          ),
        ).not.toBeDisabled();

        expect(
          onSave,
        ).not.toHaveBeenCalled();
      },
    );

    it(
      "mostra a rodada correta quando a partida termina",
      async () => {
        const {
          user,
        } = renderGame();

        /*
         * 4 × 3:
         * sete eventos.
         */
        await finishNormalGame(
          user,
        );

        const counter =
          document.querySelector(
            ".live-round-count strong",
          );

        expect(
          counter?.textContent,
        ).toBe("7");
      },
    );

    it(
      "salva vencedores perdedores e placar de uma partida normal",
      async () => {
        const onSave =
          vi.fn<SaveHandler>();

        const {
          user,
        } = renderGame({
          onSave,
        });

        await finishNormalGame(
          user,
        );

        /*
         * Não salva sozinho.
         */
        expect(
          onSave,
        ).not.toHaveBeenCalled();

        await user.click(
          screen.getByRole(
            "button",
            {
              name: /salvar nos resultados/i,
            },
          ),
        );

        await waitFor(
          () => {
            expect(
              onSave,
            ).toHaveBeenCalledTimes(
              1,
            );
          },
        );

        expect(
          onSave,
        ).toHaveBeenCalledWith(
          expect.objectContaining(
            {
              winnerIds: [
                "player-1",
                "player-2",
              ],

              loserIds: [
                "player-3",
                "player-4",
              ],

              winnerScore:
                4,

              loserScore:
                3,

              gabuadaIds:
                [],

              senaIds:
                [],
            },
          ),
        );
      },
    );

    it(
      "limpa o localStorage somente depois de salvar com sucesso",
      async () => {
        const onSave =
          vi.fn<SaveHandler>();

        const {
          user,
        } = renderGame({
          onSave,
        });

        await finishNormalGame(
          user,
        );

        /*
         * Antes de salvar,
         * a partida continua local.
         */
        await waitFor(
          () => {
            expect(
              getStoredLiveGame(),
            ).not.toBeNull();
          },
        );

        await user.click(
          screen.getByRole(
            "button",
            {
              name: /salvar nos resultados/i,
            },
          ),
        );

        await waitFor(
          () => {
            expect(
              onSave,
            ).toHaveBeenCalledOnce();
          },
        );

        await waitFor(
          () => {
            expect(
              getStoredLiveGame(),
            ).toBeNull();
          },
        );
      },
    );

    it(
      "mantém a partida no localStorage se o salvamento falhar",
      async () => {
        const onSave =
          vi.fn<SaveHandler>(
            async () => {
              throw new Error(
                "Supabase indisponível",
              );
            },
          );

        const {
          user,
        } = renderGame({
          onSave,
        });

        await finishNormalGame(
          user,
        );

        await user.click(
          screen.getByRole(
            "button",
            {
              name: /salvar nos resultados/i,
            },
          ),
        );

        await waitFor(
          () => {
            expect(
              screen.getByText(
                /não foi possível salvar a partida/i,
              ),
            ).toBeInTheDocument();
          },
        );

        expect(
          getStoredLiveGame(),
        ).not.toBeNull();

        expect(
          getStoredLiveGame()
            ?.scoreA,
        ).toBe(4);

        expect(
          getStoredLiveGame()
            ?.scoreB,
        ).toBe(3);
      },
    );

    it(
      "abre o modal de desistência quando a partida já começou",
      async () => {
        const onCancel =
          vi.fn<CancelHandler>();

        const {
          user,
        } = renderGame({
          onCancel,
        });

        await addPoint(
          user,
          "Dupla 01",
        );

        await user.click(
          screen.getByRole(
            "button",
            {
              name: /desistir/i,
            },
          ),
        );

        expect(
          screen.getByRole(
            "dialog",
          ),
        ).toBeInTheDocument();

        expect(
          screen.getByRole(
            "heading",
            {
              name: /ihhhh.*arregou/i,
            },
          ),
        ).toBeInTheDocument();

        expect(
          onCancel,
        ).not.toHaveBeenCalled();
      },
    );

    it(
      "volta para a partida sem apagar o progresso ao cancelar a desistência",
      async () => {
        const onCancel =
          vi.fn<CancelHandler>();

        const {
          user,
        } = renderGame({
          onCancel,
        });

        await addPoint(
          user,
          "Dupla 01",
        );

        await user.click(
          screen.getByRole(
            "button",
            {
              name: /desistir/i,
            },
          ),
        );

        await user.click(
          screen.getByRole(
            "button",
            {
              name: /voltar pra mesa/i,
            },
          ),
        );

        expect(
          screen.queryByRole(
            "dialog",
          ),
        ).not.toBeInTheDocument();

        expect(
          getScore(
            "Dupla 01",
          ),
        ).toBe("1");

        expect(
          getStoredLiveGame(),
        ).not.toBeNull();

        expect(
          onCancel,
        ).not.toHaveBeenCalled();
      },
    );

    it(
      "apaga a partida ao confirmar que arregou",
      async () => {
        const onCancel =
          vi.fn<CancelHandler>();

        const {
          user,
        } = renderGame({
          onCancel,
        });

        await addPoint(
          user,
          "Dupla 01",
        );

        await addPoint(
          user,
          "Dupla 02",
        );

        await waitFor(
          () => {
            expect(
              getStoredLiveGame(),
            ).not.toBeNull();
          },
        );

        await user.click(
          screen.getByRole(
            "button",
            {
              name: /desistir/i,
            },
          ),
        );

        await user.click(
          screen.getByRole(
            "button",
            {
              name: /^arreguei$/i,
            },
          ),
        );

        expect(
          getStoredLiveGame(),
        ).toBeNull();

        expect(
          onCancel,
        ).toHaveBeenCalledOnce();
      },
    );

    it(
      "fecha o modal de desistência ao pressionar Escape",
      async () => {
        const {
          user,
        } = renderGame();

        await addPoint(
          user,
          "Dupla 01",
        );

        await user.click(
          screen.getByRole(
            "button",
            {
              name: /desistir/i,
            },
          ),
        );

        expect(
          screen.getByRole(
            "dialog",
          ),
        ).toBeInTheDocument();

        await user.keyboard(
          "{Escape}",
        );

        expect(
          screen.queryByRole(
            "dialog",
          ),
        ).not.toBeInTheDocument();

        expect(
          getScore(
            "Dupla 01",
          ),
        ).toBe("1");
      },
    );

    it(
      "mostra Descartar quando a partida terminou mas ainda não foi salva",
      async () => {
        const onSave =
          vi.fn<SaveHandler>();

        const {
          user,
        } = renderGame({
          onSave,
        });

        await finishNormalGame(
          user,
        );

        expect(
          screen.getByRole(
            "button",
            {
              name: /^descartar$/i,
            },
          ),
        ).toBeInTheDocument();

        expect(
          onSave,
        ).not.toHaveBeenCalled();
      },
    );

    it(
      "confirma antes de descartar uma partida encerrada e não salva",
      async () => {
        const onCancel =
          vi.fn<CancelHandler>();

        const {
          user,
        } = renderGame({
          onCancel,
        });

        await finishNormalGame(
          user,
        );

        await user.click(
          screen.getByRole(
            "button",
            {
              name: /^descartar$/i,
            },
          ),
        );

        expect(
          screen.getByRole(
            "heading",
            {
              name: /descartar resultado/i,
            },
          ),
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            /esse resultado ainda não foi salvo/i,
          ),
        ).toBeInTheDocument();

        expect(
          onCancel,
        ).not.toHaveBeenCalled();
      },
    );

    it(
      "registra uma Gabuada e encerra a partida",
      async () => {
        const onSave =
          vi.fn<SaveHandler>();

        const {
          user,
        } = renderGame({
          onSave,
        });

        /*
         * 1 × 1
         */
        await addPoint(
          user,
          "Dupla 01",
        );

        await addPoint(
          user,
          "Dupla 02",
        );

        await registerGabuada(
          user,
          "Dupla 01",
          "César",
        );

        expect(
          getScore(
            "Dupla 01",
          ),
        ).toBe("4");

        expect(
          getScore(
            "Dupla 02",
          ),
        ).toBe("1");

        expect(
          screen.getByText(
            "Partida encerrada",
          ),
        ).toBeInTheDocument();

        /*
         * Gabuada também não salva
         * automaticamente.
         */
        expect(
          onSave,
        ).not.toHaveBeenCalled();
      },
    );

    it(
      "desfaz a Gabuada restaurando o placar anterior",
      async () => {
        const {
          user,
        } = renderGame();

        /*
         * 2 × 1
         */
        await addPoint(
          user,
          "Dupla 01",
        );

        await addPoint(
          user,
          "Dupla 01",
        );

        await addPoint(
          user,
          "Dupla 02",
        );

        expect(
          getScore(
            "Dupla 01",
          ),
        ).toBe("2");

        expect(
          getScore(
            "Dupla 02",
          ),
        ).toBe("1");

        await registerGabuada(
          user,
          "Dupla 01",
          "César",
        );

        expect(
          getScore(
            "Dupla 01",
          ),
        ).toBe("4");

        expect(
          getScore(
            "Dupla 02",
          ),
        ).toBe("1");

        await undoLast(
          user,
        );

        expect(
          getScore(
            "Dupla 01",
          ),
        ).toBe("2");

        expect(
          getScore(
            "Dupla 02",
          ),
        ).toBe("1");

        expect(
          screen.queryByText(
            "Partida encerrada",
          ),
        ).not.toBeInTheDocument();
      },
    );

    it(
      "salva o autor da Gabuada no resultado",
      async () => {
        const onSave =
          vi.fn<SaveHandler>();

        const {
          user,
        } = renderGame({
          onSave,
        });

        await addPoint(
          user,
          "Dupla 01",
        );

        await addPoint(
          user,
          "Dupla 02",
        );

        await registerGabuada(
          user,
          "Dupla 01",
          "César",
        );

        await user.click(
          screen.getByRole(
            "button",
            {
              name: /salvar nos resultados/i,
            },
          ),
        );

        await waitFor(
          () => {
            expect(
              onSave,
            ).toHaveBeenCalledOnce();
          },
        );

        expect(
          onSave,
        ).toHaveBeenCalledWith(
          expect.objectContaining(
            {
              winnerIds: [
                "player-1",
                "player-2",
              ],

              loserIds: [
                "player-3",
                "player-4",
              ],

              winnerScore:
                4,

              loserScore:
                1,

              gabuadaIds: [
                "player-1",
              ],

              senaIds:
                [],
            },
          ),
        );
      },
    );

    it(
      "reconhece uma virada depois de a dupla ficar atrás",
      async () => {
        const {
          user,
        } = renderGame();

        /*
         * Dupla 01 começa perdendo:
         *
         * 0 × 1
         * 0 × 2
         */
        await addPoint(
          user,
          "Dupla 02",
        );

        await addPoint(
          user,
          "Dupla 02",
        );

        /*
         * Reação:
         *
         * 1 × 2
         * 2 × 2
         * 3 × 2
         */
        await addPoint(
          user,
          "Dupla 01",
        );

        await addPoint(
          user,
          "Dupla 01",
        );

        await addPoint(
          user,
          "Dupla 01",
        );

        expect(
          getScore(
            "Dupla 01",
          ),
        ).toBe("3");

        expect(
          getScore(
            "Dupla 02",
          ),
        ).toBe("2");

        expect(
          document.querySelector(
            ".live-moment-banner-comeback",
          ),
        ).not.toBeNull();
      },
    );

    it(
      "sai diretamente quando a partida ainda não possui pontos",
      async () => {
        const onCancel =
          vi.fn<CancelHandler>();

        const {
          user,
        } = renderGame({
          onCancel,
        });

        await user.click(
          screen.getByRole(
            "button",
            {
              name: /desistir/i,
            },
          ),
        );

        expect(
          screen.queryByRole(
            "dialog",
          ),
        ).not.toBeInTheDocument();

        expect(
          onCancel,
        ).toHaveBeenCalledOnce();

        expect(
          getStoredLiveGame(),
        ).toBeNull();
      },
    );
  },
);