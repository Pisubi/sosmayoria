import type { Answer, TestId, TestMode } from '../types'

export interface SavedProgress {
  testId: TestId
  mode: TestMode
  index: number
  answers: Record<string, Answer>
}

const KEY = 'brujula:progreso'

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
