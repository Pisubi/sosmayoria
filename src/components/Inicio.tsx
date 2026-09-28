import { useState } from 'react'
import { cartas, TEMAS } from '../data/cartas'
import { RONDA } from '../engine/juego'
import type { RondaGuardada } from '../lib/guardado'
import type { Tema } from '../types'
import { Eyebrow, Index } from './Eyebrow'
import { Footer } from './Footer'

interface InicioProps {
  guardada: RondaGuardada | null
  onJugar: (temas: Tema[]) => void
  onRetomar: (r: RondaGuardada) => void
  onMethodology: () => void
}

const PASOS = [
  { titulo: 'Elegí', texto: 'Una pregunta, dos opciones. Esto o aquello, de acuerdo o en desacuerdo. Si no querés decir, pasás.' },
  { titulo: 'Mayoría o minoría', texto: 'Al toque te decimos si pensás como la mayoría de los argentinos, según una encuesta publicada.' },
  { titulo: 'Tu resultado', texto: 'Al final: en cuántos temas pensás como la mayoría, dónde sos minoría y cómo te va en cada tema.' },
]

const PREGUNTAS = [
  {
    q: '¿De dónde salen los datos reales?',
    a: 'De encuestas publicadas por consultoras y universidades, casi todas nacionales; cuando es regional (por ejemplo, el AMBA) la carta lo aclara. Cada carta cita la encuestadora, la fecha, la muestra y el enlace. Cuando la encuesta tenía más opciones, la mayoría se define entre quienes eligieron una de las dos.',
  },
  {
    q: '¿Qué pasa si está muy parejo?',
    a: 'Si la encuesta muestra una diferencia chica entre las dos opciones (dentro del margen de error), la carta cuenta como pareja: no estás ni con la mayoría ni en la minoría.',
  },
  {
    q: '¿Guardan lo que respondo?',
    a: 'Si el sitio tiene activada la recolección, cada ronda se guarda de forma anónima, sin nombre ni mail, con la edad, el género y el nivel educativo si decidís darlos. Nunca se guardan las de menores de 16 años.',
  },
]

export function Inicio({ guardada, onJugar, onRetomar, onMethodology }: InicioProps) {
  const [temas, setTemas] = useState<Tema[]>([])
  const disponibles = TEMAS.filter((t) => cartas.some((c) => c.tema === t.id))
  const toggle = (t: Tema) => setTemas((ts) => (ts.includes(t) ? ts.filter((x) => x !== t) : [...ts, t]))

  return (
    <main>
      <section className="bg-noche text-marfil">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-24">
          <Eyebrow>Un juego sobre la opinión pública</Eyebrow>
          <h1 className="mt-6 max-w-3xl text-5xl leading-[1.02] font-bold tracking-[-0.025em] sm:text-7xl">
            ¿Sabés qué piensa <em className="font-light text-naranja">la Argentina</em>?
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-marfil/75">
            Elegí entre dos opciones y descubrí si pensás como la mayoría de los argentinos. {RONDA} cartas, un par
            de minutos.
          </p>

          {disponibles.length > 1 && (
            <div className="mt-8">
              <p className="text-sm text-marfil/60">Temas (si no elegís ninguno, van mezclados):</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {disponibles.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    aria-pressed={temas.includes(t.id)}
                    onClick={() => toggle(t.id)}
                    className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                      temas.includes(t.id) ? 'border-naranja bg-naranja text-marfil' : 'border-marfil/30 hover:border-marfil'
                    }`}
                  >
                    {t.nombre}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={cartas.length === 0}
              onClick={() => onJugar(temas)}
              className="rounded-md bg-naranja px-10 py-4 text-base font-semibold text-marfil hover:bg-marfil hover:text-azul disabled:opacity-40"
            >
              Jugar →
            </button>
            {guardada && guardada.jugadas.length < guardada.cartas.length && (
              <button
                type="button"
                onClick={() => onRetomar(guardada)}
                className="rounded-md border border-marfil/40 px-6 py-4 text-sm font-semibold hover:bg-marfil hover:text-azul"
              >
                Seguir la ronda ({guardada.jugadas.length} de {guardada.cartas.length})
              </button>
            )}
          </div>
          <p className="mt-6 text-sm text-marfil/50">{cartas.length} cartas con datos de encuestas publicadas.</p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
        <Eyebrow>Cómo se juega</Eyebrow>
        <ol className="mt-6 grid gap-4 md:grid-cols-3">
          {PASOS.map((p, i) => (
            <li key={p.titulo} className="rounded-3xl border border-azul/12 bg-papel p-6">
              <Index n={i + 1} />
              <p className="mt-3 text-lg font-bold">{p.titulo}</p>
              <p className="mt-2 text-sm leading-6 text-azul/70">{p.texto}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto max-w-3xl px-4 pb-16 sm:px-6 sm:pb-20">
        <Eyebrow>Preguntas frecuentes</Eyebrow>
        <div className="mt-6 divide-y divide-azul/12 border-y border-azul/12">
          {PREGUNTAS.map((item) => (
            <details key={item.q} className="group py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
                {item.q}
                <span className="text-naranja transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-sm leading-6 text-azul/75">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <Footer onMethodology={onMethodology} />
    </main>
  )
}
