import { describe, expect, it } from 'vitest'
import { tests } from '../src/data/tests'
import { acquiescence, intensity, scoreAxes } from '../src/engine/scoring'
import { questionsFor } from '../src/engine/selection'
import type { Response } from '../src/types'

describe.each(Object.values(tests))('puntaje $name', (test) => {
  const questions = questionsFor(test, 'full')
  const all = (r: Response) => Object.fromEntries(questions.map((q) => [q.id, r]))

  it('neutral en todo da 0 en cada eje', () => {
    for (const s of scoreAxes(test.axes, questions, all(0))) expect(s.score).toBe(0)
  })

  it('"muy de acuerdo" en todo da ≈ 0 (ítems balanceados)', () => {
    for (const s of scoreAxes(test.axes, questions, all(1))) {
      expect(Math.abs(s.score ?? 0), s.axisId).toBeLessThanOrEqual(10)
    }
  })

  it('"No sé" en todo deja los ejes indeterminados', () => {
    for (const s of scoreAxes(test.axes, questions, all(null))) {
      expect(s.score).toBeNull()
      expect(s.coverage).toBe(0)
    }
  })

  it('responder hacia el polo B en todo da +100', () => {
    const answers = Object.fromEntries(
      questions.map((q) => [q.id, Math.sign(q.effects[q.primaryAxis]) as Response]),
    )
    const scores = scoreAxes(test.axes, questions, answers)
    for (const s of scores) expect(s.score, s.axisId).toBeGreaterThanOrEqual(80)
  })
})

describe('auxiliares', () => {
  it('intensidad con los umbrales de la especificación', () => {
    expect(intensity(10)).toBe('Equilibrado')
    expect(intensity(-30)).toBe('Inclinado')
    expect(intensity(60)).toBe('Fuerte')
    expect(intensity(-90)).toBe('Muy fuerte')
  })

  it('aquiescencia como media de respuestas sin invertir', () => {
    expect(acquiescence({ a: 1, b: 1, c: 0.5, d: null })).toBeCloseTo(0.833, 2)
  })
})
