/* eslint-disable @typescript-eslint/no-unused-vars */

import { ArrowDownRight, ArrowUpRight } from 'lucide-react'

import { PlayerAvatar } from '../../components/PlayerAvatar'
import { PARTNER_IMPACT_MINIMUM_GAMES, PARTNER_IMPACT_MINIMUM_PARTNERS } from '../../lib/stats'
import type { PartnerImpactStat } from '../../lib/types'

interface PartnerImpactSectionProps {
  positive: PartnerImpactStat[]
  negative: PartnerImpactStat[]
}

function ImpactBoard({
  rows,
  direction,
}: {
  rows: PartnerImpactStat[]
  direction: 'positive' | 'negative'
}) {
  const positive = direction === 'positive'
  const Icon = positive ? ArrowUpRight : ArrowDownRight

  return (
    <article className={`impact-board impact-board-${direction}`}>
      <header className="impact-board-heading">
        <div>
          <span className="impact-board-overline">{positive ? 'A dupla rende' : 'A dupla pesa'}</span>
          <h3>{positive ? 'Puxam pra cima' : 'Puxam pra baixo'}</h3>
        </div>
        <span className="impact-board-emblem" aria-hidden="true"><Icon size={32} strokeWidth={3} /></span>
      </header>

      {rows.length > 0 ? (
        <ol className="impact-list">
          {rows.map((row, index) => (
            <li key={row.playerId} className="impact-row">
              <span className="impact-rank">{String(index + 1).padStart(2, '0')}</span>
              <PlayerAvatar name={row.name} photoUrl={row.photoUrl} className="impact-avatar" />
              <div className="impact-person">
                <strong>{row.name}</strong>
                <small>{row.comparedGames} jogos · {row.partnerCount} duplas</small>
              </div>
              <strong className="impact-number" aria-label={`${positive ? 'mais' : 'menos'} ${Math.abs(row.impactPercentagePoints).toLocaleString('pt-BR', { minimumFractionDigits: 1 })} pontos percentuais`}>
                <span>{positive ? '+' : '−'}{Math.abs(row.impactPercentagePoints).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</span>
                <small>p.p.</small>
              </strong>
            </li>
          ))}
        </ol>
      ) : (
        <p className="impact-empty">É preciso ter {PARTNER_IMPACT_MINIMUM_GAMES} jogos comparáveis e {PARTNER_IMPACT_MINIMUM_PARTNERS} duplas diferentes.</p>
      )}
    </article>
  )
}

// export function PartnerImpactSection({ positive, negative }: PartnerImpactSectionProps) {
//   return (
//     <section className="partner-impact-section" aria-labelledby="partner-impact-title">

//       <header className="partner-impact-heading">
//         <div>
//           <span className="partner-impact-label">O efeito de sentar ao lado</span>
//                            <p>Quem muda a sorte da dupla? Pessoas que impactam positivamente ou negativamente a dupla.</p>


//           <h2 id="partner-impact-title">Put your name <span>in the sky.</span></h2>
//         </div>

//         <h2>Melhor evitar!!!?</h2>
        
//       </header>
//       <div className="impact-board-grid">
//         <ImpactBoard rows={positive} direction="positive" />
//         <ImpactBoard rows={negative} direction="negative" />
//       </div>
//       <p className="impact-note">Mínimo de {PARTNER_IMPACT_MINIMUM_GAMES} jogos comparáveis e {PARTNER_IMPACT_MINIMUM_PARTNERS} duplas. Comparamos a taxa de vitória dos parceiros com e sem a pessoa; p.p. = pontos percentuais.</p>
//     </section>
//   )
// }
