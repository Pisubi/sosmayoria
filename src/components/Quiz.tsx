import { useEffect, useMemo, useRef, useState } from 'react'
import { tests } from '../data/tests'
import { drawQuestions, variantLabel } from '../engine/selection'
import { saveProgress, type SavedProgress } from '../lib/progress'
import { collecting } from '../lib/submit'
import type { Question, Response } from '../types'
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

  const answered = answers[question.id] !== undefined
  const pct = Math.round((index / questions.length) * 100)

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-14">
      <p className="text-xs font-medium tracking-[0.12em] text-azul/55 uppercase">
        Test {test.name} · Versión {variantLabel[variant].toLowerCase()}
      </p>
      <div className="mt-4 flex items-baseline justify-between gap-4 text-sm">
        <p>
          Afirmación <span className="font-semibold tabular-nums">{index + 1}</span> de{' '}
          <span className="tabular-nums">{questions.length}</span>
        </p>
        <p className="text-azul/60 tabular-nums">{pct}% completado</p>
      </div>
      <div className="mt-3">
        <ProgressBar current={index + 1} total={questions.length} />
      </div>

      <div className="mt-6">
        <QuestionCard
          key={question.id}
          question={question}
          number={index + 1}
          value={answers[question.id]}
          onAnswer={handleAnswer}
        />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 text-sm font-semibold">
        <button
          type="button"
          disabled={index === 0}
          onClick={goBack}
          className="rounded-xl border border-azul/20 bg-papel px-4 py-3.5 hover:border-azul/50 disabled:opacity-35"
        >
          ← Anterior
        </button>
        <button
          type="button"
          disabled={!answered}
          onClick={() => handleAnswer(answers[question.id] as Response)}
          className="rounded-xl bg-azul px-4 py-3.5 text-marfil hover:bg-noche disabled:bg-azul/35"
        >
          {index + 1 < questions.length ? 'Siguiente →' : 'Terminar →'}
        </button>
      </div>
      <p className="mt-6 text-center text-xs text-azul/50">
        {collecting
          ? 'Al terminar, tus respuestas se guardan de forma anónima, con fines estadísticos.'
          : 'Tus respuestas se guardan solo en este dispositivo.'}
      </p>
    </main>
  )
}
