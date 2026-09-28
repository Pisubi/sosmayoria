import { describe, expect, it } from 'vitest'
import { tests } from '../src/data/tests'

describe.each(Object.values(tests))('datos $name', (test) => {
  const axisIds = new Set(test.axes.map((a) => a.id))
  const catalogIds = new Set(test.catalogs.map((c) => c.id))

  it('IDs únicos de preguntas y perfiles', () => {
    const qIds = test.questions.map((q) => q.id)
    const pIds = test.profiles.map((p) => p.id)
    expect(new Set(qIds).size).toBe(qIds.length)
    expect(new Set(pIds).size).toBe(pIds.length)
  })

  it('los efectos apuntan a ejes existentes y el principal vale ±1', () => {
    for (const q of test.questions) {
      expect(axisIds.has(q.primaryAxis), q.id).toBe(true)
      expect(Math.abs(q.effects[q.primaryAxis]), q.id).toBe(1)
      for (const axisId of Object.keys(q.effects)) expect(axisIds.has(axisId), q.id).toBe(true)
    }
  })

  it.each(['short', 'full'] as const)('balance de polos por eje en la versión %s', (variant) => {
    for (const axis of test.axes) {
      const items = test.questions.filter(
        (q) => q.primaryAxis === axis.id && q.variants.includes(variant),
      )
      const pos = items.filter((q) => q.effects[axis.id] > 0).length
      const neg = items.filter((q) => q.effects[axis.id] < 0).length
      expect(pos, `${axis.id} ${variant}`).toBe(neg)
    }
  })

  it('perfiles con coordenadas en [−100, 100] o null y catálogo válido', () => {
    for (const p of test.profiles) {
      expect(catalogIds.has(p.catalog), p.id).toBe(true)
      for (const axis of test.axes) {
        const v = p.coords[axis.id]
        expect(v === null || (typeof v === 'number' && v >= -100 && v <= 100), `${p.id}.${axis.id}`).toBe(true)
      }
    }
  })
})
