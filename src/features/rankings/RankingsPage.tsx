import { useState } from "react";

import { DominoTile } from "../../components/DominoTile";
import { PlayerAvatar } from "../../components/PlayerAvatar";
import { getIndividualStats, getPairStats } from "../../lib/stats";
import type { Game, Player } from "../../lib/types";
import { RankingTable } from "./RankingTable";

interface RankingsPageProps {
  players: Player[];
  games: Game[];
}

export function RankingsPage({ players, games }: RankingsPageProps) {
  const [tab, setTab] = useState<"individual" | "pairs">("individual");
  const individual = getIndividualStats(players, games);
  const pairs = getPairStats(players, games);
  const worstEstablished = [...pairs]
    .filter((pair) => pair.sampleSize === "established")
    .sort((a, b) => a.winRate - b.winRate || b.losses - a.losses)[0];

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
        <div className="panel full-ranking-panel" role="tabpanel">
          <RankingTable rows={individual} />
        </div>
      ) : (
        <div role="tabpanel">
          <div
            className="panel pair-ranking-table"
            role="table"
            aria-label="Ranking de duplas"
          >
            <div className="pair-ranking-head" role="row">
              <span>#</span>
              <span>Dupla</span>
              <span>Jogos</span>
              <span>V</span>
              <span>D</span>
              <span>Aproveit.</span>
            </div>
            {pairs.map((pair, index) => (
              <div
                className="pair-ranking-row"
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
                      mood={
                        index === 0
                          ? "champion"
                          : index === pairs.length - 1
                            ? "sad"
                            : index <= 2
                              ? "happy"
                              : "serious"
                      }
                    />

                    <PlayerAvatar
                      name={pair.names[1]}
                      photoUrl={pair.photoUrls[1]}
                      mood={
                        index === 0
                          ? "champion"
                          : index === pairs.length - 1
                            ? "sad"
                            : index <= 2
                              ? "happy"
                              : "serious"
                      }
                    />
                  </span>
                  <span>
                    <strong>{pair.label}</strong>
                    {pair.sampleSize === "small" && (
                      <small>Amostra pequena</small>
                    )}
                  </span>
                </span>
                <span>{pair.games}</span>
                <span className="win">{pair.wins}</span>
                <span className="loss">{pair.losses}</span>
                <strong className="rank-rate">{pair.winRate}%</strong>
              </div>
            ))}
          </div>
          {worstEstablished && (
            <aside className="worst-callout">
              <span className="sticker sticker-red">Lanterna das duplas</span>
              <strong>{worstEstablished.label}</strong>
              <p>
                {worstEstablished.losses} derrotas em {worstEstablished.games}{" "}
                jogos. Ainda dá para virar.
              </p>
            </aside>
          )}
        </div>
      )}
    </section>
  );
}
