interface ProgressBarProps {
  current: number
  total: number
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const pct = Math.round((current / total) * 100)
  return (
    <div>
      <div className="flex justify-between text-xs text-ink/50 dark:text-cream/50">
        <span>
          {current} / {total}
        </span>
        <span>{pct}%</span>
      </div>
      <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-ink/10 dark:bg-cream/10">
        <div
          className="h-full rounded-full bg-forest transition-all duration-300 dark:bg-forest-light"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
