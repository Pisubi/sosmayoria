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

/**
 * Consistencia de las respuestas: en cada tema, |Σ r·s| / Σ |r|, con s el sentido de cada
 * afirmación (neutrales y "No sé" no cuentan), promediada con el peso de las respuestas.
 * 1 = todas las respuestas marcadas de un tema van en el mismo sentido; cerca de 0 = se
 * anulan, como pasa al responder al azar o al estar de acuerdo con afirmaciones opuestas.
 */
export function consistency(questions: Question[], answers: Record<string, Response>): number {
  const num: Record<string, number> = {}
  const den: Record<string, number> = {}
  for (const q of questions) {
    const r = answers[q.id]
    if (r == null || r === 0) continue
    const s = Math.sign(q.effects[q.primaryAxis])
    num[q.primaryAxis] = (num[q.primaryAxis] ?? 0) + r * s
    den[q.primaryAxis] = (den[q.primaryAxis] ?? 0) + Math.abs(r)
  }
  const axes = Object.keys(den)
  const total = axes.reduce((sum, a) => sum + den[a], 0)
  return total ? axes.reduce((sum, a) => sum + Math.abs(num[a]), 0) / total : 1
}

/** Por debajo, el resultado se marca como poco claro (ninguna persona coherente simulada baja de acá). */
export const CONSISTENCY_THRESHOLD = 0.4
