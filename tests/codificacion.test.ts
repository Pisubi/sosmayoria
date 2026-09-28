import { describe, expect, it } from 'vitest'
import { codificar, decodificar } from '../src/engine/codificacion'
import type { Jugada } from '../src/types'

describe('codificación de partidas', () => {
  const orden = Array.from({ length: 700 }, (_, i) => `c${i}`)
  const jugadas: Jugada[] = [
    { carta: 'c0', eleccion: 'a' },
    { carta: 'c255', eleccion: 'b' },
    { carta: 'c256', eleccion: 'nada' },
    { carta: 'c699', eleccion: 'a' },
  ]

  it('ida y vuelta', () => {
    const hex = codificar(orden, jugadas)
    expect(hex).toMatch(/^\\x[0-9a-f]+$/)
    expect((hex.length - 2) / 2).toBe(2 * jugadas.length)
    expect(decodificar(orden, hex)).toEqual(jugadas)
  })

  it('una ronda de 25 entra en el límite de 120 bytes del esquema', () => {
    const ronda = Array.from({ length: 25 }, (_, i) => ({ carta: `c${i * 20}`, eleccion: 'a' as const }))
    expect((codificar(orden, ronda).length - 2) / 2).toBeLessThanOrEqual(120)
  })

  it('coincide byte a byte con el formato documentado en supabase/schema.sql', () => {
    // Carta 0 A, carta 300 B, carta 5 sin elección.
    const hex = codificar(orden, [
      { carta: 'c0', eleccion: 'a' },
      { carta: 'c300', eleccion: 'b' },
      { carta: 'c5', eleccion: 'nada' },
    ])
    expect(hex).toBe('\\x4000812cc005')
  })
})
