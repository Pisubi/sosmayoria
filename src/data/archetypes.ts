import type { Axis } from '../types'

/**
 * Orden de ejes que usan los vectores de los arquetipos.
 * Cada valor va de -100 (poleA del eje) a +100 (poleB del eje).
 */
export const ARCHETYPE_AXIS_ORDER = [
  'economia',
  'fiscal',
  'comercio',
  'moneda',
  'federalismo',
  'trabajo',
  'seguridad',
  'campo_energia',
  'agenda_social',
  'grieta',
] as const

export interface Archetype {
  id: string
  name: string
  description: string
  /** Vector prototipo en el mismo orden que ARCHETYPE_AXIS_ORDER */
  vector: number[]
}

export const archetypes: Archetype[] = [
  {
    id: 'libertario',
    name: 'Libertario',
    description:
      'Estado mínimo, dolarización, apertura comercial y desregulación total. Ve al peronismo como el origen del estancamiento económico argentino y prioriza la libertad económica individual por sobre la intervención estatal.',
    vector: [90, 90, 90, 80, 40, 80, 30, 90, 20, -90],
  },
  {
    id: 'liberal_conservador',
    name: 'Liberal-conservador',
    description:
      'Cercano al mercado y al ajuste fiscal, pero más gradualista que el libertarismo. Conservador en temas sociales, duro en seguridad y crítico del peronismo, aunque sin plantear una ruptura total del orden institucional.',
    vector: [50, 60, 50, 10, -10, 40, 60, 50, -40, -70],
  },
  {
    id: 'centrista',
    name: 'Centrista / radical',
    description:
      'Posiciones moderadas en casi todos los ejes, buscando equilibrio entre Estado y mercado. Valora el federalismo y las instituciones, sin identificarse fuertemente ni con el peronismo ni con el antiperonismo.',
    vector: [10, 10, 20, -10, 30, 0, 0, 0, 10, -10],
  },
  {
    id: 'peronismo_federal',
    name: 'Peronismo federal',
    description:
      'Peronista pero pragmático: defiende un Estado presente sin llevarlo al extremo, valora el federalismo frente al centralismo porteño y prioriza la gobernabilidad y el orden social por sobre las disputas ideológicas.',
    vector: [-30, -30, -30, -40, 50, -40, 20, -20, -10, 80],
  },
  {
    id: 'nacional_popular',
    name: 'Nacional-popular',
    description:
      'Fuerte intervención estatal, protección de la industria y el trabajo, retenciones al agro y una agenda social progresista. Se identifica plenamente con la tradición peronista y su rol redistributivo.',
    vector: [-80, -70, -70, -70, -20, -80, -50, -80, 60, 90],
  },
  {
    id: 'izquierda',
    name: 'Izquierda',
    description:
      'La intervención estatal más fuerte de todo el espectro, garantista en seguridad y muy progresista en agenda social. Suele mirar al peronismo con distancia crítica, por izquierda, más que identificarse con él.',
    vector: [-90, -80, -60, -60, 0, -90, -80, -70, 90, -20],
  },
]

export interface ArchetypeMatch {
  archetype: Archetype
  /** 0 a 100, qué tan cerca está el usuario de este arquetipo */
  similarity: number
}

/** Distancia euclídea máxima posible entre dos puntos del hipercubo [-100,100]^n */
function maxDistance(dimensions: number): number {
  return Math.sqrt(dimensions * (200 * 200))
}

export function matchArchetypes(
  scoresByAxisId: Record<string, number>,
): ArchetypeMatch[] {
  const vector = ARCHETYPE_AXIS_ORDER.map((axisId) => scoresByAxisId[axisId] ?? 0)
  const maxDist = maxDistance(vector.length)

  return archetypes
    .map((archetype) => {
      const squaredDiff = archetype.vector.reduce((sum, value, i) => {
        const diff = value - vector[i]
        return sum + diff * diff
      }, 0)
      const distance = Math.sqrt(squaredDiff)
      const similarity = Math.max(0, 100 * (1 - distance / maxDist))
      return { archetype, similarity }
    })
    .sort((a, b) => b.similarity - a.similarity)
}

export function axisOrderIsValid(axes: Axis[]): boolean {
  const ids = new Set(axes.map((a) => a.id))
  return ARCHETYPE_AXIS_ORDER.every((id) => ids.has(id))
}
