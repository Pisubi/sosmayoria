import { useEffect, useRef, useState } from 'react'
import { lugar, type Lugar } from '../engine/juego'
import { fecha } from '../lib/formato'
import type { Carta, Eleccion, Jugada } from '../types'
import { Foto } from './Foto'
import { ProgressBar } from './ProgressBar'

interface JuegoProps {
  cartas: Carta[]
  jugadas: Jugada[]
  onJugada: (jugadas: Jugada[]) => void
  onFin: (jugadas: Jugada[]) => void
}

/** Cuánto se muestra el "con la mayoría / en la minoría" antes de pasar sola a la siguiente. */
const PAUSA = 1400

const MENSAJE: Record<Lugar, { texto: string; clase: string }> = {
  mayoria: { texto: 'Estás con la mayoría', clase: 'bg-azul text-marfil' },
  minoria: { texto: 'Estás en la minoría', clase: 'bg-naranja text-marfil' },
  parejo: { texto: 'Está parejo: el país se parte al medio', clase: 'bg-arena text-azul' },
  nada: { texto: 'Pasaste esta', clase: 'bg-linea text-azul' },
}

export function Juego({ cartas, jugadas: iniciales, onJugada, onFin }: JuegoProps) {
  const [jugadas, setJugadas] = useState<Jugada[]>(iniciales)
  const [revelada, setRevelada] = useState<Jugada | null>(null)
  const timer = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(timer.current), [])

  const index = revelada ? jugadas.length - 1 : Math.min(jugadas.length, cartas.length - 1)
  const carta = cartas[index]

  function elegir(eleccion: Eleccion) {
    if (revelada) return
    const jugada = { carta: carta.id, eleccion }
    const nuevas = [...jugadas, jugada]
    setJugadas(nuevas)
    onJugada(nuevas)
    setRevelada(jugada)
    timer.current = window.setTimeout(() => seguir(nuevas), PAUSA)
  }

  function seguir(todas: Jugada[] = jugadas) {
    window.clearTimeout(timer.current)
    if (todas.length >= cartas.length) {
      onFin(todas)
      return
    }
    setRevelada(null)
  }

  const resultado = revelada ? lugar(carta, revelada) : null

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="flex items-baseline justify-between gap-4 text-sm">
        <p>
          Carta <span className="font-semibold tabular-nums">{index + 1}</span> de{' '}
          <span className="tabular-nums">{cartas.length}</span>
        </p>
        <p className="text-azul/60">{carta.tipo === 'afirmacion' ? '¿Estás de acuerdo?' : '¿Qué elegís?'}</p>
      </div>
      <div className="mt-3">
        <ProgressBar current={index + 1} total={cartas.length} />
      </div>

      <article
        key={carta.id}
        className="relative mt-6 overflow-hidden rounded-2xl border border-azul/12 bg-papel p-5 shadow-[0_1px_0_rgb(30_58_71/0.06),0_12px_32px_-18px_rgb(30_58_71/0.35)] sm:p-8"
      >
        <h1 className="text-2xl leading-snug font-semibold tracking-[-0.01em] sm:text-3xl sm:leading-tight">
          {carta.pregunta}
        </h1>

        <div className="mt-8 grid grid-cols-2 gap-3">
          {(['a', 'b'] as const).map((lado) => {
            const op = carta[lado]
            const elegida = revelada?.eleccion === lado
            return (
              <button
                key={lado}
                type="button"
                disabled={Boolean(revelada)}
                onClick={() => elegir(lado)}
                className={`flex min-h-24 flex-col items-center justify-center gap-3 rounded-2xl border-2 px-3 py-5 text-center text-base font-semibold transition-all sm:text-lg ${
                  elegida
                    ? 'border-azul bg-azul text-marfil'
                    : revelada
                      ? 'border-azul/10 text-azul/40'
                      : lado === 'a'
                        ? 'border-azul/20 hover:-translate-y-0.5 hover:border-azul hover:bg-azul/5'
                        : 'border-naranja/30 hover:-translate-y-0.5 hover:border-naranja hover:bg-naranja/5'
                }`}
              >
                {(carta.a.foto || carta.b.foto) && <Foto id={op.foto} nombre={op.texto} size={80} />}
                {op.texto}
              </button>
            )
          })}
        </div>

        {resultado ? (
          <button
            type="button"
            onClick={() => seguir()}
            className={`mt-6 w-full rounded-xl px-4 py-4 text-center text-lg font-bold ${MENSAJE[resultado].clase}`}
          >
            {MENSAJE[resultado].texto}
            <span className="mt-1 block text-xs font-normal opacity-75">
              Según {carta.ref.encuestadora}, {fecha(carta.ref.fecha)} · tocá para seguir
            </span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => elegir('nada')}
            className="mt-4 rounded-lg px-3 py-2 text-sm font-medium text-azul/60 hover:bg-linea hover:text-azul"
          >
            Prefiero no decir
          </button>
        )}
      </article>
    </main>
  )
}
