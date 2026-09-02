import { createClient } from '@supabase/supabase-js'

import type { DominoRepository } from './repository'
import type { Game, Player } from './types'

interface PlayerRow {
  id: string
  name: string
  photo_url: string
  catchphrase: string | null
  active: boolean
  created_at: string
}

interface GameRow {
  id: string
  played_at: string
  winner_ids: [string, string]
  loser_ids: [string, string]
  winner_score: number | null
  loser_score: number | null
  latitude: number | null
  longitude: number | null
  created_at: string
}

const toPlayer = (row: PlayerRow): Player => ({
  id: row.id,
  name: row.name,
  photoUrl: row.photo_url,
  ...(row.catchphrase === null ? {} : { catchphrase: row.catchphrase }),
  active: row.active,
  createdAt: row.created_at,
})

const toPlayerRow = (player: Player): PlayerRow => ({
  id: player.id,
  name: player.name,
  photo_url: player.photoUrl,
  catchphrase: player.catchphrase ?? null,
  active: player.active,
  created_at: player.createdAt,
})

const toGame = (row: GameRow): Game => ({
  id: row.id,
  playedAt: row.played_at,
  winnerIds: row.winner_ids,
  loserIds: row.loser_ids,
  ...(row.winner_score === null ? {} : { winnerScore: row.winner_score }),
  ...(row.loser_score === null ? {} : { loserScore: row.loser_score }),
  ...(row.latitude === null ? {} : { latitude: row.latitude }),
  ...(row.longitude === null ? {} : { longitude: row.longitude }),
  createdAt: row.created_at,
})

const toGameRow = (game: Game): GameRow => ({
  id: game.id,
  played_at: game.playedAt,
  winner_ids: game.winnerIds,
  loser_ids: game.loserIds,
  winner_score: game.winnerScore ?? null,
  loser_score: game.loserScore ?? null,
  latitude: game.latitude ?? null,
  longitude: game.longitude ?? null,
  created_at: game.createdAt,
})

export function createSupabaseRepository(url: string, publishableKey: string): DominoRepository {
  const client = createClient(url, publishableKey)

  return {
    async listPlayers() {
      const { data, error } = await client.from('players').select('*').order('name')
      if (error) throw error
      return (data as PlayerRow[]).map(toPlayer)
    },
    async listGames() {
      const { data, error } = await client.from('games').select('*').order('played_at', { ascending: false })
      if (error) throw error
      return (data as GameRow[]).map(toGame)
    },
    async addGame(game) {
      const { data, error } = await client.from('games').insert(toGameRow(game)).select().single()
      if (error) throw error
      return toGame(data as GameRow)
    },
    async addPlayer(player) {
      const { data, error } = await client.from('players').insert(toPlayerRow(player)).select().single()
      if (error) throw error
      return toPlayer(data as PlayerRow)
    },
    async updatePlayer(id, changes) {
      const row = {
        ...(changes.name === undefined ? {} : { name: changes.name }),
        ...(changes.photoUrl === undefined ? {} : { photo_url: changes.photoUrl }),
        ...(changes.catchphrase === undefined ? {} : { catchphrase: changes.catchphrase.trim() || null }),
        ...(changes.active === undefined ? {} : { active: changes.active }),
      }
      const { data, error } = await client.from('players').update(row).eq('id', id).select().single()
      if (error) throw error
      return toPlayer(data as PlayerRow)
    },
  }
}
