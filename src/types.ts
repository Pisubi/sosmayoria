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

export type TestMode = 'rapido' | 'completo'
