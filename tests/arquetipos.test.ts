import { describe, expect, it } from 'vitest'
import { cartas } from '../src/data/cartas'
import { brujula, CENTRO, esIdeologica, real, sortear } from '../src/engine/juego'
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

describe('perfiles en las tres escalas', () => {
  it('todas las cartas con eje tienen respuesta de cada perfil', () => {
    const faltan = cartas.filter((c) => esIdeologica(c) && !cartasConRespuesta().includes(c.id)).map((c) => c.id)
    expect(faltan).toEqual([])
  })

  // Solo economía y valores: autoridad se calcula pero no se muestra ni tiene cupo por ronda.
  const VISIBLES = ['economia', 'valores'] as const

  it.each(ARQUETIPOS.map((a, i) => [a.nombre, i] as const))('%s queda donde se espera tras tres rondas', (_, i) => {
    const { esperado } = ARQUETIPOS[i]
    const aciertos = { economia: 0, valores: 0 }
    for (let s = 1; s <= SEMILLAS; s++) {
      const b = jugar(s, 3, (c) => respuestaDe(i, c.id) ?? (real(c) >= 50 ? 'a' : 'b'))
      for (const e of VISIBLES) {
        const v = b.vos[e]
        // Los ejes "de centro" no se exigen: elegir siempre lo mayoritario no da el promedio (ver
        // docs/auditoria-brujula.md), así que un perfil de centro puede caer a un lado.
        if (esperado[e] === 0) continue
        expect(lado(v) * esperado[e], `semilla ${s}, ${e} = ${v.toFixed(2)}`).toBeGreaterThanOrEqual(0)
        if (lado(v) === esperado[e]) aciertos[e]++
      }
    }
    for (const e of VISIBLES) if (esperado[e] !== 0) expect(aciertos[e] / SEMILLAS, e).toBeGreaterThanOrEqual(0.95)
  })
})
