import { useCallback, useEffect, useState } from 'react'

import { AppShell, type PageId } from './components/AppShell'
import { Dashboard } from './features/rankings/Dashboard'
import { createRepository, type DominoRepository } from './lib/repository'
import type { Game, PeriodFilter, Player } from './lib/types'

interface AppProps {
  repository?: DominoRepository
}

const pageTitles: Record<PageId, string> = {
  home: 'Início',
  rankings: 'Rankings',
  rivalries: 'Confrontos',
  players: 'Jogadores',
  history: 'Histórico',
  'new-game': 'Nova partida',
}

export function App({ repository: suppliedRepository }: AppProps) {
  const [repository, setRepository] = useState<DominoRepository | null>(suppliedRepository ?? null)
  const [players, setPlayers] = useState<Player[]>([])
  const [games, setGames] = useState<Game[]>([])
  const [page, setPage] = useState<PageId>('home')
  const [period, setPeriod] = useState<PeriodFilter>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadData = useCallback(async (activeRepository: DominoRepository) => {
    setLoading(true)
    setError('')
    try {
      const [nextPlayers, nextGames] = await Promise.all([
        activeRepository.listPlayers(),
        activeRepository.listGames(),
      ])
      setPlayers(nextPlayers)
      setGames(nextGames)
    } catch {
      setError('Não conseguimos carregar a mesa. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    const boot = async () => {
      const activeRepository = suppliedRepository ?? await createRepository()
      if (cancelled) return
      setRepository(activeRepository)
      await loadData(activeRepository)
    }
    void boot()
    return () => { cancelled = true }
  }, [loadData, suppliedRepository])

  const navigate = (nextPage: PageId) => {
    setPage(nextPage)
    window.location.hash = nextPage === 'home' ? '' : nextPage
    window.scrollTo?.({ top: 0, behavior: 'smooth' })
  }

  return (
    <AppShell activePage={page} onNavigate={navigate}>
      {loading && (
        <div className="page-wrap loading-grid" aria-label="Carregando ranking">
          <span /><span /><span />
        </div>
      )}
      {error && (
        <section className="page-wrap error-panel" role="alert">
          <strong>Ops, a rodada travou.</strong>
          <p>{error}</p>
          {repository && <button className="button button-secondary" type="button" onClick={() => void loadData(repository)}>Tentar novamente</button>}
        </section>
      )}
      {!loading && !error && page === 'home' && (
        <Dashboard
          players={players}
          games={games}
          period={period}
          onPeriodChange={setPeriod}
          onShowRankings={() => navigate('rankings')}
          onNewGame={() => navigate('new-game')}
        />
      )}
      {!loading && !error && page !== 'home' && (
        <section className="page-wrap placeholder-page">
          <p className="eyebrow">Próxima peça</p>
          <h1>{pageTitles[page]}</h1>
          <p>Esta área está entrando na mesa agora.</p>
        </section>
      )}
    </AppShell>
  )
}

