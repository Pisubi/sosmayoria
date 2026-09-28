import { useState } from 'react'
import { TEST_ORDER, tests } from '../data/tests'
import { estimatedMinutes, MODE_ORDER, modeInfo, questionCount } from '../lib/modes'
import type { SavedProgress } from '../lib/progress'
import type { TestDefinition, TestId, TestMode } from '../types'
import { Eyebrow, Index } from './Eyebrow'
import { Footer } from './Footer'

interface IntroProps {
  saved: SavedProgress | null
  onStart: (testId: TestId, mode: TestMode) => void
  onResume: (progress: SavedProgress) => void
}

export function Intro({ saved, onStart, onResume }: IntroProps) {
  const [tab, setTab] = useState<TestId>('internacional')
  const test = tests[tab]

  return (
    <main>
      <section className="mx-auto max-w-5xl px-4 pt-14 pb-16 sm:px-6 sm:pt-20 sm:pb-24">
        <Eyebrow>Test político</Eyebrow>
        <h1 className="mt-6 max-w-3xl text-4xl leading-[1.08] font-normal tracking-[-0.015em] sm:text-6xl">
          Dónde te <em className="font-light text-naranja">ubicás</em> en la política
        </h1>
        <p className="mt-6 max-w-xl text-base leading-7 text-azul/75 sm:text-lg sm:leading-8">
          Dos tests con ejes propios. El internacional te compara con figuras históricas y
          actuales de todo el mundo; el argentino, con la política del país de Yrigoyen a hoy.
        </p>
        {saved && <ResumeBanner saved={saved} onResume={onResume} />}
      </section>

      <section className="bg-noche text-marfil">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
          <Eyebrow>Elegí el test</Eyebrow>
          <h2 className="mt-5 text-3xl font-bold sm:text-4xl">Dos tests, tres versiones</h2>
          <p className="mt-4 max-w-xl leading-7 text-marfil/70">
            Cada test tiene una versión rápida, una completa y una a fondo. Cuantas más
            afirmaciones respondas, más preciso es el resultado.
          </p>

          <div className="mt-10 grid gap-4 lg:grid-cols-2">
            {TEST_ORDER.map((id, i) => (
              <TestCard key={id} test={tests[id]} index={i + 1} onStart={onStart} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-arena">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
          <Eyebrow>Qué mide</Eyebrow>
          <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
            <h2 className="text-3xl font-bold sm:text-4xl">Los ejes</h2>
            <TestTabs value={tab} onChange={setTab} />
          </div>
          <p className="mt-4 max-w-xl leading-7 text-azul/75">
            Cada eje va de un polo a otro. Ningún extremo es la respuesta correcta: el test
            describe dónde estás, no dónde deberías estar.
          </p>

          <ol className="mt-10 border-t border-azul/14">
            {test.axes.map((axis, i) => (
              <li
                key={axis.id}
                className="grid gap-2 border-b border-azul/14 py-5 sm:grid-cols-[3rem_16rem_1fr] sm:gap-6"
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

      <Comparisons test={test} tab={tab} onTabChange={setTab} />

      <Footer />
    </main>
  )
}

function ResumeBanner({
  saved,
  onResume,
}: {
  saved: SavedProgress
  onResume: (progress: SavedProgress) => void
}) {
  const test = tests[saved.testId]
  const total = questionCount(test, saved.mode)
  return (
    <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-azul/14 bg-linea/60 p-5">
      <p className="text-sm leading-6">
        Tenés un test sin terminar:{' '}
        <span className="font-semibold">
          {test.name}, versión {modeInfo[saved.mode].label.toLowerCase()}
        </span>{' '}
        ({saved.index} de {total}).
      </p>
      <button
        type="button"
        onClick={() => onResume(saved)}
        className="rounded-md bg-azul px-5 py-2.5 text-sm font-semibold text-marfil hover:bg-noche"
      >
        Continuar →
      </button>
    </div>
  )
}

function TestCard({
  test,
  index,
  onStart,
}: {
  test: TestDefinition
  index: number
  onStart: (testId: TestId, mode: TestMode) => void
}) {
  return (
    <article className="flex flex-col rounded-xl border border-marfil/20 p-6 sm:p-8">
      <p className="text-xs font-medium tracking-[0.12em] uppercase">
        <Index n={index} /> <span className="ml-2">Test</span>
      </p>
      <h3 className="mt-4 text-4xl font-bold">{test.name}</h3>
      <p className="mt-1 text-lg">
        <em className="font-light text-naranja">{test.tagline}</em>
      </p>
      <p className="mt-4 leading-7 text-marfil/70">{test.description}</p>
      <p className="mt-4 text-sm text-marfil/60">
        {test.axes.length} ejes · {test.figures.length} figuras · {test.parties.length} partidos
      </p>

      <div className="mt-8 grid gap-2">
        {MODE_ORDER.map((mode) => {
          const primary = mode === 'completa'
          return (
            <button
              key={mode}
              type="button"
              onClick={() => onStart(test.id, mode)}
              className={`flex flex-wrap items-center justify-between gap-x-3 gap-y-1 rounded-md px-5 py-3.5 text-left text-sm transition-colors ${
                primary
                  ? 'bg-marfil text-azul hover:bg-arena'
                  : 'border border-marfil/25 hover:border-marfil hover:bg-marfil/5'
              }`}
            >
              <span>
                <span className="font-semibold">{modeInfo[mode].label}</span>
                {primary && (
                  <span className="ml-2 text-xs font-medium tracking-[0.12em] text-naranja uppercase">
                    Recomendada
                  </span>
                )}
              </span>
              <span className={`tabular-nums ${primary ? 'text-azul/70' : 'text-marfil/70'}`}>
                {questionCount(test, mode)} afirmaciones · {estimatedMinutes(test, mode)} min →
              </span>
            </button>
          )
        })}
      </div>
    </article>
  )
}

function TestTabs({ value, onChange }: { value: TestId; onChange: (id: TestId) => void }) {
  return (
    <div role="tablist" className="inline-flex rounded-md border border-azul/20 p-1">
      {TEST_ORDER.map((id) => (
        <button
          key={id}
          type="button"
          role="tab"
          aria-selected={value === id}
          onClick={() => onChange(id)}
          className={`rounded px-4 py-2 text-sm font-semibold transition-colors ${
            value === id ? 'bg-azul text-marfil' : 'text-azul/70 hover:text-azul'
          }`}
        >
          {tests[id].name}
        </button>
      ))}
    </div>
  )
}

function Comparisons({
  test,
  tab,
  onTabChange,
}: {
  test: TestDefinition
  tab: TestId
  onTabChange: (id: TestId) => void
}) {
  const historic = test.figures.filter((f) => f.era === 'historica')
  const current = test.figures.filter((f) => f.era === 'actual')
  const label = (name: string, country: string) =>
    test.id === 'internacional' ? `${name} (${country})` : name

  return (
    <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
      <Eyebrow>Con quién te comparamos</Eyebrow>
      <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
        <h2 className="text-3xl font-bold sm:text-4xl">
          {test.figures.length} figuras y {test.parties.length} partidos
        </h2>
        <TestTabs value={tab} onChange={onTabChange} />
      </div>
      <p className="mt-4 max-w-xl leading-7 text-azul/75">
        Sus posiciones son estimaciones editoriales basadas en programas, decisiones de
        gobierno y declaraciones públicas.
      </p>

      <div className="mt-10 grid gap-10 border-t border-azul/14 pt-8 sm:grid-cols-2">
        <NameList title="Históricas" names={historic.map((f) => label(f.name, f.country))} />
        <NameList title="Actuales" names={current.map((f) => label(f.name, f.country))} />
      </div>
    </section>
  )
}

function NameList({ title, names }: { title: string; names: string[] }) {
  return (
    <div>
      <p className="font-semibold">
        {title} <span className="font-normal text-azul/60">· {names.length}</span>
      </p>
      <ul className="mt-4 space-y-2 text-sm text-azul/75">
        {names.map((name) => (
          <li key={name} className="flex items-center gap-3">
            <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full bg-naranja" />
            {name}
          </li>
        ))}
      </ul>
    </div>
  )
}
