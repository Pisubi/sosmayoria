export type TestId = 'ar' | 'intl'
export type Variant = 'short' | 'full' | 'deep'
export type Confidence = 'alta' | 'media' | 'baja'

export interface Pole {
  label: string
  description?: string
}

export interface Axis {
  id: string
  name: string
  description: string
  poleA: Pole
  poleB: Pole
  /** false: no entra en las comparaciones */
  includeInMatching: boolean
  /** Se muestra aparte en el resultado (identidad peronista), aunque cuente en la cercanía. */
  reportSeparately?: boolean
  /**
   * Proporción del valor de un perfil hacia el polo B que expresan en el test quienes piensan
   * como él. En temas con polo "poco declarable" (movimientismo, populismo, autoridad) los
   * votantes no se expresan como actúan sus líderes; la comparación usa el valor escalado.
   */
  poleBExpressed?: number
}

export interface Question {
  id: string
  text: string
  primaryAxis: string
  /** Peso firmado por eje: el acuerdo empuja hacia el polo B si es positivo. */
  effects: Record<string, number>
  /** Elegible para el núcleo: las afirmaciones centrales de cada tema, que pesan más. */
  core?: boolean
  /** Peso en el puntaje, asignado al sortear (núcleo = CORE_WEIGHT, detalle = 1). */
  weight?: number
  /** Ítem coyuntural que conviene revisar cada ciclo electoral. */
  volatile?: boolean
  /** Reemplazada: ya no se sortea, pero conserva su lugar en el empaquetado de respuestas. */
  retired?: boolean
}

export interface Catalog {
  id: string
  name: string
  description: string
  kind: 'ideologias' | 'tradiciones' | 'figuras' | 'partidos'
}

export interface Profile {
  id: string
  catalog: string
  name: string
  country?: string
  era?: string
  description: string
  /** −100 (polo A) a +100 (polo B); null = no aplica a su época o sin evidencia. */
  coords: Record<string, number | null>
  confidence: Confidence
  method: string
  basis?: string
  contextNote?: string
}

export interface TestDefinition {
  id: TestId
  version: string
  name: string
  tagline: string
  description: string
  axes: Axis[]
  /** Afirmaciones activas (las que se sortean). */
  questions: Question[]
  /** Ids de todo el banco, retiradas incluidas, en el orden del empaquetado de respuestas. */
  layout: string[]
  catalogs: Catalog[]
  profiles: Profile[]
  /** Pares de ejes para los planos 2D. */
  planes: [string, string][]
  /** Grupos de temas para "también cerca, por dimensión". */
  dimensions: { label: string; axes: string[] }[]
  /** Afirmaciones que se sortean por eje: el núcleo va en todas las versiones y el detalle suma. */
  draw: {
    core: Record<string, number>
    detail: Record<Exclude<Variant, 'short'>, Record<string, number>>
  }
}

/** 1 = muy de acuerdo … −1 = muy en desacuerdo; null = "No sé" (se excluye). */
export type Response = -1 | -0.5 | 0 | 0.5 | 1 | null

export interface AxisScore {
  axisId: string
  /** −100..100, o null si el eje quedó indeterminado. */
  score: number | null
  /** Proporción del peso del eje efectivamente respondido (0..1). */
  coverage: number
}
