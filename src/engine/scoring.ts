import type { Axis, AxisScore, Question, Response } from '../types'

/** Por debajo de esta cobertura el eje se marca indeterminado y no entra en las comparaciones. */
export const MIN_COVERAGE = 0.5

/**
 * score_k = 100 · Σ w_i·r_i·e_ik / Σ w_i·|e_ik|, solo sobre ítems respondidos.
 * cobertura_k = Σ_respondidos w_i·|e_ik| / Σ_todos w_i·|e_ik|.
 * w_i es el peso del ítem en la partida (núcleo o detalle) y solo se aplica a su eje
 * principal: en los efectos secundarios sobre otros ejes pesa 1.
 */
export function scoreAxes(
  axes: Axis[],
  questions: Question[],
  answers: Record<string, Response>,
): AxisScore[] {
  const num: Record<string, number> = {}
  const den: Record<string, number> = {}
  const tot: Record<string, number> = {}
  for (const axis of axes) num[axis.id] = den[axis.id] = tot[axis.id] = 0

  for (const q of questions) {
    for (const [axisId, e] of Object.entries(q.effects)) {
      if (!(axisId in tot)) continue
      const w = axisId === q.primaryAxis ? (q.weight ?? 1) : 1
      tot[axisId] += w * Math.abs(e)
      const r = answers[q.id]
      if (r == null) continue
      num[axisId] += w * r * e
      den[axisId] += w * Math.abs(e)
    }
  }

  return axes.map((axis) => {
    const coverage = tot[axis.id] ? den[axis.id] / tot[axis.id] : 0
    const score =
      den[axis.id] && coverage >= MIN_COVERAGE
        ? Math.round((100 * num[axis.id]) / den[axis.id])
        : null
    return { axisId: axis.id, score, coverage }
  })
}

export type Intensity = 'Equilibrado' | 'Inclinado' | 'Fuerte' | 'Muy fuerte'

/** Umbrales sobre el desvío respecto del centro (|score|/2, en puntos porcentuales). */
export function intensity(score: number): Intensity {
  const deviation = Math.abs(score) / 2
  if (deviation < 7.5) return 'Equilibrado'
  if (deviation < 22.5) return 'Inclinado'
  if (deviation < 37.5) return 'Fuerte'
  return 'Muy fuerte'
}

/**
 * Media de las respuestas sin invertir. Si supera 0,6 en valor absoluto, la persona
 * tiende a responder lo mismo a todo y conviene avisarle.
 */
export function acquiescence(answers: Record<string, Response>): number {
  const values = Object.values(answers).filter((r): r is Exclude<Response, null> => r != null)
  if (values.length === 0) return 0
  return values.reduce<number>((sum, r) => sum + r, 0) / values.length
}

export const ACQUIESCENCE_THRESHOLD = 0.6
