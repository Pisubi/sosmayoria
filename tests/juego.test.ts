import { describe, expect, it } from 'vitest'
import { lugar, mayoria, perfil, real, resumir, RONDA, sortear } from '../src/engine/juego'
import type { Tema } from '../src/types'
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
