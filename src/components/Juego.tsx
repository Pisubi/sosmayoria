import { useEffect, useRef, useState } from 'react'
import { lugar, respaldo, type Lugar } from '../engine/juego'
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

/** Cuánto se muestra el resultado y la encuesta antes de pasar sola a la siguiente. */
const PAUSA = 3200

const MENSAJE: Record<Lugar, { texto: string; clase: string }> = {
  mayoria: { texto: 'Estás con la mayoría', clase: 'bg-azul text-papel' },
  minoria: { texto: 'Estás en la minoría', clase: 'bg-naranja text-azul' },
  parejo: { texto: 'Está parejo: el país se parte al medio', clase: 'bg-arena text-azul' },
  nada: { texto: 'Pasaste esta', clase: 'bg-papel text-azul' },
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
  // Porcentajes entre quienes eligieron A o B, redondeados para que sumen 100.
  const pctA = Math.round(respaldo(carta, 'a'))
  const pcts = { a: pctA, b: 100 - pctA }

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="flex items-baseline justify-between gap-4 text-sm">
        <p>
          Carta <span className="font-black tabular-nums">{index + 1}</span> de{' '}
          <span className="tabular-nums">{cartas.length}</span>
        </p>
        <p className="etiqueta">{carta.tipo === 'afirmacion' ? '¿Estás de acuerdo?' : '¿Qué elegís?'}</p>
      </div>
      <div className="mt-3">
        <ProgressBar current={index + 1} total={cartas.length} />
      </div>

      <article
        key={carta.id}
        className="caja relative mt-6 bg-papel p-5 sm:p-8"
      >
        <p className="etiqueta mb-4 !bg-ciruela">
          Encuesta {carta.ref.encuestadora} · {fecha(carta.ref.fecha)}
        </p>
        <h1 className="text-2xl leading-[1.05] sm:text-4xl">
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
                className={`caja-sm flex min-h-24 flex-col items-center justify-center gap-3 px-3 py-5 text-center text-base font-extrabold transition-transform sm:text-lg ${
                  elegida
                    ? 'bg-azul text-papel'
                    : revelada
                      ? 'bg-marfil text-azul/45 !shadow-none'
                      : lado === 'a'
                        ? 'bg-marfil hover:-translate-y-0.5 hover:bg-arena active:translate-x-1 active:translate-y-1 active:shadow-none'
                        : 'bg-marfil hover:-translate-y-0.5 hover:bg-arena active:translate-x-1 active:translate-y-1 active:shadow-none'
                }`}
              >
                {(carta.a.foto || carta.b.foto) && <Foto id={op.foto} nombre={op.texto} size={80} />}
                {op.texto}
                {revelada && <span className="text-4xl font-black tabular-nums">{pcts[lado]}%</span>}
              </button>
            )
          })}
        </div>

        {resultado && revelada ? (
          <>
            <button
              type="button"
              onClick={() => seguir()}
              className={`caja-sm mt-6 w-full px-4 py-4 text-center text-lg font-black uppercase ${MENSAJE[resultado].clase}`}
            >
              {MENSAJE[resultado].texto}
              <span className="mt-1 block text-base font-extrabold normal-case">
                {revelada.eleccion === 'nada'
                  ? `${pcts.a}% eligió «${carta.a.texto}» y ${pcts.b}% «${carta.b.texto}»`
                  : `${resultado === 'minoria' ? 'Solo el' : 'El'} ${pcts[revelada.eleccion]}% eligió lo mismo que vos`}
              </span>
              <span className="mt-1 block text-xs font-medium normal-case">tocá para seguir</span>
            </button>
            <Encuesta carta={carta} />
          </>
        ) : (
          <button
            type="button"
            onClick={() => elegir('nada')}
            className="mt-5 px-1 py-2 text-sm font-bold underline decoration-[3px] underline-offset-4 hover:bg-arena"
          >
            Prefiero no decir
          </button>
        )}
      </article>
    </main>
  )
}

/** La fuente del dato, a la vista: encuestadora, fecha, muestra, alcance, pregunta original y enlace. */
function Encuesta({ carta }: { carta: Carta }) {
  const { encuestadora, alcance, muestra, pregunta_original, url } = carta.ref
  const casos = muestra && /casos/.test(muestra) ? muestra.split(',')[0] : null
  return (
    <div className="caja-sm mt-4 border-l-[12px] border-l-ciruela bg-marfil px-4 py-3 text-sm">
      <p className="font-black uppercase">
        Encuesta de {encuestadora}, {fecha(carta.ref.fecha)}
      </p>
      <p className="mt-0.5 font-semibold">{[casos, alcance].filter(Boolean).join(' · ')}</p>
      {pregunta_original && <p className="mt-2 font-medium">Preguntó: «{pregunta_original}»</p>}
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="mt-2 inline-block font-black underline decoration-[3px] underline-offset-4 hover:bg-arena"
      >
        Ver la encuesta ↗
      </a>
    </div>
  )
}
