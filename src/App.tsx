import { useEffect, useState } from 'react'
import { Header } from './components/Header'
import { Intro } from './components/Intro'
import { Quiz } from './components/Quiz'
import { Results } from './components/Results'
import { clearProgress, loadProgress, type SavedProgress } from './lib/progress'
import type { Answer, Question, TestId, TestMode } from './types'

type Stage =
  | { step: 'intro' }
  | { step: 'quiz'; testId: TestId; mode: TestMode; resume?: SavedProgress }
  | { step: 'results'; testId: TestId; questions: Question[]; answers: Record<string, Answer> }

function App() {
  const [stage, setStage] = useState<Stage>({ step: 'intro' })
  const [saved, setSaved] = useState<SavedProgress | null>(() => loadProgress())

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [stage.step])

  function goHome() {
    setSaved(loadProgress())
    setStage({ step: 'intro' })
  }

  return (
    <>
      <Header onHome={goHome} />
      {stage.step === 'intro' && (
        <Intro
          saved={saved}
          onStart={(testId, mode) => {
            clearProgress()
            setStage({ step: 'quiz', testId, mode })
          }}
          onResume={(progress) =>
            setStage({ step: 'quiz', testId: progress.testId, mode: progress.mode, resume: progress })
          }
        />
      )}
      {stage.step === 'quiz' && (
        <Quiz
          key={`${stage.testId}-${stage.mode}`}
          testId={stage.testId}
          mode={stage.mode}
          resume={stage.resume}
          onComplete={(questions, answers) => {
            clearProgress()
            setSaved(null)
            setStage({ step: 'results', testId: stage.testId, questions, answers })
          }}
        />
      )}
      {stage.step === 'results' && (
        <Results
          testId={stage.testId}
          questions={stage.questions}
          answers={stage.answers}
          onRestart={goHome}
        />
      )}
    </>
  )
}

export default App
