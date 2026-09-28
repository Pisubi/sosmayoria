import { describe, expect, it } from 'vitest'
import { cartas, orden, todas, TEMAS } from '../src/data/cartas'
import { RONDA, sortear } from '../src/engine/juego'
import fotos from '../src/data/fotos.json'
import guardado from './orden-cartas.json'

describe('banco de cartas', () => {
  it('ids y preguntas únicos', () => {
    expect(new Set(orden).size).toBe(orden.length)
    const activas = todas.filter((c) => !c.retirada).map((c) => c.pregunta.trim().toLowerCase())
    expect(new Set(activas).size).toBe(activas.length)
  })

  it('los grupos de parecidas tienen al menos dos cartas y ninguna activa comparte grupo con una núcleo', () => {
    const activas = todas.filter((c) => !c.retirada)
    const porGrupo = new Map<string, number>()
    for (const c of activas) for (const g of c.grupos ?? []) porGrupo.set(g, (porGrupo.get(g) ?? 0) + 1)
    const deNucleo = new Set(activas.filter((c) => c.nucleo).flatMap((c) => c.grupos ?? []))
    for (const c of activas) if (!c.nucleo) for (const g of c.grupos ?? []) expect(deNucleo.has(g), c.id).toBe(false)
    for (const [g, n] of porGrupo) if (!deNucleo.has(g)) expect(n, g).toBeGreaterThanOrEqual(2)
  })

  it('una ronda real sale completa, sin parecidas', () => {
    for (let s = 0; s < 200; s++) {
      const r = sortear(cartas, s)
      expect(r).toHaveLength(RONDA)
      const grupos = r.flatMap((c) => c.grupos ?? [])
      expect(new Set(grupos).size).toBe(grupos.length)
    }
  })

  it('hay entre 4 y 5 cartas núcleo, nacionales', () => {
    const nucleo = todas.filter((c) => c.nucleo && !c.retirada)
    expect(nucleo.length).toBeGreaterThanOrEqual(4)
    expect(nucleo.length).toBeLessThanOrEqual(5)
    for (const c of nucleo) expect(c.ref.alcance).toBe('nacional')
  })

  it('nacionales, o regionales amplias con al menos 500 casos informados', () => {
    for (const c of todas.filter((x) => !x.retirada)) {
      if (/^nacional/.test(c.ref.alcance)) continue
      const m = (c.ref.muestra ?? '').match(/(\d{1,3}(?:\.\d{3})*|\d+)\s*casos/)
      const casos = m ? Number(m[1].replace(/\./g, '')) : 0
      expect(casos, `${c.id}: ${c.ref.alcance} sin muestra suficiente`).toBeGreaterThanOrEqual(500)
    }
  })

  it('el orden solo crece al final (las partidas guardadas dependen de él)', () => {
    expect(orden.slice(0, guardado.length)).toEqual(guardado)
  })

  it.each(todas.map((c) => [c.id, c] as const))('%s: texto, tema y encuesta válidos', (_, c) => {
    expect(c.pregunta.length).toBeGreaterThan(5)
    expect(c.pregunta.length).toBeLessThanOrEqual(140)
    expect(c.a.texto.length).toBeLessThanOrEqual(32)
    expect(c.b.texto.length).toBeLessThanOrEqual(32)
    expect(TEMAS.map((t) => t.id)).toContain(c.tema)
    expect(['duelo', 'afirmacion']).toContain(c.tipo)
    const r = c.ref
    expect(r.a).toBeGreaterThan(0)
    expect(r.b).toBeGreaterThan(0)
    expect(r.a + r.b).toBeGreaterThanOrEqual(60)
    expect(Math.abs(r.a + r.b + r.resto - 100)).toBeLessThanOrEqual(1.5)
    expect(r.url).toMatch(/^https:\/\//)
    expect(r.fecha).toMatch(/^\d{4}(-\d{2})?$/)
    expect(r.encuestadora.length).toBeGreaterThan(1)
    for (const op of [c.a, c.b]) if (op.foto) expect(Object.keys(fotos.fotos)).toContain(op.foto)
  })
})
