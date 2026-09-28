import { useState } from 'react'
import { deJugadores, puntos, real } from '../engine/juego'
import type { Carta, Conteo, Eleccion, Jugada } from '../types'
import { fecha } from '../lib/formato'
import { Foto } from './Foto'
import { ProgressBar } from './ProgressBar'

interface JuegoProps {
  cartas: Carta[]
  jugadas: Jugada[]
  conteos: Record<string, Conteo>
  onJugada: (jugadas: Jugada[]) => void
  onFin: (jugadas: Jugada[]) => void
}

type Paso = 'elegir' | 'adivinar' | 'revelar'

export function Juego({ cartas, jugadas: iniciales, conteos, onJugada, onFin }: JuegoProps) {
  const [jugadas, setJugadas] = useState<Jugada[]>(iniciales)
  const [paso, setPaso] = useState<Paso>('elegir')
  const [eleccion, setEleccion] = useState<Eleccion | null>(null)
  const [prediccion, setPrediccion] = useState(50)
  // Al revelar, la carta es la recién jugada; si no, la siguiente sin jugar.
  const index = paso === 'revelar' ? jugadas.length - 1 : Math.min(jugadas.length, cartas.length - 1)
  const carta = cartas[index]
  const acumulado = jugadas.reduce((s, j) => {
    const c = cartas.find((x) => x.id === j.carta)
    return s + (c ? puntos(j.prediccion, real(c)) : 0)
  }, 0)

  function elegir(e: Eleccion) {
    setEleccion(e)
    setPaso('adivinar')
  }

  function confirmar() {
    const nuevas = [...jugadas, { carta: carta.id, eleccion: eleccion ?? 'nada', prediccion }]
    setJugadas(nuevas)
    onJugada(nuevas)
    setPaso('revelar')
  }

  function siguiente() {
    if (jugadas.length >= cartas.length) {
      onFin(jugadas)
      return
    }
    setPaso('elegir')
    setEleccion(null)
    setPrediccion(50)
    window.scrollTo(0, 0)
  }

  const jugada = paso === 'revelar' ? jugadas[jugadas.length - 1] : null
  const numero = paso === 'revelar' ? jugadas.length : jugadas.length + 1

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="flex items-baseline justify-between gap-4 text-sm">
        <p>
          Carta <span className="font-semibold tabular-nums">{numero}</span> de{' '}
          <span className="tabular-nums">{cartas.length}</span>
        </p>
        <p className="font-semibold tabular-nums">
          {acumulado} <span className="font-normal text-azul/60">puntos</span>
        </p>
      </div>
      <div className="mt-3">
        <ProgressBar current={numero} total={cartas.length} />
      </div>

      <article className="relative mt-6 overflow-hidden rounded-2xl border border-azul/12 bg-papel p-5 shadow-[0_1px_0_rgb(30_58_71/0.06),0_12px_32px_-18px_rgb(30_58_71/0.35)] sm:p-8">
        <p className="text-xs font-semibold tracking-[0.12em] text-naranja uppercase">
          {carta.tipo === 'afirmacion' ? '¿Estás de acuerdo?' : '¿Qué elegís?'}
        </p>
        <h1 className="mt-3 text-2xl leading-snug font-semibold tracking-[-0.01em] sm:text-3xl sm:leading-tight">
          {carta.pregunta}
        </h1>

        {paso === 'elegir' && <Elegir carta={carta} onElegir={elegir} />}
        {paso === 'adivinar' && (
          <Adivinar carta={carta} eleccion={eleccion} valor={prediccion} onCambio={setPrediccion} onConfirmar={confirmar} />
        )}
        {paso === 'revelar' && jugada && <Revelar carta={carta} jugada={jugada} conteo={conteos[carta.id]} />}
      </article>

      {paso === 'revelar' && (
        <button
          type="button"
          onClick={siguiente}
          className="mt-5 w-full rounded-xl bg-azul px-4 py-4 text-sm font-semibold text-marfil hover:bg-noche"
        >
          {jugadas.length >= cartas.length ? 'Ver mi resultado →' : 'Siguiente carta →'}
        </button>
      )}
    </main>
  )
}

function Elegir({ carta, onElegir }: { carta: Carta; onElegir: (e: Eleccion) => void }) {
  const conFoto = Boolean(carta.a.foto || carta.b.foto)
  return (
    <>
      <div className="mt-8 grid grid-cols-2 gap-3">
        {(['a', 'b'] as const).map((lado) => {
          const op = carta[lado]
          return (
            <button
              key={lado}
              type="button"
              onClick={() => onElegir(lado)}
              className={`flex min-h-24 flex-col items-center justify-center gap-3 rounded-2xl border-2 px-3 py-5 text-center text-base font-semibold transition-all hover:-translate-y-0.5 sm:text-lg ${
                lado === 'a' ? 'border-azul/20 hover:border-azul hover:bg-azul/5' : 'border-naranja/30 hover:border-naranja hover:bg-naranja/5'
              }`}
            >
              {conFoto && <Foto id={op.foto} nombre={op.texto} size={80} />}
              {op.texto}
            </button>
          )
        })}
      </div>
      <button
        type="button"
        onClick={() => onElegir('nada')}
        className="mt-4 rounded-lg px-3 py-2 text-sm font-medium text-azul/60 hover:bg-linea hover:text-azul"
      >
        Prefiero no decir
      </button>
    </>
  )
}

function Adivinar({
  carta,
  eleccion,
  valor,
  onCambio,
  onConfirmar,
}: {
  carta: Carta
  eleccion: Eleccion | null
  valor: number
  onCambio: (v: number) => void
  onConfirmar: () => void
}) {
  return (
    <div className="mt-6">
      {eleccion && eleccion !== 'nada' && (
        <p className="text-sm text-azul/60">
          Elegiste <span className="font-semibold text-azul">{carta[eleccion].texto}</span>.
        </p>
      )}
      <p className="mt-4 text-lg font-semibold">¿Y la Argentina? ¿Cómo creés que se reparte?</p>
      <Reparto carta={carta} pctA={valor} />
      <input
        type="range"
        min={0}
        max={100}
        step={1}
        value={valor}
        onChange={(e) => onCambio(Number(e.target.value))}
        aria-label={`Porcentaje que eligió ${carta.a.texto}`}
        className="mt-5 h-3 w-full cursor-pointer accent-naranja"
      />
      <div className="mt-1 flex justify-between text-xs text-azul/55">
        <span>Todos {carta.a.texto}</span>
        <span>Todos {carta.b.texto}</span>
      </div>
      <button
        type="button"
        onClick={onConfirmar}
        className="mt-6 w-full rounded-xl bg-naranja px-4 py-4 text-sm font-semibold text-marfil hover:bg-azul"
      >
        Confirmar: {Math.round(valor)}% / {100 - Math.round(valor)}%
      </button>
    </div>
  )
}

/** Barra partida en dos: A a la izquierda (azul), B a la derecha (naranja). */
export function Reparto({ carta, pctA, chico = false }: { carta: Carta; pctA: number; chico?: boolean }) {
  const a = Math.round(pctA)
  return (
    <div className={chico ? 'mt-2' : 'mt-4'}>
      <div className={`flex overflow-hidden rounded-xl ${chico ? 'h-7' : 'h-14'}`}>
        <div className="flex items-center bg-azul px-3 text-marfil transition-[width] duration-500" style={{ width: `${a}%` }}>
          {a >= 12 && <span className={`font-bold tabular-nums ${chico ? 'text-sm' : 'text-xl'}`}>{a}%</span>}
        </div>
        <div className="flex flex-1 items-center justify-end bg-naranja px-3 text-marfil">
          {100 - a >= 12 && <span className={`font-bold tabular-nums ${chico ? 'text-sm' : 'text-xl'}`}>{100 - a}%</span>}
        </div>
      </div>
      {!chico && (
        <div className="mt-1.5 flex justify-between gap-4 text-sm font-medium">
          <span>{carta.a.texto}</span>
          <span className="text-right">{carta.b.texto}</span>
        </div>
      )}
    </div>
  )
}

function Revelar({ carta, jugada, conteo }: { carta: Carta; jugada: Jugada; conteo?: Conteo }) {
  const r = real(carta)
  const p = puntos(jugada.prediccion, r)
  const error = Math.round(Math.abs(jugada.prediccion - r))
  const jugadores = deJugadores(conteo)
  const mayoria = jugada.eleccion === 'nada' ? null : (jugada.eleccion === 'a') === r >= 50
  const ref = carta.ref
  return (
    <div className="mt-6">
      <div className="flex items-center justify-between gap-4">
        <p className="text-lg font-semibold">
          {error <= 3 ? '¡Clavado!' : error <= 10 ? 'Muy cerca' : error <= 20 ? 'Más o menos' : 'Te sorprendió'}
        </p>
        <p className={`rounded-full px-3 py-1 text-sm font-bold tabular-nums ${p >= 75 ? 'bg-acuerdo/15 text-acuerdo' : p >= 40 ? 'bg-linea' : 'bg-desacuerdo/15 text-desacuerdo'}`}>
          +{p} puntos
        </p>
      </div>

      <p className="mt-5 text-xs font-semibold tracking-[0.1em] text-azul/55 uppercase">La Argentina</p>
      <div className="relative">
        <Reparto carta={carta} pctA={r} />
        <span
          aria-hidden
          className="absolute top-2 h-16 w-1 -translate-x-1/2 rounded-full bg-noche ring-2 ring-marfil"
          style={{ left: `${jugada.prediccion}%` }}
          title={`Tu predicción: ${jugada.prediccion}%`}
        />
      </div>
      <p className="mt-2 text-sm text-azul/70">
        Dijiste {jugada.prediccion}% · era {Math.round(r)}%
        {mayoria != null && (
          <span className={`ml-2 rounded-full px-2 py-0.5 text-xs font-semibold ${mayoria ? 'bg-azul/10' : 'bg-naranja/15 text-naranja'}`}>
            {mayoria ? 'Estás con la mayoría' : 'Estás en la minoría'}
          </span>
        )}
      </p>

      {jugadores && (
        <div className="mt-5">
          <p className="text-xs font-semibold tracking-[0.1em] text-azul/55 uppercase">
            Quienes jugaron ({jugadores.n.toLocaleString('es-AR')})
          </p>
          <Reparto carta={carta} pctA={jugadores.pct} chico />
        </div>
      )}

      <p className="mt-5 text-xs leading-5 text-azul/55">
        Fuente: {ref.encuestadora}, {fecha(ref.fecha)}
        {ref.muestra && ` · ${ref.muestra}`}
        {ref.alcance !== 'nacional' && ` · alcance: ${ref.alcance}`}.{' '}
        {ref.resto > 0 && `${Math.round(ref.resto)}% respondió otra cosa o no sabe; se muestra cómo se reparten quienes eligieron una de las dos. `}
        <a href={ref.url} target="_blank" rel="noreferrer" className="underline decoration-naranja underline-offset-2">
          Ver la encuesta
        </a>
      </p>
    </div>
  )
}
