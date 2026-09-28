import { describe, expect, it } from 'vitest'
import { tests } from '../src/data/tests'
import { CORE_WEIGHT, drawQuestions, VARIANT_SIZE } from '../src/engine/selection'

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

  it('cada eje tiene suficientes afirmaciones por polo para sus cupos', () => {
    for (const axis of test.axes) {
      const items = test.questions.filter((q) => q.primaryAxis === axis.id)
      const core = items.filter((q) => q.core)
      const nCore = test.draw.core[axis.id]
      const nDetail = test.draw.detail.deep[axis.id]
      // Peor caso: el polo minoritario del núcleo recibe el detalle extra que compensa el peso.
      const needed = Math.floor(nCore / 2) + Math.ceil((nDetail + CORE_WEIGHT * (nCore % 2)) / 2)
      for (const sign of [1, -1]) {
        expect(core.filter((q) => Math.sign(q.effects[axis.id]) === sign).length, axis.id).toBeGreaterThanOrEqual(Math.ceil(nCore / 2))
        expect(items.filter((q) => Math.sign(q.effects[axis.id]) === sign).length, axis.id).toBeGreaterThanOrEqual(needed)
      }
    }
  })

  // Sorteos con muchas semillas: tamaños, núcleo y balance de polos ponderado por peso.
  it.each(['short', 'full', 'deep'] as const)('sorteo de la versión %s', (variant) => {
    for (let seed = 1; seed <= 200; seed++) {
      const drawn = drawQuestions(test, variant, seed)
      expect(drawn.length).toBe(VARIANT_SIZE[variant])
      expect(new Set(drawn.map((q) => q.id)).size).toBe(drawn.length)
      expect(drawn.filter((q) => q.weight === CORE_WEIGHT).length).toBe(VARIANT_SIZE.short)
      expect(drawn.filter((q) => q.weight === CORE_WEIGHT).every((q) => q.core)).toBe(true)
      let total = 0
      for (const axis of test.axes) {
        const items = drawn.filter((q) => q.primaryAxis === axis.id)
        const net = items.reduce((s, q) => s + (q.weight ?? 1) * Math.sign(q.effects[axis.id]), 0)
        if (variant === 'short') {
          expect(Math.abs(net), `${axis.id} ${seed}`).toBe(CORE_WEIGHT * (items.length % 2))
          total += net
        } else {
          expect(net, `${axis.id} ${variant} ${seed}`).toBe(0)
        }
      }
      expect(Math.abs(total), `total ${seed}`).toBeLessThanOrEqual(CORE_WEIGHT)
    }
  })

  it('no siempre tocan las mismas afirmaciones', () => {
    const ids = (seed: number) => new Set(drawQuestions(test, 'full', seed).map((q) => q.id))
    const a = ids(1)
    const b = ids(2)
    expect([...a].filter((id) => b.has(id)).length).toBeLessThan(a.size)
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
