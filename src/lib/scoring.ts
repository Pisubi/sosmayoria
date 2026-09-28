import type { Answer, Axis, AxisResult, Question } from '../types'

/** Convierte 1..5 (muy en desacuerdo..muy de acuerdo) a -2..+2 */
function toSignedValue(answer: Answer): number {
  return answer - 3
}

export function computeAxisResults(
  axes: Axis[],
  questions: Question[],
  answers: Record<string, Answer>,
): AxisResult[] {
  return axes.flatMap((axis) => {
    const axisQuestions = questions.filter((q) => q.axisId === axis.id)
    if (axisQuestions.length === 0) return []

    const total = axisQuestions.reduce((sum, question) => {
      const answer = answers[question.id]
      if (answer == null) return sum
      return sum + question.direction * toSignedValue(answer)
    }, 0)

    const score = Math.round((total / (axisQuestions.length * 2)) * 100)
    return [{ axis, score }]
  })
}

export function scoresByAxisId(results: AxisResult[]): Record<string, number> {
  return Object.fromEntries(results.map((r) => [r.axis.id, r.score]))
}
