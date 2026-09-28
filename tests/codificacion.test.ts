import { describe, expect, it } from 'vitest'
import { codificar, decodificar } from '../src/engine/codificacion'
import type { Jugada } from '../src/types'

describe('codificación de partidas', () => {
  const orden = Array.from({ length: 700 }, (_, i) => `c${i}`)
  const jugadas: Jugada[] = [
    { carta: 'c0', eleccion: 'a', prediccion: 0 },
    { carta: 'c255', eleccion: 'b', prediccion: 100 },
    { carta: 'c256', eleccion: 'nada', prediccion: 37 },
    { carta: 'c699', eleccion: 'a', prediccion: 64 },
  ]

  it('ida y vuelta', () => {
    const hex = codificar(orden, jugadas)
    expect(hex).toMatch(/^\\x[0-9a-f]+$/)
    expect((hex.length - 2) / 2).toBe(3 * jugadas.length)
    expect(decodificar(orden, hex)).toEqual(jugadas)
  })

  it('una ronda de 15 entra en el límite de 90 bytes del esquema', () => {
    const ronda = Array.from({ length: 15 }, (_, i) => ({ carta: `c${i * 40}`, eleccion: 'a' as const, prediccion: 50 }))
    expect((codificar(orden, ronda).length - 2) / 2).toBeLessThanOrEqual(90)
  })

  it('coincide byte a byte con lo que decodifica el trigger de supabase/schema.sql', () => {
    // Verificado contra Postgres: carta 0 A 64%, carta 300 B 30%, carta 5 sin elección 50%.
    const hex = codificar(orden, [
      { carta: 'c0', eleccion: 'a', prediccion: 64 },
      { carta: 'c300', eleccion: 'b', prediccion: 30 },
      { carta: 'c5', eleccion: 'nada', prediccion: 50 },
    ])
    expect(hex).toBe('\\x400040812c1ec00532')
  })
})
