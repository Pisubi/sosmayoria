/** Una de las dos opciones de una carta. */
export interface Opcion {
  texto: string
  /** Id de una foto de src/data/fotos.json (figuras, partidos). */
  foto?: string
}

/** El dato real con el que se compara la adivinanza: una encuesta publicada. */
export interface Referencia {
  /** Porcentajes crudos publicados para A y B, y el resto (otras respuestas, no sabe, no contesta). */
  a: number
  b: number
  resto: number
  encuestadora: string
  /** AAAA-MM */
  fecha: string
  muestra?: string
  alcance: string
  url: string
  pregunta_original?: string
  nota?: string
}

export type Tema = 'economia' | 'politica' | 'sociedad' | 'historia' | 'cultura' | 'vida'

export interface Carta {
  id: string
  /** duelo: esto o aquello; afirmacion: de acuerdo o en desacuerdo. */
  tipo: 'duelo' | 'afirmacion'
  pregunta: string
  a: Opcion
  b: Opcion
  tema: Tema
  ref: Referencia
  /** Ya no se sortea, pero conserva su lugar en la codificación de partidas guardadas. */
  retirada?: boolean
}

/** Lo que eligió la persona: A, B o prefirió no decir. */
export type Eleccion = 'a' | 'b' | 'nada'

export interface Jugada {
  carta: string
  eleccion: Eleccion
}

/** Qué opción eligió la mayoría según la encuesta, o parejo si la diferencia entra en el margen de error. */
export type Mayoria = 'a' | 'b' | 'parejo'
