import { useState } from 'react'
import { TEST_ORDER, tests } from '../data/tests'
import { estimatedMinutes, questionsFor, VARIANTS, variantLabel } from '../engine/selection'
import type { SavedProgress } from '../lib/progress'
import type { TestDefinition, TestId, Variant } from '../types'
import { Eyebrow, Index } from './Eyebrow'
import { Footer } from './Footer'

interface IntroProps {
  saved: SavedProgress | null
  onStart: (testId: TestId, variant: Variant) => void
  onResume: (progress: SavedProgress) => void
  onMethodology: () => void
}

export function Intro({ saved, onStart, onResume, onMethodology }: IntroProps) {
  const [tab, setTab] = useState<TestId>('intl')
  const test = tests[tab]

  return (
    <main>
      <section className="mx-auto max-w-5xl px-4 pt-14 pb-16 sm:px-6 sm:pt-20 sm:pb-24">
        <Eyebrow>Test político multidimensional</Eyebrow>
        <h1 className="mt-6 max-w-3xl text-4xl leading-[1.08] font-normal tracking-[-0.015em] sm:text-6xl">
          Dónde te <em className="font-light text-naranja">ubicás</em> en la política
        </h1>
        <p className="mt-6 max-w-xl text-base leading-7 text-azul/75 sm:text-lg sm:leading-8">
          Dos tests con doce ejes cada uno. El resultado no te encasilla: muestra tu posición en
          cada eje y en qué coincidís y en qué te diferenciás de ideologías, tradiciones, figuras
          y partidos.
        </p>
        {saved && <ResumeBanner saved={saved} onResume={onResume} />}
      </section>

      <section className="bg-noche text-marfil">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
          <Eyebrow>Elegí el test</Eyebrow>
          <h2 className="mt-5 text-3xl font-bold sm:text-4xl">Dos tests, tres versiones</h2>
          <p className="mt-4 max-w-xl leading-7 text-marfil/70">
            La versión corta tiene seis afirmaciones por eje; la completa, diez, y la a fondo, todas.
            Podés responder "No sé" cuando no tengas una opinión formada.
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
                  <p className="font-semibold">
                    {axis.name}
                    {!axis.includeInMatching && (
                      <span className="ml-2 text-xs font-medium tracking-[0.12em] text-naranja uppercase">
                        Aparte
                      </span>
                    )}
                  </p>
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

      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
        <Eyebrow>Con qué te comparamos</Eyebrow>
        <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-3xl font-bold sm:text-4xl">
            {test.profiles.length} perfiles en {test.catalogs.length} catálogos
          </h2>
          <TestTabs value={tab} onChange={setTab} />
        </div>
        <p className="mt-4 max-w-xl leading-7 text-azul/75">
          Los catálogos se comparan por separado: una ideología, una figura histórica y un partido
          no se miden con la misma vara.
        </p>
        <div className="mt-10 grid gap-10 border-t border-azul/14 pt-8 sm:grid-cols-2">
          {test.catalogs.map((catalog) => {
            const names = test.profiles
              .filter((p) => p.catalog === catalog.id)
              .map((p) => p.name)
            return (
              <div key={catalog.id}>
                <p className="font-semibold">
                  {catalog.name} <span className="font-normal text-azul/60">· {names.length}</span>
                </p>
                <p className="mt-1 text-sm text-azul/60">{catalog.description}</p>
                <p className="mt-3 text-sm leading-6 text-azul/75">
                  {names.slice(0, 14).join(' · ')}
                  {names.length > 14 && ` · y ${names.length - 14} más`}
                </p>
              </div>
            )
          })}
        </div>
      </section>

      <Footer onMethodology={onMethodology} />
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
  const total = questionsFor(test, saved.variant).length
  return (
    <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-azul/14 bg-linea/60 p-5">
      <p className="text-sm leading-6">
        Tenés un test sin terminar:{' '}
        <span className="font-semibold">
          {test.name}, versión {variantLabel[saved.variant].toLowerCase()}
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
  onStart: (testId: TestId, variant: Variant) => void
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
        {test.axes.length} ejes · {test.profiles.length} perfiles
      </p>
      <div className="mt-8 grid gap-2">
        {VARIANTS.map((variant) => {
          const count = questionsFor(test, variant).length
          const primary = variant === 'full'
          return (
            <button
              key={variant}
              type="button"
              onClick={() => onStart(test.id, variant)}
              className={`flex flex-wrap items-center justify-between gap-x-3 gap-y-1 rounded-md px-5 py-3.5 text-left text-sm transition-colors ${
                primary
                  ? 'bg-marfil text-azul hover:bg-arena'
                  : 'border border-marfil/25 hover:border-marfil hover:bg-marfil/5'
              }`}
            >
              <span>
                <span className="font-semibold">{variantLabel[variant]}</span>
                {primary && (
                  <span className="ml-2 text-xs font-medium tracking-[0.12em] text-naranja uppercase">
                    Recomendada
                  </span>
                )}
              </span>
              <span className={`tabular-nums ${primary ? 'text-azul/70' : 'text-marfil/70'}`}>
                {count} afirmaciones · {estimatedMinutes(count)} min →
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
