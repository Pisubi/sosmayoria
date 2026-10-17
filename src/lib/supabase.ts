import type { Jugada } from '../types'
import { codificar } from '../engine/codificacion'
import { MINIMO_EJE, type Brujula } from '../engine/juego'
import type { Participant } from './participant'

const URL = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.replace(/\/$/, '')
const KEY = import.meta.env.VITE_SUPABASE_KEY as string | undefined

/** Solo se guardan partidas si el despliegue tiene Supabase configurado. */
export const collecting = Boolean(URL && KEY)

const MAX_SMALLINT = 32767

const headers = () => ({
  apikey: KEY!,
  // Las claves anon heredadas son JWT; las nuevas sb_publishable_ van solo en apikey.
  ...(KEY!.startsWith('eyJ') ? { Authorization: `Bearer ${KEY}` } : {}),
  'Content-Type': 'application/json',
})

const centesimos = (v: number) => Math.round(Math.max(-1, Math.min(1, v)) * 100)

export function enviarPartida(
  orden: string[],
  jugadas: Jugada[],
  participant: Participant,
  segundos: number,
  b: Brujula | null,
): void {
  if (!collecting || jugadas.length === 0) return
  const fila = {
    edad: participant.age,
    genero: participant.gender,
    educacion: participant.education,
    segundos: Math.min(MAX_SMALLINT, Math.max(0, Math.round(segundos))),
    jugadas: codificar(orden, jugadas),
    economia: b ? centesimos(b.vos.economia) : null,
    valores: b ? centesimos(b.vos.valores) : null,
    autoridad: b && b.cartas.autoridad >= MINIMO_EJE ? centesimos(b.vos.autoridad) : null,
  }
  fetch(`${URL}/rest/v1/partidas`, {
    method: 'POST',
    keepalive: true,
    headers: { ...headers(), Prefer: 'return=minimal' },
    body: JSON.stringify(fila),
  }).catch(() => {
    // Si falla el envío, la persona igual ve su resultado.
  })
}

/** Dónde queda en promedio la brújula de quienes jugaron (cada ronda guardada cuenta una vez). */
export interface Promedio {
  economia: number
  valores: number
  /** null si ninguna partida tenía cartas suficientes de autoridad. */
  autoridad: number | null
  partidas: number
}

export async function leerPromedio(): Promise<Promedio | null> {
  if (!collecting) return null
  try {
    const res = await fetch(`${URL}/rest/v1/rpc/promedio`, { method: 'POST', headers: headers(), body: '{}' })
    if (!res.ok) return null
    const [fila] = (await res.json()) as { economia: number | null; valores: number | null; autoridad: number | null; partidas: number }[]
    if (!fila || !fila.partidas || fila.economia == null || fila.valores == null) return null
    return { economia: fila.economia, valores: fila.valores, autoridad: fila.autoridad, partidas: fila.partidas }
  } catch {
    return null
  }
}
