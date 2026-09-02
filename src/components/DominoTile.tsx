interface DominoTileProps {
  left?: number
  right?: number
  className?: string
  label?: string
}

const Pip = () => <span className="domino-pip" />

function DominoHalf({ value }: { value: number }) {
  return (
    <span className={`domino-half pips-${value}`} aria-hidden="true">
      {Array.from({ length: value }, (_, index) => <Pip key={index} />)}
    </span>
  )
}

export function DominoTile({ left = 3, right = 5, className = '', label = 'Peça de dominó' }: DominoTileProps) {
  return (
    <span className={`domino-tile ${className}`} role="img" aria-label={`${label}: ${left} e ${right}`}>
      <DominoHalf value={left} />
      <DominoHalf value={right} />
    </span>
  )
}

