import { describe, expect, it } from 'vitest'
import { tests } from '../src/data/tests'
import { decodeAnswers, encodeAnswers } from '../src/engine/encoding'
import { questionsFor } from '../src/engine/selection'
import type { Response } from '../src/types'
import layout from './answer-layout.json'
import { rng } from './helpers'

const VALUES: Response[] = [-1, -0.5, 0, 0.5, 1, null]

describe.each(Object.values(tests))('codificación de respuestas $name', (test) => {
  it.each(['short', 'full', 'deep'] as const)('ida y vuelta en la versión %s', (variant) => {
    const random = rng(7)
    const answers = Object.fromEntries(
      questionsFor(test, variant).map((q) => [q.id, VALUES[Math.floor(random() * VALUES.length)]]),
    )
    const hex = encodeAnswers(test, answers)
    expect(hex).toMatch(/^\\x[0-9a-f]+$/)
    expect((hex.length - 2) / 2).toBe(Math.ceil(test.questions.length / 2))
    expect(decodeAnswers(test, hex)).toEqual(answers)
  })

  it('el orden de las afirmaciones solo crece al final (las filas guardadas dependen de él)', () => {
    const saved = layout[test.id]
    expect(test.questions.slice(0, saved.length).map((q) => q.id)).toEqual(saved)
  })
})
