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
      setError('PIN errado. Pergunte para alguém da mesa.')
      return
    }
    setError('')
    onUnlock()
  }

  return (
    <section className="page-wrap pin-page">
      <div className="pin-card">
        <span className="sticker sticker-yellow"><KeyRound size={16} /> Trava informal</span>
        <h1>Quem tem o<br />PIN da mesa?</h1>
        <p>É só uma barreira casual para evitar cadastro sem querer. Não é segurança de verdade.</p>
        <form onSubmit={submit}>
          <label htmlFor="shared-pin">PIN da mesa</label>
          <input id="shared-pin" type="password" inputMode="numeric" autoComplete="current-password" value={pin} onChange={(event) => setPin(event.target.value)} />
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="button button-primary" type="submit">Liberar cadastro</button>
        </form>
        <DominoTile left={1} right={6} className="pin-domino" />
      </div>
    </section>
  )
}

