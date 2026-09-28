import { useState } from 'react'
import { deJugadores, etiqueta, percentil, type Resumen } from '../engine/juego'
import { renderShareImage } from '../lib/compartir'
import type { Conteo } from '../types'
import { Eyebrow } from './Eyebrow'
import { Footer } from './Footer'
import { fecha } from '../lib/formato'
import { Reparto } from './Juego'

interface ResultadoProps {
  resumen: Resumen
  conteos: Record<string, Conteo>
  histograma: number[] | null
  onOtraRonda: () => void
  onMethodology: () => void
}

export function Resultado({ resumen, conteos, histograma, onOtraRonda, onMethodology }: ResultadoProps) {
  const { promedio, alAzar, lecturas, sesgoPropio, sorpresa } = resumen
  const pct = histograma ? percentil(promedio, histograma) : null
  const minoria = lecturas.filter((l) => l.mayoria === false)
  const texto = `Saqué ${Math.round(promedio)} puntos en La Mayoría: ${etiqueta(promedio).toLowerCase()}. ¿Sabés qué piensa la Argentina?`

  return (
    <main>
      <section className="bg-noche text-marfil">
        <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-20">
          <Eyebrow>Fin de la ronda</Eyebrow>
          <div className="mt-6 grid items-center gap-8 sm:grid-cols-[auto_1fr]">
            <Anillo valor={promedio} />
            <div>
              <h1 className="text-4xl leading-tight font-bold tracking-[-0.02em] sm:text-5xl">{etiqueta(promedio)}</h1>
              <p className="mt-4 max-w-xl leading-7 text-marfil/75">
                {Math.round(promedio)} puntos de 100 por carta, en {lecturas.length} cartas.{' '}
                {pct != null
                  ? `Leés a la Argentina mejor que el ${pct}% de quienes jugaron.`
                  : `Diciendo 50% en todas habrías sacado ${Math.round(alAzar)}.`}
              </p>
            </div>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            <Dato
              titulo="Pensás como la mayoría"
              valor={resumen.eligio ? `${resumen.conLaMayoria} de ${resumen.eligio}` : '—'}
              texto={
                resumen.eligio
                  ? minoria.length === 0
                    ? 'En todas elegiste lo mismo que la mayoría.'
                    : `Estás en la minoría en ${minoria.length}: ${minoria
                        .slice(0, 2)
                        .map((l) => `«${l.carta.pregunta}»`)
                        .join(' y ')}${minoria.length > 2 ? ' y otras' : ''}.`
                  : 'No elegiste en ninguna carta.'
              }
            />
            <Dato
              titulo="Tu sesgo"
              valor={sesgoPropio == null ? '—' : `${sesgoPropio > 0 ? '+' : ''}${Math.round(sesgoPropio)} pts`}
              texto={
                sesgoPropio == null
                  ? 'Elegí en más cartas para calcularlo.'
                  : sesgoPropio > 5
                    ? 'Creés que hay más gente que piensa como vos de la que hay. Nos pasa a casi todos: se llama falso consenso.'
                    : sesgoPropio < -5
                      ? 'Subestimás a quienes piensan como vos: hay más de los que creés.'
                      : 'Ni sobreestimás ni subestimás a quienes piensan como vos. Poco común.'
              }
            />
            <Dato
              titulo="Tu mayor sorpresa"
              valor={sorpresa ? `${Math.round(Math.abs(sorpresa.error))} pts` : '—'}
              texto={
                sorpresa
                  ? `«${sorpresa.carta.pregunta}»: dijiste ${sorpresa.jugada.prediccion}% para «${sorpresa.carta.a.texto}» y era ${Math.round(sorpresa.real)}%.`
                  : 'Ninguna carta te sorprendió de verdad.'
              }
            />
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onOtraRonda}
              className="rounded-md bg-naranja px-8 py-3.5 text-sm font-semibold text-marfil hover:bg-marfil hover:text-azul"
            >
              Jugar otra ronda →
            </button>
            <Compartir texto={texto} promedio={promedio} etiqueta={etiqueta(promedio)} lecturas={lecturas.length} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        <Eyebrow>Carta por carta</Eyebrow>
        <ol className="mt-6 grid gap-4">
          {lecturas.map((l) => {
            const jug = deJugadores(conteos[l.carta.id])
            return (
              <li key={l.carta.id} className="rounded-2xl border border-azul/12 bg-papel p-5">
                <div className="flex items-start justify-between gap-4">
                  <p className="font-semibold">{l.carta.pregunta}</p>
                  <p className="shrink-0 text-sm font-bold tabular-nums">+{l.puntos}</p>
                </div>
                <Reparto carta={l.carta} pctA={l.real} chico />
                <p className="mt-2 text-xs text-azul/60">
                  {l.carta.a.texto} {Math.round(l.real)}% · {l.carta.b.texto} {100 - Math.round(l.real)}% · dijiste{' '}
                  {l.jugada.prediccion}%
                  {l.jugada.eleccion !== 'nada' && ` · elegiste ${l.carta[l.jugada.eleccion].texto}`}
                  {jug && ` · quienes jugaron: ${Math.round(jug.pct)}% «${l.carta.a.texto}»`}
                </p>
                <p className="mt-1 text-xs text-azul/50">
                  {l.carta.ref.encuestadora}, {fecha(l.carta.ref.fecha)} ·{' '}
                  <a href={l.carta.ref.url} target="_blank" rel="noreferrer" className="underline">
                    fuente
                  </a>
                </p>
              </li>
            )
          })}
        </ol>
      </section>

      <Footer onMethodology={onMethodology} />
    </main>
  )
}

function Dato({ titulo, valor, texto }: { titulo: string; valor: string; texto: string }) {
  return (
    <div className="rounded-3xl border border-marfil/15 bg-marfil/[0.06] p-6">
      <p className="text-xs font-semibold tracking-[0.1em] text-marfil/60 uppercase">{titulo}</p>
      <p className="mt-2 text-3xl font-bold text-naranja tabular-nums">{valor}</p>
      <p className="mt-2 text-sm leading-6 text-marfil/75">{texto}</p>
    </div>
  )
}

function Anillo({ valor }: { valor: number }) {
  const r = 42
  const c = 2 * Math.PI * r
  return (
    <div className="relative h-36 w-36 shrink-0">
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90" aria-hidden>
        <circle cx="50" cy="50" r={r} fill="none" strokeWidth="9" className="stroke-marfil/15" />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          strokeWidth="9"
          strokeLinecap="round"
          className="stroke-naranja"
          strokeDasharray={`${(Math.max(0, Math.min(100, valor)) / 100) * c} ${c}`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold tabular-nums">{Math.round(valor)}</span>
        <span className="text-[10px] font-semibold tracking-[0.12em] text-marfil/60 uppercase">de 100</span>
      </div>
    </div>
  )
}

function Compartir({ texto, promedio, etiqueta, lecturas }: { texto: string; promedio: number; etiqueta: string; lecturas: number }) {
  const [estado, setEstado] = useState<'listo' | 'copiado' | 'generando'>('listo')
  async function compartir() {
    const url = window.location.origin + window.location.pathname
    setEstado('generando')
    try {
      const blob = await renderShareImage({ promedio, etiqueta, cartas: lecturas, url })
      const file = new File([blob], 'la-mayoria.png', { type: 'image/png' })
      if (navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({ files: [file], text: `${texto} ${url}` })
          setEstado('listo')
          return
        } catch (e) {
          if ((e as Error).name === 'AbortError') {
            setEstado('listo')
            return
          }
        }
      }
      await navigator.clipboard.writeText(`${texto} ${url}`).catch(() => undefined)
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = file.name
      a.click()
      window.setTimeout(() => URL.revokeObjectURL(a.href), 5000)
      setEstado('copiado')
      window.setTimeout(() => setEstado('listo'), 3000)
    } catch {
      setEstado('listo')
    }
  }
  return (
    <button
      type="button"
      onClick={compartir}
      disabled={estado === 'generando'}
      className="rounded-md border border-marfil/40 px-8 py-3.5 text-sm font-semibold text-marfil hover:bg-marfil hover:text-azul disabled:opacity-60"
    >
      {estado === 'generando' ? 'Generando…' : estado === 'copiado' ? 'Imagen descargada y texto copiado' : 'Compartir resultado'}
    </button>
  )
}
