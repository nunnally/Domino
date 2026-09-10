import {
  render,
  screen,
  within,
} from "@testing-library/react";

import userEvent from "@testing-library/user-event";

import {
  describe,
  expect,
  it,
  vi,
} from "vitest";

import type { Player } from "../../lib/types";

import { LiveGameSetup } from "./LiveGameSetup";

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
  {
    id: "player-5",
    name: "Gustavo",
    photoUrl: "",
    active: true,
    createdAt: "2026-09-10T12:00:00.000Z",
  },
  {
    id: "player-inactive",
    name: "Inativo",
    photoUrl: "",
    active: false,
    createdAt: "2026-09-10T12:00:00.000Z",
  },
];

type TeamLabel =
  | "Dupla 01"
  | "Dupla 02";

type PlayerLabel =
  | "Jogador 1"
  | "Jogador 2";

const getTeamSection = (
  teamLabel: TeamLabel,
) => {
  const teamTitle =
    screen.getByText(teamLabel);

  const teamSection =
    teamTitle.closest(
      ".live-setup-team",
    );

  if (
    !(teamSection instanceof HTMLElement)
  ) {
    throw new Error(
      `Não foi possível encontrar ${teamLabel}`,
    );
  }

  return teamSection;
};

const getPlayerField = (
  teamLabel: TeamLabel,
  playerLabel: PlayerLabel,
) => {
  const teamSection =
    getTeamSection(teamLabel);

  const label =
    within(teamSection).getByText(
      playerLabel,
      {
        selector:
          ".live-player-field-label",
      },
    );

  const field =
    label.closest(
      ".live-player-field",
    );

  if (
    !(field instanceof HTMLElement)
  ) {
    throw new Error(
      `Não foi possível encontrar ${playerLabel} de ${teamLabel}`,
    );
  }

  return field;
};

const openPlayerPicker = async (
  user: ReturnType<
    typeof userEvent.setup
  >,
  teamLabel: TeamLabel,
  playerLabel: PlayerLabel,
) => {
  const field =
    getPlayerField(
      teamLabel,
      playerLabel,
    );

  const trigger =
    within(field).getByRole(
      "button",
    );

  await user.click(trigger);

  return screen.getByRole(
    "dialog",
    {
      name: /escolher jogador/i,
    },
  );
};

const selectPlayer = async (
  user: ReturnType<
    typeof userEvent.setup
  >,
  teamLabel: TeamLabel,
  playerLabel: PlayerLabel,
  playerName: string,
) => {
  const dialog =
    await openPlayerPicker(
      user,
      teamLabel,
      playerLabel,
    );

  const playerButton =
    within(dialog).getByRole(
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

describe(
  "LiveGameSetup",
  () => {
    it(
      "exibe os dois lados da partida",
      () => {
        render(
          <LiveGameSetup
            players={players}
            onStart={() => {}}
            onCancel={() => {}}
          />,
        );

        expect(
          screen.getByText(
            "Dupla 01",
          ),
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            "Dupla 02",
          ),
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            "Quem joga desse lado?",
          ),
        ).toBeInTheDocument();

        expect(
          screen.getByText(
            "E do outro lado?",
          ),
        ).toBeInTheDocument();

        expect(
          screen.getByRole(
            "button",
            {
              name: /começar partida/i,
            },
          ),
        ).toBeInTheDocument();
      },
    );

    it(
      "abre o seletor de jogadores em modal",
      async () => {
        const user =
          userEvent.setup();

        render(
          <LiveGameSetup
            players={players}
            onStart={() => {}}
            onCancel={() => {}}
          />,
        );

        const dialog =
          await openPlayerPicker(
            user,
            "Dupla 01",
            "Jogador 1",
          );

        expect(
          dialog,
        ).toBeInTheDocument();

        expect(
          within(
            dialog,
          ).getByRole(
            "heading",
            {
              name: /escolher jogador 1/i,
            },
          ),
        ).toBeInTheDocument();
      },
    );

    it(
      "seleciona os quatro jogadores e inicia a partida",
      async () => {
        const user =
          userEvent.setup();

        const onStart =
          vi.fn();

        render(
          <LiveGameSetup
            players={players}
            onStart={onStart}
            onCancel={() => {}}
          />,
        );

        await selectPlayer(
          user,
          "Dupla 01",
          "Jogador 1",
          "César",
        );

        await selectPlayer(
          user,
          "Dupla 01",
          "Jogador 2",
          "Vinícius",
        );

        await selectPlayer(
          user,
          "Dupla 02",
          "Jogador 1",
          "David",
        );

        await selectPlayer(
          user,
          "Dupla 02",
          "Jogador 2",
          "Emanoel",
        );

        await user.click(
          screen.getByRole(
            "button",
            {
              name: /começar partida/i,
            },
          ),
        );

        expect(
          onStart,
        ).toHaveBeenCalledOnce();

        expect(
          onStart,
        ).toHaveBeenCalledWith(
          [
            "player-1",
            "player-2",
          ],
          [
            "player-3",
            "player-4",
          ],
        );
      },
    );

    it(
      "não oferece novamente um jogador já selecionado",
      async () => {
        const user =
          userEvent.setup();

        render(
          <LiveGameSetup
            players={players}
            onStart={() => {}}
            onCancel={() => {}}
          />,
        );

        await selectPlayer(
          user,
          "Dupla 01",
          "Jogador 1",
          "César",
        );

        const dialog =
          await openPlayerPicker(
            user,
            "Dupla 01",
            "Jogador 2",
          );

        expect(
          within(
            dialog,
          ).queryByRole(
            "button",
            {
              name: /césar/i,
            },
          ),
        ).not.toBeInTheDocument();

        expect(
          within(
            dialog,
          ).getByRole(
            "button",
            {
              name: /vinícius/i,
            },
          ),
        ).toBeInTheDocument();
      },
    );

    it(
      "não exibe jogadores inativos",
      async () => {
        const user =
          userEvent.setup();

        render(
          <LiveGameSetup
            players={players}
            onStart={() => {}}
            onCancel={() => {}}
          />,
        );

        const dialog =
          await openPlayerPicker(
            user,
            "Dupla 01",
            "Jogador 1",
          );

        expect(
          within(
            dialog,
          ).queryByRole(
            "button",
            {
              name: /inativo/i,
            },
          ),
        ).not.toBeInTheDocument();
      },
    );

    it(
      "não inicia se os quatro jogadores não estiverem preenchidos",
      async () => {
        const user =
          userEvent.setup();

        const onStart =
          vi.fn();

        render(
          <LiveGameSetup
            players={players}
            onStart={onStart}
            onCancel={() => {}}
          />,
        );

        await selectPlayer(
          user,
          "Dupla 01",
          "Jogador 1",
          "César",
        );

        await user.click(
          screen.getByRole(
            "button",
            {
              name: /começar partida/i,
            },
          ),
        );

        expect(
          screen.getByRole(
            "alert",
          ),
        ).toHaveTextContent(
          "Escolha os quatro jogadores para começar.",
        );

        expect(
          onStart,
        ).not.toHaveBeenCalled();
      },
    );

    it(
      "permite alterar um jogador já selecionado",
      async () => {
        const user =
          userEvent.setup();

        render(
          <LiveGameSetup
            players={players}
            onStart={() => {}}
            onCancel={() => {}}
          />,
        );

        await selectPlayer(
          user,
          "Dupla 01",
          "Jogador 1",
          "César",
        );

        const fieldBefore =
          getPlayerField(
            "Dupla 01",
            "Jogador 1",
          );

        expect(
          within(
            fieldBefore,
          ).getByText(
            "César",
          ),
        ).toBeInTheDocument();

        await selectPlayer(
          user,
          "Dupla 01",
          "Jogador 1",
          "Gustavo",
        );

        const fieldAfter =
          getPlayerField(
            "Dupla 01",
            "Jogador 1",
          );

        expect(
          within(
            fieldAfter,
          ).getByText(
            "Gustavo",
          ),
        ).toBeInTheDocument();

        expect(
          within(
            fieldAfter,
          ).queryByText(
            "César",
          ),
        ).not.toBeInTheDocument();
      },
    );

    it(
      "permite limpar uma seleção",
      async () => {
        const user =
          userEvent.setup();

        render(
          <LiveGameSetup
            players={players}
            onStart={() => {}}
            onCancel={() => {}}
          />,
        );

        await selectPlayer(
          user,
          "Dupla 01",
          "Jogador 1",
          "César",
        );

        const dialog =
          await openPlayerPicker(
            user,
            "Dupla 01",
            "Jogador 1",
          );

        await user.click(
          within(
            dialog,
          ).getByRole(
            "button",
            {
              name: /limpar seleção/i,
            },
          ),
        );

        expect(
          screen.queryByRole(
            "dialog",
          ),
        ).not.toBeInTheDocument();

        const field =
          getPlayerField(
            "Dupla 01",
            "Jogador 1",
          );

        expect(
          within(
            field,
          ).getByText(
            "Escolher jogador",
          ),
        ).toBeInTheDocument();
      },
    );

    it(
      "fecha o seletor pelo botão de fechar",
      async () => {
        const user =
          userEvent.setup();

        render(
          <LiveGameSetup
            players={players}
            onStart={() => {}}
            onCancel={() => {}}
          />,
        );

        await openPlayerPicker(
          user,
          "Dupla 01",
          "Jogador 1",
        );

        expect(
          screen.getByRole(
            "dialog",
          ),
        ).toBeInTheDocument();

        await user.click(
          screen.getByRole(
            "button",
            {
              name: /fechar/i,
            },
          ),
        );

        expect(
          screen.queryByRole(
            "dialog",
          ),
        ).not.toBeInTheDocument();
      },
    );

    it(
      "fecha o seletor pressionando Escape",
      async () => {
        const user =
          userEvent.setup();

        render(
          <LiveGameSetup
            players={players}
            onStart={() => {}}
            onCancel={() => {}}
          />,
        );

        await openPlayerPicker(
          user,
          "Dupla 02",
          "Jogador 2",
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
      },
    );

    it(
      "chama onCancel ao clicar em voltar",
      async () => {
        const user =
          userEvent.setup();

        const onCancel =
          vi.fn();

        render(
          <LiveGameSetup
            players={players}
            onStart={() => {}}
            onCancel={onCancel}
          />,
        );

        await user.click(
          screen.getByRole(
            "button",
            {
              name: /voltar/i,
            },
          ),
        );

        expect(
          onCancel,
        ).toHaveBeenCalledOnce();
      },
    );

    it(
      "chama onCancel ao clicar em cancelar",
      async () => {
        const user =
          userEvent.setup();

        const onCancel =
          vi.fn();

        render(
          <LiveGameSetup
            players={players}
            onStart={() => {}}
            onCancel={onCancel}
          />,
        );

        await user.click(
          screen.getByRole(
            "button",
            {
              name: /^cancelar$/i,
            },
          ),
        );

        expect(
          onCancel,
        ).toHaveBeenCalledOnce();
      },
    );
  },
);