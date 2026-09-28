import { describe, expect, it } from 'vitest'
import { percentil, puntos, real, resumir, sortear } from '../src/engine/juego'
import type { Tema } from '../src/types'
import { carta } from './fixture'

describe('puntos', () => {
  it('100 exacto, 2,5 menos por punto y nunca negativo', () => {
    expect(puntos(60, 60)).toBe(100)
    expect(puntos(50, 60)).toBe(75)
    expect(puntos(70, 60)).toBe(75)
    expect(puntos(0, 60)).toBe(0)
  })
})

describe('real', () => {
  it('reparte entre A y B dejando afuera el resto', () => {
    expect(real(carta('x', 45, 15))).toBeCloseTo(75)
  })
})

describe('sortear', () => {
  const temas: Tema[] = ['politica', 'economia', 'cultura']
  const banco = Array.from({ length: 40 }, (_, i) => carta(`c${i}`, 50, 50, temas[i % 3]))

  it('no repite cartas y respeta el tamaño de la ronda', () => {
    const r = sortear(banco, 7)
    expect(r).toHaveLength(15)
    expect(new Set(r.map((c) => c.id)).size).toBe(15)
  })

  it('prioriza las cartas no vistas de cada tema', () => {
    const vistas = new Set(banco.slice(0, 24).map((c) => c.id))
    const r = sortear(banco, 3, vistas)
    expect(r.filter((c) => !vistas.has(c.id))).toHaveLength(15)
  })

  it('intercala temas: nunca tres seguidas del mismo', () => {
    for (let s = 0; s < 50; s++) {
      const r = sortear(banco, s)
      for (let i = 2; i < r.length; i++) {
        expect(r[i].tema === r[i - 1].tema && r[i].tema === r[i - 2].tema).toBe(false)
      }
    }
  })

  it('filtra por tema', () => {
    expect(sortear(banco, 1, new Set(), new Set<Tema>(['cultura'])).every((c) => c.tema === 'cultura')).toBe(true)
  })

  it('la misma semilla da la misma ronda', () => {
    expect(sortear(banco, 42).map((c) => c.id)).toEqual(sortear(banco, 42).map((c) => c.id))
  })
})

describe('resumir', () => {
  const banco = [carta('a', 70, 30), carta('b', 40, 60), carta('c', 50, 50), carta('d', 20, 80)]

  it('suma puntos, cuenta la mayoría y mide el falso consenso', () => {
    const r = resumir(banco, [
      { carta: 'a', eleccion: 'a', prediccion: 80 },
      { carta: 'b', eleccion: 'a', prediccion: 55 },
      { carta: 'c', eleccion: 'nada', prediccion: 50 },
      { carta: 'd', eleccion: 'b', prediccion: 10 },
    ])
    expect(r.total).toBe(75 + 63 + 100 + 75)
    expect(r.eligio).toBe(3)
    expect(r.conLaMayoria).toBe(2) // a con la mayoría, b en la minoría, d con la mayoría
    // Sobreestimó a su lado: +10 en a, +15 en b y +10 en d (dijo 90% B y era 80%).
    expect(r.sesgoPropio).toBeCloseTo(35 / 3)
    expect(r.sorpresa?.carta.id).toBe('b')
  })
})

describe('percentil', () => {
  it('requiere al menos 100 partidas', () => {
    expect(percentil(70, Array(50).fill(1))).toBeNull()
  })
  it('ubica el promedio en el histograma', () => {
    const h = Array(50).fill(0)
    h[20] = 100 // todos sacaron 40–41
    h[40] = 100 // todos sacaron 80–81
    expect(percentil(60, h)).toBe(50)
  })
})
