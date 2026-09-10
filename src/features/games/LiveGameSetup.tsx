import { useEffect, useMemo, useState } from "react";

import { createPortal } from "react-dom";

import { ArrowLeft, Check, ChevronDown, Play, Swords, X } from "lucide-react";

import { DominoTile } from "../../components/DominoTile";
import { PlayerAvatar } from "../../components/PlayerAvatar";

import { isGuestPlayer, type Player } from "../../lib/types";

export type LiveTeam = [string, string];

interface LiveGameSetupProps {
  players: Player[];

  onStart: (teamA: LiveTeam, teamB: LiveTeam) => void;

  onCancel: () => void;
}

type Slot = "teamA1" | "teamA2" | "teamB1" | "teamB2";

interface SlotConfig {
  slot: Slot;
  label: string;
  team: "A" | "B";
}

const slotConfig: Record<Slot, SlotConfig> = {
  teamA1: {
    slot: "teamA1",
    label: "Jogador 1",
    team: "A",
  },

  teamA2: {
    slot: "teamA2",
    label: "Jogador 2",
    team: "A",
  },

  teamB1: {
    slot: "teamB1",
    label: "Jogador 1",
    team: "B",
  },

  teamB2: {
    slot: "teamB2",
    label: "Jogador 2",
    team: "B",
  },
};

export function LiveGameSetup({
  players,
  onStart,
  onCancel,
}: LiveGameSetupProps) {
const activePlayers = useMemo(
  () =>
    [...players]
      .filter(
        (player) =>
          player.active ||
          isGuestPlayer(player),
      )
      .sort(
        (a, b) =>
          Number(isGuestPlayer(a)) -
            Number(isGuestPlayer(b)) ||
          a.name.localeCompare(
            b.name,
            "pt-BR",
          ),
      ),
  [players],
);

  const [slots, setSlots] = useState<Record<Slot, string>>({
    teamA1: "",
    teamA2: "",
    teamB1: "",
    teamB2: "",
  });

  const [openSlot, setOpenSlot] = useState<Slot | null>(null);

  const [error, setError] = useState("");

  useEffect(() => {
    if (!openSlot) {
      return;
    }

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenSlot(null);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;

      window.removeEventListener("keydown", handleEscape);
    };
  }, [openSlot]);

  const selectedIds = useMemo(
    () => new Set(Object.values(slots).filter(Boolean)),
    [slots],
  );

  const updateSlot = (slot: Slot, playerId: string) => {
    setSlots((current) => ({
      ...current,
      [slot]: playerId,
    }));

    setError("");
    setOpenSlot(null);
  };

  const getPlayer = (id: string) =>
    activePlayers.find((player) => player.id === id);

const getSelectablePlayers =
  (slot: Slot) =>
    activePlayers.filter(
      (player) =>
        isGuestPlayer(player) ||
        player.id === slots[slot] ||
        !selectedIds.has(player.id),
    );

  const renderPlayerField = (slot: Slot, label: string) => {
    const selected = getPlayer(slots[slot]);

    return (
      <div className="live-player-field">
        <span className="live-player-field-label">{label}</span>

        <button
          className="live-player-trigger"
          type="button"
          aria-haspopup="dialog"
          aria-expanded={openSlot === slot}
          onClick={() => setOpenSlot(slot)}
        >
          <span className="live-player-trigger-content">
            {selected ? (
              <PlayerAvatar
                name={selected.name}
                photoUrl={selected.photoUrl}
                mood="serious"
              />
            ) : (
              <span className="live-player-empty-avatar">?</span>
            )}

            <strong>{selected?.name ?? "Escolher jogador"}</strong>
          </span>

          <ChevronDown size={18} aria-hidden="true" />
        </button>
      </div>
    );
  };

  const startGame = () => {
    const { teamA1, teamA2, teamB1, teamB2 } = slots;

    if (!teamA1 || !teamA2 || !teamB1 || !teamB2) {
      setError("Escolha os quatro jogadores para começar.");

      return;
    }

const ids = [
  teamA1,
  teamA2,
  teamB1,
  teamB2,
];

const nonGuestIds = ids.filter(
  (id) => {
    const player =
      activePlayers.find(
        (currentPlayer) =>
          currentPlayer.id === id,
      );

    return (
      player &&
      !isGuestPlayer(player)
    );
  },
);

if (
  new Set(nonGuestIds).size !==
  nonGuestIds.length
) {
  setError(
    "Cada jogador pode participar apenas uma vez. O Convidado pode ser repetido.",
  );

  return;
}

    onStart([teamA1, teamA2], [teamB1, teamB2]);
  };

  const picker =
    openSlot && typeof document !== "undefined"
      ? createPortal(
          <div
            className="live-player-picker-backdrop"
            onClick={() => setOpenSlot(null)}
          >
            <section
              className="live-player-picker"
              role="dialog"
              aria-modal="true"
              aria-label="Escolher jogador"
              onClick={(event) => event.stopPropagation()}
            >
              <header className="live-player-picker-header">
                <div>
                  <span className="eyebrow">
                    {slotConfig[openSlot].team === "A"
                      ? "Dupla 01"
                      : "Dupla 02"}
                  </span>

                  <h2>Escolher {slotConfig[openSlot].label.toLowerCase()}</h2>
                </div>

                <button
                  className="live-player-picker-close"
                  type="button"
                  aria-label="Fechar"
                  onClick={() => setOpenSlot(null)}
                >
                  <X size={22} />
                </button>
              </header>

              <div className="live-player-picker-list">
                {getSelectablePlayers(openSlot).map((player) => {
                  const selected = slots[openSlot] === player.id;

                  return (
                    <button
                      className={[
                        "live-player-picker-option",
                        selected ? "selected" : "",
                      ].join(" ")}
                      type="button"
                      key={player.id}
                      onClick={() => updateSlot(openSlot, player.id)}
                    >
                      <PlayerAvatar
                        name={player.name}
                        photoUrl={player.photoUrl}
                        mood="serious"
                      />

                      <span>
                        <strong>{player.name}</strong>

                        <small>
                          {selected ? "Selecionado" : "Selecionar jogador"}
                        </small>
                      </span>

                      {selected && <Check size={22} />}
                    </button>
                  );
                })}
              </div>

              {slots[openSlot] && (
                <button
                  className="live-player-picker-clear"
                  type="button"
                  onClick={() => updateSlot(openSlot, "")}
                >
                  Limpar seleção
                </button>
              )}
            </section>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <section className="page-wrap live-setup-page">
        <button className="back-button" type="button" onClick={onCancel}>
          <ArrowLeft size={19} />
          Voltar
        </button>

        <div className="form-heading live-setup-heading">
          <div>
            <p className="eyebrow">A mesa está formada?</p>

            <h1>Partida ao vivo</h1>

            <p className="live-setup-intro">
              Escolha as duas duplas. Depois disso, o placar acompanha cada
              rodada da partida.
            </p>
          </div>

          <DominoTile left={6} right={6} />
        </div>

        <div className="live-setup-board">
          <section className="live-setup-team live-setup-team-a">
            <div className="live-setup-team-heading">
              <span className="sticker sticker-yellow">Dupla 01</span>

              <h2>Quem joga desse lado?</h2>
            </div>

            <div className="live-player-fields">
              {renderPlayerField("teamA1", "Jogador 1")}

              {renderPlayerField("teamA2", "Jogador 2")}
            </div>
          </section>

          <div className="live-setup-versus">
            <Swords size={27} strokeWidth={2.8} />

            <strong>VS.</strong>
          </div>

          <section className="live-setup-team live-setup-team-b">
            <div className="live-setup-team-heading">
              <span className="sticker sticker-violet">Dupla 02</span>

              <h2>E do outro lado?</h2>
            </div>

            <div className="live-player-fields">
              {renderPlayerField("teamB1", "Jogador 1")}

              {renderPlayerField("teamB2", "Jogador 2")}
            </div>
          </section>
        </div>

        {error && (
          <p className="form-error live-setup-error" role="alert">
            {error}
          </p>
        )}

        <div className="live-setup-actions">
          <button
            className="button button-secondary"
            type="button"
            onClick={onCancel}
          >
            Cancelar
          </button>

          <button
            className="button button-primary"
            type="button"
            onClick={startGame}
          >
            <Play size={18} fill="currentColor" />
            Começar partida
          </button>
        </div>
      </section>

      {picker}
    </>
  );
}
