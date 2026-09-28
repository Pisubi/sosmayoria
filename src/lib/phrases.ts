import data from '../data/frases.json'
import type { TestId } from '../types'

export interface Phrase {
  /** Familia política, para el chip sobre el nombre. */
  familia: string
  /** Cómo resumiría la sociedad que quiere alguien de esa corriente, en primera persona. */
  frase: string
}

const phrases = data as unknown as Record<TestId, Record<string, Phrase>>

export function phraseFor(testId: TestId, profileId: string): Phrase | undefined {
  return phrases[testId]?.[profileId]
}
