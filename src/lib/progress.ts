import type { Response, TestId, Variant } from '../types'

export interface SavedProgress {
  testId: TestId
  variant: Variant
  seed: number
  index: number
  answers: Record<string, Response>
}

// Las opiniones políticas son datos sensibles (Ley 25.326): solo se guardan en este navegador.
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
