import {
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";

import userEvent from "@testing-library/user-event";

import {
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { seedPlayers } from "../../lib/seed";

import { GameForm } from "./GameForm";
import { PinGate } from "./PinGate";

const openManualForm = async (
  user: ReturnType<typeof userEvent.setup>,
) => {
  await user.click(
    screen.getByRole("button", {
      name: /registrar resultado/i,
    }),
  );
};

describe("GameForm", () => {
  it("mostra as opções de partida ao abrir", () => {
    render(
      <GameForm
        players={seedPlayers}
        onSave={() => {}}
        onCancel={() => {}}
      />,
    );

    expect(
      screen.getByRole("button", {
        name: /jogar ao vivo/i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: /registrar resultado/i,
      }),
    ).toBeInTheDocument();
  });

  it("abre o formulário manual ao escolher registrar resultado", async () => {
    const user = userEvent.setup();

    render(
      <GameForm
        players={seedPlayers}
        onSave={() => {}}
        onCancel={() => {}}
      />,
    );

    await openManualForm(user);

    expect(
      screen.getByLabelText("Vencedor 1"),
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("Vencedor 2"),
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("Perdedor 1"),
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("Perdedor 2"),
    ).toBeInTheDocument();
  });

  it("envia uma partida com quatro jogadores distintos", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();

    render(
      <GameForm
        players={seedPlayers}
        onSave={onSave}
        onCancel={() => {}}
        locate={async () => ({
          latitude: -23.5505,
          longitude: -46.6333,
        })}
      />,
    );

    await openManualForm(user);

    await user.selectOptions(
      screen.getByLabelText("Vencedor 1"),
      "cesar",
    );

    await user.selectOptions(
      screen.getByLabelText("Vencedor 2"),
      "vinicius",
    );

    await user.selectOptions(
      screen.getByLabelText("Perdedor 1"),
      "david",
    );

    await user.selectOptions(
      screen.getByLabelText("Perdedor 2"),
      "emanoel",
    );

    await user.click(
      screen.getByRole("button", {
        name: /salvar partida/i,
      }),
    );

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          winnerIds: ["cesar", "vinicius"],
          loserIds: ["david", "emanoel"],
          latitude: -23.5505,
          longitude: -46.6333,
        }),
      );
    });
  });

  it("permite repetir o convidado em uma partida", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();

    render(
      <GameForm
        players={seedPlayers}
        onSave={onSave}
        onCancel={() => {}}
        locate={async () => undefined}
      />,
    );

    await openManualForm(user);

    await user.selectOptions(
      screen.getByLabelText("Vencedor 1"),
      "cesar",
    );

    await user.selectOptions(
      screen.getByLabelText("Vencedor 2"),
      "convidado",
    );

    await user.selectOptions(
      screen.getByLabelText("Perdedor 1"),
      "david",
    );

    await user.selectOptions(
      screen.getByLabelText("Perdedor 2"),
      "convidado",
    );

    await user.click(
      screen.getByRole("button", {
        name: /salvar partida/i,
      }),
    );

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          winnerIds: ["cesar", "convidado"],
          loserIds: ["david", "convidado"],
        }),
      );
    });
  });

  it("salva normalmente quando a localização não está disponível", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();

    render(
      <GameForm
        players={seedPlayers}
        onSave={onSave}
        onCancel={() => {}}
        locate={async () => undefined}
      />,
    );

    await openManualForm(user);

    await user.selectOptions(
      screen.getByLabelText("Vencedor 1"),
      "cesar",
    );

    await user.selectOptions(
      screen.getByLabelText("Vencedor 2"),
      "vinicius",
    );

    await user.selectOptions(
      screen.getByLabelText("Perdedor 1"),
      "david",
    );

    await user.selectOptions(
      screen.getByLabelText("Perdedor 2"),
      "emanoel",
    );

    await user.click(
      screen.getByRole("button", {
        name: /salvar partida/i,
      }),
    );

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledOnce();
    });

    const savedGame = onSave.mock.calls[0][0];

    expect(savedGame).not.toHaveProperty("latitude");
    expect(savedGame).not.toHaveProperty("longitude");
  });

  it("envia gabuada e sena opcionais dos jogadores selecionados", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();

    render(
      <GameForm
        players={seedPlayers}
        onSave={onSave}
        onCancel={() => {}}
        locate={async () => undefined}
      />,
    );

    await openManualForm(user);

    await user.selectOptions(
      screen.getByLabelText("Vencedor 1"),
      "cesar",
    );

    await user.selectOptions(
      screen.getByLabelText("Vencedor 2"),
      "vinicius",
    );

    await user.selectOptions(
      screen.getByLabelText("Perdedor 1"),
      "david",
    );

    await user.selectOptions(
      screen.getByLabelText("Perdedor 2"),
      "emanoel",
    );

    await user.click(
      screen.getByRole("checkbox", {
        name: /gabuada.*césar/i,
      }),
    );

    await user.click(
      screen.getByRole("checkbox", {
        name: /sena.*emanoel/i,
      }),
    );

    await user.click(
      screen.getByRole("button", {
        name: /salvar partida/i,
      }),
    );

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          gabuadaIds: ["cesar"],
          senaIds: ["emanoel"],
        }),
      );
    });
  });

  it("abre o seletor customizado com avatar e nome", async () => {
    const user = userEvent.setup();

    render(
      <GameForm
        players={seedPlayers}
        onSave={() => {}}
        onCancel={() => {}}
      />,
    );

    await openManualForm(user);

    await user.click(
      screen.getByRole("button", {
        name: /vencedor 1: escolher jogador/i,
      }),
    );

    const menu = screen.getByRole("listbox", {
      name: /opções de vencedor 1/i,
    });

    expect(
      within(menu).getByRole("option", {
        name: /foto de césar.*césar/i,
      }),
    ).toBeInTheDocument();
  });

  it("permite apenas uma gabuada e uma sena por partida", async () => {
    const user = userEvent.setup();

    render(
      <GameForm
        players={seedPlayers}
        onSave={() => {}}
        onCancel={() => {}}
      />,
    );

    await openManualForm(user);

    await user.selectOptions(
      screen.getByLabelText("Vencedor 1"),
      "cesar",
    );

    await user.selectOptions(
      screen.getByLabelText("Vencedor 2"),
      "vinicius",
    );

    await user.selectOptions(
      screen.getByLabelText("Perdedor 1"),
      "david",
    );

    await user.selectOptions(
      screen.getByLabelText("Perdedor 2"),
      "emanoel",
    );

    const cesarGabuada = screen.getByRole("checkbox", {
      name: /gabuada.*césar/i,
    });

    const viniciusGabuada = screen.getByRole("checkbox", {
      name: /gabuada.*vinícius/i,
    });

    const cesarSena = screen.getByRole("checkbox", {
      name: /sena.*césar/i,
    });

    const davidSena = screen.getByRole("checkbox", {
      name: /sena.*david/i,
    });

    const emanoelSena = screen.getByRole("checkbox", {
      name: /sena.*emanoel/i,
    });

    await user.click(cesarGabuada);
    await user.click(viniciusGabuada);

    expect(cesarGabuada).not.toBeChecked();
    expect(viniciusGabuada).toBeChecked();

    await user.click(cesarSena);
    await user.click(davidSena);
    await user.click(emanoelSena);

    expect(cesarSena).not.toBeChecked();
    expect(davidSena).not.toBeChecked();
    expect(emanoelSena).toBeChecked();
  });

  it("salva sem localização quando o provedor falha", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();

    render(
      <GameForm
        players={seedPlayers}
        onSave={onSave}
        onCancel={() => {}}
        locate={async () => {
          throw new Error("permissão bloqueada");
        }}
      />,
    );

    await openManualForm(user);

    await user.selectOptions(
      screen.getByLabelText("Vencedor 1"),
      "cesar",
    );

    await user.selectOptions(
      screen.getByLabelText("Vencedor 2"),
      "vinicius",
    );

    await user.selectOptions(
      screen.getByLabelText("Perdedor 1"),
      "david",
    );

    await user.selectOptions(
      screen.getByLabelText("Perdedor 2"),
      "emanoel",
    );

    await user.click(
      screen.getByRole("button", {
        name: /salvar partida/i,
      }),
    );

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledOnce();
    });
  });

  it("não oferece um jogador já selecionado nos outros seletores", async () => {
    const user = userEvent.setup();

    render(
      <GameForm
        players={seedPlayers}
        onSave={() => {}}
        onCancel={() => {}}
      />,
    );

    await openManualForm(user);

    await user.selectOptions(
      screen.getByLabelText("Vencedor 1"),
      "cesar",
    );

    expect(
      within(
        screen.getByLabelText("Vencedor 2"),
      ).queryByRole("option", {
        name: "César",
      }),
    ).not.toBeInTheDocument();

    expect(
      within(
        screen.getByLabelText("Perdedor 1"),
      ).queryByRole("option", {
        name: "César",
      }),
    ).not.toBeInTheDocument();

    await user.click(
      screen.getByRole("button", {
        name: /vencedor 2: escolher jogador/i,
      }),
    );

    const menu = screen.getByRole("listbox", {
      name: /opções de vencedor 2/i,
    });

    expect(
      within(menu).queryByRole("option", {
        name: /césar/i,
      }),
    ).not.toBeInTheDocument();
  });

  it("mantém o convidado disponível mesmo quando já foi selecionado", async () => {
    const user = userEvent.setup();

    render(
      <GameForm
        players={seedPlayers}
        onSave={() => {}}
        onCancel={() => {}}
      />,
    );

    await openManualForm(user);

    await user.selectOptions(
      screen.getByLabelText("Vencedor 1"),
      "convidado",
    );

    expect(
      within(
        screen.getByLabelText("Vencedor 2"),
      ).getByRole("option", {
        name: /convidado/i,
      }),
    ).toBeInTheDocument();

    expect(
      within(
        screen.getByLabelText("Perdedor 1"),
      ).getByRole("option", {
        name: /convidado/i,
      }),
    ).toBeInTheDocument();
  });

  it("mostra o erro quando a data é apagada", async () => {
    const user = userEvent.setup();

    render(
      <GameForm
        players={seedPlayers}
        onSave={() => {}}
        onCancel={() => {}}
      />,
    );

    await openManualForm(user);

    await user.selectOptions(
      screen.getByLabelText("Vencedor 1"),
      "cesar",
    );

    await user.selectOptions(
      screen.getByLabelText("Vencedor 2"),
      "vinicius",
    );

    await user.selectOptions(
      screen.getByLabelText("Perdedor 1"),
      "david",
    );

    await user.selectOptions(
      screen.getByLabelText("Perdedor 2"),
      "emanoel",
    );

    await user.clear(
      screen.getByLabelText("Quando foi?"),
    );

    await user.click(
      screen.getByRole("button", {
        name: /salvar partida/i,
      }),
    );

    expect(
      screen.getByRole("alert"),
    ).toHaveTextContent(
      "Informe uma data válida.",
    );
  });
});

describe("PinGate", () => {
  it("libera a edição com o PIN compartilhado", async () => {
    const user = userEvent.setup();
    const onUnlock = vi.fn();

    const { container } = render(
      <PinGate
        expectedPin="1234"
        onUnlock={onUnlock}
      />,
    );

    await user.type(
      container.querySelector(
        'input[type="password"]',
      )!,
      "1234",
    );

    await user.click(
      screen.getByRole("button", {
        name: /liberar cadastro/i,
      }),
    );

    expect(onUnlock).toHaveBeenCalledOnce();

    expect(onUnlock).toHaveBeenCalledWith(
      "1234",
    );
  });
});