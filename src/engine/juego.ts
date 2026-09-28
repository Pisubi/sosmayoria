import type { Carta, Jugada, Mayoria, Tema } from '../types'

/** Cartas por ronda. */
export const RONDA = 25

/**
 * Si entre quienes eligieron A o B la diferencia con 50% es menor que esto (en puntos),
 * la carta se considera pareja: las encuestas tienen márgenes de error de 2 a 4 puntos.
 */
export const MARGEN = 3

/** Porcentaje de A entre quienes eligieron A o B en la encuesta de referencia (0 a 100). */
export function real(carta: Carta): number {
  const { a, b } = carta.ref
  return (100 * a) / (a + b)
}

export function mayoria(carta: Carta): Mayoria {
  const pct = real(carta)
  if (Math.abs(pct - 50) < MARGEN) return 'parejo'
  return pct > 50 ? 'a' : 'b'
}

/** Cómo quedó tu elección frente a la encuesta: con la mayoría, en la minoría, parejo o sin elegir. */
export type Lugar = 'mayoria' | 'minoria' | 'parejo' | 'nada'

export function lugar(carta: Carta, jugada: Jugada): Lugar {
  if (jugada.eleccion === 'nada') return 'nada'
  const m = mayoria(carta)
  if (m === 'parejo') return 'parejo'
  return m === jugada.eleccion ? 'mayoria' : 'minoria'
}

export function random(seed: number): () => number {
  let t = seed >>> 0
  return () => {
    t += 0x6d2b79f5
    let r = Math.imul(t ^ (t >>> 15), 1 | t)
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r)
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

export function nuevaSemilla(): number {
  return Math.floor(Math.random() * 2 ** 31)
}

function mezclar<T>(items: T[], next: () => number): T[] {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/**
 * Sortea una ronda alternando temas por turnos (nunca salen varias de política seguidas) y,
 * dentro de cada tema, priorizando las cartas que la persona todavía no vio.
 */
export function sortear(
  cartas: Carta[],
  seed: number,
  vistas: ReadonlySet<string> = new Set(),
  temas?: ReadonlySet<Tema>,
  n = RONDA,
): Carta[] {
  const next = random(seed)
  const activas = cartas.filter((c) => !c.retirada && (!temas || temas.size === 0 || temas.has(c.tema)))
  // Una cola por tema, primero las no vistas; después se toma de a una por tema, por turnos.
  const colas = new Map<Tema, Carta[]>()
  for (const c of activas) colas.set(c.tema, [...(colas.get(c.tema) ?? []), c])
  const orden = mezclar(
    [...colas.values()].map((cola) => [
      ...mezclar(cola.filter((c) => !vistas.has(c.id)), next),
      ...mezclar(cola.filter((c) => vistas.has(c.id)), next),
    ]),
    next,
  )
  const out: Carta[] = []
  const total = Math.min(n, activas.length)
  while (out.length < total) {
    for (const cola of orden) {
      const c = cola.shift()
      if (c && out.length < total) out.push(c)
    }
  }
  return out
}

export interface Lectura {
  carta: Carta
  jugada: Jugada
  lugar: Lugar
}

export interface Resumen {
  lecturas: Lectura[]
  conLaMayoria: number
  enLaMinoria: number
  parejas: number
  /** Cartas con mayoría clara en las que elegiste (la base del "X de Y"). */
  definidas: number
  porTema: { tema: Tema; mayoria: number; definidas: number }[]
}

export function resumir(cartas: Carta[], jugadas: Jugada[]): Resumen {
  const porId = new Map(cartas.map((c) => [c.id, c]))
  const lecturas: Lectura[] = []
  for (const jugada of jugadas) {
    const carta = porId.get(jugada.carta)
    if (carta) lecturas.push({ carta, jugada, lugar: lugar(carta, jugada) })
  }
  const cuenta = (l: Lugar) => lecturas.filter((x) => x.lugar === l).length
  const temas = [...new Set(lecturas.map((l) => l.carta.tema))]
  return {
    lecturas,
    conLaMayoria: cuenta('mayoria'),
    enLaMinoria: cuenta('minoria'),
    parejas: cuenta('parejo'),
    definidas: cuenta('mayoria') + cuenta('minoria'),
    porTema: temas
      .map((tema) => {
        const del = lecturas.filter((l) => l.carta.tema === tema)
        const mayoria = del.filter((l) => l.lugar === 'mayoria').length
        return { tema, mayoria, definidas: mayoria + del.filter((l) => l.lugar === 'minoria').length }
      })
      .filter((t) => t.definidas > 0),
  }
}

/** Qué tan mayoritario sos, en palabras. */
export function perfil(conLaMayoria: number, definidas: number): { titulo: string; texto: string } {
  if (definidas === 0) return { titulo: 'Sin datos', texto: 'No elegiste en ninguna carta con una mayoría clara.' }
  const p = conLaMayoria / definidas
  if (p >= 0.85) return { titulo: 'Sos la mayoría', texto: 'Casi siempre pensás lo mismo que la mayor parte del país.' }
  if (p >= 0.65) return { titulo: 'Bien mayoritario', texto: 'En general coincidís con la mayoría, con algunas excepciones.' }
  if (p >= 0.45) return { titulo: 'Mitad y mitad', texto: 'Tan seguido con la mayoría como en la minoría.' }
  if (p >= 0.25) return { titulo: 'A contracorriente', texto: 'Más de una vez pensás distinto que la mayoría del país.' }
  return { titulo: 'Minoría intensa', texto: 'Casi siempre elegís lo que eligen menos argentinos.' }
}
