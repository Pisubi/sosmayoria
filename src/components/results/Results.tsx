import { useMemo, useState } from 'react'
import { tests } from '../../data/tests'
import { rankProfiles, type Match } from '../../engine/matching'
import { ACQUIESCENCE_THRESHOLD } from '../../engine/scoring'
import type { AxisScore, TestId } from '../../types'
import { Avatar } from '../Avatar'
import { Eyebrow } from '../Eyebrow'
import { Footer } from '../Footer'
import { AxisBars } from './AxisBars'
import { CatalogRanking } from './CatalogRanking'
import { IdentityMeter } from './IdentityMeter'
import { Plane2D } from './Plane2D'

export interface ResultData {
  testId: TestId
  scores: AxisScore[]
  acquiescence?: number
  answered?: number
  total?: number
  /** Resultado abierto desde un enlace compartido (sin respuestas individuales). */
  shared?: boolean
}

interface ResultsProps {
  data: ResultData
  onRestart: () => void
  onMethodology: () => void
}

export function Results({ data, onRestart, onMethodology }: ResultsProps) {
  const test = tests[data.testId]
  const { scores } = data
  const matchAxes = test.axes.filter((a) => a.includeInMatching)
  const identityAxis = test.axes.find((a) => !a.includeInMatching)
  const axisName = (id: string) => test.axes.find((a) => a.id === id)?.name ?? id

  const byCatalog = useMemo(
    () =>
      test.catalogs.map((catalog) => ({
        catalog,
        matches: rankProfiles(
          scores,
          test.axes,
          test.profiles.filter((p) => p.catalog === catalog.id && !p.sensitive),
        ),
      })),
    [test, scores],
  )
  const sensitive = useMemo(
    () => rankProfiles(scores, test.axes, test.profiles.filter((p) => p.sensitive)),
    [test, scores],
  )
  // Ideologías/tradiciones y figuras actuales: suficientes puntos para orientarse sin saturar.
  const planeCatalogs = [test.catalogs[0], test.catalogs[2]]
  const planeProfiles = test.profiles.filter(
    (p) => !p.sensitive && planeCatalogs.some((c) => c.id === p.catalog),
  )

  const [lead, ...others] = byCatalog
  const top = lead.matches[0]
  const undetermined = scores.filter(
    (s) => s.score == null && matchAxes.some((a) => a.id === s.axisId),
  )
  const acquiescent = Math.abs(data.acquiescence ?? 0) > ACQUIESCENCE_THRESHOLD

  return (
    <main>
      <section className="bg-noche text-marfil">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-24">
          <Eyebrow>Tu resultado · Test {test.name}</Eyebrow>
          <h1 className="mt-6 max-w-3xl text-4xl leading-[1.1] font-normal tracking-[-0.015em] sm:text-6xl">
            Tu perfil se acerca a{' '}
            <em className="font-light text-naranja">{top.profile.name}</em>
          </h1>
          <p className="mt-6 max-w-2xl leading-7 text-marfil/75 sm:text-lg sm:leading-8">
            Coincidís sobre todo en {listOf(top.agree.map(axisName))}, y te diferenciás en{' '}
            {listOf(top.differ.map(axisName))}. Abajo están tu posición eje por eje y la cercanía
            con cada catálogo.
          </p>

          <div className="mt-12 grid gap-px overflow-hidden rounded-xl border border-marfil/20 bg-marfil/20 sm:grid-cols-2 lg:grid-cols-4">
            {byCatalog.map(({ catalog, matches }) =>
              matches[0] ? (
                <Highlight key={catalog.id} testId={test.id} label={catalog.name} match={matches[0]} axisName={axisName} />
              ) : null,
            )}
          </div>
          <p className="mt-4 text-xs leading-5 text-marfil/60">
            Cercanía de 0 a 100% calculada con la distancia media entre ejes.
            {data.total != null && ` Respondiste ${data.answered} de ${data.total} afirmaciones.`}
          </p>
        </div>
      </section>

      {(acquiescent || undetermined.length > 0 || data.shared) && (
        <section className="mx-auto max-w-5xl px-4 pt-10 sm:px-6">
          <div className="space-y-2 rounded-xl border border-naranja/40 bg-linea/50 p-5 text-sm leading-6">
            {data.shared && (
              <p>Estás viendo un resultado compartido: se recalculó a partir de los puntajes del enlace.</p>
            )}
            {acquiescent && (
              <p>
                Respondiste casi todo en el mismo sentido. Como cada eje tiene afirmaciones de ambos
                polos, tu resultado puede quedar más cerca del centro de lo que realmente pensás.
              </p>
            )}
            {undetermined.length > 0 && (
              <p>
                {listOf(undetermined.map((s) => axisName(s.axisId)))} quedaron indeterminados por
                la cantidad de "No sé" y no entran en las comparaciones.
              </p>
            )}
          </div>
        </section>
      )}

      <Section
        eyebrow="01 · Ejes"
        title="Tu posición eje por eje"
        note="Escala de −100 a +100 desde la posición neutral, con la intensidad de tu postura. En naranja, el eje donde es más marcada."
      >
        <AxisBars axes={matchAxes} scores={scores} />
      </Section>

      <Section
        eyebrow="02 · Planos"
        title="Tu lugar en el mapa"
        note={`Tres cortes de dos ejes. Los puntos son ${planeCatalogs.map((c) => c.name.toLowerCase()).join(' y ')}; se nombran los más cercanos a vos.`}
      >
        <div className="grid gap-10 md:grid-cols-3 md:gap-6">
          {test.planes.map(([x, y]) => (
            <Plane2D
              key={`${x}-${y}`}
              xAxis={test.axes.find((a) => a.id === x)!}
              yAxis={test.axes.find((a) => a.id === y)!}
              scores={scores}
              profiles={planeProfiles}
            />
          ))}
        </div>
      </Section>

      <Section
        eyebrow="03 · Cercanías"
        title="A quién te parecés, y en qué"
        note="Cada catálogo se compara por separado. Las posiciones de los perfiles son semillas editoriales basadas en decisiones de gobierno, programas y declaraciones públicas; en figuras históricas son de época."
      >
        <div className="grid gap-14">
          {[lead, ...others].map(({ catalog, matches }) => (
            <CatalogRanking key={catalog.id} testId={test.id} catalog={catalog} matches={matches} axes={test.axes} />
          ))}
        </div>
      </Section>

      {identityAxis && (
        <Section
          eyebrow="04 · Identidad"
          title={identityAxis.name}
          note={identityAxis.description}
        >
          <IdentityMeter axis={identityAxis} score={scores.find((s) => s.axisId === identityAxis.id)} />
        </Section>
      )}

      {sensitive.length > 0 && (
        <SensitiveReferences matches={sensitive} axisName={axisName} />
      )}

      <section className="bg-arena">
        <div className="mx-auto max-w-5xl px-4 py-16 text-center sm:px-6">
          <p className="text-2xl font-bold">Compartí o compará</p>
          <p className="mx-auto mt-3 max-w-md leading-7 text-azul/75">
            El enlace guarda solo tus puntajes por eje, no tus respuestas. Probá también el otro
            test o la versión completa.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <ShareButton />
            <button
              type="button"
              onClick={onRestart}
              className="rounded-md border border-azul px-8 py-3.5 text-sm font-semibold text-azul transition-colors hover:bg-azul hover:text-marfil"
            >
              Volver al inicio
            </button>
          </div>
        </div>
      </section>

      <Footer onMethodology={onMethodology} />
    </main>
  )
}

function listOf(items: string[]): string {
  const lower = items.map((s) => s.toLowerCase())
  if (lower.length <= 1) return lower.join('')
  return `${lower.slice(0, -1).join(', ')} y ${lower[lower.length - 1]}`
}

function Highlight({
  testId,
  label,
  match,
  axisName,
}: {
  testId: TestId
  label: string
  match: Match
  axisName: (id: string) => string
}) {
  return (
    <div className="bg-noche p-5 sm:p-6">
      <p className="text-xs font-medium tracking-[0.12em] text-marfil/60 uppercase">{label}</p>
      <div className="mt-4">
        <Avatar testId={testId} profile={match.profile} size={56} dark />
      </div>
      <p className="mt-3 text-lg leading-snug font-semibold">{match.profile.name}</p>
      {match.profile.country && <p className="text-xs text-marfil/60">{match.profile.country}</p>}
      <p className="mt-4 text-3xl font-bold text-naranja tabular-nums">
        {Math.round(match.similarity)}%
      </p>
      <p className="mt-2 text-xs leading-5 text-marfil/60">
        Más cerca en {listOf(match.agree.slice(0, 2).map(axisName))}
      </p>
    </div>
  )
}

function SensitiveReferences({
  matches,
  axisName,
}: {
  matches: Match[]
  axisName: (id: string) => string
}) {
  return (
    <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
      <Eyebrow>Referencias históricas</Eyebrow>
      <h2 className="mt-5 text-3xl font-bold sm:text-4xl">Distancia a regímenes autoritarios</h2>
      <p className="mt-4 max-w-2xl text-sm leading-6 text-azul/70">
        Dictaduras y totalitarismos con crímenes documentados se muestran solo como referencia
        educativa, nunca como resultado principal. Parecerse en algunos ejes no implica compartir
        sus métodos ni sus crímenes.
      </p>
      <details className="mt-8 rounded-xl border border-azul/14 p-5">
        <summary className="cursor-pointer text-sm font-semibold">
          Ver las {matches.length} referencias ordenadas por cercanía
        </summary>
        <ol className="mt-4 border-t border-azul/14">
          {matches.map((m) => (
            <li key={m.profile.id} className="border-b border-azul/14 py-4">
              <div className="flex items-baseline justify-between gap-4">
                <p className="font-semibold">
                  {m.profile.name}
                  <span className="ml-2 text-xs font-normal text-azul/55">
                    {[m.profile.country, m.profile.era].filter(Boolean).join(' · ')}
                  </span>
                </p>
                <p className="text-sm tabular-nums">{Math.round(m.similarity)}%</p>
              </div>
              <p className="mt-2 text-sm leading-6 text-azul/70">{m.profile.description}</p>
              <p className="mt-1 text-xs text-azul/55">
                Diferís en {listOf(m.differ.map(axisName))}.
              </p>
            </li>
          ))}
        </ol>
      </details>
    </section>
  )
}

function ShareButton() {
  const [copied, setCopied] = useState(false)
  async function copy() {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2500)
    } catch {
      window.prompt('Copiá este enlace', window.location.href)
    }
  }
  return (
    <button
      type="button"
      onClick={copy}
      className="rounded-md bg-azul px-8 py-3.5 text-sm font-semibold text-marfil transition-colors hover:bg-noche"
    >
      {copied ? 'Enlace copiado' : 'Copiar enlace al resultado'}
    </button>
  )
}

interface SectionProps {
  eyebrow: string
  title: string
  note: string
  children: React.ReactNode
}

function Section({ eyebrow, title, note, children }: SectionProps) {
  return (
    <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="mt-5 text-3xl font-bold sm:text-4xl">{title}</h2>
      <p className="mt-4 max-w-2xl text-sm leading-6 text-azul/70">{note}</p>
      <div className="mt-10">{children}</div>
    </section>
  )
}
