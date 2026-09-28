import { useState } from 'react'
import { TEST_ORDER, tests } from '../data/tests'
import { estimatedMinutes, VARIANT_SIZE, VARIANTS, variantLabel } from '../engine/selection'
import type { SavedProgress } from '../lib/progress'
import type { TestDefinition, TestId, Variant } from '../types'
import { Eyebrow, Index } from './Eyebrow'
import { Avatar } from './Avatar'
import { Footer } from './Footer'

const STEPS = [
  {
    title: 'Respondé',
    text: 'Afirmaciones cortas sobre economía, valores, instituciones y el mundo. Si no tenés opinión, marcá "No sé": no te empuja a ningún lado.',
  },
  {
    title: 'Te ubicamos',
    text: 'Cada respuesta suma en uno o más temas. Con eso armamos tu posición y la comparamos con la de cada perfil, medida con el mismo test.',
  },
  {
    title: 'Mirá a quién te parecés',
    text: 'Ideologías, figuras históricas y actuales y partidos, cada catálogo por separado: en qué coincidís, en qué no y qué te distingue.',
  },
]

const FAQ = [
  {
    q: '¿Cómo se ubican los perfiles?',
    a: 'Cada figura, partido e ideología respondió todas las afirmaciones del test como lo haría según su trayectoria documentada (leyes, votos, decisiones de gobierno, programas y declaraciones; en las históricas, con las posiciones de su época). Su posición sale de esas respuestas con la misma fórmula que la tuya. Las respuestas de cada perfil son públicas en el repositorio.',
  },
  {
    q: '¿Por qué me tocaron afirmaciones distintas que a otra persona?',
    a: 'Cada partida sortea sus afirmaciones de un banco más grande. Las más informativas de cada tema pesan más y aparecen en todas las versiones; el resto varía. Así el test no se vuelve predecible.',
  },
  {
    q: '¿Qué significa el porcentaje?',
    a: 'Es la cercanía entre tus posiciones y las del perfil, tema por tema: 80% o más es muy cerca, menos de 50% es lejos. Importa sobre todo el orden: quién te queda más cerca dentro de cada catálogo.',
  },
  {
    q: '¿Guardan mis respuestas?',
    a: 'Si el sitio tiene activada la recolección, se guardan de forma anónima, sin nombre ni mail, con la edad, el género y el nivel educativo si decidís darlos. Nunca se guardan las de menores de 16 años.',
  },
  {
    q: '¿Es científico?',
    a: 'Es una herramienta educativa, no un diagnóstico: el test no está validado psicométricamente y las posiciones de los perfiles son una codificación, no una medición. La metodología explica cómo funciona y sus límites.',
  },
]

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
        <Eyebrow>Test político</Eyebrow>
        <h1 className="mt-6 max-w-3xl text-4xl leading-[1.08] font-normal tracking-[-0.015em] sm:text-6xl">
          Dónde te <em className="font-light text-naranja">ubicás</em> en la política
        </h1>
        <p className="mt-6 max-w-xl text-base leading-7 text-azul/75 sm:text-lg sm:leading-8">
          Respondé sobre economía, valores, instituciones y el mundo, y descubrí a qué figuras,
          partidos e ideologías te parecés, en qué coincidís y en qué te diferenciás. Sin
          etiquetas cerradas.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href="#tests"
            className="rounded-md bg-azul px-7 py-3.5 text-sm font-semibold text-marfil hover:bg-noche"
          >
            Empezar el test →
          </a>
          <a
            href="#como-funciona"
            className="rounded-md border border-azul/30 px-7 py-3.5 text-sm font-semibold hover:border-azul"
          >
            Cómo funciona
          </a>
        </div>
        {saved && <ResumeBanner saved={saved} onResume={onResume} />}
      </section>

      <section id="como-funciona" className="mx-auto max-w-5xl scroll-mt-20 px-4 pb-16 sm:px-6 sm:pb-20">
        <ol className="grid gap-4 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <li key={step.title} className="rounded-3xl border border-azul/12 bg-papel p-6">
              <Index n={i + 1} />
              <p className="mt-3 text-lg font-bold">{step.title}</p>
              <p className="mt-2 text-sm leading-6 text-azul/70">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section id="tests" className="scroll-mt-16 bg-noche text-marfil">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
          <Eyebrow>Elegí el test</Eyebrow>
          <h2 className="mt-5 text-3xl font-bold sm:text-4xl">Dos tests, tres versiones</h2>
          <p className="mt-4 max-w-xl leading-7 text-marfil/70">
            La corta alcanza para ubicarte; la completa y la a fondo afinan el resultado. Podés
            responder "No sé" cuando no tengas una opinión formada.
          </p>
          <div className="mt-10 grid gap-4 lg:grid-cols-2">
            {TEST_ORDER.map((id, i) => (
              <TestCard key={id} test={tests[id]} index={i + 1} onStart={onStart} />
            ))}
          </div>
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
            const members = test.profiles.filter((p) => p.catalog === catalog.id)
            const names = members.map((p) => p.name)
            return (
              <div key={catalog.id}>
                <div className="mb-3 flex -space-x-2">
                  {members.slice(0, 8).map((p) => (
                    <span key={p.id} className="rounded-full ring-2 ring-marfil">
                      <Avatar testId={test.id} profile={p} size={36} />
                    </span>
                  ))}
                </div>
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

      <section className="bg-arena">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="max-w-xl text-sm leading-6 text-azul/75">
              Las afirmaciones recorren estos temas. Ninguna respuesta es la correcta: el test
              describe dónde estás, no dónde deberías estar.
            </p>
            <TestTabs value={tab} onChange={setTab} />
          </div>
          <ul className="mt-6 flex flex-wrap gap-2">
            {test.axes.map((axis) => (
              <li
                key={axis.id}
                title={axis.description}
                className="rounded-full border border-azul/20 px-3.5 py-1.5 text-sm text-azul/80"
              >
                {axis.name}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
        <Eyebrow>Preguntas frecuentes</Eyebrow>
        <div className="mt-6 divide-y divide-azul/12 border-y border-azul/12">
          {FAQ.map((item) => (
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

function ResumeBanner({
  saved,
  onResume,
}: {
  saved: SavedProgress
  onResume: (progress: SavedProgress) => void
}) {
  const test = tests[saved.testId]
  const total = VARIANT_SIZE[saved.variant]
  return (
    <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-azul/14 bg-linea/60 p-5">
      <p className="text-sm leading-6">
        {saved.index >= total ? 'Terminaste el test' : 'Tenés un test sin terminar:'}{' '}
        <span className="font-semibold">
          {test.name}, versión {variantLabel[saved.variant].toLowerCase()}
        </span>{' '}
        {saved.index >= total ? 'y falta ver tu resultado.' : `(${Object.keys(saved.answers).length} de ${total} respondidas).`}
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
        {test.profiles.length} perfiles para comparar
      </p>
      <div className="mt-8 grid gap-2">
        {VARIANTS.map((variant) => {
          const count = VARIANT_SIZE[variant]
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
