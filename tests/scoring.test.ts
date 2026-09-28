import { describe, expect, it } from 'vitest'
import { tests } from '../src/data/tests'
import { acquiescence, consistency, CONSISTENCY_THRESHOLD, intensity, scoreAxes } from '../src/engine/scoring'
import { drawQuestions } from '../src/engine/selection'
import type { Question, Response } from '../src/types'

describe.each(Object.values(tests))('puntaje $name', (test) => {
  // Varias partidas sorteadas de la versión completa y de la a fondo.
  const games = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].flatMap((seed) => [
    drawQuestions(test, 'full', seed),
    drawQuestions(test, 'deep', seed),
  ])
  const all = (questions: Question[], r: Response) => Object.fromEntries(questions.map((q) => [q.id, r]))

  it('neutral en todo da 0 en cada eje', () => {
    for (const qs of games) for (const s of scoreAxes(test.axes, qs, all(qs, 0))) expect(s.score).toBe(0)
  })

  it('"muy de acuerdo" en todo da ≈ 0 (ítems balanceados)', () => {
    for (const qs of games) {
      for (const s of scoreAxes(test.axes, qs, all(qs, 1))) {
        expect(Math.abs(s.score ?? 0), s.axisId).toBeLessThanOrEqual(10)
      }
    }
  })

  it('"No sé" en todo deja los ejes indeterminados', () => {
    for (const s of scoreAxes(test.axes, games[0], all(games[0], null))) {
      expect(s.score).toBeNull()
      expect(s.coverage).toBe(0)
    }
  })

  it('responder hacia el polo B en todo da +100', () => {
    for (const qs of games) {
      const answers = Object.fromEntries(
        qs.map((q) => [q.id, Math.sign(q.effects[q.primaryAxis]) as Response]),
      )
      for (const s of scoreAxes(test.axes, qs, answers)) expect(s.score, s.axisId).toBeGreaterThanOrEqual(80)
    }
  })

  it('consistencia: responder en un solo sentido da 1 y estar de acuerdo con todo queda bajo el umbral', () => {
    for (const qs of games) {
      const coherent = Object.fromEntries(qs.map((q) => [q.id, Math.sign(q.effects[q.primaryAxis]) as Response]))
      expect(consistency(qs, coherent)).toBe(1)
      expect(consistency(qs, all(qs, 1))).toBeLessThan(CONSISTENCY_THRESHOLD)
    }
  })

  it('el núcleo pesa el triple en su eje principal', () => {
    const q = games[0].find((x) => x.weight === 3)!
    const detail = games[0].find((x) => (x.weight ?? 1) === 1 && x.primaryAxis === q.primaryAxis)!
    const answers = { [q.id]: 1, [detail.id]: -1 } as Record<string, Response>
    const score = scoreAxes(test.axes, [q, detail], answers).find((s) => s.axisId === q.primaryAxis)!
    const e1 = q.effects[q.primaryAxis]
    const e2 = detail.effects[detail.primaryAxis]
    expect(score.score).toBe(Math.round((100 * (3 * e1 - e2)) / 4))
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
