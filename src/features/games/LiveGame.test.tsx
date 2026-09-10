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

import { LiveGame } from "./LiveGame";

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

const teamA: [string, string] = [
  "player-1",
  "player-2",
];

const teamB: [string, string] = [
  "player-3",
  "player-4",
];

const getScore = (
  container: HTMLElement,
  team: "A" | "B",
) => {
  const selector =
    team === "A"
      ? ".live-team-a .live-score-number"
      : ".live-team-b .live-score-number";

  return container.querySelector(
    selector,
  )?.textContent;
};

const addPoints = async (
  user: ReturnType<
    typeof userEvent.setup
  >,
  team: "A" | "B",
  amount: number,
) => {
  for (
    let point = 0;
    point < amount;
    point += 1
  ) {
    const buttons =
      screen.getAllByRole(
        "button",
        {
          name: /\+1 ponto/i,
        },
      );

    await user.click(
      team === "A"
        ? buttons[0]
        : buttons[1],
    );
  }
};

const registerGabuada = async (
  user: ReturnType<
    typeof userEvent.setup
  >,
  team: "A" | "B",
  playerName: string,
) => {
  const buttons =
    screen.getAllByRole(
      "button",
      {
        name: /gabuada/i,
      },
    );

  await user.click(
    team === "A"
      ? buttons[0]
      : buttons[1],
  );

  const dialog =
    screen.getByRole(
      "dialog",
      {
        name: /marcar gabuada/i,
      },
    );

  await user.click(
    within(dialog).getByRole(
      "button",
      {
        name: new RegExp(
          playerName,
          "i",
        ),
      },
    ),
  );
};

const undoLast = async (
  user: ReturnType<
    typeof userEvent.setup
  >,
) => {
  await user.click(
    screen.getByRole(
      "button",
      {
        name: /^desfazer$/i,
      },
    ),
  );
};

describe("LiveGame", () => {
  beforeEach(() => {
    Object.defineProperty(
      Element.prototype,
      "scrollIntoView",
      {
        configurable: true,
        value: vi.fn(),
      },
    );
  });

  it(
    "inicia a partida com placar zero a zero",
    () => {
      const { container } =
        render(
          <LiveGame
            players={players}
            teamA={teamA}
            teamB={teamB}
            onSave={() => {}}
            onCancel={() => {}}
            locate={async () =>
              undefined
            }
          />,
        );

      expect(
        getScore(
          container,
          "A",
        ),
      ).toBe("0");

      expect(
        getScore(
          container,
          "B",
        ),
      ).toBe("0");
    },
  );

  it(
    "adiciona um ponto para a Dupla 01",
    async () => {
      const user =
        userEvent.setup();

      const { container } =
        render(
          <LiveGame
            players={players}
            teamA={teamA}
            teamB={teamB}
            onSave={() => {}}
            onCancel={() => {}}
            locate={async () =>
              undefined
            }
          />,
        );

      await addPoints(
        user,
        "A",
        1,
      );

      expect(
        getScore(
          container,
          "A",
        ),
      ).toBe("1");

      expect(
        getScore(
          container,
          "B",
        ),
      ).toBe("0");
    },
  );

  it(
    "adiciona um ponto para a Dupla 02",
    async () => {
      const user =
        userEvent.setup();

      const { container } =
        render(
          <LiveGame
            players={players}
            teamA={teamA}
            teamB={teamB}
            onSave={() => {}}
            onCancel={() => {}}
            locate={async () =>
              undefined
            }
          />,
        );

      await addPoints(
        user,
        "B",
        1,
      );

      expect(
        getScore(
          container,
          "A",
        ),
      ).toBe("0");

      expect(
        getScore(
          container,
          "B",
        ),
      ).toBe("1");
    },
  );

  it(
    "Gabuada em zero a zero leva a dupla diretamente para quatro pontos",
    async () => {
      const user =
        userEvent.setup();

      const { container } =
        render(
          <LiveGame
            players={players}
            teamA={teamA}
            teamB={teamB}
            onSave={() => {}}
            onCancel={() => {}}
            locate={async () =>
              undefined
            }
          />,
        );

      await registerGabuada(
        user,
        "A",
        "César",
      );

      expect(
        getScore(
          container,
          "A",
        ),
      ).toBe("4");

      expect(
        getScore(
          container,
          "B",
        ),
      ).toBe("0");

      expect(
        screen.getByText(
          "Partida encerrada",
        ),
      ).toBeInTheDocument();

      expect(
        screen.getByText(
          /gabuada — césar/i,
        ),
      ).toBeInTheDocument();
    },
  );

  it(
    "Gabuada com dois pontos leva o placar para quatro e não para seis",
    async () => {
      const user =
        userEvent.setup();

      const { container } =
        render(
          <LiveGame
            players={players}
            teamA={teamA}
            teamB={teamB}
            onSave={() => {}}
            onCancel={() => {}}
            locate={async () =>
              undefined
            }
          />,
        );

      await addPoints(
        user,
        "A",
        2,
      );

      expect(
        getScore(
          container,
          "A",
        ),
      ).toBe("2");

      await registerGabuada(
        user,
        "A",
        "César",
      );

      expect(
        getScore(
          container,
          "A",
        ),
      ).toBe("4");

      expect(
        getScore(
          container,
          "B",
        ),
      ).toBe("0");

      expect(
        screen.getByText(
          "Partida encerrada",
        ),
      ).toBeInTheDocument();
    },
  );

  it(
    "Gabuada da Dupla 02 leva a Dupla 02 para quatro pontos",
    async () => {
      const user =
        userEvent.setup();

      const { container } =
        render(
          <LiveGame
            players={players}
            teamA={teamA}
            teamB={teamB}
            onSave={() => {}}
            onCancel={() => {}}
            locate={async () =>
              undefined
            }
          />,
        );

      await addPoints(
        user,
        "A",
        2,
      );

      await addPoints(
        user,
        "B",
        1,
      );

      await registerGabuada(
        user,
        "B",
        "David",
      );

      expect(
        getScore(
          container,
          "A",
        ),
      ).toBe("2");

      expect(
        getScore(
          container,
          "B",
        ),
      ).toBe("4");

      expect(
        screen.getByText(
          "Partida encerrada",
        ),
      ).toBeInTheDocument();
    },
  );

  it(
    "exibe a animação da Gabuada",
    async () => {
      const user =
        userEvent.setup();

      render(
        <LiveGame
          players={players}
          teamA={teamA}
          teamB={teamB}
          onSave={() => {}}
          onCancel={() => {}}
          locate={async () =>
            undefined
          }
        />,
      );

      await registerGabuada(
        user,
        "A",
        "César",
      );

      expect(
        screen.getByLabelText(
          "Gabuada",
        ),
      ).toBeInTheDocument();

      expect(
        screen.getByText(
          "GABUADA!",
        ),
      ).toBeInTheDocument();

      expect(
        screen.getByText(
          "César",
          {
            selector:
              ".gabuada-celebration-player",
          },
        ),
      ).toBeInTheDocument();
    },
  );

  it(
    "desfaz um ponto normalmente",
    async () => {
      const user =
        userEvent.setup();

      const { container } =
        render(
          <LiveGame
            players={players}
            teamA={teamA}
            teamB={teamB}
            onSave={() => {}}
            onCancel={() => {}}
            locate={async () =>
              undefined
            }
          />,
        );

      await addPoints(
        user,
        "A",
        1,
      );

      expect(
        getScore(
          container,
          "A",
        ),
      ).toBe("1");

      await undoLast(
        user,
      );

      expect(
        getScore(
          container,
          "A",
        ),
      ).toBe("0");
    },
  );

  it(
    "desfaz a Gabuada restaurando o placar anterior",
    async () => {
      const user =
        userEvent.setup();

      const { container } =
        render(
          <LiveGame
            players={players}
            teamA={teamA}
            teamB={teamB}
            onSave={() => {}}
            onCancel={() => {}}
            locate={async () =>
              undefined
            }
          />,
        );

      await addPoints(
        user,
        "A",
        2,
      );

      await addPoints(
        user,
        "B",
        1,
      );

      expect(
        getScore(
          container,
          "A",
        ),
      ).toBe("2");

      expect(
        getScore(
          container,
          "B",
        ),
      ).toBe("1");

      await registerGabuada(
        user,
        "A",
        "César",
      );

      expect(
        getScore(
          container,
          "A",
        ),
      ).toBe("4");

      await undoLast(
        user,
      );

      expect(
        getScore(
          container,
          "A",
        ),
      ).toBe("2");

      expect(
        getScore(
          container,
          "B",
        ),
      ).toBe("1");

      expect(
        screen.queryByText(
          "Partida encerrada",
        ),
      ).not.toBeInTheDocument();

      expect(
        screen.queryByText(
          /gabuada — césar/i,
        ),
      ).not.toBeInTheDocument();
    },
  );

  it(
    "encerra normalmente quando uma dupla chega a quatro pontos",
    async () => {
      const user =
        userEvent.setup();

      const { container } =
        render(
          <LiveGame
            players={players}
            teamA={teamA}
            teamB={teamB}
            onSave={() => {}}
            onCancel={() => {}}
            locate={async () =>
              undefined
            }
          />,
        );

      await addPoints(
        user,
        "A",
        4,
      );

      expect(
        getScore(
          container,
          "A",
        ),
      ).toBe("4");

      expect(
        getScore(
          container,
          "B",
        ),
      ).toBe("0");

      expect(
        screen.getByText(
          "Partida encerrada",
        ),
      ).toBeInTheDocument();
    },
  );

  it(
    "salva vencedores perdedores e placar de uma partida normal",
    async () => {
      const user =
        userEvent.setup();

      const onSave =
        vi.fn();

      render(
        <LiveGame
          players={players}
          teamA={teamA}
          teamB={teamB}
          onSave={onSave}
          onCancel={() => {}}
          locate={async () =>
            undefined
          }
        />,
      );

      await addPoints(
        user,
        "B",
        3,
      );

      await addPoints(
        user,
        "A",
        4,
      );

      await user.click(
        screen.getByRole(
          "button",
          {
            name: /salvar nos resultados/i,
          },
        ),
      );

      await waitFor(() => {
        expect(
          onSave,
        ).toHaveBeenCalledOnce();
      });

      expect(
        onSave,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          winnerIds: [
            "player-1",
            "player-2",
          ],
          loserIds: [
            "player-3",
            "player-4",
          ],
          winnerScore: 4,
          loserScore: 3,
          gabuadaIds: [],
          senaIds: [],
        }),
      );
    },
  );

  it(
    "salva a Gabuada com placar quatro e registra o jogador que aplicou",
    async () => {
      const user =
        userEvent.setup();

      const onSave =
        vi.fn();

      render(
        <LiveGame
          players={players}
          teamA={teamA}
          teamB={teamB}
          onSave={onSave}
          onCancel={() => {}}
          locate={async () => ({
            latitude: -15.7929,
            longitude: -47.8496,
          })}
        />,
      );

      await addPoints(
        user,
        "A",
        2,
      );

      await addPoints(
        user,
        "B",
        1,
      );

      await registerGabuada(
        user,
        "A",
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

      await waitFor(() => {
        expect(
          onSave,
        ).toHaveBeenCalledOnce();
      });

      expect(
        onSave,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          winnerIds: [
            "player-1",
            "player-2",
          ],
          loserIds: [
            "player-3",
            "player-4",
          ],
          winnerScore: 4,
          loserScore: 1,
          gabuadaIds: [
            "player-1",
          ],
          senaIds: [],
          latitude: -15.7929,
          longitude: -47.8496,
        }),
      );
    },
  );
});