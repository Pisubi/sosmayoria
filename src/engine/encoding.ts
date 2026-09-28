import type { Response, TestDefinition } from '../types'

/**
 * Respuestas empaquetadas en medio byte por afirmación, en el orden de test.questions
 * (que solo admite agregar al final: ver tests/answer-layout.json).
 * 0 = no preguntada, 1 = "No sé", 2..6 = −1, −0,5, 0, 0,5, 1.
 * 100 afirmaciones ocupan 50 bytes.
 */
const VALUES: Response[] = [null, -1, -0.5, 0, 0.5, 1]

function code(r: Response | undefined): number {
  if (r === undefined) return 0
  return r === null ? 1 : VALUES.indexOf(r) + 1
}

/** Devuelve el literal hexadecimal de bytea que acepta PostgREST (\x…). */
export function encodeAnswers(test: TestDefinition, answers: Record<string, Response>): string {
  const bytes = new Uint8Array(Math.ceil(test.questions.length / 2))
  test.questions.forEach((q, i) => {
    bytes[i >> 1] |= code(answers[q.id]) << (i % 2 ? 0 : 4)
  })
  return '\\x' + Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}

export function decodeAnswers(test: TestDefinition, hex: string): Record<string, Response> {
  const clean = hex.replace(/^\\x/, '')
  const answers: Record<string, Response> = {}
  test.questions.forEach((q, i) => {
    const byte = parseInt(clean.slice((i >> 1) * 2, (i >> 1) * 2 + 2) || '0', 16)
    const c = i % 2 ? byte & 0xf : byte >> 4
    if (c > 0) answers[q.id] = VALUES[c - 1]
  })
  return answers
}
