interface ProgressBarProps {
  current: number
  total: number
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const pct = (current / total) * 100
  return (
    <div
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={total}
      aria-valuenow={current}
      className="h-1 w-full rounded-full bg-linea"
    >
      <div
        className="h-full rounded-full bg-azul transition-[width] duration-300"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
