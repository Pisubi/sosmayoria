import { describe, expect, it } from 'vitest'
import { cartas } from '../src/data/cartas'
import { brujula, CENTRO, cuadrante, EJES, esIdeologica, mayoria, real, sortear } from '../src/engine/juego'
import type { Carta, Eleccion } from '../src/types'
import { ARQUETIPOS, cartasConRespuesta, respuestaDe } from './arquetipos'

/** Juega `rondas` rondas seguidas (como en el teléfono: las vistas pasan al final) y devuelve la brújula. */
function jugar(seed: number, rondas: number, elegir: (c: Carta) => Eleccion) {
  const vistas = new Set<string>()
  const resp = new Map<string, { carta: Carta; eleccion: Eleccion }>()
  for (let k = 0; k < rondas; k++) {
    for (const c of sortear(cartas, seed * 7 + k, vistas)) {
      vistas.add(c.id)
      resp.set(c.id, { carta: c, eleccion: elegir(c) })
    }
  }
  return brujula([...resp.values()])!
}

const SEMILLAS = 60
const lado = (v: number) => (v <= -CENTRO ? -1 : v >= CENTRO ? 1 : 0)

describe('arquetipos políticos', () => {
  it('todas las cartas con eje tienen respuesta de cada arquetipo', () => {
    const faltan = cartas.filter((c) => esIdeologica(c) && !cartasConRespuesta().includes(c.id)).map((c) => c.id)
    expect(faltan).toEqual([])
  })

  it.each(ARQUETIPOS.map((a, i) => [a.nombre, i] as const))('%s queda donde se espera tras tres rondas', (_, i) => {
    const { esperado } = ARQUETIPOS[i]
    const aciertos = { economia: 0, valores: 0, autoridad: 0 }
    for (let s = 1; s <= SEMILLAS; s++) {
      const b = jugar(s, 3, (c) => respuestaDe(i, c.id) ?? (real(c) >= 50 ? 'a' : 'b'))
      for (const e of EJES) {
        // Nunca del lado opuesto; en el lado esperado (o en el centro) en casi todas las rondas.
        expect(lado(b.vos[e]) * esperado[e], `semilla ${s}, ${e} = ${b.vos[e].toFixed(2)}`).toBeGreaterThanOrEqual(0)
        if (esperado[e] === 0) expect(lado(b.vos[e]) === 0 || Math.abs(b.vos[e]) < 0.4, `semilla ${s}, ${e}`).toBe(true)
        if (lado(b.vos[e]) === esperado[e]) aciertos[e]++
      }
    }
    for (const e of EJES) expect(aciertos[e] / SEMILLAS, e).toBeGreaterThanOrEqual(0.85)
  })

  it('quien siempre elige lo de la mayoría queda cerca del promedio en valores', () => {
    let centro = 0
    for (let s = 1; s <= SEMILLAS; s++) {
      const b = jugar(s, 3, (c) => {
        const m = mayoria(c)
        return m === 'parejo' ? (real(c) >= 50 ? 'a' : 'b') : m
      })
      if (lado(b.vos.valores) === 0) centro++
      // Elegir siempre lo mayoritario es un poco más estatista que el promedio (que a veces elige
      // el lado minoritario de mercado), pero nunca da "más mercado" ni "más orden".
      expect(cuadrante(b.vos)).not.toMatch(/mercado|tradicionales/)
      expect(lado(b.vos.autoridad)).toBeLessThanOrEqual(0)
    }
    expect(centro / SEMILLAS).toBeGreaterThanOrEqual(0.9)
  })
})
