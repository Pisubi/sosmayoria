import { intensity } from '../../engine/scoring'
import type { Axis, AxisScore } from '../../types'
import { Index } from '../Eyebrow'

interface AxisBarsProps {
  axes: Axis[]
  scores: AxisScore[]
}

export function AxisBars({ axes, scores }: AxisBarsProps) {
  const byAxis = new Map(scores.map((s) => [s.axisId, s]))
  const determined = scores.filter((s) => s.score != null)
  const strongest = determined.reduce<AxisScore | null>(
    (best, s) => (!best || Math.abs(s.score!) > Math.abs(best.score!) ? s : best),
    null,
  )

  return (
    <ol className="border-t border-azul/14">
      {axes.map((axis, i) => {
        const s = byAxis.get(axis.id)
        const score = s?.score ?? null
        const highlight = s === strongest && score !== 0
        const leaning = score != null && score >= 0 ? axis.poleB : axis.poleA

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
                  {score == null ? (
                    'Indeterminado'
                  ) : score === 0 ? (
                    'Equilibrado'
                  ) : (
                    <>
                      <span className="font-semibold text-azul">{intensity(score)}</span> ·{' '}
                      {Math.abs(score)} hacia {leaning.label}
                    </>
                  )}
                </p>
              </div>
              <div
                className="relative mt-3 h-2 rounded-full bg-linea"
                style={
                  score == null
                    ? {
                        backgroundImage:
                          'repeating-linear-gradient(45deg, transparent 0 4px, rgb(30 58 71 / 0.18) 4px 6px)',
                      }
                    : undefined
                }
                title={score == null ? 'Menos de la mitad del tema respondido' : `${axis.name}: ${score > 0 ? '+' : ''}${score}`}
              >
                <span
                  aria-hidden
                  className="absolute top-1/2 left-1/2 h-4 w-px -translate-y-1/2 bg-azul/40"
                />
                {score != null && (
                  <span
                    className={`absolute top-0 h-full rounded-full ${highlight ? 'bg-naranja' : 'bg-dato'}`}
                    style={{
                      left: `${score >= 0 ? 50 : 50 + score / 2}%`,
                      width: `${Math.abs(score) / 2}%`,
                    }}
                  />
                )}
              </div>
              <div className="mt-2 flex justify-between gap-4 text-xs text-azul/60">
                <span>{axis.poleA.label}</span>
                <span className="text-right">{axis.poleB.label}</span>
              </div>
              {score == null && (
                <p className="mt-2 text-xs text-azul/60">
                  Respondiste "No sé" en más de la mitad de este tema: no entra en las comparaciones.
                </p>
              )}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
