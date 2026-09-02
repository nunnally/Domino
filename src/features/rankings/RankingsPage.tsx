import { useState } from "react";
import { Flame, Trash2 } from "lucide-react";

import { DominoTile } from "../../components/DominoTile";
import { PlayerAvatar, type AvatarMood } from "../../components/PlayerAvatar";

import { getIndividualStats, getPairStats } from "../../lib/stats";

import type { Game, Player } from "../../lib/types";

import { RankingTable } from "./RankingTable";

interface RankingsPageProps {
  players: Player[];
  games: Game[];
}

function getMoodForPosition(index: number, total: number): AvatarMood {
  if (index === 0) {
    return "champion";
  }

  if (total > 1 && index === total - 1) {
    return "sad";
  }

  if (index <= 2) {
    return "happy";
  }

  return "serious";
}

function recordNames<
  T extends {
    label?: string;
    name?: string;
  },
>(rows: T[], record: number) {
  if (record <= 0) {
    return "Sem partidas ainda";
  }

  return rows
    .map((row) => row.label ?? row.name ?? "")
    .filter(Boolean)
    .join(" · ");
}

export function RankingsPage({ players, games }: RankingsPageProps) {
  const [tab, setTab] = useState<"individual" | "pairs">("individual");

  const individual = getIndividualStats(players, games);

  const pairs = getPairStats(players, games);

  const worstEstablished = [...pairs]
    .filter((pair) => pair.sampleSize === "established")
    .sort((a, b) => a.winRate - b.winRate || b.losses - a.losses)[0];

  const individualWinRecord = Math.max(
    0,
    ...individual.map((row) => row.maxWinStreak),
  );

  const individualLossRecord = Math.max(
    0,
    ...individual.map((row) => row.maxLossStreak),
  );

  const pairWinRecord = Math.max(0, ...pairs.map((row) => row.maxWinStreak));

  const pairLossRecord = Math.max(0, ...pairs.map((row) => row.maxLossStreak));

  return (
    <section className="page-wrap inner-page">
      <header className="inner-page-heading">
        <div>
          <p className="eyebrow">A tabela não mente</p>

          <h1>Rankings</h1>

          <p>Quem está mandando na mesa — sozinho ou com a dupla certa.</p>
        </div>

        <DominoTile left={6} right={4} label="Peça seis quatro" />
      </header>

      <div className="ranking-tabs" role="tablist" aria-label="Tipo de ranking">
        <button
          role="tab"
          aria-selected={tab === "individual"}
          className={tab === "individual" ? "active" : ""}
          onClick={() => setTab("individual")}
        >
          Individual
        </button>

        <button
          role="tab"
          aria-selected={tab === "pairs"}
          className={tab === "pairs" ? "active" : ""}
          onClick={() => setTab("pairs")}
        >
          Duplas
        </button>
      </div>

      {tab === "individual" ? (
        <div role="tabpanel">
          <div className="panel full-ranking-panel">
            <RankingTable rows={individual} showStreaks />
          </div>

          <section className="streak-records" aria-label="Recordes individuais">
            <article className="streak-record win-record">
              <Flame size={25} />

              <span>
                <small>Maior sequência de vitórias</small>

                <strong>
                  {recordNames(
                    individual.filter(
                      (row) => row.maxWinStreak === individualWinRecord,
                    ),
                    individualWinRecord,
                  )}
                </strong>
              </span>

              <b>{individualWinRecord || "—"}</b>
            </article>

            <article className="streak-record loss-record">
              <Trash2 size={25} />

              <span>
                <small>Maior sequência de derrotas</small>

                <strong>
                  {recordNames(
                    individual.filter(
                      (row) => row.maxLossStreak === individualLossRecord,
                    ),
                    individualLossRecord,
                  )}
                </strong>
              </span>

              <b>{individualLossRecord || "—"}</b>
            </article>
          </section>
        </div>
      ) : (
        <div role="tabpanel">
          <div
            className="panel pair-ranking-table"
            role="table"
            aria-label="Ranking de duplas"
          >
            <div className="pair-ranking-head with-streaks" role="row">
              <span>#</span>
              <span>Dupla</span>
              <span>Jogos</span>
              <span>V</span>
              <span>D</span>
              <span>Aproveit.</span>

              <span>Maior sequência de vitórias</span>

              <span>Maior sequência de derrotas</span>
            </div>

            {pairs.map((pair, index) => {
              const mood = getMoodForPosition(index, pairs.length);

              return (
                <div
                  className="pair-ranking-row with-streaks"
                  role="row"
                  aria-label={`${pair.label}, ${pair.wins} vitórias, ${pair.losses} derrotas, ${pair.winRate}%`}
                  key={pair.pairKey}
                >
                  <strong>{String(index + 1).padStart(2, "0")}</strong>

                  <span className="pair-ranking-name">
                    <span className="mini-pair-avatars">
                      <PlayerAvatar
                        name={pair.names[0]}
                        photoUrl={pair.photoUrls[0]}
                        mood={mood}
                      />

                      <PlayerAvatar
                        name={pair.names[1]}
                        photoUrl={pair.photoUrls[1]}
                        mood={mood}
                      />
                    </span>

                    <span>
                      <strong>{pair.label}</strong>

                      {pair.sampleSize === "small" && (
                        <small>Amostra pequena</small>
                      )}

                      <span className="mobile-streaks">
                        <small>
                          <Flame size={13} /> Maior sequência de vitórias:{" "}
                          {pair.maxWinStreak}
                        </small>

                        <small>
                          <Trash2 size={13} /> Maior sequência de derrotas:{" "}
                          {pair.maxLossStreak}
                        </small>
                      </span>
                    </span>
                  </span>

                  <span>{pair.games}</span>

                  <span className="win">{pair.wins}</span>

                  <span className="loss">{pair.losses}</span>

                  <strong className="rank-rate">{pair.winRate}%</strong>

                  <span className="streak-cell desktop-streak win">
                    <Flame size={17} /> {pair.maxWinStreak}
                  </span>

                  <span className="streak-cell desktop-streak loss">
                    <Trash2 size={17} /> {pair.maxLossStreak}
                  </span>
                </div>
              );
            })}
          </div>

          <section className="streak-records" aria-label="Recordes de duplas">
            <article className="streak-record win-record">
              <Flame size={25} />

              <span>
                <small>Maior sequência de vitórias</small>

                <strong>
                  {recordNames(
                    pairs.filter((row) => row.maxWinStreak === pairWinRecord),
                    pairWinRecord,
                  )}
                </strong>
              </span>

              <b>{pairWinRecord || "—"}</b>
            </article>

            <article className="streak-record loss-record">
              <Trash2 size={25} />

              <span>
                <small>Maior sequência de derrotas</small>

                <strong>
                  {recordNames(
                    pairs.filter((row) => row.maxLossStreak === pairLossRecord),
                    pairLossRecord,
                  )}
                </strong>
              </span>

              <b>{pairLossRecord || "—"}</b>
            </article>
          </section>

 {worstEstablished && (
  <aside className="worst-callout">
    <span className="sticker sticker-red">
      Lanterna das duplas
    </span>

    <div className="worst-callout-avatars">
      <PlayerAvatar
        name={worstEstablished.names[0]}
        photoUrl={worstEstablished.photoUrls[0]}
        mood="sad"
      />

      <PlayerAvatar
        name={worstEstablished.names[1]}
        photoUrl={worstEstablished.photoUrls[1]}
        mood="sad"
      />
    </div>

    <strong>
      {worstEstablished.label}
    </strong>

    <p>
      {worstEstablished.losses} derrotas em{" "}
      {worstEstablished.games} jogos. Ainda dá para virar.
    </p>
  </aside>
)}
        </div>
      )}
    </section>
  );
}
