import type { Jugada } from '../types'
import { codificar } from '../engine/codificacion'
import type { Participant } from './participant'

const URL = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.replace(/\/$/, '')
const KEY = import.meta.env.VITE_SUPABASE_KEY as string | undefined

/** Solo se guardan partidas si el despliegue tiene Supabase configurado. */
export const collecting = Boolean(URL && KEY)

const MAX_SMALLINT = 32767

export function enviarPartida(orden: string[], jugadas: Jugada[], participant: Participant, segundos: number): void {
  if (!collecting || jugadas.length === 0) return
  const fila = {
    edad: participant.age,
    genero: participant.gender,
    educacion: participant.education,
    segundos: Math.min(MAX_SMALLINT, Math.max(0, Math.round(segundos))),
    jugadas: codificar(orden, jugadas),
  }
  fetch(`${URL}/rest/v1/partidas`, {
    method: 'POST',
    keepalive: true,
    headers: {
      apikey: KEY!,
      // Las claves anon heredadas son JWT; las nuevas sb_publishable_ van solo en apikey.
      ...(KEY!.startsWith('eyJ') ? { Authorization: `Bearer ${KEY}` } : {}),
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(fila),
  }).catch(() => {
    // Si falla el envío, la persona igual ve su resultado.
  })
}
