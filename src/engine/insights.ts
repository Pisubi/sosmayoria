import type { Axis, AxisScore, Profile } from '../types'
import { expressed, matchProfile, uncoveredAxes, type Match } from './matching'

/** Por debajo de esta distancia al centro, una posición se considera equilibrada. */
const NEUTRAL = 15

export interface AxisReading {
  axis: Axis
  score: number
  median: number
  /** Proporción del catálogo que queda menos inclinada que vos hacia tu lado (0..1). */
  beyond: number
}

export interface Tension {
  a: AxisReading
  b: AxisReading
  /** Perfiles del catálogo con tu misma combinación de lados. */
  share: Profile[]
  total: number
}

export interface Distinctive {
  unusual: AxisReading | null
  typical: AxisReading | null
  tension: Tension | null
}

function median(values: number[]): number {
  const s = [...values].sort((x, y) => x - y)
  const m = s.length >> 1
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2
}

function correlation(xs: number[], ys: number[]): number {
  const n = xs.length
  const mx = xs.reduce((s, x) => s + x, 0) / n
  const my = ys.reduce((s, y) => s + y, 0) / n
  let sxy = 0, sxx = 0, syy = 0
  for (let i = 0; i < n; i++) {
    sxy += (xs[i] - mx) * (ys[i] - my)
    sxx += (xs[i] - mx) ** 2
    syy += (ys[i] - my) ** 2
  }
  return sxx && syy ? sxy / Math.sqrt(sxx * syy) : 0
}

/**
 * Lo que te distingue frente a un catálogo de referencia (ideologías o tradiciones):
 * tu posición más inusual, la más típica y, si existe, una combinación de temas que en el
 * catálogo suelen ir juntos y vos combinás al revés. No inventa nada: si no hay tensión,
 * devuelve null.
 */
export function distinctive(scores: AxisScore[], axes: Axis[], profiles: Profile[]): Distinctive {
  const readings: AxisReading[] = []
  for (const axis of axes) {
    const score = scores.find((s) => s.axisId === axis.id)?.score
    if (score == null || !axis.includeInMatching || axis.reportSeparately) continue
    const values = profiles.map((p) => expressed(axis, p.coords[axis.id])).filter((v): v is number => v != null)
    if (values.length < 5) continue
    const toward = Math.sign(score) || 1
    const beyond = values.filter((v) => v * toward < score * toward).length / values.length
    readings.push({ axis, score, median: median(values), beyond })
  }
  if (readings.length === 0) return { unusual: null, typical: null, tension: null }

  const byGap = [...readings].sort((x, y) => Math.abs(y.score - y.median) - Math.abs(x.score - x.median))
  const unusual = byGap[0]
  const typical = byGap.length > 1 ? byGap[byGap.length - 1] : null

  let tension: Tension | null = null
  let best = 0
  for (let i = 0; i < readings.length; i++) {
    for (let j = i + 1; j < readings.length; j++) {
      const a = readings[i], b = readings[j]
      if (Math.abs(a.score) < NEUTRAL || Math.abs(b.score) < NEUTRAL) continue
      const both = profiles
        .map((p) => [expressed(a.axis, p.coords[a.axis.id]), expressed(b.axis, p.coords[b.axis.id]), p] as const)
        .filter(([x, y]) => x != null && y != null) as [number, number, Profile][]
      if (both.length < 8) continue
      const r = correlation(both.map((x) => x[0]), both.map((x) => x[1]))
      if (Math.abs(r) < 0.45 || Math.sign(a.score * b.score) === Math.sign(r)) continue
      const share = both.filter(([x, y]) => Math.sign(x) === Math.sign(a.score) && Math.sign(y) === Math.sign(b.score)).map((x) => x[2])
      const rarity = 1 - share.length / both.length
      if (Math.abs(r) * rarity > best) {
        best = Math.abs(r) * rarity
        tension = { a, b, share, total: both.length }
      }
    }
  }
  return { unusual, typical, tension }
}

export interface Dimension {
  label: string
  axes: string[]
}

/** El perfil más cercano mirando solo un grupo de temas, sin repetir los ya mostrados. */
export function dimensionMatches(
  scores: AxisScore[],
  axes: Axis[],
  profiles: Profile[],
  dimensions: Dimension[],
  exclude: ReadonlySet<string>,
  /** Candidatos (por defecto, todo el catálogo). */
  pool: Profile[] = profiles,
): { dimension: Dimension; match: Match }[] {
  const uncovered = uncoveredAxes(axes, profiles)
  const used = new Set(exclude)
  const out: { dimension: Dimension; match: Match }[] = []
  for (const dimension of dimensions) {
    const skip = new Set([...uncovered, ...axes.filter((a) => !dimension.axes.includes(a.id)).map((a) => a.id)])
    const has = dimension.axes.some((id) => !skip.has(id) && scores.find((s) => s.axisId === id)?.score != null)
    if (!has) continue
    const best = pool
      .filter((p) => !used.has(p.id))
      .map((p) => matchProfile(scores, axes, p, skip))
      .filter((m) => m.compared.length > 0)
      .sort((x, y) => y.similarity - x.similarity)[0]
    if (!best) continue
    used.add(best.profile.id)
    out.push({ dimension, match: best })
  }
  return out
}
