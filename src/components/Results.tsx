import { useMemo } from 'react'
import { matchArchetypes } from '../data/archetypes'
import { computeAxisResults, scoresByAxisId } from '../lib/scoring'
import type { Answer, Question } from '../types'
import { AffinityBars } from './AffinityBars'
import { AxisBreakdown } from './AxisBreakdown'
import { AxisRadarChart } from './AxisRadarChart'
import { Eyebrow } from './Eyebrow'
import { Footer } from './Footer'

interface ResultsProps {
  questions: Question[]
  answers: Record<string, Answer>
  onRestart: () => void
}

export function Results({ questions, answers, onRestart }: ResultsProps) {
  const results = useMemo(
    () => computeAxisResults(questions, answers),
    [questions, answers],
  )
  const matches = useMemo(() => matchArchetypes(scoresByAxisId(results)), [results])
  const top = matches[0]
  const n = questions.length

  return (
    <main>
      <section className="bg-noche text-marfil">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-24">
          <Eyebrow>Tu resultado</Eyebrow>
          <h1 className="mt-6 max-w-3xl text-4xl leading-[1.1] font-normal tracking-[-0.015em] sm:text-6xl">
            Tu perfil más cercano es{' '}
            <em className="font-light text-naranja">{top.archetype.name}</em>
          </h1>
          <p className="mt-6 max-w-2xl leading-7 text-marfil/75 sm:text-lg sm:leading-8">
            {top.archetype.description}
          </p>
          <div className="mt-10 flex items-baseline gap-4 border-t border-marfil/20 pt-8">
            <span className="text-5xl font-bold text-naranja tabular-nums sm:text-6xl">
              {Math.round(top.similarity)}%
            </span>
            <span className="max-w-xs text-sm leading-6 text-marfil/70">
              de afinidad con este perfil, sobre {n} afirmaciones respondidas
            </span>
          </div>
        </div>
      </section>

      <Section
        eyebrow="01 · Mapa"
        title="Tu posición en los 10 ejes"
        note="El centro del gráfico corresponde al primer polo de cada eje y el borde al segundo; el anillo medio es la posición neutral."
      >
        <AxisRadarChart results={results} />
      </Section>

      <Section
        eyebrow="02 · Detalle"
        title="Eje por eje"
        note="Escala de −100 a +100 por eje, medida desde la posición neutral. En naranja, el eje donde tu postura es más marcada."
      >
        <AxisBreakdown results={results} />
      </Section>

      <Section
        eyebrow="03 · Afinidad"
        title="Cercanía con cada perfil"
        note="Similitud entre tus respuestas y seis perfiles de referencia de la política argentina, de 0 a 100%."
      >
        <AffinityBars matches={matches} />
      </Section>

      <section className="bg-arena">
        <div className="mx-auto max-w-5xl px-4 py-16 text-center sm:px-6">
          <p className="text-2xl font-bold">¿Querés comparar?</p>
          <p className="mx-auto mt-3 max-w-md leading-7 text-azul/75">
            Volvé a hacer el test o probá la otra versión para ver si tu perfil cambia.
          </p>
          <button
            type="button"
            onClick={onRestart}
            className="mt-8 rounded-md bg-azul px-8 py-3.5 text-sm font-semibold text-marfil transition-colors hover:bg-noche"
          >
            Volver a hacer el test
          </button>
        </div>
      </section>

      <Footer />
    </main>
  )
}

interface SectionProps {
  eyebrow: string
  title: string
  note: string
  children: React.ReactNode
}

function Section({ eyebrow, title, note, children }: SectionProps) {
  return (
    <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="mt-5 text-3xl font-bold sm:text-4xl">{title}</h2>
      <p className="mt-4 max-w-2xl text-sm leading-6 text-azul/70">{note}</p>
      <div className="mt-10">{children}</div>
    </section>
  )
}
