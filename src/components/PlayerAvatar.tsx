import { useState } from 'react'

interface PlayerAvatarProps {
  name: string
  photoUrl: string
  className?: string
}

export function PlayerAvatar({ name, photoUrl, className = '' }: PlayerAvatarProps) {
  const [failed, setFailed] = useState(false)
  const initials = name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase()

  return (
    <span className={`player-avatar ${className}`}>
      {failed || !photoUrl
        ? <span aria-label={`Foto de ${name}`}>{initials}</span>
        : <img src={photoUrl} alt={`Foto de ${name}`} onError={() => setFailed(true)} />}
    </span>
  )
}

