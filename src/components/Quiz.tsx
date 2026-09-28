import { useMemo, useState } from 'react'
import { axes } from '../data/axes'
import { getQuestionsForMode } from '../lib/modes'
import type { Answer, Question, TestMode } from '../types'
import { Eyebrow } from './Eyebrow'
import { ProgressBar } from './ProgressBar'
import { QuestionCard } from './QuestionCard'

interface QuizProps {
  mode: TestMode
  onComplete: (questions: Question[], answers: Record<string, Answer>) => void
}

const axisNameById = Object.fromEntries(axes.map((a) => [a.id, a.name]))

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
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-20">
      <div className="flex items-center justify-between gap-4">
        <Eyebrow>{axisNameById[question.axisId]}</Eyebrow>
        <p className="text-sm text-azul/60 tabular-nums">
          {String(index + 1).padStart(2, '0')} / {questions.length}
        </p>
      </div>
      <div className="mt-4">
        <ProgressBar current={index + 1} total={questions.length} />
      </div>

      <div className="mt-12">
        <QuestionCard
          key={question.id}
          question={question}
          value={answers[question.id]}
          onAnswer={handleAnswer}
        />
      </div>

      <button
        type="button"
        disabled={index === 0}
        onClick={() => setIndex((i) => Math.max(0, i - 1))}
        className="mt-10 text-sm font-medium text-azul/70 hover:text-azul disabled:opacity-30"
      >
        ← Anterior
      </button>
    </main>
  )
}
