import type { Reference } from '../types'

export interface Match {
  reference: Reference
  /** 0 a 100 */
  similarity: number
}

// Distancia media cuadrática por eje: 0 = idénticos; 150 o más = afinidad 0%.
const ZERO_AFFINITY_DISTANCE = 150

/** Compara solo en los ejes donde la referencia tiene posición (las figuras históricas pueden no tenerla). */
export function rankMatches(
  scoresByAxisId: Record<string, number>,
  references: Reference[],
): Match[] {
  return references
    .map((reference) => {
      const diffs = Object.entries(scoresByAxisId).flatMap(([axisId, score]) => {
        const position = reference.position[axisId]
        return position == null ? [] : [position - score]
      })
      const meanSquared = diffs.reduce((sum, d) => sum + d * d, 0) / diffs.length
      const similarity = Math.max(0, 100 * (1 - Math.sqrt(meanSquared) / ZERO_AFFINITY_DISTANCE))
      return { reference, similarity }
    })
    .sort((a, b) => b.similarity - a.similarity)
}
