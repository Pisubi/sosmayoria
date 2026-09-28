import { describe, expect, it } from 'vitest'
import { tests } from '../src/data/tests'
import { decodeAnswers, encodeAnswers } from '../src/engine/encoding'
import { drawQuestions } from '../src/engine/selection'
import type { Response } from '../src/types'
import layout from './answer-layout.json'
import { rng } from './helpers'

const VALUES: Response[] = [-1, -0.5, 0, 0.5, 1, null]

describe.each(Object.values(tests))('codificación de respuestas $name', (test) => {
  it.each(['short', 'full', 'deep'] as const)('ida y vuelta en la versión %s', (variant) => {
    const random = rng(7)
    const drawn = drawQuestions(test, variant, 11)
    const answers = Object.fromEntries(drawn.map((q) => [q.id, VALUES[Math.floor(random() * VALUES.length)]]))
    const hex = encodeAnswers(test, drawn, answers)
    expect(hex).toMatch(/^\\x[0-9a-f]+$/)
    expect((hex.length - 2) / 2).toBe(Math.ceil(test.layout.length / 2))
    const decoded = decodeAnswers(test, hex)
    expect(decoded.answers).toEqual(answers)
    expect(new Set(decoded.core)).toEqual(new Set(drawn.filter((q) => (q.weight ?? 1) > 1).map((q) => q.id)))
  })

  it('el orden de las afirmaciones solo crece al final (las filas guardadas dependen de él)', () => {
    const saved = layout[test.id]
    expect(test.layout.slice(0, saved.length)).toEqual(saved)
  })
})
