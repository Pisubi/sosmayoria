import { axes } from '../data/axes'
import type { Answer, AxisResult, Question } from '../types'

/** Convierte 1..5 (muy en desacuerdo..muy de acuerdo) a -2..+2 */
function toSignedValue(answer: Answer): number {
  return answer - 3
}

export function computeAxisResults(
  questions: Question[],
  answers: Record<string, Answer>,
): AxisResult[] {
  return axes
    .map((axis) => {
      const axisQuestions = questions.filter((q) => q.axisId === axis.id)
      if (axisQuestions.length === 0) return null

      const total = axisQuestions.reduce((sum, question) => {
        const answer = answers[question.id]
        if (answer == null) return sum
        return sum + question.direction * toSignedValue(answer)
      }, 0)

      const maxPossible = axisQuestions.length * 2
      const score = Math.round((total / maxPossible) * 100)

      return { axis, score }
    })
    .filter((result): result is AxisResult => result !== null)
}

export function scoresByAxisId(results: AxisResult[]): Record<string, number> {
  return Object.fromEntries(results.map((r) => [r.axis.id, r.score]))
}
