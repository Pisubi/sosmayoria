import type { Question, Response } from '../types'

type Tone = 'acuerdo' | 'neutral' | 'desacuerdo'

const OPTIONS: { value: Exclude<Response, null>; label: string; tone: Tone; strong?: boolean }[] = [
  { value: 1, label: 'Muy de acuerdo', tone: 'acuerdo', strong: true },
  { value: 0.5, label: 'De acuerdo', tone: 'acuerdo' },
  { value: 0, label: 'Ni de acuerdo ni en desacuerdo', tone: 'neutral' },
  { value: -0.5, label: 'En desacuerdo', tone: 'desacuerdo' },
  { value: -1, label: 'Muy en desacuerdo', tone: 'desacuerdo', strong: true },
]

const TONE = {
  acuerdo: { bar: 'border-l-acuerdo', icon: 'border-acuerdo/40 bg-acuerdo/10 text-acuerdo', on: 'bg-acuerdo/10 border-acuerdo/50' },
  neutral: { bar: 'border-l-azul/30', icon: 'border-azul/25 bg-azul/5 text-azul/70', on: 'bg-azul/8 border-azul/40' },
  desacuerdo: { bar: 'border-l-desacuerdo', icon: 'border-desacuerdo/40 bg-desacuerdo/10 text-desacuerdo', on: 'bg-desacuerdo/10 border-desacuerdo/50' },
}

function Mark({ tone, strong }: { tone: Tone; strong?: boolean }) {
  const path =
    tone === 'acuerdo' ? 'M4 8.5l2.5 2.5L12 5.5' : tone === 'desacuerdo' ? 'M5 5l6 6M11 5l-6 6' : 'M4.5 8h7'
  return (
    <span className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border ${TONE[tone].icon}`}>
      <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={strong ? 2.6 : 1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d={path} />
      </svg>
    </span>
  )
}

interface QuestionCardProps {
  question: Question
  number: number
  /** undefined = sin responder; null = "No sé" */
  value: Response | undefined
  onAnswer: (answer: Response) => void
}

export function QuestionCard({ question, number, value, onAnswer }: QuestionCardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-azul/12 bg-papel p-5 shadow-[0_1px_0_rgb(30_58_71/0.06),0_12px_32px_-18px_rgb(30_58_71/0.35)] sm:p-8">
      <span
        aria-hidden
        className="pointer-events-none absolute top-2 right-4 text-7xl font-bold text-azul/[0.06] tabular-nums sm:text-8xl"
      >
        {String(number).padStart(2, '0')}
      </span>
      <p className="relative pr-10 text-2xl leading-snug font-semibold tracking-[-0.01em] sm:text-3xl sm:leading-tight">
        {question.text}
      </p>
      <div className="mt-8 grid gap-2.5">
        {OPTIONS.map((option) => {
          const selected = value === option.value
          const tone = TONE[option.tone]
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={selected}
              onClick={() => onAnswer(option.value)}
              className={`flex items-center gap-3 rounded-xl border border-l-4 px-4 py-3 text-left text-sm font-medium transition-all sm:text-base ${tone.bar} ${
                selected ? `${tone.on} translate-x-1 font-semibold` : 'border-azul/12 bg-marfil/60 hover:border-azul/30 hover:bg-marfil'
              }`}
            >
              <Mark tone={option.tone} strong={option.strong} />
              {option.label}
            </button>
          )
        })}
      </div>
      <button
        type="button"
        aria-pressed={value === null}
        onClick={() => onAnswer(null)}
        className={`mt-4 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
          value === null ? 'bg-linea text-azul' : 'text-azul/60 hover:bg-linea hover:text-azul'
        }`}
      >
        No sé / prefiero no responder
      </button>
    </div>
  )
}
