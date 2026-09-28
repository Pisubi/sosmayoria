import { useEffect, useState } from 'react'
import { Header } from './components/Header'
import { Intro } from './components/Intro'
import { Methodology } from './components/Methodology'
import { ParticipantForm } from './components/ParticipantForm'
import { Quiz } from './components/Quiz'
import { Results, type ResultData } from './components/results/Results'
import { tests } from './data/tests'
import { acquiescence, consistency, scoreAxes } from './engine/scoring'
import { drawQuestions, newSeed, VARIANT_SIZE } from './engine/selection'
import { decodeResult, encodeResult } from './engine/share'
import type { Participant } from './lib/participant'
import { clearProgress, drawnIds, loadProgress, saveProgress, type SavedProgress } from './lib/progress'
import { collecting, submitResult } from './lib/submit'
import type { Question, Response, TestId, Variant } from './types'

type Stage =
  | { step: 'intro' }
  | { step: 'datos'; data: ResultData; pending: PendingSubmission }
  | { step: 'quiz'; progress: SavedProgress }
  | { step: 'results'; data: ResultData }
  | { step: 'metodologia'; from: Stage }

/** Lo que se envía a Supabase una vez completados los datos demográficos. */
interface PendingSubmission {
  variant: Variant
  questions: Question[]
  answers: Record<string, Response>
  seconds: number
}

// El último resultado propio, para que al recargar no se muestre como compartido
// ni se pierdan los avisos y el conteo de respuestas.
const LAST_RESULT = 'brujula:resultado'

function initialStage(): Stage {
  try {
    const last = JSON.parse(sessionStorage.getItem(LAST_RESULT) ?? 'null') as { url: string; data: ResultData } | null
    if (last && last.url === window.location.pathname + window.location.search) {
      return { step: 'results', data: last.data }
    }
  } catch {
    // Sin sessionStorage: se lee el enlace como compartido.
  }
  const shared = decodeResult(window.location.search, tests)
  if (shared) return { step: 'results', data: { ...shared, shared: true } }
  return { step: 'intro' }
}

function App() {
  const [stage, setStage] = useState<Stage>(initialStage)
  const [saved, setSaved] = useState<SavedProgress | null>(() => loadProgress())

  useEffect(() => {
    window.scrollTo(0, 0)
    const url =
      stage.step === 'results'
        ? encodeResult(tests[stage.data.testId], stage.data.scores)
        : window.location.pathname
    try {
      window.history.replaceState(null, '', url)
    } catch {
      // En un iframe aislado puede no estar permitido; el test funciona igual.
    }
    if (stage.step === 'results' && !stage.data.shared) {
      try {
        sessionStorage.setItem(LAST_RESULT, JSON.stringify({ url, data: stage.data }))
      } catch {
        // Ídem.
      }
    }
  }, [stage])

  function goHome() {
    setSaved(loadProgress())
    setStage({ step: 'intro' })
  }

  function start(testId: TestId, variant: Variant) {
    clearProgress()
    const seed = newSeed()
    setStage({
      step: 'quiz',
      progress: { testId, variant, seed, ids: drawnIds(testId, variant, seed), index: 0, answers: {}, startedAt: Date.now() },
    })
  }

  function backFrom(from: Stage) {
    if (from.step === 'intro' || from.step === 'metodologia') return goHome()
    // El test en curso se retoma desde lo guardado, que tiene las respuestas más recientes.
    const progress = from.step === 'quiz' ? loadProgress() : null
    setStage(progress ? { step: 'quiz', progress } : from)
  }

  function openMethodology() {
    setStage((from) => (from.step === 'metodologia' ? from : { step: 'metodologia', from }))
  }

  function finish(progress: SavedProgress, questions: Question[], allAnswers: Record<string, Response>) {
    const { testId, variant, startedAt } = progress
    const test = tests[testId]
    // Solo cuentan las afirmaciones de esta partida.
    const answers = Object.fromEntries(
      questions.filter((q) => q.id in allAnswers).map((q) => [q.id, allAnswers[q.id]]),
    ) as Record<string, Response>
    const data: ResultData = {
      testId,
      scores: scoreAxes(test.axes, questions, answers),
      acquiescence: acquiescence(answers),
      consistency: consistency(questions, answers),
      answered: Object.values(answers).filter((r) => r != null).length,
      total: questions.length,
    }
    if (!collecting) {
      clearProgress()
      setSaved(null)
      setStage({ step: 'results', data })
      return
    }
    // Hasta enviar los datos, el test terminado queda guardado: si se recarga, se retoma acá.
    const seconds = progress.seconds ?? Math.round((Date.now() - (startedAt ?? Date.now())) / 1000)
    saveProgress({ ...progress, index: questions.length, answers, seconds })
    setStage({ step: 'datos', data, pending: { variant, questions, answers, seconds } })
  }

  function resume(progress: SavedProgress) {
    if (progress.index >= VARIANT_SIZE[progress.variant]) {
      const questions = drawQuestions(tests[progress.testId], progress.variant, progress.seed)
      finish(progress, questions, progress.answers)
    } else {
      setStage({ step: 'quiz', progress })
    }
  }

  function showResults(data: ResultData, pending: PendingSubmission, participant: Participant | null) {
    clearProgress()
    setSaved(null)
    if (participant) {
      submitResult(tests[data.testId], pending.variant, participant, pending.questions, pending.answers, pending.seconds)
    }
    setStage({ step: 'results', data })
  }

  return (
    <>
      <Header onHome={goHome} onMethodology={openMethodology} />
      {stage.step === 'intro' && (
        <Intro
          saved={saved}
          onStart={start}
          onResume={resume}
          onMethodology={openMethodology}
        />
      )}
      {stage.step === 'datos' && (
        <ParticipantForm
          onContinue={(participant) => showResults(stage.data, stage.pending, participant)}
        />
      )}
      {stage.step === 'quiz' && (
        <Quiz
          key={`${stage.progress.testId}-${stage.progress.seed}`}
          progress={stage.progress}
          onComplete={(questions, answers) => finish(stage.progress, questions, answers)}
        />
      )}
      {stage.step === 'results' && (
        <Results
          data={stage.data}
          onRestart={goHome}
          onMethodology={openMethodology}
        />
      )}
      {stage.step === 'metodologia' && (
        <Methodology
          backLabel={stage.from.step === 'results' ? 'Volver al resultado' : stage.from.step === 'intro' ? 'Volver a los tests' : 'Volver'}
          onBack={() => backFrom(stage.from)}
        />
      )}
    </>
  )
}

export default App
