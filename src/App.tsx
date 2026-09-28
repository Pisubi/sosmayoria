import { useState } from 'react'
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

  if (stage.step === 'intro') {
    return <Intro onStart={(mode) => setStage({ step: 'quiz', mode })} />
  }

  if (stage.step === 'quiz') {
    return (
      <Quiz
        mode={stage.mode}
        onComplete={(questions, answers) =>
          setStage({ step: 'results', questions, answers })
        }
      />
    )
  }

  return (
    <Results
      questions={stage.questions}
      answers={stage.answers}
      onRestart={() => setStage({ step: 'intro' })}
    />
  )
}

export default App
