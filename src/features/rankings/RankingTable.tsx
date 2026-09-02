import type { IndividualStat } from '../../lib/types'
import { PlayerAvatar } from '../../components/PlayerAvatar'
import type { AvatarMood } from '../../components/PlayerAvatar'

interface RankingTableProps {
  rows: IndividualStat[]
  limit?: number
}

function getMoodForPosition(
  index: number,
  total: number,
): AvatarMood {
  if (index === 0) {
    return 'champion'
  }

  if (total > 1 && index === total - 1) {
    return 'sad'
  }

  if (index <= 2) {
    return 'happy'
  }

  return 'serious'
}

export function RankingTable({
  rows,
  limit,
}: RankingTableProps) {
  const visibleRows = limit ? rows.slice(0, limit) : rows

  return (
    <div
      className="ranking-list"
      role="table"
      aria-label="Ranking individual"
    >
      <div className="ranking-head" role="row">
        <span>#</span>
        <span>Jogador</span>
        <span>Jogos</span>
        <span>V</span>
        <span>D</span>
        <span>Aproveit.</span>
      </div>

      {visibleRows.map((row, index) => {
        const mood = getMoodForPosition(index, rows.length)

        return (
          <div
            className={
              index === 0
                ? 'ranking-row leader'
                : 'ranking-row'
            }
            role="row"
            aria-label={`${row.name}, ${row.wins} vitórias, ${row.losses} derrotas, ${row.winRate}%`}
            key={row.playerId}
          >
            <strong className="rank-number">
              {String(index + 1).padStart(2, '0')}
            </strong>

            <span className="rank-player">
              <PlayerAvatar
                name={row.name}
                photoUrl={row.photoUrl}
                mood={mood}
              />

              <strong>{row.name}</strong>
            </span>

            <span className="rank-stat">
              <small>J</small>
              {row.games}
            </span>

            <span className="rank-stat win">
              <small>V</small>
              {row.wins}
            </span>

            <span className="rank-stat loss">
              <small>D</small>
              {row.losses}
            </span>

            <strong className="rank-rate">
              {row.winRate}%
            </strong>
          </div>
        )
      })}
    </div>
  )
}