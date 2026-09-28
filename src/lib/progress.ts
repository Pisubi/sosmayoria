import { tests } from '../data/tests'
import { drawQuestions, VARIANT_SIZE } from '../engine/selection'
import type { Response, TestId, Variant } from '../types'

export interface SavedProgress {
  testId: TestId
  variant: Variant
  seed: number
  index: number
  answers: Record<string, Response>
  startedAt?: number
  /** Afirmaciones sorteadas: si el banco cambió desde que se empezó, el progreso se descarta. */
  ids?: string[]
  /** Segundos que llevó el test, fijados al terminarlo (no cuenta el tiempo hasta retomar). */
  seconds?: number
}

// El progreso queda en este navegador; a Supabase solo se envía el test terminado.
const KEY = 'brujula:progreso:v4'

export function drawnIds(testId: TestId, variant: Variant, seed: number): string[] {
  return drawQuestions(tests[testId], variant, seed).map((q) => q.id)
}

/** Un progreso sirve solo si es del mismo test, versión y sorteo que hoy saldría con su semilla. */
function isValid(p: SavedProgress): boolean {
  if (!p || typeof p !== 'object' || !Object.hasOwn(tests, p.testId)) return false
  if (!Object.hasOwn(VARIANT_SIZE, p.variant) || !Number.isInteger(p.seed)) return false
  if (!Number.isInteger(p.index) || p.index < 0 || typeof p.answers !== 'object' || !p.answers) return false
  const ids = drawnIds(p.testId, p.variant, p.seed)
  return Array.isArray(p.ids) && p.ids.length === ids.length && p.ids.every((id, i) => id === ids[i])
}

export function loadProgress(): SavedProgress | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const progress = JSON.parse(raw) as SavedProgress
    if (isValid(progress)) return progress
    localStorage.removeItem(KEY)
    return null
  } catch {
    return null
  }
}

export function saveProgress(progress: SavedProgress): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(progress))
  } catch {
    // Sin almacenamiento disponible: el test sigue funcionando sin guardar.
  }
}

export function clearProgress(): void {
  try {
    localStorage.removeItem(KEY)
  } catch {
    // Ídem.
  }
}
