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

const MENSAJE: Record<Lugar, { texto: string; clase: string }> = {
  mayoria: { texto: 'Estás con la mayoría', clase: 'bg-azul text-papel' },
  minoria: { texto: 'Estás en la minoría', clase: 'bg-naranja text-azul' },
  parejo: { texto: 'Está parejo: el país se parte al medio', clase: 'bg-arena text-azul' },
  nada: { texto: 'Pasaste esta', clase: 'bg-papel text-azul' },
}

/** Cuánto se muestra el resultado y la encuesta antes de pasar sola a la siguiente. */
const PAUSA = 3200

export function Juego({ cartas, jugadas: iniciales, onJugada, onFin }: JuegoProps) {
  const [jugadas, setJugadas] = useState<Jugada[]>(iniciales)
  const [revelada, setRevelada] = useState<Jugada | null>(null)
  const timer = useRef<number | undefined>(undefined)
  const proxima = useRef<HTMLButtonElement>(null)
  useEffect(() => () => window.clearTimeout(timer.current), [])
  // En pantallas muy bajas, que el botón para seguir quede a la vista.
  useEffect(() => {
    if (revelada) proxima.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [revelada])

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
    <main className="mx-auto max-w-3xl px-4 py-4 sm:px-6 sm:pt-3 sm:pb-6">
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
        className="caja relative mt-4 bg-papel p-4 sm:p-6"
      >
        <p className="etiqueta mb-3 !bg-ciruela">
          Encuesta {carta.ref.encuestadora} · {fecha(carta.ref.fecha)}
        </p>
        <h1 className="text-xl leading-[1.05] sm:text-3xl">
          {carta.pregunta}
        </h1>

        <div className={`grid grid-cols-2 gap-3 ${revelada ? 'mt-4' : 'mt-8'}`}>
          {(['a', 'b'] as const).map((lado) => {
            const op = carta[lado]
            const elegida = revelada?.eleccion === lado
            return (
              <button
                key={lado}
                type="button"
                disabled={Boolean(revelada)}
                onClick={() => elegir(lado)}
                className={`caja-sm flex flex-col items-center justify-center px-3 text-center text-base font-extrabold transition-transform sm:text-lg ${
                  revelada ? 'gap-0.5 py-2' : 'min-h-24 gap-3 py-5'
                } ${
                  elegida
                    ? 'bg-azul text-papel'
                    : revelada
                      ? 'bg-marfil text-azul/45 !shadow-none'
                      : lado === 'a'
                        ? 'bg-marfil hover:-translate-y-0.5 hover:bg-arena active:translate-x-1 active:translate-y-1 active:shadow-none'
                        : 'bg-marfil hover:-translate-y-0.5 hover:bg-arena active:translate-x-1 active:translate-y-1 active:shadow-none'
                }`}
              >
                {(carta.a.foto || carta.b.foto) && <Foto id={op.foto} nombre={op.texto} size={revelada ? 40 : 80} />}
                {op.texto}
                {revelada && <span className="text-3xl leading-none font-black tabular-nums sm:text-4xl">{pcts[lado]}%</span>}
              </button>
            )
          })}
        </div>

        {resultado && revelada ? (
          <>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-stretch">
              <div
                role="status"
                className={`caja-sm w-full px-3 py-2.5 text-center text-base font-black uppercase sm:text-lg ${MENSAJE[resultado].clase}`}
              >
                {MENSAJE[resultado].texto}
                <span className="block text-sm font-extrabold normal-case sm:text-base">
                  {revelada.eleccion === 'nada'
                    ? `${pcts.a}% eligió «${carta.a.texto}» y ${pcts.b}% «${carta.b.texto}»`
                    : `${resultado === 'minoria' ? 'Solo el' : 'El'} ${pcts[revelada.eleccion]}% eligió lo mismo que vos`}
                </span>
              </div>
              <button
                key={carta.id}
                ref={proxima}
                type="button"
                onClick={() => seguir()}
                className="caja-sm relative w-full shrink-0 overflow-hidden bg-naranja px-4 py-3 whitespace-nowrap sm:w-auto sm:px-8 text-sm font-black tracking-wide text-azul uppercase transition-transform hover:-translate-y-0.5 active:translate-x-1 active:translate-y-1 active:shadow-none"
              >
                {jugadas.length >= cartas.length ? 'Ver mi resultado →' : 'Próxima pregunta →'}
                {/* Cuánto falta para que pase sola. */}
                <span
                  aria-hidden
                  className="absolute bottom-0 left-0 h-1 w-full origin-left bg-azul"
                  style={{ animation: `llenar ${PAUSA}ms linear forwards` }}
                />
              </button>
            </div>
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

const normalizar = (t: string) =>
  t
    .toLowerCase()
    .normalize('NFD')
    .replace(/[^a-zñ ]/g, '')
    .trim()

/**
 * La fuente del dato, a la vista (encuestadora y fecha van arriba de la pregunta): muestra, alcance,
 * enlace y la pregunta original si dice otra cosa que la carta.
 */
function Encuesta({ carta }: { carta: Carta }) {
  const { alcance, muestra, pregunta_original, url } = carta.ref
  const casos = muestra?.match(/(más de |~)?[\d.]+ casos/)?.[0] ?? null
  const original =
    pregunta_original && !normalizar(pregunta_original).includes(normalizar(carta.pregunta))
      ? pregunta_original
      : null
  return (
    <div className="mt-3 border-l-[6px] border-ciruela bg-marfil px-3 py-2 text-xs leading-snug sm:text-sm">
      <p>
        <span className="font-black">{[casos, alcance].filter(Boolean).join(' · ')}</span> ·{' '}
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="font-black whitespace-nowrap underline decoration-2 underline-offset-2 hover:bg-arena"
        >
          Ver la encuesta ↗
        </a>
      </p>
      {original && <p className="mt-1 line-clamp-2 font-medium">Preguntó: «{original}»</p>}
    </div>
  )
}
