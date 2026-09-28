import { encodeAnswers } from '../engine/encoding'
import type { Question, Response, TestDefinition, Variant } from '../types'
import type { Participant } from './participant'

const URL = import.meta.env.VITE_SUPABASE_URL as string | undefined
const KEY = import.meta.env.VITE_SUPABASE_KEY as string | undefined

/** Solo se piden datos y se envían respuestas si el despliegue tiene Supabase configurado. */
export const collecting = Boolean(URL && KEY)

const TEST_CODE = { intl: 1, ar: 2 } as const
const VARIANT_CODE: Record<Variant, number> = { short: 1, full: 2, deep: 3 }
const MAX_SMALLINT = 32767

export function submitResult(
  test: TestDefinition,
  variant: Variant,
  participant: Participant,
  questions: Question[],
  answers: Record<string, Response>,
  seconds: number,
): void {
  if (!URL || !KEY) return
  const row = {
    test: TEST_CODE[test.id],
    variante: VARIANT_CODE[variant],
    edad: participant.age,
    genero: participant.gender,
    educacion: participant.education,
    segundos: Math.min(MAX_SMALLINT, Math.max(0, seconds)),
    respuestas: encodeAnswers(test, questions, answers),
  }
  fetch(`${URL.replace(/\/$/, '')}/rest/v1/respuestas`, {
    method: 'POST',
    keepalive: true,
    headers: {
      apikey: KEY,
      // Las claves anon heredadas son JWT; las nuevas sb_publishable_ van solo en apikey.
      ...(KEY.startsWith('eyJ') ? { Authorization: `Bearer ${KEY}` } : {}),
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(row),
  }).catch(() => {
    // Si falla el envío, la persona igual ve su resultado.
  })
}
