import type { Axis, Era, Question, Reference } from '../types'

/** Por eje: afirmaciones alternando +1 / -1, para que cada recorte tome ambos polos por igual. */
export type QuestionBank = Record<string, [text: string, direction: 1 | -1][]>

export function buildQuestions(bank: QuestionBank): Question[] {
  return Object.entries(bank).flatMap(([axisId, items]) =>
    items.map(([text, direction], i) => ({ id: `${axisId}-${i + 1}`, axisId, text, direction })),
  )
}

/** Valores en el mismo orden que los ejes; null cuando el eje no aplica a esa figura o época. */
export type ReferenceRow = [
  id: string,
  name: string,
  country: string,
  era: Era,
  description: string,
  values: (number | null)[],
]

export function buildReferences(
  kind: Reference['kind'],
  axes: Axis[],
  rows: ReferenceRow[],
): Reference[] {
  return rows.map(([id, name, country, era, description, values]) => ({
    id,
    kind,
    name,
    country,
    era,
    description,
    position: Object.fromEntries(axes.map((axis, i) => [axis.id, values[i] ?? null])),
  }))
}
