import type { AxisResult } from '../types'

interface AxisBreakdownProps {
  results: AxisResult[]
}

export function AxisBreakdown({ results }: AxisBreakdownProps) {
  return (
    <div className="space-y-6">
      {results.map(({ axis, score }) => {
        // score: -100..100 -> posición 0%..100% en la barra
        const position = (score + 100) / 2
        const leaning = score >= 0 ? axis.poleB : axis.poleA

        return (
          <div key={axis.id}>
            <div className="flex items-baseline justify-between">
              <p className="font-semibold">{axis.name}</p>
              <p className="text-sm text-ink/60 dark:text-cream/60">
                {Math.abs(score)}% hacia{' '}
                <span className="font-medium text-ink dark:text-cream">
                  {leaning.label}
                </span>
              </p>
            </div>
            <div className="mt-2 flex items-center gap-3 text-xs text-ink/50 dark:text-cream/50">
              <span className="w-24 shrink-0 text-right sm:w-32">
                {axis.poleA.label}
              </span>
              <div className="relative h-2 w-full rounded-full bg-ink/10 dark:bg-cream/10">
                <div
                  className="absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-2 border-cream bg-forest shadow dark:border-ink dark:bg-forest-light"
                  style={{ left: `calc(${position}% - 8px)` }}
                />
              </div>
              <span className="w-24 shrink-0 sm:w-32">{axis.poleB.label}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
