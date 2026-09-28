import type { Conteo, Jugada } from '../types'
import { codificar } from '../engine/codificacion'
import type { Participant } from './participant'

const URL = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.replace(/\/$/, '')
const KEY = import.meta.env.VITE_SUPABASE_KEY as string | undefined

/** Solo se piden datos y se guardan partidas si el despliegue tiene Supabase configurado. */
export const collecting = Boolean(URL && KEY)

const MAX_SMALLINT = 32767

function headers(): Record<string, string> {
  return {
    apikey: KEY!,
    // Las claves anon heredadas son JWT; las nuevas sb_publishable_ van solo en apikey.
    ...(KEY!.startsWith('eyJ') ? { Authorization: `Bearer ${KEY}` } : {}),
    'Content-Type': 'application/json',
  }
}

export function enviarPartida(
  orden: string[],
  jugadas: Jugada[],
  participant: Participant,
  segundos: number,
  promedio: number,
): void {
  if (!collecting || jugadas.length === 0) return
  const fila = {
    edad: participant.age,
    genero: participant.gender,
    educacion: participant.education,
    segundos: Math.min(MAX_SMALLINT, Math.max(0, Math.round(segundos))),
    promedio: Math.max(0, Math.min(100, Math.round(promedio))),
    jugadas: codificar(orden, jugadas),
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

export interface Estado {
  conteos: Record<string, Conteo>
  /** Partidas por tramo de 2 puntos de promedio (50 tramos). */
  histograma: number[]
}

/** Lo que eligieron quienes jugaron, carta por carta. Nunca devuelve partidas individuales. */
export async function cargarEstado(orden: string[]): Promise<Estado | null> {
  if (!collecting) return null
  try {
    const r = await fetch(`${URL}/rest/v1/rpc/estado`, { method: 'POST', headers: headers(), body: '{}' })
    if (!r.ok) return null
    const data = (await r.json()) as {
      cartas: { c: number; a: number; b: number; nada: number; pa: number; na: number; pb: number; nb: number }[] | null
      puntajes: { t: number; n: number }[] | null
    }
    const conteos: Record<string, Conteo> = {}
    for (const x of data.cartas ?? []) {
      const id = orden[x.c]
      if (id) conteos[id] = { a: x.a, b: x.b, nada: x.nada, predA: x.pa, nA: x.na, predB: x.pb, nB: x.nb }
    }
    const histograma = Array.from({ length: 50 }, () => 0)
    for (const x of data.puntajes ?? []) if (x.t >= 0 && x.t < 50) histograma[x.t] = x.n
    return { conteos, histograma }
  } catch {
    return null
  }
}
