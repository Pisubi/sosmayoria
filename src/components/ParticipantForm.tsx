import { useState } from 'react'
import {
  AGE_OPTIONS,
  EDUCATION_OPTIONS,
  GENDER_OPTIONS,
  UNDER_16,
  type Option,
  type Participant,
} from '../lib/participant'
import { Eyebrow } from './Eyebrow'

interface ParticipantFormProps {
  /** null = juega sin guardar respuestas. */
  onContinue: (participant: Participant | null) => void
}

export function ParticipantForm({ onContinue }: ParticipantFormProps) {
  const [age, setAge] = useState<number>()
  const [gender, setGender] = useState<number>()
  const [education, setEducation] = useState<number>()
  const [consent, setConsent] = useState(false)

  const minor = age === UNDER_16
  const complete = age !== undefined && gender !== undefined && education !== undefined
  const canStart = complete && (consent || minor)

  function start() {
    if (!canStart || age === undefined || gender === undefined || education === undefined) return
    onContinue(minor ? null : { age, gender, education })
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-20">
      <Eyebrow>Antes de empezar</Eyebrow>
      <h1 className="mt-6 text-3xl font-bold sm:text-4xl">Tres datos sobre vos</h1>
      <p className="mt-5 leading-7 text-azul/75">
        Los usamos junto con tus respuestas, solo con fines estadísticos y de investigación. No
        pedimos nombre, mail ni nada que te identifique. Participar es voluntario: podés jugar
        igual sin que se guarde nada.
      </p>

      <Field label="Edad" options={AGE_OPTIONS} value={age} onChange={setAge} />
      {minor && (
        <p className="mt-3 text-sm text-naranja">
          Podés hacer el test, pero no guardamos respuestas de menores de 16 años.
        </p>
      )}
      <Field label="Género" options={GENDER_OPTIONS} value={gender} onChange={setGender} />
      <Field
        label="Máximo nivel educativo alcanzado"
        options={EDUCATION_OPTIONS}
        value={education}
        onChange={setEducation}
      />

      {!minor && (
        <label className="mt-10 flex cursor-pointer items-start gap-3 text-sm leading-6 text-azul/80">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-1 size-4 accent-azul"
          />
          <span>
            Acepto que mis respuestas y estos datos se guarden de forma anónima con fines
            estadísticos. Las opiniones políticas son datos sensibles (Ley 25.326) y nadie está
            obligado a darlas.
          </span>
        </label>
      )}

      <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
        <button
          type="button"
          disabled={!canStart}
          onClick={start}
          className="rounded-md bg-azul px-8 py-3.5 text-sm font-semibold text-marfil hover:bg-noche disabled:opacity-40"
        >
          Empezar →
        </button>
        <button
          type="button"
          onClick={() => onContinue(null)}
          className="text-sm font-medium text-azul/70 underline-offset-4 hover:text-azul hover:underline"
        >
          Jugar sin guardar mis respuestas
        </button>
      </div>
    </main>
  )
}

function Field({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: Option[]
  value: number | undefined
  onChange: (code: number) => void
}) {
  return (
    <fieldset className="mt-10">
      <legend className="text-xs font-medium tracking-[0.12em] text-azul/60 uppercase">{label}</legend>
      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((o) => {
          const selected = value === o.code
          return (
            <button
              key={o.code}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(o.code)}
              className={`rounded-md border px-4 py-2.5 text-sm font-medium transition-colors ${
                selected
                  ? 'border-azul bg-azul text-marfil'
                  : 'border-azul/20 hover:border-azul hover:bg-linea'
              }`}
            >
              {o.label}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}
