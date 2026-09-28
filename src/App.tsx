import { useEffect, useState } from 'react'
import { Header } from './components/Header'
import { Intro } from './components/Intro'
import { Methodology } from './components/Methodology'
import { ParticipantForm } from './components/ParticipantForm'
import { Quiz } from './components/Quiz'
import { Results, type ResultData } from './components/results/Results'
import { tests } from './data/tests'
import { acquiescence, consistency, scoreAxes } from './engine/scoring'
import { newSeed } from './engine/selection'
import { decodeResult, encodeResult } from './engine/share'
import type { Participant } from './lib/participant'
import { clearProgress, loadProgress, type SavedProgress } from './lib/progress'
import { collecting, submitResult } from './lib/submit'
import type { Question, Response, TestId, Variant } from './types'

type Stage =
  | { step: 'intro' }
  | { step: 'datos'; data: ResultData; pending: PendingSubmission }
  | { step: 'quiz'; progress: SavedProgress }
  | { step: 'results'; data: ResultData }
  | { step: 'metodologia' }

/** Lo que se envía a Supabase una vez completados los datos demográficos. */
interface PendingSubmission {
  variant: Variant
  questions: Question[]
  answers: Record<string, Response>
  seconds: number
}

function initialStage(): Stage {
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
  }, [stage])

  function goHome() {
    setSaved(loadProgress())
    setStage({ step: 'intro' })
  }

  function start(testId: TestId, variant: Variant) {
    clearProgress()
    setStage({
      step: 'quiz',
      progress: { testId, variant, seed: newSeed(), index: 0, answers: {}, startedAt: Date.now() },
    })
  }

  function finish(progress: SavedProgress, questions: Question[], answers: Record<string, Response>) {
    clearProgress()
    setSaved(null)
    const { testId, variant, startedAt } = progress
    const test = tests[testId]
    const data: ResultData = {
      testId,
      scores: scoreAxes(test.axes, questions, answers),
      acquiescence: acquiescence(answers),
      consistency: consistency(questions, answers),
      answered: Object.values(answers).filter((r) => r != null).length,
      total: questions.length,
    }
    if (!collecting) {
      setStage({ step: 'results', data })
      return
    }
    const seconds = Math.round((Date.now() - (startedAt ?? Date.now())) / 1000)
    setStage({ step: 'datos', data, pending: { variant, questions, answers, seconds } })
  }

  function showResults(data: ResultData, pending: PendingSubmission, participant: Participant | null) {
    if (participant) {
      submitResult(tests[data.testId], pending.variant, participant, pending.questions, pending.answers, pending.seconds)
    }
    setStage({ step: 'results', data })
  }

  return (
    <>
      <Header onHome={goHome} onMethodology={() => setStage({ step: 'metodologia' })} />
      {stage.step === 'intro' && (
        <Intro
          saved={saved}
          onStart={start}
          onResume={(progress) => setStage({ step: 'quiz', progress })}
          onMethodology={() => setStage({ step: 'metodologia' })}
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
          onMethodology={() => setStage({ step: 'metodologia' })}
        />
      )}
      {stage.step === 'metodologia' && <Methodology onBack={goHome} />}
    </>
  )
}

export default App
