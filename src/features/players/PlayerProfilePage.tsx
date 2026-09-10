import type { ReactNode } from "react";
import { ArrowLeft, ArrowRight, Crosshair, Swords, TrendingDown, TrendingUp } from "lucide-react";
import { PlayerAvatar } from "../../components/PlayerAvatar";
import { getIndividualStats, getPlayerRelationships, getPlayerScoreTimeline } from "../../lib/stats";
import type { Game, Player, PlayerRelationship } from "../../lib/types";
import { PlayerScoreChart } from "./PlayerScoreChart";

interface PlayerProfilePageProps {
  player: Player;
  players: Player[];
  games: Game[];
  onBack: () => void;
  onCompare: (playerId: string) => void;
}

function RelationCard({ title, icon, rows }: { title: string; icon: ReactNode; rows: PlayerRelationship[] }) {
  return (
    <article className="player-relation-card">
      <header><span>{icon}</span><h3>{title}</h3></header>
      {rows.length ? rows.map((row) => <div className="player-relation-row" key={row.playerId}><PlayerAvatar name={row.name} photoUrl={row.photoUrl} /><span>{row.name}</span><strong>{row.wins || row.losses}x</strong></div>) : <p>Nenhum confronto registrado ainda.</p>}
    </article>
  );
}

export function PlayerProfilePage({ player, players, games, onBack, onCompare }: PlayerProfilePageProps) {
  const stat = getIndividualStats(players, games).find((row) => row.playerId === player.id);
  const timeline = getPlayerScoreTimeline(players, games, player.id);
  const relations = getPlayerRelationships(players, games, player.id);
  const latest = [...timeline].reverse().slice(0, 5);

  return (
    <section className="page-wrap inner-page player-profile-page">
      <button className="text-back-button" type="button" onClick={onBack}><ArrowLeft size={18} /> Jogadores</button>
      <header className="player-profile-hero">
        <PlayerAvatar name={player.name} photoUrl={player.photoUrl} className="player-profile-avatar" mood="champion" />
        <div><p className="eyebrow">Ficha da mesa</p><h1>{player.name}</h1><p className="player-profile-phrase">{player.catchphrase ? `“${player.catchphrase}”` : "Na ativa, esperando a próxima rodada."}</p></div>
        <button className="button button-secondary" type="button" onClick={() => onCompare(player.id)}>Comparar jogador <ArrowRight size={18} /></button>
      </header>
      <div className="player-metric-grid">
        <div><span>Score</span><strong>{stat?.score.toFixed(1) ?? "0.0"}</strong></div>
        <div><span>Vitórias</span><strong>{stat?.wins ?? 0}</strong></div>
        <div><span>Derrotas</span><strong>{stat?.losses ?? 0}</strong></div>
        <div><span>Partidas</span><strong>{stat?.games ?? 0}</strong></div>
      </div>
      <section className="panel player-chart-panel"><div className="section-heading"><div><p className="eyebrow">Forma ao longo do tempo</p><h2>Histórico de score</h2></div><span className="sticker sticker-yellow">{timeline.length} partidas</span></div><PlayerScoreChart label={`Histórico de score de ${player.name}`} points={timeline} /></section>
      <section className="player-relations-grid">
        <RelationCard title="Mais vitórias com" icon={<TrendingUp size={20} />} rows={relations.mostWinsWith} />
        <RelationCard title="Mais derrotas com" icon={<TrendingDown size={20} />} rows={relations.mostLossesWith} />
        <RelationCard title="Mais venceu contra" icon={<Swords size={20} />} rows={relations.mostWinsAgainst} />
      </section>
      <section className="panel player-recent-panel"><div className="section-heading"><div><p className="eyebrow">Últimos capítulos</p><h2>Partidas recentes</h2></div><Crosshair size={22} /></div>{latest.length ? <div className="player-recent-list">{latest.map((game) => <div key={game.gameId}><span className={game.result === "win" ? "result-dot win" : "result-dot loss"} /><strong>{game.result === "win" ? "Vitória" : "Derrota"}</strong><span>vs. {game.opponentNames.join(" e ")}</span><b>{game.score.toFixed(1)}</b></div>)}</div> : <p>Ainda não há partidas para este jogador.</p>}</section>
    </section>
  );
}
