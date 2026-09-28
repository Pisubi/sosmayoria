import type { Carta, Tema } from '../src/types'

export function carta(id: string, a: number, b: number, tema: Tema = 'politica'): Carta {
  return {
    id,
    tipo: 'afirmacion',
    pregunta: `Pregunta ${id}`,
    a: { texto: 'De acuerdo' },
    b: { texto: 'En desacuerdo' },
    tema,
    ref: { a, b, resto: 100 - a - b, encuestadora: 'X', fecha: '2025-01', alcance: 'nacional', url: 'https://x' },
  }
}
