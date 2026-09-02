import { Flame } from "lucide-react";

import { PlayerAvatar } from "../../components/PlayerAvatar";

import type { IndividualStat } from "../../lib/types";

interface LanternCardProps {
  players: IndividualStat[];
}

export function LanternCard({
  players,
}: LanternCardProps) {
  if (players.length === 0) {
    return null;
  }

  const isTie = players.length > 1;
  const reference = players[0];

  return (
    <section
      className="panel lantern-card"
      aria-label={
        isTie
          ? `${players.length} jogadores empatados na última posição`
          : `${reference.name} está na última posição`
      }
    >
      <span className="sticker sticker-red">
        <Flame size={16} />

        {isTie
          ? "Briga pela lanterna"
          : "Cansaaado"}
      </span>

      <p>
        {isTie
          ? "A disputa para ver quem é o pior está acirrada"
          : "Hoje o peso da derrota ficou com"}
      </p>

      <div
        className={
          isTie
            ? "lantern-players lantern-players-tied"
            : "lantern-players"
        }
      >
        {players.map((player) => (
          <div
            className="lantern-player"
            key={player.playerId}
          >
            <PlayerAvatar
              name={player.name}
              photoUrl={player.photoUrl}
              mood="sad"
            />

            <h3>{player.name}</h3>
          </div>
        ))}
      </div>

      <strong>
        {reference.wins}{" "}
        {reference.wins === 1
          ? "vitória"
          : "vitórias"}
        {" · "}
        {reference.losses}{" "}
        {reference.losses === 1
          ? "derrota"
          : "derrotas"}
      </strong>

      {isTie && (
        <small className="lantern-tie-label">
          Empatados na última posição
        </small>
      )}

      <small>Durezas....</small>
    </section>
  );
}