import { axes } from '../data/axes'
import { questions } from '../data/questions'
import type { Question, TestMode } from '../types'

const QUESTIONS_PER_AXIS_FULL = 4
const QUESTIONS_PER_AXIS_QUICK = 2

export const modeInfo: Record<
  TestMode,
  {
    label: string
    cta: string
    questionCount: number
    minutes: number
    description: string
  }
> = {
  rapido: {
    label: 'Rápida',
    cta: 'Empezar versión rápida',
    questionCount: axes.length * QUESTIONS_PER_AXIS_QUICK,
    minutes: 4,
    description: 'Una primera lectura de tu perfil, con una afirmación de cada polo por eje.',
  },
  completo: {
    label: 'Completa',
    cta: 'Empezar versión completa',
    questionCount: axes.length * QUESTIONS_PER_AXIS_FULL,
    minutes: 7,
    description: 'Mayor precisión, con las cuatro afirmaciones de cada eje.',
  },
}

export function getQuestionsForMode(mode: TestMode): Question[] {
  if (mode === 'completo') return questions

  const byAxis = new Map<string, Question[]>()
  for (const question of questions) {
    const list = byAxis.get(question.axisId) ?? []
    list.push(question)
    byAxis.set(question.axisId, list)
  }

  return axes.flatMap((axis) => {
    const axisQuestions = byAxis.get(axis.id) ?? []
    return axisQuestions.slice(0, QUESTIONS_PER_AXIS_QUICK)
  })
}
