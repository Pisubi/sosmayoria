import { describe, expect, it } from 'vitest'
import { tests } from '../src/data/tests'
import { questionsFor } from '../src/engine/selection'

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

  // Con cantidades impares (la corta tiene 25) un eje queda 2 a 1; los desbalances se alternan
  // entre ejes para que en total el test siga equilibrado.
  it.each(['short', 'full', 'deep'] as const)('balance de polos por eje en la versión %s', (variant) => {
    let total = 0
    for (const axis of test.axes) {
      const items = questionsFor(test, variant).filter((q) => q.primaryAxis === axis.id)
      const pos = items.filter((q) => q.effects[axis.id] > 0).length
      const neg = items.filter((q) => q.effects[axis.id] < 0).length
      expect(Math.abs(pos - neg), `${axis.id} ${variant}`).toBe(items.length % 2)
      total += pos - neg
    }
    expect(Math.abs(total), `total ${variant}`).toBeLessThanOrEqual(1)
  })

  it('versiones de 25, 50 y 100 afirmaciones', () => {
    expect([questionsFor(test, 'short'), questionsFor(test, 'full'), questionsFor(test, 'deep')].map((q) => q.length)).toEqual([25, 50, 100])
  })

  it('no incluye perfiles excluidos por decisión editorial', () => {
    const excluded = ['hitler', 'nazismo', 'pinochet', 'alfredo_stroessner', 'slobodan_milosevic', 'videla', 'massera', 'agosti', 'galtieri', 'jose_alfredo_martinez_de_hoz']
    const ids = new Set(test.profiles.map((p) => p.id))
    for (const id of excluded) expect(ids.has(id), id).toBe(false)
    for (const p of test.profiles) expect(p.name, p.id).not.toMatch(/hitler|videla|massera|galtieri|nazismo|pinochet|stroessner|milo[sš]evi[cć]/i)
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
