import type { Eleccion, Jugada } from '../types'

/**
 * Una partida se guarda en 2 bytes por carta jugada (una ronda de 25 ocupa 50 bytes):
 *   byte 0: bits 6–7 = elección (1 A, 2 B, 3 prefirió no decir); bits 0–5 = parte alta del índice
 *   byte 1: parte baja del índice de la carta en src/data/cartas.json (que solo crece al final)
 * El índice admite hasta 16.384 cartas.
 */
const CODIGO: Record<Eleccion, number> = { a: 1, b: 2, nada: 3 }
const ELECCION: Eleccion[] = ['a', 'a', 'b', 'nada']

/** Devuelve el literal hexadecimal de bytea que acepta PostgREST (\x…). */
export function codificar(orden: string[], jugadas: Jugada[]): string {
  const indice = new Map(orden.map((id, i) => [id, i]))
  const bytes: number[] = []
  for (const j of jugadas) {
    const i = indice.get(j.carta)
    if (i == null) continue
    bytes.push((CODIGO[j.eleccion] << 6) | ((i >> 8) & 63), i & 255)
  }
  return '\\x' + bytes.map((b) => b.toString(16).padStart(2, '0')).join('')
}

export function decodificar(orden: string[], hex: string): Jugada[] {
  const limpio = hex.replace(/^\\x/, '')
  const out: Jugada[] = []
  for (let k = 0; k + 4 <= limpio.length; k += 4) {
    const b0 = parseInt(limpio.slice(k, k + 2), 16)
    const b1 = parseInt(limpio.slice(k + 2, k + 4), 16)
    const id = orden[((b0 & 63) << 8) | b1]
    if (id == null || b0 >> 6 === 0) continue
    out.push({ carta: id, eleccion: ELECCION[b0 >> 6] })
  }
  return out
}
