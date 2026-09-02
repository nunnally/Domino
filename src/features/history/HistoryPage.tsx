import { DominoTile } from '../../components/DominoTile'
import type { Game, Player } from '../../lib/types'

interface HistoryPageProps {
  players: Player[]
  games: Game[]
}

export function HistoryPage({ players, games }: HistoryPageProps) {
  const names = new Map(players.map((player) => [player.id, player.name]))
  const orderedGames = [...games].sort((a, b) => new Date(b.playedAt).getTime() - new Date(a.playedAt).getTime())
  const pairLabel = (ids: [string, string]) => ids.map((id) => names.get(id) ?? 'Desconhecido').join(' & ')

  return (
    <section className="page-wrap inner-page">
      <header className="inner-page-heading">
        <div>
          <p className="eyebrow">A súmula da resenha</p>
          <h1>Histórico</h1>
          <p>Todas as partidas, da mais recente até aquela derrota que ninguém esqueceu.</p>
        </div>
        <DominoTile left={1} right={4} label="Peça um quatro" />
      </header>

      <div className="history-list">
        {orderedGames.map((game, index) => (
          <article className="history-row" key={game.id}>
            <div className="history-meta"><strong>#{String(orderedGames.length - index).padStart(2, '0')}</strong><time dateTime={game.playedAt}>{new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(game.playedAt))}</time></div>
            <div className="history-pair winners"><small>Ganharam</small><strong>{pairLabel(game.winnerIds)}</strong></div>
            <div className="history-score">{game.winnerScore != null && game.loserScore != null ? <><strong>{game.winnerScore}</strong><span>×</span><strong>{game.loserScore}</strong></> : <span>Venceu</span>}</div>
            <div className="history-pair losers"><small>Perderam</small><strong>{pairLabel(game.loserIds)}</strong></div>
          </article>
        ))}
      </div>
    </section>
  )
}
