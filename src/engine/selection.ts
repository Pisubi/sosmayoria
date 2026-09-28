import type { Question, TestDefinition, Variant } from '../types'

export const VARIANTS: Variant[] = ['short', 'full']

export const variantLabel: Record<Variant, string> = {
  short: 'Corta',
  full: 'Completa',
}

export function questionsFor(test: TestDefinition, variant: Variant): Question[] {
  return test.questions.filter((q) => q.variants.includes(variant))
}

/** Unos 8 segundos por afirmación. */
export function estimatedMinutes(count: number): number {
  return Math.max(1, Math.round((count * 8) / 60))
}

/** Generador determinístico (mulberry32) para poder retomar un test con el mismo orden. */
function random(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function shuffled<T>(items: T[], seed: number): T[] {
  const next = random(seed)
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

export function newSeed(): number {
  return Math.floor(Math.random() * 2 ** 31)
}
