import type {
  Game,
  HeadToHeadStat,
  IndividualStat,
  PairStat,
  PeriodFilter,
  Player,
} from './types'

const percentage = (wins: number, games: number) =>
  games === 0 ? 0 : Number(((wins / games) * 100).toFixed(1))

const playerMap = (players: Player[]) => new Map(players.map((player) => [player.id, player]))

const canonicalPair = (ids: [string, string]) => [...ids].sort() as [string, string]

const pairKey = (ids: [string, string]) => canonicalPair(ids).join('::')

const compareByRank = <T extends { wins: number; losses: number; winRate: number }>(
  a: T,
  b: T,
) => b.wins - a.wins || b.winRate - a.winRate || a.losses - b.losses

export function getIndividualStats(players: Player[], games: Game[]): IndividualStat[] {
  const stats = new Map<string, IndividualStat>()

  for (const player of players) {
    stats.set(player.id, {
      playerId: player.id,
      name: player.name,
      photoUrl: player.photoUrl,
      games: 0,
      wins: 0,
      losses: 0,
      winRate: 0,
    })
  }

  for (const game of games) {
    for (const id of game.winnerIds) {
      const stat = stats.get(id)
      if (stat) {
        stat.games += 1
        stat.wins += 1
      }
    }
    for (const id of game.loserIds) {
      const stat = stats.get(id)
      if (stat) {
        stat.games += 1
        stat.losses += 1
      }
    }
  }

  return [...stats.values()]
    .map((stat) => ({ ...stat, winRate: percentage(stat.wins, stat.games) }))
    .sort((a, b) => compareByRank(a, b) || a.name.localeCompare(b.name, 'pt-BR'))
}

export function getPairStats(players: Player[], games: Game[]): PairStat[] {
  const playersById = playerMap(players)
  const stats = new Map<string, PairStat>()

  const addResult = (ids: [string, string], won: boolean) => {
    const canonicalIds = canonicalPair(ids)
    const key = pairKey(ids)
    const pairPlayers = canonicalIds
      .map((id) => playersById.get(id))
      .filter((player): player is Player => Boolean(player))
      .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))

    if (pairPlayers.length !== 2) return

    const existing = stats.get(key) ?? {
      pairKey: key,
      playerIds: [pairPlayers[0].id, pairPlayers[1].id] as [string, string],
      names: [pairPlayers[0].name, pairPlayers[1].name] as [string, string],
      label: `${pairPlayers[0].name} & ${pairPlayers[1].name}`,
      photoUrls: [pairPlayers[0].photoUrl, pairPlayers[1].photoUrl] as [string, string],
      games: 0,
      wins: 0,
      losses: 0,
      winRate: 0,
      sampleSize: 'small' as const,
    }

    existing.games += 1
    if (won) existing.wins += 1
    else existing.losses += 1
    stats.set(key, existing)
  }

  for (const game of games) {
    addResult(game.winnerIds, true)
    addResult(game.loserIds, false)
  }

  return [...stats.values()]
    .map((stat) => ({
      ...stat,
      winRate: percentage(stat.wins, stat.games),
      sampleSize: stat.games >= 3 ? 'established' as const : 'small' as const,
    }))
    .sort((a, b) =>
      b.wins - a.wins
      || b.winRate - a.winRate
      || Number(b.sampleSize === 'established') - Number(a.sampleSize === 'established')
      || a.losses - b.losses
      || a.label.localeCompare(b.label, 'pt-BR'),
    )
}

export function getHeadToHeadStats(players: Player[], games: Game[]): HeadToHeadStat[] {
  const pairs = getPairStats(players, games)
  const pairByKey = new Map(pairs.map((pair) => [pair.pairKey, pair]))
  const matchups = new Map<string, HeadToHeadStat>()

  for (const game of games) {
    const winnerKey = pairKey(game.winnerIds)
    const loserKey = pairKey(game.loserIds)
    const winner = pairByKey.get(winnerKey)
    const loser = pairByKey.get(loserKey)
    if (!winner || !loser) continue

    const keys = [winnerKey, loserKey].sort()
    const matchupKey = keys.join('::vs::')
    const labels = keys.map((key) => pairByKey.get(key)?.label ?? key) as [string, string]
    const existing = matchups.get(matchupKey) ?? {
      matchupKey,
      pairLabels: labels,
      games: 0,
      scoreByPair: { [labels[0]]: 0, [labels[1]]: 0 },
      leaderLabel: labels[0],
      leaderWins: 0,
      trailerWins: 0,
      rivalryLabel: 'Primeiro confronto' as const,
    }

    existing.games += 1
    existing.scoreByPair[winner.label] = (existing.scoreByPair[winner.label] ?? 0) + 1
    matchups.set(matchupKey, existing)
  }

  return [...matchups.values()]
    .map((matchup) => {
      const [first, second] = matchup.pairLabels
      const ordered = [
        { label: first, wins: matchup.scoreByPair[first] ?? 0 },
        { label: second, wins: matchup.scoreByPair[second] ?? 0 },
      ].sort((a, b) => b.wins - a.wins || a.label.localeCompare(b.label, 'pt-BR'))
      const rivalryLabel: HeadToHeadStat['rivalryLabel'] = matchup.games === 1
        ? 'Primeiro confronto'
        : ordered[0].wins === ordered[1].wins
          ? 'Duelo aberto'
          : 'Carrasco da rodada'

      return {
        ...matchup,
        leaderLabel: ordered[0].label,
        leaderWins: ordered[0].wins,
        trailerWins: ordered[1].wins,
        rivalryLabel,
      }
    })
    .sort((a, b) => b.games - a.games || a.matchupKey.localeCompare(b.matchupKey, 'pt-BR'))
}

export function filterGamesByPeriod(
  games: Game[],
  period: PeriodFilter,
  now = new Date(),
): Game[] {
  if (period === 'all') return [...games]

  const start = new Date(now)
  if (period === 'today') start.setHours(0, 0, 0, 0)
  else start.setDate(start.getDate() - 30)

  return games.filter((game) => new Date(game.playedAt) >= start)
}
