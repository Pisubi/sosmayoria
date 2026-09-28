import type { Carta, Conteo, Jugada, Tema } from '../types'

/** Cartas por ronda. */
export const RONDA = 15

/** Por debajo de esta cantidad de jugadas, no se muestra lo que eligieron quienes jugaron. */
export const MIN_JUGADORES = 50

/** Porcentaje de A entre quienes eligieron A o B en la encuesta de referencia (0 a 100). */
export function real(carta: Carta): number {
  const { a, b } = carta.ref
  return (100 * a) / (a + b)
}

/** Porcentaje de A entre quienes jugaron, o null si todavía son pocos. */
export function deJugadores(conteo: Conteo | undefined): { pct: number; n: number } | null {
  if (!conteo) return null
  const n = conteo.a + conteo.b
  return n >= MIN_JUGADORES ? { pct: (100 * conteo.a) / n, n } : null
}

/**
 * Puntos por carta: 100 si acertás exacto, 2,5 puntos menos por cada punto de error;
 * errarle por 40 o más da 0. Con el banco actual, decir 50% en todas rinde unos 57 puntos.
 */
export function puntos(prediccion: number, realA: number): number {
  return Math.max(0, Math.round(100 - 2.5 * Math.abs(prediccion - realA)))
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
  real: number
  puntos: number
  /** Positivo: creíste que A tenía más apoyo del que tiene. */
  error: number
  /** Tu elección coincide con la opción más elegida (null si no elegiste). */
  mayoria: boolean | null
}

export interface Resumen {
  lecturas: Lectura[]
  total: number
  /** Promedio de puntos por carta, 0 a 100. */
  promedio: number
  /** Lo que habría sacado alguien que dice 50% en todas. */
  alAzar: number
  /** Cartas en las que elegiste lo mismo que la mayoría, sobre las que elegiste. */
  conLaMayoria: number
  eligio: number
  /**
   * Cuánto sobreestimás, en promedio, a quienes eligen lo mismo que vos (puntos porcentuales).
   * El "falso consenso": casi todos creemos que más gente piensa como nosotros.
   */
  sesgoPropio: number | null
  /** La carta en la que más le erraste. */
  sorpresa: Lectura | null
}

export function resumir(cartas: Carta[], jugadas: Jugada[]): Resumen {
  const porId = new Map(cartas.map((c) => [c.id, c]))
  const lecturas: Lectura[] = []
  for (const jugada of jugadas) {
    const carta = porId.get(jugada.carta)
    if (!carta) continue
    const r = real(carta)
    lecturas.push({
      carta,
      jugada,
      real: r,
      puntos: puntos(jugada.prediccion, r),
      error: jugada.prediccion - r,
      mayoria: jugada.eleccion === 'nada' ? null : (jugada.eleccion === 'a') === r >= 50,
    })
  }
  const total = lecturas.reduce((s, l) => s + l.puntos, 0)
  const alAzar = lecturas.reduce((s, l) => s + puntos(50, l.real), 0)
  const eligieron = lecturas.filter((l) => l.mayoria != null)
  // Error hacia el lado propio: si elegiste A, cuánto de más le diste a A; si B, a B.
  const propios = eligieron.map((l) => (l.jugada.eleccion === 'a' ? l.error : -l.error))
  const sorpresa = lecturas.reduce<Lectura | null>(
    (peor, l) => (!peor || Math.abs(l.error) > Math.abs(peor.error) ? l : peor),
    null,
  )
  return {
    lecturas,
    total,
    promedio: lecturas.length ? total / lecturas.length : 0,
    alAzar: lecturas.length ? alAzar / lecturas.length : 0,
    conLaMayoria: eligieron.filter((l) => l.mayoria).length,
    eligio: eligieron.length,
    sesgoPropio: propios.length >= 3 ? propios.reduce((s, x) => s + x, 0) / propios.length : null,
    sorpresa: sorpresa && Math.abs(sorpresa.error) >= 10 ? sorpresa : null,
  }
}

/** Cómo leés a la Argentina, en palabras. */
export function etiqueta(promedio: number): string {
  if (promedio >= 85) return 'Leés a la Argentina como nadie'
  if (promedio >= 75) return 'Tenés muy buen olfato'
  if (promedio >= 65) return 'La conocés bastante'
  if (promedio >= 55) return 'Más o menos: algunas te sorprendieron'
  return 'La Argentina te sorprendió'
}

/** Porcentaje de partidas con un promedio menor al tuyo, a partir del histograma (tramos de 2 puntos). */
export function percentil(promedio: number, histograma: number[]): number | null {
  const total = histograma.reduce((s, n) => s + n, 0)
  if (total < 100) return null
  const tramo = Math.min(histograma.length - 1, Math.floor(promedio / 2))
  const debajo = histograma.slice(0, tramo).reduce((s, n) => s + n, 0) + histograma[tramo] / 2
  return Math.round((100 * debajo) / total)
}
