import { axes } from '../data/axes'
import { modeInfo } from '../lib/modes'
import type { TestMode } from '../types'

interface IntroProps {
  onStart: (mode: TestMode) => void
}

export function Intro({ onStart }: IntroProps) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:py-16">
      <header className="mb-10 text-center">
        <p className="text-sm font-semibold tracking-wide text-amber uppercase">
          10 ejes · Argentina
        </p>
        <h1 className="mt-2 text-4xl font-bold text-forest sm:text-5xl dark:text-forest-light">
          ¿Dónde te ubicás en la política argentina?
        </h1>
        <p className="mt-4 text-lg text-ink/70 dark:text-cream/70">
          Respondé afirmaciones sobre economía, trabajo, seguridad, la grieta y más. Al
          final vas a ver tu posición en cada eje y con qué corriente política argentina
          tenés más afinidad.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {(Object.keys(modeInfo) as TestMode[]).map((mode) => {
          const info = modeInfo[mode]
          const recommended = mode === 'completo'
          return (
            <button
              key={mode}
              type="button"
              onClick={() => onStart(mode)}
              className={`flex flex-col items-start gap-3 rounded-2xl border p-6 text-left transition hover:-translate-y-0.5 hover:shadow-lg ${
                recommended
                  ? 'border-forest bg-forest text-cream'
                  : 'border-ink/10 bg-cream-soft text-ink dark:border-cream/10 dark:bg-white/5 dark:text-cream'
              }`}
            >
              {recommended && (
                <span className="rounded-full bg-amber px-3 py-1 text-xs font-bold text-ink uppercase">
                  Recomendado
                </span>
              )}
              <span className="text-3xl font-bold">{info.questionCount}</span>
              <span className="text-sm opacity-80">preguntas</span>
              <p className="text-sm opacity-90">{info.description}</p>
              <span className="text-sm font-medium opacity-70">
                ~{info.minutes} min · Empezar {info.label.toLowerCase()} →
              </span>
            </button>
          )
        })}
      </div>

      <section className="mt-14">
        <p className="text-sm font-semibold tracking-wide text-amber uppercase">
          Los 10 ejes
        </p>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {axes.map((axis, i) => (
            <li
              key={axis.id}
              className="rounded-xl border border-ink/10 p-4 dark:border-cream/10"
            >
              <p className="text-xs font-semibold text-ink/50 dark:text-cream/50">
                {String(i + 1).padStart(2, '0')}
              </p>
              <p className="font-semibold">{axis.name}</p>
              <p className="text-sm text-ink/60 dark:text-cream/60">
                {axis.poleA.label} ↔ {axis.poleB.label}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
