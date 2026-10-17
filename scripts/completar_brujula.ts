/**
 * Completa la posición en la brújula de las partidas guardadas sin ella (las anteriores a que se
 * guardara), para que cuenten en el promedio. Usa el mismo motor que el juego, con las respuestas
 * de esa ronda solamente (el historial del dispositivo no se guardaba). Las rondas sin al menos
 * tres respuestas de economía y tres de valores quedan sin posición.
 *
 * Uso (la clave secreta escribe en la base: no la subas al repo ni la pongas en la app):
 *   SUPABASE_URL=https://xxxx.supabase.co SUPABASE_SECRET_KEY=sb_secret_xxxx npm run completar-brujula
 *   … npm run completar-brujula -- --probar   # calcula y resume, sin escribir
 */
import { decodificar } from '../src/engine/codificacion'
import { brujula, MINIMO_EJE, type Brujula } from '../src/engine/juego'
import { orden, todas } from '../src/data/cartas'

const URL = process.env.SUPABASE_URL?.replace(/\/$/, '')
const KEY = process.env.SUPABASE_SECRET_KEY
const PROBAR = process.argv.includes('--probar')
if (!URL || !KEY) {
  console.error('Faltan SUPABASE_URL y SUPABASE_SECRET_KEY.')
  process.exit(1)
}

const headers = {
  apikey: KEY,
  ...(KEY.startsWith('eyJ') ? { Authorization: `Bearer ${KEY}` } : {}),
  'Content-Type': 'application/json',
}
const porId = new Map(todas.filter((c) => !c.retirada).map((c) => [c.id, c]))
const centesimos = (v: number) => Math.round(Math.max(-1, Math.min(1, v)) * 100)

interface Fila {
  id: number
  jugadas: string
}

async function pendientes(): Promise<Fila[]> {
  const filas: Fila[] = []
  for (let ultimo = 0; ; ) {
    const res = await fetch(
      `${URL}/rest/v1/partidas?select=id,jugadas&economia=is.null&id=gt.${ultimo}&order=id&limit=1000`,
      { headers },
    )
    if (!res.ok) throw new Error(`Leyendo partidas: ${res.status} ${await res.text()}`)
    const pagina = (await res.json()) as Fila[]
    filas.push(...pagina)
    if (pagina.length < 1000) return filas
    ultimo = pagina[pagina.length - 1].id
  }
}

function posicion(hex: string): Brujula | null {
  const respuestas = decodificar(orden, hex).flatMap((j) => {
    const carta = porId.get(j.carta)
    return carta ? [{ carta, eleccion: j.eleccion }] : []
  })
  return brujula(respuestas)
}

const filas = await pendientes()
const calculadas = filas.flatMap((f) => {
  const b = posicion(f.jugadas)
  return b
    ? [
        {
          id: f.id,
          economia: centesimos(b.vos.economia),
          valores: centesimos(b.vos.valores),
          autoridad: b.cartas.autoridad >= MINIMO_EJE ? centesimos(b.vos.autoridad) : null,
        },
      ]
    : []
})
const media = (k: 'economia' | 'valores') =>
  calculadas.length ? (calculadas.reduce((s, c) => s + c[k], 0) / calculadas.length / 100).toFixed(2) : '-'
console.log(
  `${filas.length} partidas sin posición; ${calculadas.length} con respuestas suficientes. ` +
    `Promedio de esas: economía ${media('economia')}, valores ${media('valores')}.`,
)
if (PROBAR) process.exit(0)

let hechas = 0
for (let i = 0; i < calculadas.length; i += 20) {
  await Promise.all(
    calculadas.slice(i, i + 20).map(async ({ id, ...pos }) => {
      const res = await fetch(`${URL}/rest/v1/partidas?id=eq.${id}&economia=is.null`, {
        method: 'PATCH',
        headers: { ...headers, Prefer: 'return=minimal' },
        body: JSON.stringify(pos),
      })
      if (!res.ok) throw new Error(`Partida ${id}: ${res.status} ${await res.text()}`)
      hechas++
    }),
  )
}
console.log(`Listo: ${hechas} partidas completadas.`)
