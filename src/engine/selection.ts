import type { Question, TestDefinition, Variant } from '../types'

export const VARIANTS: Variant[] = ['short', 'full', 'deep']

export const variantLabel: Record<Variant, string> = {
  short: 'Corta',
  full: 'Completa',
  deep: 'A fondo',
}

export const VARIANT_SIZE: Record<Variant, number> = { short: 25, full: 50, deep: 100 }

/** Las afirmaciones del núcleo pesan el triple que las de detalle. */
export const CORE_WEIGHT = 3

/** Unos 8 segundos por afirmación. */
export function estimatedMinutes(count: number): number {
  return Math.max(1, Math.round((count * 8) / 60))
}

/** Generador determinístico (mulberry32) para poder retomar un test con las mismas afirmaciones. */
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

function shuffle<T>(items: T[], next: () => number): T[] {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

export function shuffled<T>(items: T[], seed: number): T[] {
  return shuffle(items, random(seed))
}

/**
 * Sortea las afirmaciones de una partida y las devuelve en orden aleatorio.
 * Por eje: primero el núcleo, entre las elegibles, y después el detalle, entre todas las
 * demás. Con núcleo impar (3) un polo queda 2 a 1; ese polo mayoritario se alterna entre ejes
 * y el detalle suma afirmaciones del otro polo hasta compensar el peso, así que en las
 * versiones completa y a fondo cada eje queda balanceado.
 */
export function drawQuestions(test: TestDefinition, variant: Variant, seed: number): Question[] {
  const next = random(seed)
  const picked: Question[] = []
  let major = next() < 0.5 ? 1 : -1

  for (const axisId of shuffle(test.axes.map((a) => a.id), next)) {
    const items = test.questions.filter((q) => q.primaryAxis === axisId)
    const pole = (pool: Question[], sign: number) =>
      shuffle(pool.filter((q) => Math.sign(q.effects[axisId]) === sign), next)

    const nCore = test.draw.core[axisId] ?? 0
    const corePos = nCore % 2 ? (nCore + major) / 2 : nCore / 2
    if (nCore % 2) major = -major
    const eligible = items.filter((q) => q.core)
    const core = [...pole(eligible, 1).slice(0, corePos), ...pole(eligible, -1).slice(0, nCore - corePos)]
    picked.push(...core.map((q) => ({ ...q, weight: CORE_WEIGHT })))
    if (variant === 'short') continue

    const nDetail = test.draw.detail[variant][axisId] ?? 0
    const imbalance = CORE_WEIGHT * (2 * corePos - nCore)
    const detailPos = Math.min(nDetail, Math.max(0, Math.round((nDetail - imbalance) / 2)))
    const rest = items.filter((q) => !core.includes(q))
    picked.push(
      ...pole(rest, 1).slice(0, detailPos),
      ...pole(rest, -1).slice(0, nDetail - detailPos),
    )
  }
  return shuffle(picked, next)
}

export function newSeed(): number {
  return Math.floor(Math.random() * 2 ** 31)
}
