import { describe, expect, it } from 'vitest'
import { tests } from '../src/data/tests'
import { rankProfiles } from '../src/engine/matching'
import { scoreAxes } from '../src/engine/scoring'
import { questionsFor } from '../src/engine/selection'
import type { Axis, Profile } from '../src/types'
import { rng, simulate } from './helpers'

const RUNS = 30
/**
 * Por debajo de esta distancia media entre ejes, dos perfiles son indistinguibles para el test.
 * Con 6 afirmaciones por eje en la versión completa y ruido σ = 0,25, el puntaje de cada eje
 * varía unos ±10 puntos entre simulaciones, así que perfiles a menos de 20 se confunden.
 */
export const TWIN_DISTANCE = 20

function distance(a: Profile, b: Profile, axes: Axis[]): number {
  const diffs = axes
    .filter((x) => x.includeInMatching)
    .flatMap((x) => {
      const u = a.coords[x.id]
      const v = b.coords[x.id]
      return u == null || v == null ? [] : [u - v]
    })
  return Math.sqrt(diffs.reduce((s, d) => s + d * d, 0) / diffs.length)
}

describe.each(Object.values(tests))('recall $name', (test) => {
  const questions = questionsFor(test, 'full')

  it('cada perfil sale primero en su catálogo en al menos el 80% de las simulaciones (σ = 0,25); entre los dos primeros si tiene un "gemelo"', () => {
    const next = rng(42)
    const failures: string[] = []

    for (const profile of test.profiles) {
      const pool = test.profiles.filter((p) => p.catalog === profile.catalog)
      const hasTwin = pool.some(
        (p) => p.id !== profile.id && distance(p, profile, test.axes) < TWIN_DISTANCE,
      )
      const topN = hasTwin ? 2 : 1
      let hits = 0
      for (let i = 0; i < RUNS; i++) {
        const scores = scoreAxes(test.axes, questions, simulate(profile, questions, next))
        const ranked = rankProfiles(scores, test.axes, pool)
        if (ranked.slice(0, topN).some((m) => m.profile.id === profile.id)) hits++
      }
      if (hits / RUNS < 0.8) failures.push(`${profile.id} ${Math.round((100 * hits) / RUNS)}%`)
    }

    expect(failures).toEqual([])
  })
})
