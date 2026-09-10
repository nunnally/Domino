import { useMemo, useState, type FormEvent } from "react";

import {
  ArrowLeft,
  ChevronDown,
  ClipboardPenLine,
  MapPin,
  Play,
  Save,
  Zap,
} from "lucide-react";

import { DominoTile } from "../../components/DominoTile";
import { PlayerAvatar } from "../../components/PlayerAvatar";

import { isGuestPlayer } from "../../lib/types";
import type { Player } from "../../lib/types";

import {
  validateGameDraft,
  type GameDraft,
  type ValidationErrors,
} from "../../lib/validation";

import { LiveGameSetup, type LiveTeam } from "./LiveGameSetup";
import { LiveGame } from "./LiveGame";

interface GameFormProps {
  players: Player[];
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

type GameMode = "choose" | "manual" | "live-setup" | "live";

type Slot = "winner1" | "winner2" | "loser1" | "loser2";

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
      ({ coords }) =>
        resolve({
          latitude: coords.latitude,
          longitude: coords.longitude,
        }),
      () => resolve(undefined),
      {
        enableHighAccuracy: false,
        timeout: 5_000,
        maximumAge: 60_000,
      },
    );
  });

const localDateTime = () => {
  const now = new Date();

  const local = new Date(
    now.getTime() - now.getTimezoneOffset() * 60_000,
  );

  return local.toISOString().slice(0, 16);
};

export function GameForm({
  players,
  onSave,
  onCancel,
  locate = locateCurrentGame,
}: GameFormProps) {
  const activePlayers = useMemo(
    () =>
      [...players]
        .filter(
          (player) =>
            player.active || isGuestPlayer(player),
        )
        .sort(
          (a, b) =>
            Number(isGuestPlayer(a)) -
              Number(isGuestPlayer(b)) ||
            a.name.localeCompare(b.name, "pt-BR"),
        ),
    [players],
  );

  const [mode, setMode] = useState<GameMode>("choose");

  const [liveTeams, setLiveTeams] = useState<{
    teamA: LiveTeam;
    teamB: LiveTeam;
  } | null>(null);

  const [slots, setSlots] = useState<Record<Slot, string>>({
    winner1: "",
    winner2: "",
    loser1: "",
    loser2: "",
  });

  const [gabuadaSlot, setGabuadaSlot] =
    useState<Slot | null>(null);

  const [senaSlot, setSenaSlot] =
    useState<Slot | null>(null);

  const [openSlot, setOpenSlot] =
    useState<Slot | null>(null);

  const [playedAt, setPlayedAt] =
    useState(localDateTime);

  const [winnerScore, setWinnerScore] =
    useState("");

  const [loserScore, setLoserScore] =
    useState("");

  const [errors, setErrors] =
    useState<ValidationErrors>({});

  const [saveError, setSaveError] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  const updateSlot = (
    slot: Slot,
    value: string,
  ) => {
    setSlots((current) => ({
      ...current,
      [slot]: value,
    }));

    if (gabuadaSlot === slot) {
      setGabuadaSlot(null);
    }

    if (senaSlot === slot) {
      setSenaSlot(null);
    }
  };

  const choosePlayer = (
    slot: Slot,
    value: string,
  ) => {
    updateSlot(slot, value);
    setOpenSlot(null);
  };

  const updateBonus = (
    slot: Slot,
    bonus: "gabuada" | "sena",
    checked: boolean,
  ) => {
    if (bonus === "gabuada") {
      setGabuadaSlot(
        checked ? slot : null,
      );
    } else {
      setSenaSlot(
        checked ? slot : null,
      );
    }
  };

  const submit = async (
    event: FormEvent,
  ) => {
    event.preventDefault();

    const draft: GameDraft = {
      winnerIds: [
        slots.winner1,
        slots.winner2,
      ],

      loserIds: [
        slots.loser1,
        slots.loser2,
      ],

      playedAt: playedAt
        ? new Date(
            playedAt,
          ).toISOString()
        : "",

      ...(winnerScore === ""
        ? {}
        : {
            winnerScore:
              Number(
                winnerScore,
              ),
          }),

      ...(loserScore === ""
        ? {}
        : {
            loserScore:
              Number(
                loserScore,
              ),
          }),

      gabuadaIds:
        gabuadaSlot &&
        slots[gabuadaSlot]
          ? [
              slots[
                gabuadaSlot
              ],
            ]
          : [],

      senaIds:
        senaSlot &&
        slots[senaSlot]
          ? [
              slots[
                senaSlot
              ],
            ]
          : [],
    };

    const guestIds = new Set(
      activePlayers
        .filter(isGuestPlayer)
        .map(({ id }) => id),
    );

    const nextErrors =
      validateGameDraft(
        draft,
        {
          allowDuplicatePlayerIds:
            guestIds,
        },
      );

    setErrors(nextErrors);

    if (
      Object.keys(
        nextErrors,
      ).length > 0
    ) {
      return;
    }

    setSaving(true);
    setSaveError("");

    try {
      let location: Awaited<
        ReturnType<
          NonNullable<
            GameFormProps["locate"]
          >
        >
      >;

      try {
        location =
          await locate();
      } catch {
        location =
          undefined;
      }

      await onSave({
        ...draft,
        ...location,
      });
    } catch {
      setSaveError(
        "Não foi possível salvar. A partida continua preenchida para você tentar de novo.",
      );
    } finally {
      setSaving(false);
    }
  };

  const select = (
    label: string,
    slot: Slot,
    bonusLabels: Array<
      "Gabuada" | "Sena"
    >,
  ) => {
    const selected =
      activePlayers.find(
        (player) =>
          player.id ===
          slots[slot],
      );

    const selectedIds =
      new Set(
        Object.values(
          slots,
        ).filter(Boolean),
      );

    const selectablePlayers =
      activePlayers.filter(
        (player) =>
          isGuestPlayer(
            player,
          ) ||
          player.id ===
            slots[slot] ||
          !selectedIds.has(
            player.id,
          ),
      );

    return (
      <div className="player-select">
        <span>{label}</span>

        <div className="player-select-control">
          <button
            className="player-picker-trigger"
            type="button"
            aria-haspopup="listbox"
            aria-expanded={
              openSlot ===
              slot
            }
            aria-label={`${label}: ${
              selected?.name ??
              "Escolher jogador"
            }`}
            onClick={() =>
              setOpenSlot(
                (
                  current,
                ) =>
                  current ===
                  slot
                    ? null
                    : slot,
              )
            }
          >
            {selected && (
              <PlayerAvatar
                name={
                  selected.name
                }
                photoUrl={
                  selected.photoUrl
                }
                mood="serious"
              />
            )}

            <span className="player-picker-label">
              {selected?.name ??
                "Escolher jogador"}
            </span>

            <ChevronDown
              size={18}
              aria-hidden="true"
            />
          </button>

          <select
            className="player-picker-native"
            value={
              slots[slot]
            }
            onChange={(
              event,
            ) =>
              choosePlayer(
                slot,
                event.target
                  .value,
              )
            }
            aria-label={label}
            tabIndex={-1}
          >
            <option value="">
              Escolher
              jogador
            </option>

            {selectablePlayers.map(
              (
                player,
              ) => (
                <option
                  value={
                    player.id
                  }
                  key={
                    player.id
                  }
                >
                  {
                    player.name
                  }
                </option>
              ),
            )}
          </select>

          {openSlot ===
            slot && (
            <div
              className="player-picker-menu"
              role="listbox"
              aria-label={`Opções de ${label}`}
            >
              <button
                className="player-picker-option"
                type="button"
                role="option"
                aria-selected={
                  !selected
                }
                onClick={() =>
                  choosePlayer(
                    slot,
                    "",
                  )
                }
              >
                <span className="player-picker-placeholder">
                  —
                </span>

                <span>
                  Escolher
                  jogador
                </span>
              </button>

              {selectablePlayers.map(
                (
                  player,
                ) => (
                  <button
                    className="player-picker-option"
                    type="button"
                    role="option"
                    aria-selected={
                      player.id ===
                      selected?.id
                    }
                    key={
                      player.id
                    }
                    onClick={() =>
                      choosePlayer(
                        slot,
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

                    <span>
                      {
                        player.name
                      }
                    </span>
                  </button>
                ),
              )}
            </div>
          )}
        </div>

        {selected && (
          <div className="bonus-toggles">
            {bonusLabels.map(
              (
                bonusLabel,
              ) => {
                const bonus =
                  bonusLabel.toLowerCase() as
                    | "gabuada"
                    | "sena";

                const checked =
                  bonus ===
                  "gabuada"
                    ? gabuadaSlot ===
                      slot
                    : senaSlot ===
                      slot;

                return (
                  <label
                    className="bonus-toggle"
                    key={
                      bonusLabel
                    }
                  >
                    <input
                      type="checkbox"
                      checked={
                        checked
                      }
                      onChange={(
                        event,
                      ) =>
                        updateBonus(
                          slot,
                          bonus,
                          event
                            .target
                            .checked,
                        )
                      }
                      aria-label={`${bonusLabel} — ${selected.name}`}
                    />

                    <span>
                      {
                        bonusLabel
                      }
                    </span>
                  </label>
                );
              },
            )}
          </div>
        )}
      </div>
    );
  };

  if (
    mode ===
    "live-setup"
  ) {
    return (
      <LiveGameSetup
        players={
          players
        }
        onCancel={() =>
          setMode(
            "choose",
          )
        }
        onStart={(
          teamA,
          teamB,
        ) => {
          setLiveTeams({
            teamA,
            teamB,
          });

          setMode(
            "live",
          );
        }}
      />
    );
  }

  if (
    mode === "live" &&
    liveTeams
  ) {
    return (
      <LiveGame
        players={
          players
        }
        teamA={
          liveTeams.teamA
        }
        teamB={
          liveTeams.teamB
        }
        locate={
          locate
        }
        onSave={
          onSave
        }
        onCancel={() => {
          setLiveTeams(
            null,
          );

          setMode(
            "choose",
          );
        }}
      />
    );
  }

  if (
    mode ===
    "choose"
  ) {
    return (
      <section className="page-wrap game-mode-page">
        <button
          className="back-button"
          type="button"
          onClick={
            onCancel
          }
        >
          <ArrowLeft
            size={
              19
            }
          />

          Voltar
        </button>

        <header className="form-heading game-mode-heading">
          <div>
            <p className="eyebrow">
              Preparar a
              mesa
            </p>

            <h1>
              Nova partida
            </h1>

            <p className="game-mode-intro">
              Jogue
              acompanhando
              cada rodada
              ou registre
              uma partida
              que já
              terminou.
            </p>
          </div>

          <DominoTile
            left={
              4
            }
            right={
              2
            }
          />
        </header>

        <div className="game-mode-grid">
          <button
            className="game-mode-card game-mode-card-live"
            type="button"
            onClick={() =>
              setMode(
                "live-setup",
              )
            }
          >
            <div className="game-mode-card-icon">
              <Zap
                size={
                  32
                }
                strokeWidth={
                  2.7
                }
              />
            </div>

            <span className="sticker sticker-yellow">
              Novo
            </span>

            <h2>
              Jogar ao vivo
            </h2>

            <p>
              Marque cada
              ponto enquanto
              a partida
              acontece e
              acompanhe
              viradas,
              Gabuidas e
              momentos
              especiais.
            </p>

            <span className="game-mode-card-action">
              <Play
                size={
                  18
                }
                fill="currentColor"
              />

              Começar
              partida
            </span>
          </button>

          <button
            className="game-mode-card game-mode-card-manual"
            type="button"
            onClick={() =>
              setMode(
                "manual",
              )
            }
          >
            <div className="game-mode-card-icon">
              <ClipboardPenLine
                size={
                  32
                }
                strokeWidth={
                  2.5
                }
              />
            </div>

            <span className="sticker sticker-violet">
              Súmula
            </span>

            <h2>
              Registrar
              resultado
            </h2>

            <p>
              A partida já
              terminou?
              Informe
              vencedores,
              perdedores e
              o placar final
              normalmente.
            </p>

            <span className="game-mode-card-action">
              <ClipboardPenLine
                size={
                  18
                }
              />

              Preencher
              resultado
            </span>
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="page-wrap game-form-page">
      <button
        className="back-button"
        type="button"
        onClick={() =>
          setMode(
            "choose",
          )
        }
      >
        <ArrowLeft
          size={
            19
          }
        />

        Voltar
      </button>

      <div className="form-heading">
        <div>
          <p className="eyebrow">
            Mais uma para
            o histórico
          </p>

          <h1>
            Registrar
            resultado
          </h1>
        </div>

        <DominoTile
          left={
            4
          }
          right={
            2
          }
        />
      </div>

      <form
        className="game-form"
        onSubmit={
          submit
        }
      >
        <section className="team-block winners-block">
          <span className="team-number">
            01
          </span>

          <div className="team-heading">
            <span className="sticker sticker-yellow">
              Vencedores
            </span>

            <h2>
              Quem bateu?
            </h2>
          </div>

          <div className="player-selects">
            {select(
              "Vencedor 1",
              "winner1",
              [
                "Gabuada",
                "Sena",
              ],
            )}

            {select(
              "Vencedor 2",
              "winner2",
              [
                "Gabuada",
                "Sena",
              ],
            )}
          </div>
        </section>

        <div className="versus-stamp">
          VS.
        </div>

        <section className="team-block losers-block">
          <span className="team-number">
            02
          </span>

          <div className="team-heading">
            <span className="sticker sticker-violet">
              Perdedores
            </span>

            <h2>
              Quem levou?
            </h2>
          </div>

          <div className="player-selects">
            {select(
              "Perdedor 1",
              "loser1",
              [
                "Sena",
              ],
            )}

            {select(
              "Perdedor 2",
              "loser2",
              [
                "Sena",
              ],
            )}
          </div>
        </section>

        {errors.players && (
          <p
            className="form-error full-error"
            role="alert"
          >
            {
              errors.players
            }
          </p>
        )}

        <section className="match-details">
          <label>
            <span>
              Quando foi?
            </span>

            <input
              type="datetime-local"
              value={
                playedAt
              }
              onChange={(
                event,
              ) =>
                setPlayedAt(
                  event
                    .target
                    .value,
                )
              }
            />
          </label>

          <fieldset>
            <legend>
              Placar{" "}
              <small>
                (opcional)
              </small>
            </legend>

            <label>
              <span>
                Vencedor
              </span>

              <input
                type="number"
                min="0"
                inputMode="numeric"
                value={
                  winnerScore
                }
                onChange={(
                  event,
                ) =>
                  setWinnerScore(
                    event
                      .target
                      .value,
                  )
                }
              />
            </label>

            <span>
              ×
            </span>

            <label>
              <span>
                Perdedor
              </span>

              <input
                type="number"
                min="0"
                inputMode="numeric"
                value={
                  loserScore
                }
                onChange={(
                  event,
                ) =>
                  setLoserScore(
                    event
                      .target
                      .value,
                  )
                }
              />
            </label>
          </fieldset>
        </section>

        <p className="location-note">
          <MapPin
            size={
              17
            }
          />

          Ao salvar,
          tentaremos
          incluir o local
          da partida.
        </p>

        {(errors.date ||
          errors.score ||
          saveError) && (
          <p
            className="form-error full-error"
            role="alert"
          >
            {errors.date ??
              errors.score ??
              saveError}
          </p>
        )}

        <div className="form-actions">
          <button
            className="button button-secondary"
            type="button"
            onClick={() =>
              setMode(
                "choose",
              )
            }
          >
            Cancelar
          </button>

          <button
            className="button button-primary"
            type="submit"
            disabled={
              saving
            }
          >
            <Save
              size={
                19
              }
            />

            {saving
              ? "Salvando…"
              : "Salvar partida"}
          </button>
        </div>
      </form>
    </section>
  );
}