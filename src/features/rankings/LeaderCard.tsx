import { Crown, Trophy } from "lucide-react";

import { DominoTile } from "../../components/DominoTile";
import { PlayerAvatar } from "../../components/PlayerAvatar";

import type { IndividualStat } from "../../lib/types";

interface LeaderCardProps {
  players: IndividualStat[];
}

export function LeaderCard({ players }: LeaderCardProps) {
  if (players.length === 0) {
    return null;
  }

  const isTie = players.length > 1;
  const reference = players[0];

  if (!isTie) {
    const leader = reference;

    return (
      <section className="leader-stage leader-fighter-card">
        <div className="leader-copy">
          <span
            className="sticker sticker-yellow leader-bubble-enter"
            aria-label={leader.catchphrase ? undefined : "Líder"}
          >
            <Trophy size={16} />

            {leader.catchphrase}
          </span>

          <div className="leader-avatar-wrap leader-avatar-enter">
            <span className="leader-impact" aria-hidden="true" />

            <PlayerAvatar
              name={leader.name}
              photoUrl={leader.photoUrl}
              className="hero-avatar"
              mood="champion"
            />

            <span className="leader-crown-enter" aria-hidden="true">
              <Crown className="leader-crown-floating" strokeWidth={2.5} />
            </span>
          </div>

          <div className="leader-details">
            <p className="leader-kicker leader-title-enter">Líder individual</p>

            <h2 className="leader-info-enter leader-name-enter">
              {leader.name}
            </h2>

            <p className="leader-record leader-info-enter leader-record-enter">
              <strong>
                {leader.wins} {leader.wins === 1 ? "vitória" : "vitórias"}
              </strong>{" "}
              · {leader.losses} {leader.losses === 1 ? "derrota" : "derrotas"}
            </p>
          </div>
        </div>

        <div className="leader-score">
          <span className="leader-info-enter leader-score-enter">
            {leader.winRate}%
          </span>

          <small className="leader-info-enter leader-score-label-enter">
            de aproveitamento
          </small>
        </div>

        <DominoTile left={4} right={1} className="corner-domino" />
      </section>
    );
  }

  return (
    <section
      className="leader-stage leader-fighter-card leader-stage-tied"
      aria-label={`${players.length} jogadores empatados na liderança`}
    >
      <div className="leader-tie-content">
        <div className="leader-tie-heading leader-title-enter">
          <span className="sticker sticker-yellow">
            <Trophy size={16} />
            Os véi tão brigando
          </span>

          <p className="leader-kicker">Liderança dividida</p>

          <h2>Tá difícil decidir quem manda na mesa</h2>
        </div>

        <div className="leader-tie-players">
          {players.map((player, index) => (
            <div
              className="leader-tie-player leader-avatar-enter"
              style={{
                animationDelay: `${430 + index * 100}ms`,
              }}
              key={player.playerId}
            >
              <div className="leader-tie-avatar">
                <PlayerAvatar
                  name={player.name}
                  photoUrl={player.photoUrl}
                  mood="champion"
                />

                <Crown
                  className="leader-tie-crown"
                  strokeWidth={2.5}
                  aria-hidden="true"
                />
              </div>

              <strong>{player.name}</strong>

              {player.catchphrase && <small>“{player.catchphrase}”</small>}
            </div>
          ))}
        </div>
      </div>

      <div className="leader-score">
        <span className="leader-info-enter leader-score-enter">
          {reference.winRate}%
        </span>

        <small className="leader-info-enter leader-score-label-enter">
          de aproveitamento
        </small>
      </div>

      <DominoTile left={4} right={1} className="corner-domino" />
    </section>
  );
}
