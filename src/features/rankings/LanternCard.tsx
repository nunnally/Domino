import { Flame } from "lucide-react";

import { PlayerAvatar } from "../../components/PlayerAvatar";

import type {
  IndividualStat,
  PeriodFilter,
} from "../../lib/types";

interface LanternCardProps {
  players: IndividualStat[];
  period: PeriodFilter;
}

const periodLabels: Record<PeriodFilter, string> = {
  today: "Hoje",
  "30d": "30 dias",
  all: "Geral",
};

export function LanternCard({
  players,
  period,
}: LanternCardProps) {
  if (players.length === 0) {
    return null;
  }

  const isTie = players.length > 1;
  const reference = players[0];
  const singlePlayer = !isTie ? players[0] : null;

  return (
    <section
      className={
        isTie
          ? "panel lantern-card"
          : "panel lantern-card lantern-card-single"
      }
      aria-label={
        isTie
          ? `${players.length} jogadores empatados na última posição em ${periodLabels[period]}`
          : `${reference.name} está na última posição em ${periodLabels[period]}`
      }
    >
      <span className="sticker sticker-red">
        <Flame size={16} />
        {isTie ? "Briga pela lanterna" : "Cansaaado"}
      </span>

      <small className="lantern-period">
        A vergonha · {periodLabels[period]}
      </small>

      {isTie ? (
        <>
          <div className="lantern-players lantern-players-tied">
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
            {reference.wins === 1 ? "vitória" : "vitórias"}
            {" · "}
            {reference.losses}{" "}
            {reference.losses === 1 ? "derrota" : "derrotas"}
          </strong>

          <small className="lantern-tie-label">
            Empatados na última posição
          </small>
        </>
      ) : (
        <>
          <div className="lantern-single-spotlight">
 
            <PlayerAvatar
              name={singlePlayer!.name}
              photoUrl={singlePlayer!.photoUrl}
              mood="sad"
              className="lantern-single-avatar"
            />
          </div>

          <h3>{singlePlayer!.name}</h3>

          <strong>
            {singlePlayer!.wins}{" "}
            {singlePlayer!.wins === 1 ? "vitória" : "vitórias"}
            {" · "}
            {singlePlayer!.losses}{" "}
            {singlePlayer!.losses === 1 ? "derrota" : "derrotas"}
          </strong>

          <small>Durezas....</small>
        </>
      )}
    </section>
  );
}