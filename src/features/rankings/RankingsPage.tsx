import { useState } from "react";
import { ArrowDown, Flame, Trash2 } from "lucide-react";

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

  if (total > 1 && index === total - 2) {
    return "sad";
  }

  if (index <= 2) {
    return "happy";
  }

  return "serious";
}

function getStreakLeaders<T>(
  rows: T[],
  getValue: (row: T) => number,
  getName: (row: T) => string,
) {
  const values = [...new Set(rows.map(getValue).filter((value) => value > 0))]
    .sort((a, b) => b - a)
    .slice(0, 2)

  if (values.length === 0) {
    return [{ rank: 1, names: "Sem partidas ainda", value: 0 }]
  }

  return values.map((value, index) => ({
    rank: index + 1,
    names: rows.filter((row) => getValue(row) === value).map(getName).join(" · "),
    value,
  }))
}

export function RankingsPage({ players, games }: RankingsPageProps) {
  const [tab, setTab] = useState<"individual" | "pairs">("individual");

  const [reverseOrder, setReverseOrder] = useState(false);

  const individual = getIndividualStats(players, games);

  const pairs = getPairStats(players, games);

  const orderedPairs = (reverseOrder ? [...pairs].reverse() : pairs).map(
    (pair) => ({
      pair,
      rankingIndex: pairs.findIndex(
        (originalPair) => originalPair.pairKey === pair.pairKey,
      ),
    }),
  );

  const worstEstablished = [...pairs]
    .filter((pair) => pair.sampleSize === "established")
    .sort((a, b) => a.winRate - b.winRate || b.losses - a.losses)[0];

  const individualWinLeaders = getStreakLeaders(individual, (row) => row.maxWinStreak, (row) => row.name)
  const individualLossLeaders = getStreakLeaders(individual, (row) => row.maxLossStreak, (row) => row.name)
  const pairWinLeaders = getStreakLeaders(pairs, (row) => row.maxWinStreak, (row) => row.label)
  const pairLossLeaders = getStreakLeaders(pairs, (row) => row.maxLossStreak, (row) => row.label)

  const gabuadaRanking = individual.filter((row) => row.gabuadas > 0).sort(
    (a, b) => b.gabuadas - a.gabuadas || b.wins - a.wins || a.name.localeCompare(b.name, 'pt-BR'),
  )

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
      <div className="ranking-order-toolbar">
        <button
          type="button"
          className={
            reverseOrder
              ? "ranking-order-button reversed"
              : "ranking-order-button"
          }
          onClick={() => setReverseOrder((current) => !current)}
          aria-label={
            reverseOrder
              ? "Ordenar do melhor para o pior"
              : "Ordenar do pior para o melhor"
          }
          title={
            reverseOrder ? "Mostrar melhor → pior" : "Mostrar pior → melhor"
          }
        >
          <span>{reverseOrder ? "Pior → melhor" : "Melhor → pior"}</span>

          <ArrowDown size={18} strokeWidth={2.5} />
        </button>
      </div>
      {tab === "individual" ? (
        <div role="tabpanel">
          <div className="panel full-ranking-panel">
            <RankingTable
              rows={individual}
              showStreaks
              reverse={reverseOrder}
            />
          </div>

          <section className="streak-records" aria-label="Recordes individuais">
            <article className="streak-record win-record">
              <div className="streak-record-title"><Flame size={22} /><small>Maior sequência de vitórias</small></div>
              <div className="streak-leaders">
                {individualWinLeaders.map((leader) => (
                  <div className="streak-leader" key={`${leader.rank}-${leader.names}`}>
                    <span className="streak-rank">{leader.rank}º</span>
                    <strong>{leader.names}</strong>
                    <b>{leader.value || "—"}</b>
                  </div>
                ))}
              </div>
            </article>

            <article className="streak-record loss-record">
              <div className="streak-record-title"><Trash2 size={22} /><small>Maior sequência de derrotas</small></div>
              <div className="streak-leaders">
                {individualLossLeaders.map((leader) => (
                  <div className="streak-leader" key={`${leader.rank}-${leader.names}`}>
                    <span className="streak-rank">{leader.rank}º</span>
                    <strong>{leader.names}</strong>
                    <b>{leader.value || "—"}</b>
                  </div>
                ))}
              </div>
            </article>
          </section>

          <section className="panel gabuada-ranking" aria-label="Ranking de gabuadas">
            <div className="gabuada-heading">
              <div>
                <span className="sticker sticker-yellow">Ranking especial</span>
                <h2>Gabuadas</h2>
              </div>
              <p>Quem mais fechou a rodada sem deixar respirar.</p>
            </div>
            <div className="gabuada-list" role="table" aria-label="Ranking de gabuadas">
              {gabuadaRanking.length > 0 ? gabuadaRanking.map((row, index) => (
                  <div className="gabuada-row" role="row" key={row.playerId}>
                    <strong>{String(index + 1).padStart(2, '0')}</strong>
                    <span className="gabuada-player">
                      <PlayerAvatar name={row.name} photoUrl={row.photoUrl} mood={getMoodForPosition(index, gabuadaRanking.length)} />
                      <span>{row.name}</span>
                    </span>
                    <strong className="gabuada-count">{row.gabuadas}</strong>
                  </div>
                )) : <p className="gabuada-empty">Ainda sem gabuadas</p>}
            </div>
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

            {orderedPairs.map(({ pair, rankingIndex }) => {
              const mood = getMoodForPosition(rankingIndex, pairs.length);

              return (
                <div
                  className="pair-ranking-row with-streaks"
                  role="row"
                  aria-label={`${pair.label}, ${pair.wins} vitórias, ${pair.losses} derrotas, ${pair.winRate}%`}
                  key={pair.pairKey}
                >
                  <strong>{String(rankingIndex + 1).padStart(2, "0")}</strong>

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
              <div className="streak-record-title"><Flame size={22} /><small>Maior sequência de vitórias</small></div>
              <div className="streak-leaders">
                {pairWinLeaders.map((leader) => (
                  <div className="streak-leader" key={`${leader.rank}-${leader.names}`}>
                    <span className="streak-rank">{leader.rank}º</span>
                    <strong>{leader.names}</strong>
                    <b>{leader.value || "—"}</b>
                  </div>
                ))}
              </div>
            </article>

            <article className="streak-record loss-record">
              <div className="streak-record-title"><Trash2 size={22} /><small>Maior sequência de derrotas</small></div>
              <div className="streak-leaders">
                {pairLossLeaders.map((leader) => (
                  <div className="streak-leader" key={`${leader.rank}-${leader.names}`}>
                    <span className="streak-rank">{leader.rank}º</span>
                    <strong>{leader.names}</strong>
                    <b>{leader.value || "—"}</b>
                  </div>
                ))}
              </div>
            </article>
          </section>

          {worstEstablished && (
            <aside className="worst-callout">
              <span className="sticker sticker-red">Lanterna das duplas</span>

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
