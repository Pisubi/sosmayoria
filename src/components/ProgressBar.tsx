interface ProgressBarProps {
  current: number
  total: number
}

/** Barra segmentada: borde de 3 px, divisiones de 3 px, sin esquinas redondeadas. */
export function ProgressBar({ current, total }: ProgressBarProps) {
  const segments = Math.min(total, 20)
  const filled = (current / total) * segments
  return (
    <div
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={total}
      aria-valuenow={current}
      className="flex h-5 w-full gap-[3px] border-[3px] border-azul bg-naranja"
    >
      {Array.from({ length: segments }, (_, i) => (
        <span key={i} className="relative flex-1 overflow-hidden bg-arena">
          <span
            className="absolute inset-y-0 left-0 bg-azul transition-[width] duration-300"
            style={{ width: `${Math.max(0, Math.min(1, filled - i)) * 100}%` }}
          />
        </span>
      ))}
    </div>
  )
}
