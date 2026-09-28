import { useMemo } from 'react'
import { axes } from '../data/axes'
import { figures, parties } from '../data/references'
import { rankMatches, type Match } from '../lib/matching'
import { computeAxisResults, scoresByAxisId } from '../lib/scoring'
import type { Answer, Question } from '../types'
import { AxisBreakdown } from './AxisBreakdown'
import { AxisRadarChart } from './AxisRadarChart'
import { Eyebrow } from './Eyebrow'
import { Footer } from './Footer'
import { RankingList } from './RankingList'

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
  const scores = useMemo(() => scoresByAxisId(results), [results])

  const figureMatches = useMemo(() => rankMatches(scores, figures), [scores])
  const argentineParties = useMemo(
    () => rankMatches(scores, parties.filter((p) => p.country === 'Argentina')),
    [scores],
  )
  const worldParties = useMemo(
    () => rankMatches(scores, parties.filter((p) => p.country !== 'Argentina')),
    [scores],
  )

  const topFigure = figureMatches[0]

  return (
    <main>
      <section className="bg-noche text-marfil">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-24">
          <Eyebrow>Tu resultado</Eyebrow>
          <h1 className="mt-6 max-w-3xl text-4xl leading-[1.1] font-normal tracking-[-0.015em] sm:text-6xl">
            La figura más cercana a tu perfil es{' '}
            <em className="font-light text-naranja">{topFigure.reference.name}</em>
          </h1>
          <p className="mt-6 max-w-2xl leading-7 text-marfil/75 sm:text-lg sm:leading-8">
            {topFigure.reference.description}
          </p>

          <div className="mt-12 grid gap-px overflow-hidden rounded-xl border border-marfil/20 bg-marfil/20 sm:grid-cols-3">
            <Highlight label="Figura" match={topFigure} />
            <Highlight label="Partido en Argentina" match={argentineParties[0]} />
            <Highlight label="Partido en el mundo" match={worldParties[0]} />
          </div>
          <p className="mt-4 text-xs leading-5 text-marfil/60">
            Afinidad de 0 a 100% sobre {questions.length} afirmaciones respondidas.
          </p>
        </div>
      </section>

      <Section
        eyebrow="01 · Mapa"
        title={`Tu posición en los ${axes.length} ejes`}
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
        eyebrow="03 · Figuras"
        title="A quién te parecés"
        note={`Cercanía con ${figures.length} figuras políticas de Argentina y del mundo. ${DISCLAIMER}`}
      >
        <RankingList matches={figureMatches} />
      </Section>

      <Section
        eyebrow="04 · Partidos"
        title="Con qué partido coincidís"
        note={`Cercanía con ${parties.length} partidos y espacios. ${DISCLAIMER}`}
      >
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-10">
          <div>
            <h3 className="mb-4 text-lg font-bold">En Argentina</h3>
            <RankingList matches={argentineParties} initialCount={6} showCountry={false} />
          </div>
          <div>
            <h3 className="mb-4 text-lg font-bold">En el resto del mundo</h3>
            <RankingList matches={worldParties} />
          </div>
        </div>
      </Section>

      <section className="bg-arena">
        <div className="mx-auto max-w-5xl px-4 py-16 text-center sm:px-6">
          <p className="text-2xl font-bold">¿Querés comparar?</p>
          <p className="mx-auto mt-3 max-w-md leading-7 text-azul/75">
            Volvé a hacer el test o probá la otra versión para ver si tu resultado cambia.
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

const DISCLAIMER =
  'Las posiciones de partidos y figuras son estimaciones editoriales basadas en programas y declaraciones públicas.'

function Highlight({ label, match }: { label: string; match: Match }) {
  return (
    <div className="bg-noche p-5 sm:p-6">
      <p className="text-xs font-medium tracking-[0.12em] text-marfil/60 uppercase">{label}</p>
      <p className="mt-3 text-lg leading-snug font-semibold">{match.reference.name}</p>
      <p className="text-xs text-marfil/60">{match.reference.country}</p>
      <p className="mt-4 text-3xl font-bold text-naranja tabular-nums">
        {Math.round(match.similarity)}%
      </p>
    </div>
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
