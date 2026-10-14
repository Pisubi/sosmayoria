/**
 * Simulación masiva de la brújula política: juega rondas reales (sortear) con jugadores sintéticos
 * y mide dónde los ubica brujula().
 *
 *   npm run simular -- [secuencias=2000] [rondas=1,3]
 *
 * Cada secuencia juega, con las mismas rondas, ~33 jugadores: una persona al azar del país según el
 * modelo (para medir cuánto recupera su posición real), cinco perfiles perfectamente coherentes
 * (Guttman), los siete arquetipos de tests/arquetipos.ts con 0, 10 y 20% de respuestas al revés,
 * y estilos de respuesta (siempre con la mayoría, siempre de acuerdo, al azar…). Sale un JSON con
 * media, desvío y % izquierda/centro/derecha (con CENTRO) por escala, la correlación entre posición
 * real y estimada, y la calibración (qué proporción elige A en la simulación vs. la encuesta).
 */
import { isMainThread, parentPort, Worker, workerData } from 'node:worker_threads'
import { cpus } from 'node:os'
import { fileURLToPath } from 'node:url'
import { cartas } from '../src/data/cartas'
import { brujula, CENTRO, EJES, mayoria, random, real, sortear } from '../src/engine/juego'
import type { Carta, Eleccion, NombreEje } from '../src/types'
import { ARQUETIPOS, respuestaDe } from '../tests/arquetipos'

const ARQ = ARQUETIPOS.map((a, i) => ({ ...a, id: String(i) }))
// Mismo modelo que brujula(): discriminación, lapso y dificultad (ver src/engine/juego.ts).
const D = 1.7
const LAPSO = 0.1
const dif = (q: number, a: number) => {
  const s = Math.min(0.97, Math.max(0.03, (q - LAPSO) / (1 - 2 * LAPSO)))
  return (-Math.log(s / (1 - s)) * Math.sqrt(1 + (Math.PI * a * a) / 8)) / a
}
const sig = (x: number) => 1 / (1 + Math.exp(-x))
/** Percentil en el país, llevado a -1…1, como muestra la brújula. */
const pantalla = (t: number) => { let s = 0.5; for (let k = 0, term = t; k < 60; k++) { s += term / (2 * k + 1) / Math.sqrt(2 * Math.PI); term *= (-t * t) / (2 * (k + 1)) } return 2 * s - 1 }

/** P(elegir A) para alguien en θ bajo el mismo modelo que usa la brújula (carta multi-eje: producto de logits sumados). */
function pA(c: Carta, th: Record<NombreEje, number>): number {
  if (!c.eje) return real(c) / 100
  const p = real(c) / 100
  let logit = 0
  let n = 0
  for (const e of EJES) {
    const w = c.eje[e]
    if (!w) continue
    const a = D * Math.abs(w)
    const q = w > 0 ? p : 1 - p
    const pMas = LAPSO + (1 - 2 * LAPSO) * sig(a * (th[e] - dif(q, a)))
    const pa = w > 0 ? pMas : 1 - pMas
    logit += Math.log(pa / (1 - pa))
    n++
  }
  return sig(logit / n)
}

// ---------- Rondas reales (sortear) ----------
function secuencia(seed: number, n: number): Carta[][] {
  const vistas = new Set<string>()
  const out: Carta[][] = []
  for (let k = 0; k < n; k++) {
    const r = sortear(cartas, seed * 7 + k, vistas)
    r.forEach((c) => vistas.add(c.id))
    out.push(r)
  }
  return out
}

type Estrategia = (c: Carta, rnd: () => number) => Eleccion
interface Acc { n: number; nulos: number; suma: Record<NombreEje, number>; suma2: Record<NombreEje, number>; signo: Record<NombreEje, [number, number, number]>; hist: Record<NombreEje, number[]> }
const nuevoAcc = (): Acc => ({ n: 0, nulos: 0, suma: { economia: 0, valores: 0, autoridad: 0 }, suma2: { economia: 0, valores: 0, autoridad: 0 }, signo: { economia: [0, 0, 0], valores: [0, 0, 0], autoridad: [0, 0, 0] }, hist: { economia: Array(21).fill(0), valores: Array(21).fill(0), autoridad: Array(21).fill(0) } })

function jugar(acc: Acc, rondas: Carta[][], estr: Estrategia, rnd: () => number, extra?: (v: Record<NombreEje, number>) => void) {
  const resp = new Map<string, Eleccion>()
  for (const r of rondas) for (const c of r) { const e = estr(c, rnd); if (e === 'nada') resp.delete(c.id); else resp.set(c.id, e) }
  const porId = new Map(cartas.map((c) => [c.id, c]))
  const b = brujula([...resp].map(([id, eleccion]) => ({ carta: porId.get(id)!, eleccion })))
  if (!b) { acc.nulos++; return }
  acc.n++
  for (const e of EJES) {
    const v = b.vos[e]
    acc.suma[e] += v; acc.suma2[e] += v * v
    acc.signo[e][v <= -CENTRO ? 0 : v >= CENTRO ? 2 : 1]++
    acc.hist[e][Math.round((v + 1) * 10)]++
  }
  extra?.(b.vos)
}

function trabajo(tarea: { desde: number; hasta: number; rondas: number }) {
  const { desde, hasta, rondas } = tarea
  const res: Record<string, Acc> = {}
  const acc = (k: string) => (res[k] ??= nuevoAcc())
  // Recuperación: correlación θ verdadero vs estimado
  const rec = { n: 0, sxy: { economia: 0, valores: 0, autoridad: 0 }, sxx: { economia: 0, valores: 0, autoridad: 0 }, syy: { economia: 0, valores: 0, autoridad: 0 }, sx: { economia: 0, valores: 0, autoridad: 0 }, sy: { economia: 0, valores: 0, autoridad: 0 }, acierto: { economia: 0, valores: 0, autoridad: 0 }, cuadrante: 0 }
  const elegA = new Map<string, [number, number]>()
  for (let s = desde; s < hasta; s++) {
    const seq = secuencia(s, rondas)
    const rnd = random(s * 13 + rondas)
    const gauss = () => { const u = 1 - rnd(), v = rnd(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v) }
    // 1) Población IRT θ ~ N(0,1)
    const th = { economia: gauss(), valores: gauss(), autoridad: gauss() }
    jugar(acc('Poblacion N(0,1) [modelo]'), seq, (c, r) => {
      const e: Eleccion = r() < pA(c, th) ? 'a' : 'b'
      const k = elegA.get(c.id) ?? [0, 0]; k[0] += e === 'a' ? 1 : 0; k[1]++; elegA.set(c.id, k)
      return e
    }, rnd, (v) => {
      rec.n++
      let ok = true
      for (const e of EJES) {
        const x = th[e], y = v[e]
        rec.sx[e] += x; rec.sy[e] += y; rec.sxx[e] += x * x; rec.syy[e] += y * y; rec.sxy[e] += x * y
        const verdadero = pantalla(x) <= -CENTRO ? 0 : pantalla(x) >= CENTRO ? 2 : 1
        const est = y <= -CENTRO ? 0 : y >= CENTRO ? 2 : 1
        if (verdadero === est) rec.acierto[e]++
        else if (e !== 'autoridad') ok = false
      }
      if (ok) rec.cuadrante++
    })
    // 2) Guttman determinista en θ fijos
    for (const t of [-2, -1, 0, 1, 2]) {
      const thg = { economia: t, valores: -t, autoridad: t }
      jugar(acc(`Guttman θ=(${t},${-t},${t})`), seq, (c) => (pA(c, thg) >= 0.5 ? 'a' : 'b'), rnd)
    }
    // 3) Arquetipos conscientes con ruido
    for (const eps of [0, 0.1, 0.2]) {
      ARQ.forEach((q, i) => {
        jugar(acc(`${q.nombre} ε=${eps}`), seq, (c, r) => {
          const e = respuestaDe(i, c.id)
          if (!e) return r() < real(c) / 100 ? 'a' : 'b'
          if (r() < 0.03) return 'nada'
          return r() < eps ? (e === 'a' ? 'b' : 'a') : e
        }, rnd)
      })
    }
    // 4) Estilos de respuesta
    jugar(acc('Siempre con la mayoría'), seq, (c, r) => { const m = mayoria(c); return m === 'parejo' ? (r() < 0.5 ? 'a' : 'b') : m }, rnd)
    jugar(acc('Siempre con la minoría'), seq, (c, r) => { const m = mayoria(c); return m === 'parejo' ? (r() < 0.5 ? 'a' : 'b') : m === 'a' ? 'b' : 'a' }, rnd)
    jugar(acc('Aquiescente (todo de acuerdo)'), seq, (c, r) => (c.tipo === 'afirmacion' ? 'a' : r() < 0.5 ? 'a' : 'b'), rnd)
    jugar(acc('Disidente (todo en desacuerdo)'), seq, (c, r) => (c.tipo === 'afirmacion' ? 'b' : r() < 0.5 ? 'a' : 'b'), rnd)
    jugar(acc('Al azar 50/50'), seq, (_, r) => (r() < 0.5 ? 'a' : 'b'), rnd)
    jugar(acc('Siempre A'), seq, () => 'a', rnd)
  }
  return { res, rec, elegA: [...elegA] }
}

if (isMainThread) {
  const N = Number(process.argv[2] ?? 2000)
  const RONDAS = (process.argv[3] ?? '1,3').split(',').map(Number)
  const nw = cpus().length
  const out: Record<string, unknown> = {}
  for (const rondas of RONDAS) {
    const partes = await Promise.all(Array.from({ length: nw }, (_, w) => new Promise<ReturnType<typeof trabajo>>((ok, ko) => {
      const wk = new Worker(fileURLToPath(import.meta.url), { workerData: { desde: 1 + Math.floor((w * N) / nw), hasta: 1 + Math.floor(((w + 1) * N) / nw), rondas } })
      wk.on('message', ok); wk.on('error', ko)
    })))
    const res: Record<string, Acc> = {}
    for (const p of partes) for (const [k, a] of Object.entries(p.res)) {
      const t = (res[k] ??= nuevoAcc()); t.n += a.n; t.nulos += a.nulos
      for (const e of EJES) { t.suma[e] += a.suma[e]; t.suma2[e] += a.suma2[e]; a.signo[e].forEach((x, i) => (t.signo[e][i] += x)); a.hist[e].forEach((x, i) => (t.hist[e][i] += x)) }
    }
    const rec = partes.map((p) => p.rec).reduce((t, r) => { t.n += r.n; t.cuadrante += r.cuadrante; for (const e of EJES) for (const k of ['sx', 'sy', 'sxx', 'syy', 'sxy', 'acierto'] as const) t[k][e] += r[k][e]; return t })
    const elegA = new Map<string, [number, number]>()
    for (const p of partes) for (const [id, [a, n]] of p.elegA) { const k = elegA.get(id) ?? [0, 0]; k[0] += a; k[1] += n; elegA.set(id, k) }
    const corr = Object.fromEntries(EJES.map((e) => { const n = rec.n; const cov = rec.sxy[e] / n - (rec.sx[e] / n) * (rec.sy[e] / n); const vx = rec.sxx[e] / n - (rec.sx[e] / n) ** 2; const vy = rec.syy[e] / n - (rec.sy[e] / n) ** 2; return [e, { r: +(cov / Math.sqrt(vx * vy)).toFixed(3), aciertoTercio: +(rec.acierto[e] / n).toFixed(3), sdEstimado: +Math.sqrt(vy).toFixed(3) }] }))
    const calib = [...elegA].filter(([id]) => cartas.find((c) => c.id === id)?.eje).map(([id, [a, n]]) => { const c = cartas.find((x) => x.id === id)!; return { id, encuesta: +real(c).toFixed(1), simulado: +((100 * a) / n).toFixed(1), n } })
    const tabla = Object.fromEntries(Object.entries(res).map(([k, a]) => [k, { n: a.n, nulos: a.nulos, ...Object.fromEntries(EJES.map((e) => [e, { media: +(a.suma[e] / a.n).toFixed(3), sd: +Math.sqrt(a.suma2[e] / a.n - (a.suma[e] / a.n) ** 2).toFixed(3), izqCentroDer: a.signo[e].map((x) => +((100 * x) / a.n).toFixed(1)), hist: a.hist[e] }])) }]))
    out[`rondas=${rondas}`] = { recuperacion: { n: rec.n, porEje: corr, cuadranteCorrecto: +(rec.cuadrante / rec.n).toFixed(3) }, tabla, calib }
  }
  console.log(JSON.stringify(out, null, 1))
} else {
  parentPort!.postMessage(trabajo(workerData))
}
