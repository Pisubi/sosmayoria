import { describe, expect, it } from 'vitest'
import { orden, todas, TEMAS } from '../src/data/cartas'
import fotos from '../src/data/fotos.json'
import guardado from './orden-cartas.json'

describe('banco de cartas', () => {
  it('ids y preguntas únicos', () => {
    expect(new Set(orden).size).toBe(orden.length)
    const activas = todas.filter((c) => !c.retirada).map((c) => c.pregunta.trim().toLowerCase())
    expect(new Set(activas).size).toBe(activas.length)
  })

  it('solo datos nacionales de la Argentina', () => {
    for (const c of todas.filter((x) => !x.retirada)) expect(c.ref.alcance).toMatch(/^nacional/)
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
