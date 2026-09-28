import type { Question, TestDefinition, TestMode } from '../types'

export const MODE_ORDER: TestMode[] = ['rapida', 'completa', 'fondo']

export const modeInfo: Record<TestMode, { label: string; perAxis: number }> = {
  rapida: { label: 'Rápida', perAxis: 2 },
  completa: { label: 'Completa', perAxis: 4 },
  fondo: { label: 'A fondo', perAxis: 8 },
}

export function questionCount(test: TestDefinition, mode: TestMode): number {
  return test.axes.length * modeInfo[mode].perAxis
}

/** Unos 10 segundos por afirmación. */
export function estimatedMinutes(test: TestDefinition, mode: TestMode): number {
  return Math.max(1, Math.round((questionCount(test, mode) * 10) / 60))
}

/**
 * Toma las primeras N afirmaciones de cada eje y las intercala (una de cada eje por
 * ronda) para que el test no repita el mismo tema muchas veces seguidas.
 */
export function getQuestionsForMode(test: TestDefinition, mode: TestMode): Question[] {
  const { perAxis } = modeInfo[mode]
  const byAxis = test.axes.map((axis) =>
    test.questions.filter((q) => q.axisId === axis.id).slice(0, perAxis),
  )
  const ordered: Question[] = []
  for (let round = 0; round < perAxis; round++) {
    for (const axisQuestions of byAxis) {
      if (axisQuestions[round]) ordered.push(axisQuestions[round])
    }
  }
  return ordered
}
