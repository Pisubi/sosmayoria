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
  /** false: se informa aparte (p. ej. identidad peronista) y no entra en las comparaciones */
  includeInMatching: boolean
}

export interface Question {
  id: string
  text: string
  primaryAxis: string
  /** Peso firmado por eje: el acuerdo empuja hacia el polo B si es positivo. */
  effects: Record<string, number>
  variants: Variant[]
  /** Ítem coyuntural que conviene revisar cada ciclo electoral. */
  volatile?: boolean
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
  questions: Question[]
  catalogs: Catalog[]
  profiles: Profile[]
  /** Pares de ejes para los planos 2D. */
  planes: [string, string][]
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
