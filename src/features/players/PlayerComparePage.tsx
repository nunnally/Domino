import * as React from "react";
import { ArrowLeft, Check, Swords } from "lucide-react";
import { PlayerAvatar } from "../../components/PlayerAvatar";
import { getHeadToHeadBetweenPlayers, getIndividualStats, getPlayerScoreTimeline } from "../../lib/stats";
import { isGuestPlayer } from "../../lib/types";
import type { Game, Player } from "../../lib/types";
import { PlayerScoreChart, type PlayerScoreSeries } from "./PlayerScoreChart";

interface PlayerComparePageProps { players: Player[]; games: Game[]; initialPlayerIds?: string[]; onBack: () => void; onOpenProfile: (id: string) => void }

export function PlayerComparePage({ players, games, initialPlayerIds = [], onBack, onOpenProfile }: PlayerComparePageProps) {
  const available = players.filter((player) => !isGuestPlayer(player));
  const [selectedIds, setSelectedIds] = React.useState<string[]>(initialPlayerIds.filter((id) => available.some((player) => player.id === id)).slice(0, 4));
  const selected = selectedIds.map((id) => available.find((player) => player.id === id)).filter((player): player is Player => Boolean(player));
  const stats = getIndividualStats(players, games);
  const matrix = getHeadToHeadBetweenPlayers(players, games, selectedIds);
  const series: PlayerScoreSeries[] = selected.map((player, index) => ({ id: player.id, label: player.name, photoUrl: player.photoUrl, points: getPlayerScoreTimeline(players, games, player.id), color: ["#000", "#ff6b6b", "#1f8a4c", "#7c3aed"][index] }));
  const toggle = (id: string) => setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : current.length < 4 ? [...current, id] : current);

  return <section className="page-wrap inner-page compare-page">
    <button className="text-back-button" type="button" onClick={onBack}><ArrowLeft size={18} /> Jogadores</button>
    <header className="inner-page-heading"><div><p className="eyebrow">Duelo de dados</p><h1>Comparar jogadores</h1><p>Escolha até quatro nomes e veja quem chega mais forte.</p></div><Swords size={44} /></header>
    <section className="panel compare-picker"><div className="compare-picker-head"><h2>Quem entra na mesa?</h2><span>{selected.length}/4</span></div><div className="compare-player-options">{available.map((player) => <button key={player.id} type="button" className={selectedIds.includes(player.id) ? "selected" : ""} onClick={() => toggle(player.id)} disabled={!selectedIds.includes(player.id) && selected.length >= 4}><PlayerAvatar name={player.name} photoUrl={player.photoUrl} /><span>{player.name}</span>{selectedIds.includes(player.id) && <Check size={18} />}</button>)}</div></section>
    {selected.length < 2 ? <div className="compare-empty"><Swords size={32} /><strong>Selecione pelo menos dois jogadores</strong><span>A comparação aparece assim que houver um duelo.</span></div> : <>
      <section className="panel compare-chart-panel"><div className="section-heading"><div><p className="eyebrow">Ritmo</p><h2>Score ao longo das partidas</h2></div></div><PlayerScoreChart label="Comparação de score entre jogadores" series={series} /></section>
      <section className="panel compare-table-panel"><div className="section-heading"><div><p className="eyebrow">Resumo</p><h2>Placar lado a lado</h2></div></div><div className="compare-table-scroll"><table><thead><tr><th>Jogador</th><th>Score</th><th>V</th><th>D</th><th>Jogos</th></tr></thead><tbody>{selected.map((player) => { const stat = stats.find((row) => row.playerId === player.id); return <tr key={player.id} onClick={() => onOpenProfile(player.id)}><td><PlayerAvatar name={player.name} photoUrl={player.photoUrl} /><strong>{player.name}</strong></td><td>{stat?.score.toFixed(1)}</td><td>{stat?.wins}</td><td>{stat?.losses}</td><td>{stat?.games}</td></tr> })}</tbody></table></div></section>
      <section className="panel compare-matrix-panel"><div className="section-heading"><div><p className="eyebrow">Confrontos diretos</p><h2>Quem venceu quem</h2></div></div><div className="compare-table-scroll"><table className="head-to-head-matrix"><thead><tr><th>Vitórias →</th>{selected.map((player) => <th key={player.id}>{player.name}</th>)}</tr></thead><tbody>{selected.map((row) => <tr key={row.id}><th>{row.name}</th>{selected.map((column) => <td key={column.id}>{row.id === column.id ? "—" : matrix[row.id]?.[column.id] ?? 0}</td>)}</tr>)}</tbody></table></div></section>
    </>}
  </section>;
}
