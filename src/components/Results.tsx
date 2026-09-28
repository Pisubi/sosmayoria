import { useMemo } from 'react'
import { matchArchetypes } from '../data/archetypes'
import { computeAxisResults, scoresByAxisId } from '../lib/scoring'
import type { Answer, Question } from '../types'
import { ArchetypeCard } from './ArchetypeCard'
import { AxisBreakdown } from './AxisBreakdown'
import { AxisRadarChart } from './AxisRadarChart'

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
  const matches = useMemo(
    () => matchArchetypes(scoresByAxisId(results)),
    [results],
  )
  const [top, ...rest] = matches

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:py-16">
      <header className="text-center">
        <p className="text-sm font-semibold tracking-wide text-amber uppercase">
          Tu resultado
        </p>
        <h1 className="mt-2 text-3xl font-bold text-forest sm:text-4xl dark:text-forest-light">
          Tu corriente más cercana: {top.archetype.name}
        </h1>
      </header>

      <div className="mt-8">
        <ArchetypeCard match={top} primary />
      </div>

      <section className="mt-10">
        <h2 className="text-lg font-bold">Tu mapa en los 10 ejes</h2>
        <div className="mt-4 rounded-2xl border border-ink/10 bg-cream-soft p-4 dark:border-cream/10 dark:bg-white/5">
          <AxisRadarChart results={results} />
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-bold">Eje por eje</h2>
        <div className="mt-4 rounded-2xl border border-ink/10 bg-cream-soft p-6 dark:border-cream/10 dark:bg-white/5">
          <AxisBreakdown results={results} />
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-bold">Otras corrientes cercanas</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {rest.map((match) => (
            <ArchetypeCard key={match.archetype.id} match={match} />
          ))}
        </div>
      </section>

      <div className="mt-12 text-center">
        <button
          type="button"
          onClick={onRestart}
          className="rounded-full border border-forest px-6 py-3 font-semibold text-forest transition hover:bg-forest hover:text-cream dark:border-forest-light dark:text-forest-light"
        >
          Volver a hacer el test
        </button>
      </div>
    </div>
  )
}
