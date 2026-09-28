interface ProgressBarProps {
  current: number
  total: number
}

/** Barra segmentada: un tramo cada pocas afirmaciones, para que el avance se sienta. */
export function ProgressBar({ current, total }: ProgressBarProps) {
  const segments = Math.min(total, 20)
  const filled = (current / total) * segments
  return (
    <div
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={total}
      aria-valuenow={current}
      className="flex w-full gap-1"
    >
      {Array.from({ length: segments }, (_, i) => (
        <span key={i} className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-linea">
          <span
            className="absolute inset-y-0 left-0 rounded-full bg-azul transition-[width] duration-300"
            style={{ width: `${Math.max(0, Math.min(1, filled - i)) * 100}%` }}
          />
        </span>
      ))}
    </div>
  )
}
