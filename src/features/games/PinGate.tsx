import { useState, type FormEvent } from 'react'
import { KeyRound } from 'lucide-react'

import { DominoTile } from '../../components/DominoTile'

interface PinGateProps {
  expectedPin: string
  onUnlock: () => void
}

export function PinGate({ expectedPin, onUnlock }: PinGateProps) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (pin !== expectedPin) {
      setError('PIN errado. Pergunte para alguém da diretoria.')
      return
    }
    setError('')
    onUnlock()
  }

  return (
    <section className="page-wrap pin-page">
      <div className="pin-card">
        <span className="sticker sticker-yellow"><KeyRound size={16} /> Ta bloqueado, pae</span>
        <h1>Quem tem o<br />PIN ?</h1>
        <form onSubmit={submit}>
          <label htmlFor="shared-pin">PIN</label>
          <input id="shared-pin" type="password" inputMode="numeric" autoComplete="current-password" value={pin} onChange={(event) => setPin(event.target.value)} />
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="button button-primary" type="submit">Liberar cadastro</button>
        </form>
        <DominoTile left={1} right={6} className="pin-domino" />
      </div>
    </section>
  )
}

