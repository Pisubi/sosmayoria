import { describe, expect, it } from 'vitest'
import {
  brujula,
  cuadrante,
  frenteALaMayoria,
  lugar,
  mayoria,
  perfil,
  real,
  resumir,
  RONDA,
  sortear,
  temaDistinto,
} from '../src/engine/juego'
import type { Carta, Eje, Tema } from '../src/types'
import { carta } from './fixture'

describe('real y mayoría', () => {
  it('reparte entre A y B dejando afuera el resto', () => {
    expect(real(carta('x', 45, 15))).toBeCloseTo(75)
  })
  it('dentro del margen de error la carta es pareja', () => {
    expect(mayoria(carta('x', 50, 48))).toBe('parejo')
    expect(mayoria(carta('x', 54, 46))).toBe('a')
    expect(mayoria(carta('x', 30, 60))).toBe('b')
  })
  it('ubica tu elección', () => {
    const c = carta('x', 70, 30)
    expect(lugar(c, { carta: 'x', eleccion: 'a' })).toBe('mayoria')
    expect(lugar(c, { carta: 'x', eleccion: 'b' })).toBe('minoria')
    expect(lugar(c, { carta: 'x', eleccion: 'nada' })).toBe('nada')
  })
})

describe('sortear', () => {
  const temas: Tema[] = ['politica', 'economia', 'cultura']
  const banco = Array.from({ length: 40 }, (_, i) => carta(`c${i}`, 50, 50, temas[i % 3]))

  it('no repite cartas y respeta el tamaño de la ronda', () => {
    const r = sortear(banco, 7)
    expect(r).toHaveLength(RONDA)
    expect(new Set(r.map((c) => c.id)).size).toBe(RONDA)
  })

  it('prioriza las cartas no vistas de cada tema', () => {
    // 16 sin ver (menos que una ronda): tienen que salir todas.
    const vistas = new Set(banco.slice(0, 24).map((c) => c.id))
    const r = sortear(banco, 3, vistas)
    expect(r.filter((c) => !vistas.has(c.id))).toHaveLength(16)
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

describe('cartas núcleo', () => {
  const temas: Tema[] = ['politica', 'economia', 'cultura']
  const banco = [
    ...Array.from({ length: 40 }, (_, i) => carta(`c${i}`, 50, 50, temas[i % 3])),
    ...Array.from({ length: 5 }, (_, i) => ({ ...carta(`n${i}`, 60, 40, 'sociedad'), nucleo: true })),
  ]

  it('salen todas en cada ronda, repartidas y nunca primera', () => {
    for (let s = 0; s < 100; s++) {
      const r = sortear(banco, s)
      expect(r).toHaveLength(RONDA)
      const pos = r.flatMap((c, i) => (c.nucleo ? [i] : []))
      expect(pos).toHaveLength(5)
      expect(pos[0]).toBeGreaterThan(0)
      // Repartidas: una por cada quinto de la ronda.
      pos.forEach((p, i) => expect(Math.floor((p * 5) / RONDA)).toBeLessThanOrEqual(i + 1))
      expect(new Set(r.map((c) => c.id)).size).toBe(RONDA)
    }
  })

  it('salen aunque se filtre por tema', () => {
    const r = sortear(banco, 3, new Set(), new Set<Tema>(['cultura']))
    expect(r.filter((c) => c.nucleo)).toHaveLength(5)
    expect(r.filter((c) => !c.nucleo).every((c) => c.tema === 'cultura')).toBe(true)
  })
})

describe('cartas parecidas', () => {
  it('nunca salen dos del mismo grupo en una ronda, ni una parecida a una núcleo', () => {
    const banco = [
      ...Array.from({ length: 40 }, (_, i) => ({ ...carta(`c${i}`, 50, 50), grupos: [`g${i % 8}`, `h${i % 5}`] })),
      ...Array.from({ length: 30 }, (_, i) => carta(`s${i}`, 50, 50, 'cultura')),
      { ...carta('n0', 60, 40), nucleo: true, grupos: ['g0'] },
    ]
    for (let s = 0; s < 100; s++) {
      const grupos = sortear(banco, s).flatMap((c) => c.grupos ?? [])
      expect(new Set(grupos).size).toBe(grupos.length)
    }
  })
})

describe('resumir', () => {
  const banco = [carta('a', 70, 30), carta('b', 40, 60), carta('c', 50, 49), carta('d', 20, 80, 'economia')]

  it('cuenta mayoría, minoría y parejas, y separa por tema', () => {
    const r = resumir(banco, [
      { carta: 'a', eleccion: 'a' },
      { carta: 'b', eleccion: 'a' },
      { carta: 'c', eleccion: 'b' },
      { carta: 'd', eleccion: 'b' },
    ])
    expect(r.conLaMayoria).toBe(2)
    expect(r.enLaMinoria).toBe(1)
    expect(r.parejas).toBe(1)
    expect(r.definidas).toBe(3)
    expect(r.porTema).toEqual([
      { tema: 'politica', mayoria: 1, definidas: 2 },
      { tema: 'economia', mayoria: 1, definidas: 1 },
    ])
  })

  it('el perfil depende de la proporción con la mayoría', () => {
    expect(perfil(19, 20).titulo).toBe('Sos la mayoría')
    expect(perfil(10, 20).titulo).toBe('Mitad y mitad')
    expect(perfil(2, 20).titulo).toBe('Minoría intensa')
  })
})

describe('brújula política', () => {
  const con = (c: Carta, eje: Eje): Carta => ({ ...c, eje })
  const banco = [
    con(carta('m1', 70, 30), { economia: 1 }),
    con(carta('m2', 20, 80), { economia: -1 }),
    con(carta('s1', 60, 40), { sociedad: 1 }),
    con(carta('s2', 50, 49), { sociedad: -1 }),
    carta('x', 90, 10),
  ]

  it('promedia tus elecciones por eje y ubica a la mayoría en las mismas cartas', () => {
    const r = resumir(banco, [
      { carta: 'm1', eleccion: 'a' },
      { carta: 'm2', eleccion: 'b' },
      { carta: 's1', eleccion: 'b' },
      { carta: 's2', eleccion: 'a' },
      { carta: 'x', eleccion: 'a' },
    ])
    const b = brujula(r.lecturas)!
    expect(b.cartas).toEqual({ economia: 2, sociedad: 2 })
    expect(b.vos).toEqual({ economia: 1, sociedad: -1 })
    // m1: mayoría A (+1); m2: mayoría B (+1); s1: mayoría A (+1); s2: parejo (0).
    expect(b.mayoria).toEqual({ economia: 1, sociedad: 0.5 })
    expect(cuadrante(b.vos)).toBe('Más mercado, más libertades')
    expect(frenteALaMayoria(b)).toBe('Frente a la mayoría, estás más hacia las libertades individuales.')
  })

  it('sin suficientes respuestas por eje no ubica', () => {
    const r = resumir(banco, [
      { carta: 'm1', eleccion: 'a' },
      { carta: 'm2', eleccion: 'a' },
      { carta: 's1', eleccion: 'a' },
      { carta: 's2', eleccion: 'nada' },
    ])
    expect(brujula(r.lecturas)).toBeNull()
  })

  it('nombra el centro', () => {
    expect(cuadrante({ economia: 0.1, sociedad: -0.1 })).toBe('Centro')
    expect(cuadrante({ economia: -0.5, sociedad: 0 })).toBe('Más Estado, centro en valores')
  })
})

describe('tema en el que más te diferenciás', () => {
  it('elige el de menor proporción con la mayoría, con al menos dos cartas', () => {
    expect(
      temaDistinto([
        { tema: 'economia', mayoria: 3, definidas: 4 },
        { tema: 'cultura', mayoria: 0, definidas: 1 },
        { tema: 'sociedad', mayoria: 1, definidas: 3 },
      ]),
    ).toBe('sociedad')
    expect(temaDistinto([{ tema: 'economia', mayoria: 2, definidas: 2 }])).toBeNull()
  })
})
