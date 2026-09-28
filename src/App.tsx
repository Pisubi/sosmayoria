import { useEffect, useState } from 'react'
import { Header } from './components/Header'
import { Intro } from './components/Intro'
import { Methodology } from './components/Methodology'
import { ParticipantForm } from './components/ParticipantForm'
import { Quiz } from './components/Quiz'
import { Results, type ResultData } from './components/results/Results'
import { tests } from './data/tests'
import { acquiescence, scoreAxes } from './engine/scoring'
import { newSeed } from './engine/selection'
import { decodeResult, encodeResult } from './engine/share'
import type { Participant } from './lib/participant'
import { clearProgress, loadProgress, type SavedProgress } from './lib/progress'
import { collecting, submitResult } from './lib/submit'
import type { Question, Response, TestId, Variant } from './types'

type Stage =
  | { step: 'intro' }
  | { step: 'datos'; testId: TestId; variant: Variant }
  | { step: 'quiz'; progress: SavedProgress }
  | { step: 'results'; data: ResultData }
  | { step: 'metodologia' }

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
    if (collecting) setStage({ step: 'datos', testId, variant })
    else begin(testId, variant, null)
  }

  function begin(testId: TestId, variant: Variant, participant: Participant | null) {
    setStage({
      step: 'quiz',
      progress: {
        testId,
        variant,
        seed: newSeed(),
        index: 0,
        answers: {},
        participant,
        startedAt: Date.now(),
      },
    })
  }

  function finish(progress: SavedProgress, questions: Question[], answers: Record<string, Response>) {
    clearProgress()
    setSaved(null)
    const { testId, variant, participant, startedAt } = progress
    const test = tests[testId]
    if (participant) submitResult(test, variant, participant, answers, startedAt ?? Date.now())
    setStage({
      step: 'results',
      data: {
        testId,
        scores: scoreAxes(test.axes, questions, answers),
        acquiescence: acquiescence(answers),
        answered: Object.values(answers).filter((r) => r != null).length,
        total: questions.length,
      },
    })
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
          onContinue={(participant) => begin(stage.testId, stage.variant, participant)}
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
