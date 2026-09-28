import { describe, expect, it } from 'vitest'
import { tests } from '../src/data/tests'
import { rankProfiles } from '../src/engine/matching'
import { scoreAxes } from '../src/engine/scoring'
import { drawQuestions } from '../src/engine/selection'
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
  it('cada perfil sale primero en su catálogo en al menos el 80% de las simulaciones (σ = 0,25); con gemelos, entre los primeros (hasta el tercero)', () => {
    const next = rng(42)
    const failures: string[] = []

    for (const profile of test.profiles) {
      const pool = test.profiles.filter((p) => p.catalog === profile.catalog)
      const twins = pool.filter(
        (p) => p.id !== profile.id && distance(p, profile, test.axes) < TWIN_DISTANCE,
      ).length
      const topN = Math.min(3, 1 + twins)
      let hits = 0
      for (let i = 0; i < RUNS; i++) {
        // Cada simulación juega una partida distinta de la versión completa.
        const questions = drawQuestions(test, 'full', Math.floor(next() * 2 ** 31))
        const scores = scoreAxes(test.axes, questions, simulate(profile, questions, next))
        const ranked = rankProfiles(scores, test.axes, pool)
        if (ranked.slice(0, topN).some((m) => m.profile.id === profile.id)) hits++
      }
      if (hits / RUNS < 0.8) failures.push(`${profile.id} ${Math.round((100 * hits) / RUNS)}%`)
    }

    expect(failures).toEqual([])
  })
})
