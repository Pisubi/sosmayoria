import type { Jugada, Tema } from '../types'
import type { Participant } from './participant'

/** Lo que queda en este navegador. A Supabase solo va la partida terminada. */
const VISTAS = 'mayoria:vistas:v1'
const PERSONA = 'mayoria:persona:v2'
const RONDA = 'mayoria:ronda:v1'

export interface RondaGuardada {
  semilla: number
  cartas: string[]
  jugadas: Jugada[]
  temas: Tema[]
  inicio: number
}

function leer<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

function escribir(key: string, value: unknown): void {
  try {
    if (value == null) localStorage.removeItem(key)
    else localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Sin almacenamiento: el juego funciona igual.
  }
}

export const cartasVistas = (): Set<string> => new Set(leer<string[]>(VISTAS) ?? [])
export const marcarVistas = (ids: string[]): void => escribir(VISTAS, [...new Set([...cartasVistas(), ...ids])])

/** Lo último que marcó en el formulario de datos (menores de 16 incluidos: no se envía, pero se recuerda). */
export const personaGuardada = (): Participant | undefined => leer<Participant>(PERSONA) ?? undefined
export const guardarPersona = (p: Participant): void => escribir(PERSONA, p)

export const rondaGuardada = (): RondaGuardada | null => leer<RondaGuardada>(RONDA)
export const guardarRonda = (r: RondaGuardada | null): void => escribir(RONDA, r)
