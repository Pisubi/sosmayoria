/** Datos demográficos que se piden al terminar el test, antes del resultado. El código 0 es "Prefiero no decir". */
export interface Participant {
  age: number
  gender: number
  education: number
}

export interface Option {
  code: number
  label: string
}

/** Menores de 16: pueden jugar, pero no se guardan sus respuestas. */
export const UNDER_16 = -1

export const AGE_OPTIONS: Option[] = [
  { code: UNDER_16, label: 'Menos de 16' },
  { code: 1, label: '16 o 17' },
  { code: 2, label: '18 a 24' },
  { code: 3, label: '25 a 34' },
  { code: 4, label: '35 a 44' },
  { code: 5, label: '45 a 54' },
  { code: 6, label: '55 a 64' },
  { code: 7, label: '65 o más' },
  { code: 0, label: 'Prefiero no decir' },
]

export const GENDER_OPTIONS: Option[] = [
  { code: 1, label: 'Mujer' },
  { code: 2, label: 'Varón' },
  { code: 3, label: 'No binario u otra identidad' },
  { code: 0, label: 'Prefiero no decir' },
]

export const EDUCATION_OPTIONS: Option[] = [
  { code: 1, label: 'Sin estudios o primario incompleto' },
  { code: 2, label: 'Primario completo' },
  { code: 3, label: 'Secundario incompleto' },
  { code: 4, label: 'Secundario completo' },
  { code: 5, label: 'Terciario o universitario incompleto' },
  { code: 6, label: 'Terciario o universitario completo' },
  { code: 7, label: 'Posgrado' },
  { code: 0, label: 'Prefiero no decir' },
]
