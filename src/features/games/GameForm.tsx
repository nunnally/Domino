import { useMemo, useState, type FormEvent } from 'react'
import { ArrowLeft, MapPin, Save } from 'lucide-react'

import { DominoTile } from '../../components/DominoTile'
import type { Player } from '../../lib/types'
import { validateGameDraft, type GameDraft, type ValidationErrors } from '../../lib/validation'

interface GameFormProps {
  players: Player[]
  onSave: (draft: GameDraft) => void | Promise<void>
  onCancel: () => void
  locate?: () => Promise<{ latitude: number; longitude: number } | undefined>
}

const locateCurrentGame = () => new Promise<{ latitude: number; longitude: number } | undefined>((resolve) => {
  if (!navigator.geolocation) {
    resolve(undefined)
    return
  }

  navigator.geolocation.getCurrentPosition(
    ({ coords }) => resolve({ latitude: coords.latitude, longitude: coords.longitude }),
    () => resolve(undefined),
    { enableHighAccuracy: false, timeout: 5_000, maximumAge: 60_000 },
  )
})

const localDateTime = () => {
  const now = new Date()
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000)
  return local.toISOString().slice(0, 16)
}

type Slot = 'winner1' | 'winner2' | 'loser1' | 'loser2'

export function GameForm({ players, onSave, onCancel, locate = locateCurrentGame }: GameFormProps) {
  const activePlayers = useMemo(() => players.filter(({ active }) => active), [players])
  const [slots, setSlots] = useState<Record<Slot, string>>({ winner1: '', winner2: '', loser1: '', loser2: '' })
  const [playedAt, setPlayedAt] = useState(localDateTime)
  const [winnerScore, setWinnerScore] = useState('')
  const [loserScore, setLoserScore] = useState('')
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [saveError, setSaveError] = useState('')
  const [saving, setSaving] = useState(false)

  const updateSlot = (slot: Slot, value: string) => setSlots((current) => ({ ...current, [slot]: value }))

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    const draft: GameDraft = {
      winnerIds: [slots.winner1, slots.winner2],
      loserIds: [slots.loser1, slots.loser2],
      playedAt: playedAt ? new Date(playedAt).toISOString() : '',
      ...(winnerScore === '' ? {} : { winnerScore: Number(winnerScore) }),
      ...(loserScore === '' ? {} : { loserScore: Number(loserScore) }),
    }
    const nextErrors = validateGameDraft(draft)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setSaving(true)
    setSaveError('')
    try {
      let location: Awaited<ReturnType<NonNullable<GameFormProps['locate']>>>
      try {
        location = await locate()
      } catch {
        location = undefined
      }
      await onSave({ ...draft, ...location })
    } catch {
      setSaveError('Não foi possível salvar. A partida continua preenchida para você tentar de novo.')
    } finally {
      setSaving(false)
    }
  }

  const select = (label: string, slot: Slot) => (
    <label className="player-select">
      <span>{label}</span>
      <select value={slots[slot]} onChange={(event) => updateSlot(slot, event.target.value)} aria-label={label}>
        <option value="">Escolher jogador</option>
        {activePlayers.map((player) => <option value={player.id} key={player.id}>{player.name}</option>)}
      </select>
    </label>
  )

  return (
    <section className="page-wrap game-form-page">
      <button className="back-button" type="button" onClick={onCancel}><ArrowLeft size={19} /> Voltar</button>
      <div className="form-heading">
        <div><p className="eyebrow">Mais uma para o histórico</p><h1>Nova partida</h1></div>
        <DominoTile left={4} right={2} />
      </div>

      <form className="game-form" onSubmit={submit}>
        <section className="team-block winners-block">
          <span className="team-number">01</span>
          <div className="team-heading"><span className="sticker sticker-yellow">Vencedores</span><h2>Quem bateu?</h2></div>
          <div className="player-selects">
            {select('Vencedor 1', 'winner1')}
            {select('Vencedor 2', 'winner2')}
          </div>
        </section>

        <div className="versus-stamp">VS.</div>

        <section className="team-block losers-block">
          <span className="team-number">02</span>
          <div className="team-heading"><span className="sticker sticker-violet">Perdedores</span><h2>Quem levou?</h2></div>
          <div className="player-selects">
            {select('Perdedor 1', 'loser1')}
            {select('Perdedor 2', 'loser2')}
          </div>
        </section>

        {errors.players && <p className="form-error full-error" role="alert">{errors.players}</p>}

        <section className="match-details">
          <label><span>Quando foi?</span><input type="datetime-local" value={playedAt} onChange={(event) => setPlayedAt(event.target.value)} /></label>
          <fieldset>
            <legend>Placar <small>(opcional)</small></legend>
            <label><span>Vencedor</span><input type="number" min="0" inputMode="numeric" value={winnerScore} onChange={(event) => setWinnerScore(event.target.value)} /></label>
            <span>×</span>
            <label><span>Perdedor</span><input type="number" min="0" inputMode="numeric" value={loserScore} onChange={(event) => setLoserScore(event.target.value)} /></label>
          </fieldset>
        </section>

        <p className="location-note"><MapPin size={17} /> Ao salvar, tentaremos incluir o local da partida.</p>

        {(errors.date || errors.score || saveError) && <p className="form-error full-error" role="alert">{errors.date ?? errors.score ?? saveError}</p>}

        <div className="form-actions">
          <button className="button button-secondary" type="button" onClick={onCancel}>Cancelar</button>
          <button className="button button-primary" type="submit" disabled={saving}><Save size={19} /> {saving ? 'Salvando…' : 'Salvar partida'}</button>
        </div>
      </form>
    </section>
  )
}
