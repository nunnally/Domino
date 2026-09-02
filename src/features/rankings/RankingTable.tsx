import type { IndividualStat } from '../../lib/types'
import { PlayerAvatar } from '../../components/PlayerAvatar'
import { Flame, Trash2 } from 'lucide-react'

interface RankingTableProps {
  rows: IndividualStat[]
  limit?: number
  showStreaks?: boolean
}

export function RankingTable({ rows, limit, showStreaks = false }: RankingTableProps) {
  const visibleRows = limit ? rows.slice(0, limit) : rows

  return (
    <div className="ranking-list" role="table" aria-label="Ranking individual">
      <div className={showStreaks ? 'ranking-head with-streaks' : 'ranking-head'} role="row">
        <span>#</span><span>Jogador</span><span>Jogos</span><span>V</span><span>D</span><span>Aproveit.</span>
        {showStreaks && <><span className="desktop-streak">Sequência de vitórias</span><span className="desktop-streak">Sequência de derrotas</span></>}
      </div>
      {visibleRows.map((row, index) => (
        <div className={`${index === 0 ? 'ranking-row leader' : 'ranking-row'}${showStreaks ? ' with-streaks' : ''}`} role="row" aria-label={`${row.name}, ${row.wins} vitórias, ${row.losses} derrotas, ${row.winRate}%`} key={row.playerId}>
          <strong className="rank-number">{String(index + 1).padStart(2, '0')}</strong>
          <span className="rank-player"><PlayerAvatar name={row.name} photoUrl={row.photoUrl} /><span><strong>{row.name}</strong>{showStreaks && <span className="mobile-streaks"><small><Flame size={13} /> Sequência de vitórias: {row.maxWinStreak}</small><small><Trash2 size={13} /> Sequência de derrotas: {row.maxLossStreak}</small></span>}</span></span>
          <span className="rank-stat"><small>J</small>{row.games}</span>
          <span className="rank-stat win"><small>V</small>{row.wins}</span>
          <span className="rank-stat loss"><small>D</small>{row.losses}</span>
          <strong className="rank-rate">{row.winRate}%</strong>
          {showStreaks && <><span className="streak-cell desktop-streak win"><Flame size={17} /> {row.maxWinStreak}</span><span className="streak-cell desktop-streak loss"><Trash2 size={17} /> {row.maxLossStreak}</span></>}
        </div>
      ))}
    </div>
  )
}
