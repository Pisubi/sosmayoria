import { expressed } from '../src/engine/matching'
import type { Axis, Profile, Question, Response } from '../src/types'

/** RNG determinístico para que los tests sean reproducibles. */
export function rng(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function normal(next: () => number): number {
  const u = Math.max(next(), 1e-12)
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * next())
}

const LEVELS = [-1, -0.5, 0, 0.5, 1] as const

function snap(x: number): Response {
  return LEVELS.reduce((best, l) => (Math.abs(l - x) < Math.abs(best - x) ? l : best), 0 as number) as Response
}

/** Coordenadas de un perfil tal como las expresaría alguien que piensa como él (ver Axis.poleBExpressed). */
export function expressedCoords(profile: Profile, axes: Axis[]): Record<string, number | null> {
  return Object.fromEntries(axes.map((a) => [a.id, expressed(a, profile.coords[a.id])]))
}

/** Respondente simulado "como" un perfil: signo del ítem · coordenada expresada + ruido. */
export function simulate(
  profile: Profile,
  questions: Question[],
  next: () => number,
  sigma = 0.25,
  axes?: Axis[],
): Record<string, Response> {
  const coords = axes ? expressedCoords(profile, axes) : profile.coords
  const answers: Record<string, Response> = {}
  for (const q of questions) {
    const p = coords[q.primaryAxis]
    if (p == null) {
      answers[q.id] = null
      continue
    }
    const sign = Math.sign(q.effects[q.primaryAxis])
    answers[q.id] = snap((sign * p) / 100 + normal(next) * sigma)
  }
  return answers
}
