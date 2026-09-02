import { useState, type FormEvent } from 'react'
import { Plus, UserRoundCheck, UserRoundX } from 'lucide-react'

import { DominoTile } from '../../components/DominoTile'
import { PlayerAvatar } from '../../components/PlayerAvatar'
import type { Player } from '../../lib/types'

interface PlayersPageProps {
  players: Player[]
  editable: boolean
  onAddPlayer: (name: string, photoUrl: string) => Promise<void>
  onTogglePlayer: (player: Player) => Promise<void>
}

export function PlayersPage({ players, editable, onAddPlayer, onTogglePlayer }: PlayersPageProps) {
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [photoUrl, setPhotoUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const togglePlayer = async (player: Player) => {
    setError('')
    try {
      await onTogglePlayer(player)
    } catch {
      setError('Não foi possível alterar esse jogador agora.')
    }
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!name.trim()) return setError('Diga o nome do novo jogador.')
    setSaving(true)
    setError('')
    try {
      await onAddPlayer(name.trim(), photoUrl.trim())
      setName('')
      setPhotoUrl('')
      setShowForm(false)
    } catch {
      setError('Não foi possível cadastrar agora.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="page-wrap inner-page">
      <header className="inner-page-heading">
        <div>
          <p className="eyebrow">A turma da mesa</p>
          <h1>Jogadores</h1>
          <p>Fotos, nomes e espaço aberto para quem chegar na próxima rodada.</p>
        </div>
        <DominoTile left={3} right={6} label="Peça três seis" />
      </header>

      <div className="players-toolbar">
        <p>{players.filter((player) => player.active).length} jogadores ativos</p>
        {editable ? <button className="button button-primary" type="button" onClick={() => setShowForm((visible) => !visible)}><Plus size={19} strokeWidth={3} /> Novo jogador</button> : <span className="access-note">Use o PIN em Nova partida para editar</span>}
      </div>

      {error && !showForm && <p className="form-error" role="alert">{error}</p>}

      {showForm && (
        <form className="add-player-form" onSubmit={submit}>
          <label><span>Nome</span><input value={name} onChange={(event) => setName(event.target.value)} placeholder="Ex.: João" autoFocus /></label>
          <label><span>URL da foto <small>(opcional)</small></span><input type="url" value={photoUrl} onChange={(event) => setPhotoUrl(event.target.value)} placeholder="https://..." /></label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="button button-secondary" type="submit" disabled={saving}>{saving ? 'Salvando...' : 'Cadastrar'}</button>
        </form>
      )}

      <div className="players-grid">
        {players.map((player, index) => (
          <article className={player.active ? 'player-card' : 'player-card inactive'} key={player.id}>
            <span className="player-index">{String(index + 1).padStart(2, '0')}</span>
            <PlayerAvatar name={player.name} photoUrl={player.photoUrl} className="player-card-avatar" />
            <h2>{player.name}</h2>
            <p>{player.active ? 'Na ativa' : 'Fora da mesa'}</p>
            {editable && <button className="player-toggle" type="button" onClick={() => void togglePlayer(player)}>{player.active ? <UserRoundX size={17} /> : <UserRoundCheck size={17} />}{player.active ? 'Arquivar' : 'Reativar'}</button>}
          </article>
        ))}
      </div>
    </section>
  )
}
