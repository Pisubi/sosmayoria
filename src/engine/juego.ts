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
 * Sortea una ronda: las cartas núcleo siempre, repartidas en lugares al azar, y el resto
 * alternando temas por turnos (nunca salen varias de política seguidas), sin dos cartas del
 * mismo grupo de parecidas y, dentro de cada tema, priorizando las que todavía no vio.
 */
export function sortear(
  cartas: Carta[],
  seed: number,
  vistas: ReadonlySet<string> = new Set(),
  temas?: ReadonlySet<Tema>,
  n = RONDA,
): Carta[] {
  const next = random(seed)
  const nucleo = cartas.filter((c) => c.nucleo && !c.retirada)
  const activas = cartas.filter(
    (c) => !c.retirada && !c.nucleo && (!temas || temas.size === 0 || temas.has(c.tema)),
  )
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
  // Como mucho una carta por grupo de cartas parecidas; las núcleo reservan el suyo primero.
  const grupos = new Set(nucleo.flatMap((c) => c.grupos ?? []))
  const choca = (c: Carta) => (c.grupos ?? []).some((g) => grupos.has(g))
  const out: Carta[] = []
  const total = Math.max(0, n - nucleo.length)
  while (out.length < total && orden.some((cola) => cola.length > 0)) {
    for (const cola of orden) {
      let c = cola.shift()
      while (c && choca(c)) c = cola.shift()
      if (!c || out.length >= total) continue
      for (const g of c.grupos ?? []) grupos.add(g)
      out.push(c)
    }
  }
  // Las cartas núcleo van en todas las rondas, en lugares al azar repartidos entre las demás
  // (una por tramo de la ronda, nunca la primera), para que no se note un bloque fijo.
  const tramos = nucleo.length
  const largo = out.length + nucleo.length
  mezclar(nucleo, next).forEach((c, i) => {
    const desde = Math.max(1, Math.floor((i * largo) / tramos))
    const hasta = Math.max(desde, Math.floor(((i + 1) * largo) / tramos) - 1)
    const pos = Math.min(out.length, desde + Math.floor(next() * (hasta - desde + 1)))
    out.splice(pos, 0, c)
  })
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

/** Un lugar en la brújula: cada eje va de -1 a 1. */
export interface Punto {
  /** -1 más Estado, 1 más mercado. */
  economia: number
  /** -1 más libertades individuales, 1 más orden y tradición. */
  sociedad: number
}

export interface Brujula {
  vos: Punto
  /** Dónde cae la opción mayoritaria de las encuestas en las mismas cartas que respondiste. */
  mayoria: Punto
  /** Cuántas respuestas cuentan en cada eje. */
  cartas: { economia: number; sociedad: number }
}

/** Respuestas mínimas por eje para ubicar a alguien en la brújula. */
export const MINIMO_EJE = 2

/** Ubica la ronda en dos ejes (Estado–mercado y libertades–orden) con las cartas que tienen eje. */
export function brujula(lecturas: Lectura[]): Brujula | null {
  const ejes = ['economia', 'sociedad'] as const
  const suma = { vos: { economia: 0, sociedad: 0 }, mayoria: { economia: 0, sociedad: 0 } }
  const cartas = { economia: 0, sociedad: 0 }
  for (const { carta, jugada } of lecturas) {
    if (!carta.eje || jugada.eleccion === 'nada') continue
    const m = mayoria(carta)
    for (const e of ejes) {
      const v = carta.eje[e]
      if (!v) continue
      suma.vos[e] += jugada.eleccion === 'a' ? v : -v
      suma.mayoria[e] += m === 'a' ? v : m === 'b' ? -v : 0
      cartas[e]++
    }
  }
  if (ejes.some((e) => cartas[e] < MINIMO_EJE)) return null
  const promedio = (p: Punto): Punto => ({ economia: p.economia / cartas.economia, sociedad: p.sociedad / cartas.sociedad })
  return { vos: promedio(suma.vos), mayoria: promedio(suma.mayoria), cartas }
}

/** Por debajo de esto (en valor absoluto) un eje cuenta como centro. */
const CENTRO = 0.2

/** El cuadrante en palabras, por ejemplo "Más Estado, más libertades". */
export function cuadrante(p: Punto): string {
  const eco = p.economia <= -CENTRO ? 'más Estado' : p.economia >= CENTRO ? 'más mercado' : null
  const soc = p.sociedad <= -CENTRO ? 'más libertades' : p.sociedad >= CENTRO ? 'más orden' : null
  const texto = eco && soc ? `${eco}, ${soc}` : eco ? `${eco}, centro en valores` : soc ? `centro en economía, ${soc}` : 'centro'
  return texto[0].toUpperCase() + texto.slice(1)
}

/** Cómo te corrés respecto de la mayoría, o null si caés en el mismo lugar. */
export function frenteALaMayoria(b: Brujula): string | null {
  const de = (d: number, menos: string, mas: string) => (d <= -CENTRO ? menos : d >= CENTRO ? mas : null)
  const partes = [
    de(b.vos.economia - b.mayoria.economia, 'más hacia el Estado', 'más hacia el mercado'),
    de(b.vos.sociedad - b.mayoria.sociedad, 'más hacia las libertades individuales', 'más hacia el orden y la tradición'),
  ].filter(Boolean)
  return partes.length ? `Frente a la mayoría, estás ${partes.join(' y ')}.` : null
}

/** El tema en el que más seguido quedaste en la minoría (al menos dos cartas definidas). */
export function temaDistinto(porTema: Resumen['porTema']): Tema | null {
  const candidatos = porTema.filter((t) => t.definidas >= 2 && t.mayoria < t.definidas)
  if (!candidatos.length) return null
  const ratio = (t: (typeof candidatos)[number]) => t.mayoria / t.definidas
  return candidatos.reduce((a, b) =>
    ratio(b) < ratio(a) || (ratio(b) === ratio(a) && b.definidas - b.mayoria > a.definidas - a.mayoria) ? b : a,
  ).tema
}
