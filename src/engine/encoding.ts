import type { Question, Response, TestDefinition } from '../types'

/**
 * Respuestas empaquetadas en medio byte por afirmación del banco, en el orden de
 * test.questions (que solo admite agregar al final: ver tests/answer-layout.json).
 * Bits 0–2: 0 = no preguntada, 1 = "No sé", 2..6 = −1, −0,5, 0, 0,5, 1.
 * Bit 3: la afirmación salió como núcleo en esa partida (pesa más).
 * Un banco de 182 afirmaciones ocupa 91 bytes.
 */
const VALUES: Response[] = [null, -1, -0.5, 0, 0.5, 1]
const CORE_BIT = 8

function code(r: Response | undefined): number {
  if (r === undefined) return 0
  return r === null ? 1 : VALUES.indexOf(r) + 1
}

/** Devuelve el literal hexadecimal de bytea que acepta PostgREST (\x…). */
export function encodeAnswers(
  test: TestDefinition,
  questions: Question[],
  answers: Record<string, Response>,
): string {
  const asked = new Map(questions.map((q) => [q.id, q]))
  const bytes = new Uint8Array(Math.ceil(test.questions.length / 2))
  test.questions.forEach((q, i) => {
    const drawn = asked.get(q.id)
    if (!drawn) return
    const c = code(answers[q.id] === undefined ? null : answers[q.id]) | ((drawn.weight ?? 1) > 1 ? CORE_BIT : 0)
    bytes[i >> 1] |= c << (i % 2 ? 0 : 4)
  })
  return '\\x' + Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}

export function decodeAnswers(
  test: TestDefinition,
  hex: string,
): { answers: Record<string, Response>; core: string[] } {
  const clean = hex.replace(/^\\x/, '')
  const answers: Record<string, Response> = {}
  const core: string[] = []
  test.questions.forEach((q, i) => {
    const byte = parseInt(clean.slice((i >> 1) * 2, (i >> 1) * 2 + 2) || '0', 16)
    const c = i % 2 ? byte & 0xf : byte >> 4
    if ((c & 7) === 0) return
    answers[q.id] = VALUES[(c & 7) - 1]
    if (c & CORE_BIT) core.push(q.id)
  })
  return { answers, core }
}
