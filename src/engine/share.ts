import type { AxisScore, TestDefinition, TestId } from '../types'

/**
 * Codifica los puntajes en la URL para que el resultado se pueda compartir y recalcular
 * sin guardar nada en un servidor: ?t=ar&v=ar-1.0.0&s=95_-40_x_…
 */
export function encodeResult(test: TestDefinition, scores: AxisScore[]): string {
  const byAxis = new Map(scores.map((s) => [s.axisId, s.score]))
  const s = test.axes.map((a) => byAxis.get(a.id) ?? 'x').join('_')
  const params = new URLSearchParams({ t: test.id, v: test.version, s })
  return `?${params.toString()}`
}

export function decodeResult(
  search: string,
  tests: Record<TestId, TestDefinition>,
): { testId: TestId; scores: AxisScore[] } | null {
  const params = new URLSearchParams(search)
  const testId = params.get('t') as TestId | null
  const raw = params.get('s')
  if (!testId || !Object.hasOwn(tests, testId) || !raw) return null

  const test = tests[testId]
  // Un enlace de otra versión mayor de los temas se leería mal: se descarta.
  const version = params.get('v')
  if (version && version.split('.')[0] !== test.version.split('.')[0]) return null
  const parts = raw.split('_')
  if (parts.length !== test.axes.length) return null
  if (!parts.every((p) => p === 'x' || /^-?\d{1,3}$/.test(p))) return null

  const scores = test.axes.map((axis, i) => {
    const n = Number(parts[i])
    const valid = parts[i] !== 'x'
    return {
      axisId: axis.id,
      score: valid ? Math.max(-100, Math.min(100, Math.round(n))) : null,
      coverage: valid ? 1 : 0,
    }
  })
  return { testId, scores }
}
