import type { Reference } from '../data/references'

export interface Match {
  reference: Reference
  /** 0 a 100 */
  similarity: number
}

// Distancia media cuadrática por eje: 0 = idénticos; 150 o más = afinidad 0%.
const ZERO_AFFINITY_DISTANCE = 150

export function rankMatches(
  scoresByAxisId: Record<string, number>,
  references: Reference[],
): Match[] {
  const axisIds = Object.keys(scoresByAxisId)

  return references
    .map((reference) => {
      const meanSquared =
        axisIds.reduce((sum, id) => {
          const diff = (reference.position[id] ?? 0) - scoresByAxisId[id]
          return sum + diff * diff
        }, 0) / axisIds.length
      const distance = Math.sqrt(meanSquared)
      const similarity = Math.max(0, 100 * (1 - distance / ZERO_AFFINITY_DISTANCE))
      return { reference, similarity }
    })
    .sort((a, b) => b.similarity - a.similarity)
}
