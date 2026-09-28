import type { Carta } from '../types'
import data from './cartas.json'

/** Todas las cartas, retiradas incluidas, en el orden del que depende la codificación. */
export const todas = data.cartas as unknown as Carta[]
export const orden = todas.map((c) => c.id)
export const cartas = todas.filter((c) => !c.retirada)
export const version = data.version

export const TEMAS: { id: Carta['tema']; nombre: string }[] = [
  { id: 'politica', nombre: 'Política' },
  { id: 'economia', nombre: 'Economía' },
  { id: 'sociedad', nombre: 'Sociedad' },
  { id: 'historia', nombre: 'Historia' },
  { id: 'cultura', nombre: 'Cultura' },
  { id: 'vida', nombre: 'Vida cotidiana' },
]
