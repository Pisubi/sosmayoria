import { useEffect, useMemo, useRef, useState } from 'react'
import { tests } from '../data/tests'
import { drawQuestions, variantLabel } from '../engine/selection'
import { saveProgress, type SavedProgress } from '../lib/progress'
import { collecting } from '../lib/submit'
import type { Question, Response } from '../types'
import { Eyebrow } from './Eyebrow'
import { ProgressBar } from './ProgressBar'
import { QuestionCard } from './QuestionCard'

interface QuizProps {
  progress: SavedProgress
  onComplete: (questions: Question[], answers: Record<string, Response>) => void
}

export function Quiz({ progress, onComplete }: QuizProps) {
  const { testId, variant, seed } = progress
  const test = tests[testId]
  const questions = useMemo(
    () => drawQuestions(test, variant, seed),
    [test, variant, seed],
  )
  const [index, setIndex] = useState(() => Math.min(progress.index, questions.length - 1))
  const [answers, setAnswers] = useState<Record<string, Response>>(progress.answers)

  const question = questions[index]
  // Pausa breve para que se vea la opción marcada antes de pasar a la siguiente.
  const timer = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(timer.current), [])

  function handleAnswer(answer: Response) {
    const next = { ...answers, [question.id]: answer }
    setAnswers(next)
    const last = index + 1 >= questions.length
    // Se guarda antes de la pausa: una recarga en ese momento no pierde la respuesta.
    saveProgress({ ...progress, index: last ? index : index + 1, answers: next })

    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => {
      if (last) onComplete(questions, next)
      else setIndex(index + 1)
    }, 150)
  }

  function goBack() {
    window.clearTimeout(timer.current)
    setIndex((i) => Math.max(0, i - 1))
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-20">
      <p className="mb-6 text-xs font-medium tracking-[0.12em] text-azul/60 uppercase">
        Test {test.name} · Versión {variantLabel[variant].toLowerCase()}
      </p>
      <div className="flex items-center justify-between gap-4">
        <Eyebrow>¿Qué opinás?</Eyebrow>
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

      <div className="mt-10 flex items-center justify-between gap-4 text-sm">
        <button
          type="button"
          disabled={index === 0}
          onClick={goBack}
          className="font-medium text-azul/70 hover:text-azul disabled:opacity-30"
        >
          ← Anterior
        </button>
        <p className="text-right text-xs text-azul/50">
          {collecting
            ? 'Al terminar, tus respuestas se guardan de forma anónima, con fines estadísticos.'
            : 'Tus respuestas se guardan solo en este dispositivo.'}
        </p>
      </div>
    </main>
  )
}
