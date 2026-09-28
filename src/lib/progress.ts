import type { Response, TestId, Variant } from '../types'
import type { Participant } from './participant'

export interface SavedProgress {
  testId: TestId
  variant: Variant
  seed: number
  index: number
  answers: Record<string, Response>
  /** Datos demográficos si la persona aceptó guardar sus respuestas; si no, null. */
  participant?: Participant | null
  startedAt?: number
}

// El progreso queda en este navegador; solo el resultado final se envía, y solo con consentimiento.
const KEY = 'brujula:progreso:v2'

export function loadProgress(): SavedProgress | null {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as SavedProgress) : null
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
