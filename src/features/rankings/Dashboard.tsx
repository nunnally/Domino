import { ArrowRight, Medal } from "lucide-react";

import { DominoTile } from "../../components/DominoTile";
import { PlayerAvatar } from "../../components/PlayerAvatar";

import {
  filterGamesByPeriod,
  getHeadToHeadStats,
  getIndividualStats,
  getPairStats,
} from "../../lib/stats";

import type { Game, PeriodFilter, Player } from "../../lib/types";

import { LeaderCard } from "./LeaderCard";
import { LanternCard } from "./LanternCard";
import { RankingTable } from "./RankingTable";

interface DashboardProps {
  players: Player[];
  games: Game[];
  period: PeriodFilter;
  onPeriodChange: (period: PeriodFilter) => void;
  onShowRankings: () => void;
  onNewGame: () => void;
}

const periodLabels: Record<PeriodFilter, string> = {
  today: "Hoje",
  "30d": "30 dias",
  all: "Geral",
};

export function Dashboard({
  players,
  games,
  period,
  onPeriodChange,
  onShowRankings,
  onNewGame,
}: DashboardProps) {
  const periodGames = filterGamesByPeriod(games, period);

  const individuals = getIndividualStats(players, periodGames).filter(
    ({ games: played }) => played > 0,
  );

  const pairs = getPairStats(players, periodGames);
  const rivalries = getHeadToHeadStats(players, periodGames);

  const leader = individuals[0];

  const leaderPlayers = leader
    ? individuals.filter(
        (player) =>
          player.wins === leader.wins &&
          player.winRate === leader.winRate &&
          player.losses === leader.losses,
      )
    : [];

  const lastPlayer = individuals.at(-1);

  const lanternPlayers = lastPlayer
    ? individuals.filter(
        (player) =>
          player.wins === lastPlayer.wins &&
          player.winRate === lastPlayer.winRate &&
          player.losses === lastPlayer.losses,
      )
    : [];

  const bestPair = pairs[0];
  const mainRivalry = rivalries[0];

  return (
    <div className="page-wrap dashboard-page">
      <section className="dashboard-intro">
        <div>
          <p className="eyebrow">O placar oficial da mesa</p>

          <h1>
            Quem é pai de quem
            no <mark>dominó?</mark>
          </h1>

          <p className="intro-copy">Vitórias, derrotas, duplas.</p>
        </div>

        <div className="period-switch" aria-label="Período do ranking">
          {(Object.keys(periodLabels) as PeriodFilter[]).map((value) => (
            <button
              type="button"
              className={
                period === value ? "period-chip active" : "period-chip"
              }
              key={value}
              onClick={() => onPeriodChange(value)}
            >
              {periodLabels[value]}
            </button>
          ))}
        </div>
      </section>

      {!leader || !bestPair ? (
        <section
          className="empty-state panel"
          style={{
            marginTop: "2rem",
            textAlign: "center",
            padding: "3rem 1rem",
          }}
        >
          <DominoTile left={0} right={0} />

          <p
            className="eyebrow"
            style={{
              marginTop: "1rem",
            }}
          >
            A mesa está limpa neste período
          </p>

          <h2>
            Nenhuma partida registrada{" "}
            {period === "today"
              ? "hoje"
              : period === "30d"
                ? "nos últimos 30 dias"
                : "no geral"}
            .
          </h2>

          <button
            className="button button-primary"
            type="button"
            onClick={onNewGame}
            style={{
              marginTop: "1.5rem",
            }}
          >
            Cadastrar partida
          </button>
        </section>
      ) : (
        <>
          <LeaderCard players={leaderPlayers} />

          <section className="score-strip" aria-label="Resumo do período">
            <div>
              <strong>{periodGames.length}</strong>
              <span>partidas</span>
            </div>

            <div>
              <strong>{individuals.length}</strong>
              <span>jogadores</span>
            </div>

            <div>
              <strong>{pairs.length}</strong>
              <span>duplas</span>
            </div>

            <div>
              <strong>{rivalries.length}</strong>
              <span>confrontos</span>
            </div>
          </section>

          <div className="dashboard-grid">
            <section className="panel ranking-panel">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Classificação geral</p>
                  <h2>Ranking dos véi</h2>
                </div>

                <button
                  className="text-button"
                  type="button"
                  onClick={onShowRankings}
                >
                  Ver completo <ArrowRight size={18} />
                </button>
              </div>

              <RankingTable rows={individuals} limit={6} />
            </section>

            <aside className="side-stack">
              <section className="panel pair-card">
                <span className="sticker sticker-violet">
                  <Medal size={16} /> Líderes do dominó
                </span>

                <div className="pair-avatars">
                  {bestPair.names.map((name, index) => (
                    <PlayerAvatar
                      key={name}
                      name={name}
                      photoUrl={bestPair.photoUrls[index]}
                      mood="happy"
                    />
                  ))}
                </div>

                <h3>
                  {bestPair.names[0]}
                  <br />
                  <span>&</span> {bestPair.names[1]}
                </h3>

                <p>
                  <strong>{bestPair.wins} vitórias</strong> em {bestPair.games}{" "}
                  jogos
                </p>

                <DominoTile
                  left={bestPair.wins % 7}
                  right={bestPair.losses % 7}
                  className="pair-domino"
                />
              </section>

             <LanternCard
  players={lanternPlayers}
  period={period}
/>
            </aside>
          </div>

          {mainRivalry && (
            <section className="rivalry-banner">
              <div>
                <p className="eyebrow">Confronto em destaque</p>

                <h2>
                  {mainRivalry.pairLabels[0]} <span>vs.</span>{" "}
                  {mainRivalry.pairLabels[1]}
                </h2>
              </div>

              <div className="rivalry-score">
                <strong>{mainRivalry.leaderWins}</strong>
                <span>×</span>
                <strong>{mainRivalry.trailerWins}</strong>
              </div>

              <span className="rivalry-stamp">
                {mainRivalry.rivalryLabel}
              </span>
            </section>
          )}
        </>
      )}
    </div>
  );
}