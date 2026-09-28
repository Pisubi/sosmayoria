import type { Answer, Question } from '../types'

const LIKERT_OPTIONS: { value: Answer; label: string }[] = [
  { value: 1, label: 'Muy en desacuerdo' },
  { value: 2, label: 'En desacuerdo' },
  { value: 3, label: 'Neutral' },
  { value: 4, label: 'De acuerdo' },
  { value: 5, label: 'Muy de acuerdo' },
]

interface QuestionCardProps {
  question: Question
  value?: Answer
  onAnswer: (answer: Answer) => void
}

export function QuestionCard({ question, value, onAnswer }: QuestionCardProps) {
  return (
    <div>
      <p className="text-2xl leading-snug font-normal sm:text-4xl sm:leading-tight">
        {question.text}
      </p>
      <div className="mt-10 grid grid-cols-1 gap-2 sm:grid-cols-5">
        {LIKERT_OPTIONS.map((option) => {
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
    </div>
  )
}
