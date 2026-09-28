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
  /** null = no se guarda nada (menores de 16). */
  onContinue: (participant: Participant | null) => void
}

export function ParticipantForm({ onContinue }: ParticipantFormProps) {
  const [age, setAge] = useState<number>()
  const [gender, setGender] = useState<number>()
  const [education, setEducation] = useState<number>()
  const minor = age === UNDER_16

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-20">
      <Eyebrow>Antes de tu resultado</Eyebrow>
      <h1 className="mt-6 text-3xl font-bold sm:text-4xl">Tres datos, una sola vez</h1>
      <p className="mt-5 leading-7 text-azul/75">
        Son opcionales y sirven para comparar cómo eligen distintas edades y grupos. Se guardan de
        forma anónima junto con tus jugadas, sin nombre, mail ni nada que te identifique, y no te
        los volvemos a pedir en este dispositivo.
      </p>

      <Field label="Edad" options={AGE_OPTIONS} value={age} onChange={setAge} />
      {minor && (
        <p className="mt-3 text-sm text-naranja">No guardamos respuestas de menores de 16 años.</p>
      )}
      <Field label="Género" options={GENDER_OPTIONS} value={gender} onChange={setGender} />
      <Field
        label="Máximo nivel educativo alcanzado"
        options={EDUCATION_OPTIONS}
        value={education}
        onChange={setEducation}
      />

      <button
        type="button"
        onClick={() => onContinue(minor ? null : { age: age ?? 0, gender: gender ?? 0, education: education ?? 0 })}
        className="mt-12 rounded-md bg-azul px-8 py-3.5 text-sm font-semibold text-marfil hover:bg-noche"
      >
        Ver mi resultado →
      </button>
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
