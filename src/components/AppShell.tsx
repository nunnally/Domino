import { Crown, History, Home, Plus, Swords, UserRound } from 'lucide-react'
import type { ReactNode } from 'react'

import { DominoTile } from './DominoTile'

export type PageId = 'home' | 'rankings' | 'rivalries' | 'players' | 'history' | 'new-game'

interface AppShellProps {
  activePage: PageId
  onNavigate: (page: PageId) => void
  children: ReactNode
}

const navItems: Array<{ id: PageId; label: string; mobileLabel: string; icon: typeof Home }> = [
  { id: 'home', label: 'Início', mobileLabel: 'Início', icon: Home },
  { id: 'rankings', label: 'Rankings', mobileLabel: 'Ranking', icon: Crown },
  { id: 'rivalries', label: 'Confrontos', mobileLabel: 'Duelos', icon: Swords },
  { id: 'players', label: 'Jogadores', mobileLabel: 'Jogadores', icon: UserRound },
  { id: 'history', label: 'Histórico', mobileLabel: 'Histórico', icon: History },
]

export function AppShell({ activePage, onNavigate, children }: AppShellProps) {
  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand-lockup" type="button" onClick={() => onNavigate('home')} aria-label="Ir para o início">
          <span className="brand-copy"><strong>DOMINÓ</strong><em>ZAAAAP</em></span>
          <DominoTile left={2} right={5} className="brand-domino" label="Marca Dominó Zaaaap" />
        </button>

        <nav className="desktop-nav" aria-label="Navegação principal">
          {navItems.map(({ id, label }) => (
            <button className={activePage === id ? 'nav-link active' : 'nav-link'} type="button" key={id} onClick={() => onNavigate(id)}>
              {label}
            </button>
          ))}
        </nav>

        <button className="button button-primary header-cta" type="button" onClick={() => onNavigate('new-game')}>
          <Plus size={19} strokeWidth={3} /> Nova partida
        </button>
      </header>

      <main>{children}</main>

      <nav className="mobile-nav" aria-label="Navegação no celular">
        {navItems.map(({ id, mobileLabel, icon: Icon }) => (
          <button className={activePage === id ? 'mobile-nav-item active' : 'mobile-nav-item'} type="button" key={id} onClick={() => onNavigate(id)}>
            <Icon size={21} strokeWidth={2.5} />
            <span>{mobileLabel}</span>
          </button>
        ))}
        <button className="mobile-nav-item mobile-add" type="button" onClick={() => onNavigate('new-game')} aria-label="Cadastrar partida">
          <Plus size={24} strokeWidth={3.5} />
          <span>Jogar</span>
        </button>
      </nav>
    </div>
  )
}
