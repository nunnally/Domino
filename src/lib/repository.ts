import type { Game, Player } from './types'

export interface DominoRepository {
  listPlayers(): Promise<Player[]>
  listGames(): Promise<Game[]>
  addGame(game: Game): Promise<Game>
  addPlayer(player: Player): Promise<Player>
  updatePlayer(id: string, changes: Partial<Pick<Player, 'name' | 'photoUrl' | 'catchphrase' | 'active'>>): Promise<Player>
}

export async function createRepository(): Promise<DominoRepository> {
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
  const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined

  if (url && publishableKey) {
    const { createSupabaseRepository } = await import('./supabase-repository')
    return createSupabaseRepository(url, publishableKey)
  }

  const { createLocalRepository } = await import('./local-repository')
  return createLocalRepository(window.localStorage)
}
