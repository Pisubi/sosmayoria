import type { Axis, AxisScore } from '../../types'

interface IdentityMeterProps {
  axis: Axis
  score: AxisScore | undefined
}

export function IdentityMeter({ axis, score }: IdentityMeterProps) {
  const value = score?.score ?? null
  return (
    <div className="rounded-xl border border-azul/14 p-6">
      <div className="flex justify-between text-sm font-semibold">
        <span>{axis.poleA.label}</span>
        <span>{axis.poleB.label}</span>
      </div>
      <div className="relative mt-3 h-3 rounded-full bg-linea">
        <span aria-hidden className="absolute top-1/2 left-1/2 h-5 w-px -translate-y-1/2 bg-azul/40" />
        {value != null && (
          <span
            className="absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-marfil bg-naranja"
            style={{ left: `${(value + 100) / 2}%` }}
            title={`${value > 0 ? '+' : ''}${value}`}
          />
        )}
      </div>
      <p className="mt-4 text-sm leading-6 text-azul/75">
        {value == null
          ? 'Sin datos suficientes: respondiste "No sé" en la mayoría de estas afirmaciones.'
          : value === 0
            ? 'No te identificás con ninguno de los dos polos.'
            : `${Math.abs(value)} puntos hacia ${value < 0 ? axis.poleA.label.toLowerCase() : axis.poleB.label.toLowerCase()}.`}{' '}
        Tu identidad no siempre coincide con tus posiciones: por eso se muestra aparte y no
        entra en las comparaciones.
      </p>
    </div>
  )
}
