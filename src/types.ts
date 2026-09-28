export interface AxisPole {
  label: string
}

export interface Axis {
  id: string
  name: string
  description: string
  poleA: AxisPole
  poleB: AxisPole
}

export interface Question {
  id: string
  axisId: string
  text: string
  /**
   * +1: estar de acuerdo empuja el puntaje hacia poleB
   * -1: estar de acuerdo empuja el puntaje hacia poleA
   */
  direction: 1 | -1
}

export type Answer = 1 | 2 | 3 | 4 | 5

export interface AxisResult {
  axis: Axis
  /** -100 (poleA puro) a +100 (poleB puro) */
  score: number
}

export type TestMode = 'rapida' | 'completa' | 'fondo'

export type TestId = 'internacional' | 'argentina'

export type Era = 'actual' | 'historica'

export interface Reference {
  id: string
  kind: 'figura' | 'partido'
  name: string
  country: string
  era: Era
  description: string
  /** Posición estimada por eje, de -100 (poleA) a +100 (poleB); null = no aplica */
  position: Record<string, number | null>
}

export interface TestDefinition {
  id: TestId
  name: string
  tagline: string
  description: string
  axes: Axis[]
  questions: Question[]
  figures: Reference[]
  parties: Reference[]
}
