import { useMemo, useState } from 'react'
import { getQuestionsForMode } from '../lib/modes'
import type { Answer, Question, TestMode } from '../types'
import { ProgressBar } from './ProgressBar'
import { QuestionCard } from './QuestionCard'

interface QuizProps {
  mode: TestMode
  onComplete: (questions: Question[], answers: Record<string, Answer>) => void
}

export function Quiz({ mode, onComplete }: QuizProps) {
  const questions = useMemo(() => getQuestionsForMode(mode), [mode])
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, Answer>>({})

  const question = questions[index]

  function handleAnswer(answer: Answer) {
    const next = { ...answers, [question.id]: answer }
    setAnswers(next)

    window.setTimeout(() => {
      if (index + 1 < questions.length) {
        setIndex(index + 1)
      } else {
        onComplete(questions, next)
      }
    }, 150)
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:py-16">
      <ProgressBar current={index + 1} total={questions.length} />
      <div className="mt-6">
        <QuestionCard
          key={question.id}
          question={question}
          value={answers[question.id]}
          onAnswer={handleAnswer}
        />
      </div>
      <div className="mt-6 flex justify-between text-sm">
        <button
          type="button"
          disabled={index === 0}
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          className="font-medium text-ink/60 disabled:opacity-30 dark:text-cream/60"
        >
          ← Anterior
        </button>
      </div>
    </div>
  )
}
