import { axes } from '../data/axes'
import { modeInfo } from '../lib/modes'
import type { TestMode } from '../types'
import { Eyebrow, Index } from './Eyebrow'
import { Footer } from './Footer'

interface IntroProps {
  onStart: (mode: TestMode) => void
}

const MODES: TestMode[] = ['rapido', 'completo']

export function Intro({ onStart }: IntroProps) {
  return (
    <main>
      <section className="mx-auto max-w-5xl px-4 pt-14 pb-16 sm:px-6 sm:pt-20 sm:pb-24">
        <Eyebrow>Test político · Argentina</Eyebrow>
        <h1 className="mt-6 max-w-3xl text-4xl leading-[1.08] font-normal tracking-[-0.015em] sm:text-6xl">
          Dónde te <em className="font-light text-naranja">ubicás</em> en la política
          argentina
        </h1>
        <p className="mt-6 max-w-xl text-base leading-7 text-azul/75 sm:text-lg sm:leading-8">
          Respondé afirmaciones sobre economía, trabajo, seguridad, federalismo y la
          grieta. El resultado muestra tu posición en 10 ejes y la corriente política
          argentina con la que tenés más afinidad.
        </p>
      </section>

      <section className="bg-noche text-marfil">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
          <Eyebrow>Versiones</Eyebrow>
          <h2 className="mt-5 text-3xl font-bold sm:text-4xl">Elegí la profundidad</h2>
          <p className="mt-4 max-w-xl leading-7 text-marfil/70">
            Las dos versiones miden los mismos 10 ejes y muestran el resultado al
            terminar.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {MODES.map((mode, i) => {
              const info = modeInfo[mode]
              const primary = mode === 'completo'
              return (
                <article
                  key={mode}
                  className={`flex flex-col rounded-xl p-6 sm:p-8 ${
                    primary ? 'bg-marfil text-azul' : 'border border-marfil/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium tracking-[0.12em] uppercase">
                      <Index n={i + 1} /> <span className="ml-2">{info.label}</span>
                    </span>
                    {primary && (
                      <span className="text-xs font-medium tracking-[0.12em] text-naranja uppercase">
                        Recomendado
                      </span>
                    )}
                  </div>
                  <p className="mt-6 flex items-baseline gap-3">
                    <span className="text-6xl font-bold tabular-nums">
                      {info.questionCount}
                    </span>
                    <span className="text-lg">afirmaciones</span>
                  </p>
                  <p
                    className={`mt-4 leading-7 ${primary ? 'text-azul/75' : 'text-marfil/70'}`}
                  >
                    {info.description}
                  </p>
                  <p
                    className={`mt-2 text-sm ${primary ? 'text-azul/60' : 'text-marfil/60'}`}
                  >
                    Alrededor de {info.minutes} minutos
                  </p>
                  <button
                    type="button"
                    onClick={() => onStart(mode)}
                    className={`mt-8 rounded-md px-6 py-3.5 text-sm font-semibold transition-colors ${
                      primary
                        ? 'bg-azul text-marfil hover:bg-noche'
                        : 'bg-marfil text-azul hover:bg-arena'
                    }`}
                  >
                    {info.cta} →
                  </button>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <section className="bg-arena">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
          <Eyebrow>Qué mide</Eyebrow>
          <h2 className="mt-5 text-3xl font-bold sm:text-4xl">Los 10 ejes</h2>
          <p className="mt-4 max-w-xl leading-7 text-azul/75">
            Cada eje va de un polo a otro. Ninguno de los dos extremos es la respuesta
            correcta: el test describe dónde estás, no dónde deberías estar.
          </p>

          <ol className="mt-10 border-t border-azul/14">
            {axes.map((axis, i) => (
              <li
                key={axis.id}
                className="grid gap-2 border-b border-azul/14 py-5 sm:grid-cols-[3rem_14rem_1fr] sm:gap-6"
              >
                <Index n={i + 1} />
                <div>
                  <p className="font-semibold">{axis.name}</p>
                  <p className="mt-1 text-sm text-azul/70">
                    {axis.poleA.label} ↔ {axis.poleB.label}
                  </p>
                </div>
                <p className="text-sm leading-6 text-azul/75">{axis.description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <Footer />
    </main>
  )
}
