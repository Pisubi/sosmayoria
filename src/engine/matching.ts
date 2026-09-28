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
 * Diferencia mínima que se asume en un eje donde vos tenés puntaje y el perfil no tiene dato:
 * la mayor entre esta y tu distancia al centro. Sin ella, un perfil con pocos ejes se compara
 * solo en esos y le resulta fácil parecerse a cualquiera, sobre todo a quien tiene posiciones
 * marcadas en los ejes que al perfil le faltan.
 */
export const MISSING_DIFF = 40

/**
 * Tolerancia a la intensidad. Mucha gente responde "de acuerdo" donde una figura respondería
 * "muy de acuerdo": sus puntajes quedan más cerca del centro aunque piense en la misma
 * dirección. Antes de comparar, tus puntajes se estiran por el factor k ∈ [1, MAX_STRETCH]
 * que mejor te acerca a cada perfil; así cuenta sobre todo la dirección de tus posiciones.
 */
export const MAX_STRETCH = 2

/** Una diferencia media de SCALE puntos por tema equivale a 0% de cercanía. */
const SCALE = 100

/**
 * k = Σ u·p / Σ u² (acotado a [1, MAX_STRETCH]) sobre los temas con dato en ambos;
 * d = sqrt(Σ (k·u − p)² / |A|) sobre los temas A con puntaje tuyo, contando
 * max(MISSING_DIFF, |k·u|) donde el perfil no tiene dato; cercanía = 100 · (1 − d / SCALE).
 */
/** Valor de un perfil tal como lo expresaría en el test alguien que piensa como él (ver Axis.poleBExpressed). */
export function expressed(axis: Axis, value: number | null | undefined): number | null {
  if (value == null) return null
  return value > 0 && axis.poleBExpressed ? value * axis.poleBExpressed : value
}

export function matchProfile(
  scores: AxisScore[],
  axes: Axis[],
  profile: Profile,
  skip: ReadonlySet<string> = new Set(),
): Match {
  const matchable = axes.filter((a) => a.includeInMatching && !skip.has(a.id))
  const byAxis = new Map(scores.map((s) => [s.axisId, s.score]))
  const pairs: { axisId: string; u: number; p: number | null }[] = []
  for (const axis of matchable) {
    const u = byAxis.get(axis.id)
    if (u == null) continue
    pairs.push({ axisId: axis.id, u, p: expressed(axis, profile.coords[axis.id]) })
  }

  const both = pairs.filter((x) => x.p != null)
  const uu = both.reduce((s, x) => s + x.u * x.u, 0)
  const up = both.reduce((s, x) => s + x.u * (x.p as number), 0)
  const k = uu > 0 ? Math.min(MAX_STRETCH, Math.max(1, up / uu)) : 1
  const stretch = (u: number) => Math.max(-100, Math.min(100, k * u))

  const diffs = both.map((x) => ({ axisId: x.axisId, diff: Math.abs(stretch(x.u) - (x.p as number)) }))
  const missingSq = pairs
    .filter((x) => x.p == null)
    .reduce((s, x) => s + Math.max(MISSING_DIFF, Math.abs(stretch(x.u))) ** 2, 0)

  const d = diffs.length
    ? Math.sqrt((diffs.reduce((sum, x) => sum + x.diff * x.diff, 0) + missingSq) / pairs.length)
    : SCALE
  const sorted = [...diffs].sort((a, b) => a.diff - b.diff)

  return {
    profile,
    similarity: Math.max(0, 100 * (1 - d / SCALE)),
    compared: diffs.map((x) => x.axisId),
    partial: diffs.length < PARTIAL_THRESHOLD * matchable.length,
    agree: sorted.slice(0, 3).map((x) => x.axisId),
    differ: sorted
      .slice(-2)
      .reverse()
      .map((x) => x.axisId),
  }
}

/** Traducción en palabras de la cercanía, para que el porcentaje no se lea como más de lo que es. */
export function closenessLabel(similarity: number): string {
  if (similarity >= 80) return 'Muy cerca'
  if (similarity >= 65) return 'Cerca'
  if (similarity >= 50) return 'Algo cerca'
  return 'Lejos'
}

/**
 * Un catálogo se compara solo en los temas que tiene medidos en al menos esta proporción de
 * sus perfiles. Así, en las figuras históricas argentinas no cuenta Memoria (no aplica antes
 * de 1976) ni, en las internacionales, Ambiente: si contaran, cualquier figura moderna les
 * ganaría a las históricas solo por tener dato.
 */
export const CATALOG_COVERAGE = 0.7

export function uncoveredAxes(axes: Axis[], profiles: Profile[]): Set<string> {
  return new Set(
    axes
      .filter((a) => profiles.filter((p) => p.coords[a.id] != null).length < CATALOG_COVERAGE * profiles.length)
      .map((a) => a.id),
  )
}

export function rankProfiles(scores: AxisScore[], axes: Axis[], profiles: Profile[]): Match[] {
  const skip = uncoveredAxes(axes, profiles)
  return profiles
    .map((p) => matchProfile(scores, axes, p, skip))
    .sort((a, b) => b.similarity - a.similarity)
}
