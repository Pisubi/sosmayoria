import type { AxisResult } from '../types'
import { Index } from './Eyebrow'

interface AxisBreakdownProps {
  results: AxisResult[]
}

export function AxisBreakdown({ results }: AxisBreakdownProps) {
  const strongest = results.reduce(
    (best, r) => (Math.abs(r.score) > Math.abs(best.score) ? r : best),
    results[0],
  )

  return (
    <ol className="border-t border-azul/14">
      {results.map((result, i) => {
        const { axis, score } = result
        const highlight = result === strongest && score !== 0
        const leaning = score >= 0 ? axis.poleB : axis.poleA
        // Barra divergente desde el centro (neutral) hacia el polo elegido
        const start = score >= 0 ? 50 : 50 + score / 2
        const width = Math.abs(score) / 2

        return (
          <li
            key={axis.id}
            className="grid gap-3 border-b border-azul/14 py-5 sm:grid-cols-[3rem_1fr] sm:gap-6"
          >
            <Index n={i + 1} />
            <div>
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <p className="font-semibold">{axis.name}</p>
                <p className="text-sm text-azul/75 tabular-nums">
                  {score === 0 ? (
                    'Neutral'
                  ) : (
                    <>
                      <span className="font-semibold text-azul">{Math.abs(score)}</span>{' '}
                      hacia {leaning.label}
                    </>
                  )}
                </p>
              </div>
              <div
                className="relative mt-3 h-2 rounded-full bg-linea"
                title={`${axis.name}: ${score > 0 ? '+' : ''}${score}`}
              >
                <span
                  aria-hidden
                  className="absolute top-1/2 left-1/2 h-4 w-px -translate-y-1/2 bg-azul/40"
                />
                <span
                  className={`absolute top-0 h-full rounded-full ${highlight ? 'bg-naranja' : 'bg-dato'}`}
                  style={{ left: `${start}%`, width: `${width}%` }}
                />
              </div>
              <div className="mt-2 flex justify-between text-xs text-azul/60">
                <span>{axis.poleA.label}</span>
                <span className="text-right">{axis.poleB.label}</span>
              </div>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
