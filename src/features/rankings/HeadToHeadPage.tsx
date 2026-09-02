import { Swords } from 'lucide-react'

import { DominoTile } from '../../components/DominoTile'
import { getHeadToHeadStats } from '../../lib/stats'
import type { Game, Player } from '../../lib/types'

interface HeadToHeadPageProps {
  players: Player[]
  games: Game[]
}

export function HeadToHeadPage({ players, games }: HeadToHeadPageProps) {
  const matchups = getHeadToHeadStats(players, games)

  return (
    <section className="page-wrap inner-page">
      <header className="inner-page-heading">
        <div>
          <p className="eyebrow">Freguesia documentada</p>
          <h1>Confrontos</h1>
          <p>Quem costuma ganhar de quem quando as mesmas quatro cadeiras se encontram.</p>
        </div>
        <DominoTile left={5} right={5} label="Bucha de cinco" />
      </header>

      <div className="matchup-grid">
        {matchups.map((matchup, index) => {
          const [first, second] = matchup.pairLabels
          return (
            <article className={index === 0 ? 'matchup-card featured' : 'matchup-card'} key={matchup.matchupKey}>
              <span className="matchup-icon"><Swords size={22} strokeWidth={3} /></span>
              <span className="sticker sticker-yellow">{matchup.rivalryLabel}</span>
              <div className="matchup-side">
                <strong>{first}</strong><b>{matchup.scoreByPair[first] ?? 0}</b>
              </div>
              <span className="versus-word">contra</span>
              <div className="matchup-side second">
                <strong>{second}</strong><b>{matchup.scoreByPair[second] ?? 0}</b>
              </div>
              <p>{matchup.games} {matchup.games === 1 ? 'partida registrada' : 'partidas registradas'}</p>
            </article>
          )
        })}
      </div>
      {matchups.length === 0 && <div className="empty-state"><h2>Ainda sem revanche</h2><p>Cadastre algumas partidas para liberar os confrontos.</p></div>}
    </section>
  )
}
