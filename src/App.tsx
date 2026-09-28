import { useEffect, useState } from 'react'
import { Header } from './components/Header'
import { Intro } from './components/Intro'
import { Quiz } from './components/Quiz'
import { Results } from './components/Results'
import type { Answer, Question, TestMode } from './types'

type Stage =
  | { step: 'intro' }
  | { step: 'quiz'; mode: TestMode }
  | { step: 'results'; questions: Question[]; answers: Record<string, Answer> }

function App() {
  const [stage, setStage] = useState<Stage>({ step: 'intro' })

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [stage.step])

  return (
    <>
      <Header onHome={() => setStage({ step: 'intro' })} />
      {stage.step === 'intro' && (
        <Intro onStart={(mode) => setStage({ step: 'quiz', mode })} />
      )}
      {stage.step === 'quiz' && (
        <Quiz
          mode={stage.mode}
          onComplete={(questions, answers) =>
            setStage({ step: 'results', questions, answers })
          }
        />
      )}
      {stage.step === 'results' && (
        <Results
          questions={stage.questions}
          answers={stage.answers}
          onRestart={() => setStage({ step: 'intro' })}
        />
      )}
    </>
  )
}

export default App
