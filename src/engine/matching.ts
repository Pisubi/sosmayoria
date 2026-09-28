import type { Axis, AxisScore, Profile } from '../types'

export interface Match {
  profile: Profile
  /** 0..100 */
  similarity: number
  /** Ejes comparados (con valor en usuario y perfil). */
  compared: string[]
  /** Menos del 60% de los ejes comparables: la cercanía es parcial. */
  partial: boolean
  /** Los 3 ejes de mayor coincidencia. */
  agree: string[]
  /** Los 2 ejes de mayor diferencia. */
  differ: string[]
}

const PARTIAL_THRESHOLD = 0.6

/**
 * d = sqrt(Σ (u_k − p_k)² / |A|) sobre los ejes A con valor en ambos (0..200);
 * sim = 100 · (1 − d/200).
 */
export function matchProfile(scores: AxisScore[], axes: Axis[], profile: Profile): Match {
  const matchable = axes.filter((a) => a.includeInMatching)
  const byAxis = new Map(scores.map((s) => [s.axisId, s.score]))
  const diffs: { axisId: string; diff: number }[] = []

  for (const axis of matchable) {
    const u = byAxis.get(axis.id)
    const p = profile.coords[axis.id]
    if (u == null || p == null) continue
    diffs.push({ axisId: axis.id, diff: Math.abs(u - p) })
  }

  const d = diffs.length
    ? Math.sqrt(diffs.reduce((sum, x) => sum + x.diff * x.diff, 0) / diffs.length)
    : 200
  const sorted = [...diffs].sort((a, b) => a.diff - b.diff)

  return {
    profile,
    similarity: 100 * (1 - d / 200),
    compared: diffs.map((x) => x.axisId),
    partial: diffs.length < PARTIAL_THRESHOLD * matchable.length,
    agree: sorted.slice(0, 3).map((x) => x.axisId),
    differ: sorted
      .slice(-2)
      .reverse()
      .map((x) => x.axisId),
  }
}

export function rankProfiles(scores: AxisScore[], axes: Axis[], profiles: Profile[]): Match[] {
  return profiles
    .map((p) => matchProfile(scores, axes, p))
    .sort((a, b) => b.similarity - a.similarity)
}
