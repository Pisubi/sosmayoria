import type { Jugada, Tema } from '../types'
import type { Participant } from './participant'

/** Lo que queda en este navegador. A Supabase solo va la partida terminada. */
const VISTAS = 'mayoria:vistas:v1'
const PERSONA = 'mayoria:persona:v1'
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

/** Los datos demográficos se piden una sola vez por dispositivo; null = no se guarda nada. */
export const personaGuardada = (): Participant | null | undefined => {
  const p = leer<{ p: Participant | null }>(PERSONA)
  return p ? p.p : undefined
}
export const guardarPersona = (p: Participant | null): void => escribir(PERSONA, { p })

export const rondaGuardada = (): RondaGuardada | null => leer<RondaGuardada>(RONDA)
export const guardarRonda = (r: RondaGuardada | null): void => escribir(RONDA, r)
