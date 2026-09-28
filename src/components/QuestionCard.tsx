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
    <div className="rounded-2xl border border-ink/10 bg-cream-soft p-6 sm:p-8 dark:border-cream/10 dark:bg-white/5">
      <p className="text-xl font-semibold sm:text-2xl">{question.text}</p>
      <div className="mt-8 grid grid-cols-1 gap-2 sm:grid-cols-5">
        {LIKERT_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onAnswer(option.value)}
            className={`rounded-xl border px-3 py-3 text-sm font-medium transition ${
              value === option.value
                ? 'border-forest bg-forest text-cream'
                : 'border-ink/15 bg-transparent hover:border-forest hover:bg-forest/10 dark:border-cream/15'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}
