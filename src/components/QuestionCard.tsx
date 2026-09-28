import type { Question, Response } from '../types'

const OPTIONS: { value: Exclude<Response, null>; label: string }[] = [
  { value: -1, label: 'Muy en desacuerdo' },
  { value: -0.5, label: 'En desacuerdo' },
  { value: 0, label: 'Neutral' },
  { value: 0.5, label: 'De acuerdo' },
  { value: 1, label: 'Muy de acuerdo' },
]

interface QuestionCardProps {
  question: Question
  /** undefined = sin responder; null = "No sé" */
  value: Response | undefined
  onAnswer: (answer: Response) => void
}

export function QuestionCard({ question, value, onAnswer }: QuestionCardProps) {
  return (
    <div>
      <p className="text-2xl leading-snug font-normal sm:text-4xl sm:leading-tight">
        {question.text}
      </p>
      <div className="mt-10 grid grid-cols-1 gap-2 sm:grid-cols-5">
        {OPTIONS.map((option) => {
          const selected = value === option.value
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={selected}
              onClick={() => onAnswer(option.value)}
              className={`rounded-md border px-4 py-3.5 text-left text-sm font-medium transition-colors sm:text-center ${
                selected
                  ? 'border-azul bg-azul text-marfil'
                  : 'border-azul/20 bg-transparent hover:border-azul hover:bg-linea'
              }`}
            >
              {option.label}
            </button>
          )
        })}
      </div>
      <button
        type="button"
        aria-pressed={value === null}
        onClick={() => onAnswer(null)}
        className={`mt-3 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
          value === null ? 'bg-linea text-azul' : 'text-azul/60 hover:bg-linea hover:text-azul'
        }`}
      >
        No sé / prefiero no responder
      </button>
    </div>
  )
}
