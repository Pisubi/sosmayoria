import { useMemo, useState } from 'react'
import { tests } from '../../data/tests'
import { closenessLabel, rankProfiles } from '../../engine/matching'
import { ACQUIESCENCE_THRESHOLD, CONSISTENCY_THRESHOLD } from '../../engine/scoring'
import type { AxisScore, TestId } from '../../types'
import { Avatar } from '../Avatar'
import { Eyebrow } from '../Eyebrow'
import { Footer } from '../Footer'
import { phraseFor } from '../../lib/phrases'
import { renderShareImage, type ShareCard } from '../../lib/shareImage'
import { AxisBars } from './AxisBars'
import { CatalogSection } from './CatalogSection'
import { Distinctive } from './Distinctive'
import { Ring } from './Ring'
import { IdentityMeter } from './IdentityMeter'
import { Plane2D } from './Plane2D'

export interface ResultData {
  testId: TestId
  scores: AxisScore[]
  acquiescence?: number
  /** Consistencia de las respuestas (ver engine/scoring). */
  consistency?: number
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
  const matchAxes = test.axes.filter((a) => a.includeInMatching && !a.reportSeparately)
  const identityAxis = test.axes.find((a) => a.reportSeparately)
  const axisName = (id: string) => test.axes.find((a) => a.id === id)?.name ?? id

  const byCatalog = useMemo(
    () =>
      test.catalogs.map((catalog) => ({
        catalog,
        matches: rankProfiles(
          scores,
          test.axes,
          test.profiles.filter((p) => p.catalog === catalog.id),
        ),
      })),
    [test, scores],
  )
  // Ideologías/tradiciones y figuras actuales: suficientes puntos para orientarse sin saturar.
  const planeCatalogs = [test.catalogs[0], test.catalogs[2]]
  const planeProfiles = test.profiles.filter(
    (p) => planeCatalogs.some((c) => c.id === p.catalog),
  )

  const [lead, ...others] = byCatalog
  const top = lead.matches[0]
  const runnerUpTied = lead.matches[1] && top.similarity - lead.matches[1].similarity < 2
  const undetermined = scores.filter(
    (s) => s.score == null && matchAxes.some((a) => a.id === s.axisId),
  )
  const acquiescent = Math.abs(data.acquiescence ?? 0) > ACQUIESCENCE_THRESHOLD
  const mixed = (data.consistency ?? 1) < CONSISTENCY_THRESHOLD
  const determinedCount = test.axes.filter(
    (a) => a.includeInMatching && scores.find((s) => s.axisId === a.id)?.score != null,
  ).length
  const tooFew = matchAxes.filter((a) => scores.find((s) => s.axisId === a.id)?.score != null).length < 3

  if (determinedCount === 0) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
        <Eyebrow>Tu resultado · Test {test.name}</Eyebrow>
        <h1 className="mt-6 text-4xl leading-[1.1] font-normal tracking-[-0.015em] sm:text-5xl">
          No hay respuestas suficientes para compararte
        </h1>
        <p className="mt-6 leading-7 text-azul/75">
          Respondiste "No sé" en casi todo, así que ningún tema quedó determinado. Probá de nuevo
          respondiendo lo que te salga, aunque no estés seguro: siempre podés marcar una posición
          intermedia.
        </p>
        <button
          type="button"
          onClick={onRestart}
          className="mt-10 rounded-md bg-azul px-8 py-3.5 text-sm font-semibold text-marfil hover:bg-noche"
        >
          Volver a empezar
        </button>
      </main>
    )
  }

  return (
    <main>
      <section className="bg-noche text-marfil">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-24">
          <Eyebrow>Análisis completo · Test {test.name}</Eyebrow>
          <h1 className="mt-5 text-4xl leading-[1.05] font-bold tracking-[-0.02em] sm:text-6xl">
            Tu perfil político
          </h1>
          <p className="mt-4 max-w-2xl leading-7 text-marfil/70">
            {tooFew
              ? 'Faltan respuestas para ubicarte bien: tomá esto como una primera aproximación.'
              : mixed
                ? 'Tus respuestas son mixtas: lo que sigue es lo más próximo, no un calce exacto.'
                : top.similarity >= 50
                  ? `Entre ${lead.matches.length} ${lead.catalog.name.toLowerCase()}, la más cercana a vos es:`
                  : 'Ningún perfil está muy cerca; este es el más próximo:'}
          </p>

          <div className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
            <div className="rounded-3xl bg-papel p-6 text-azul sm:p-8">
              <div className="flex flex-wrap-reverse items-start justify-between gap-x-6 gap-y-4">
                <div className="min-w-0 flex-1 basis-56">
                  <p className="inline-block rounded-full bg-azul px-3 py-1 text-xs font-semibold text-marfil">
                    {phraseFor(test.id, top.profile.id)?.familia ?? lead.catalog.name}
                  </p>
                  <p className="mt-4 text-3xl leading-tight font-bold tracking-[-0.015em] break-words sm:text-4xl">
                    {top.profile.name}
                  </p>
                  <p className="mt-2 text-sm font-medium text-azul/60">
                    {closenessLabel(top.similarity)}
                    {runnerUpTied && ` · casi empatado con ${lead.matches[1].profile.name}`}
                  </p>
                </div>
                <Ring value={top.similarity} />
              </div>
              <p className="mt-6 leading-7 text-azul/80">{top.profile.description}</p>
              {top.agree.length > 0 && (
                <p className="mt-4 text-sm leading-6 text-azul/65">
                  Coinciden sobre todo en {listOf(top.agree.map(axisName))}
                  {top.differ.length > 0 && <>, y se diferencian en {listOf(top.differ.map(axisName))}</>}.
                </p>
              )}
            </div>

            <div className="grid gap-4">
              {phraseFor(test.id, top.profile.id) && (
                <figure className="rounded-3xl border border-marfil/15 bg-marfil/[0.06] p-6 sm:p-8">
                  <blockquote className="text-xl leading-snug font-medium text-marfil sm:text-2xl">
                    “{phraseFor(test.id, top.profile.id)!.frase}”
                  </blockquote>
                  <figcaption className="mt-4 text-sm text-marfil/60">
                    Así resumiría alguien de esta corriente la sociedad que quiere.
                  </figcaption>
                </figure>
              )}
              <ul className="grid gap-2 rounded-3xl border border-marfil/15 p-3">
                {others.map(({ catalog, matches }) =>
                  matches[0] ? (
                    <li key={catalog.id} className="flex items-center gap-3 rounded-2xl px-3 py-2.5 hover:bg-marfil/[0.06]">
                      <Avatar testId={test.id} profile={matches[0].profile} size={44} dark />
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-medium tracking-[0.1em] text-marfil/55 uppercase">{catalog.name}</p>
                        <p className="truncate font-semibold">{matches[0].profile.name}</p>
                      </div>
                      <p className="text-xl font-bold text-naranja tabular-nums">{Math.round(matches[0].similarity)}%</p>
                    </li>
                  ) : null,
                )}
              </ul>
            </div>
          </div>
          <p className="mt-4 text-xs leading-5 text-marfil/60">
            Cercanía de 0 a 100% según la distancia media entre tus posiciones y las de cada
            perfil: 80% o más es muy cerca; menos de 50%, lejos.
            {data.total != null && ` Respondiste ${data.answered} de ${data.total} afirmaciones.`}
          </p>
        </div>
      </section>

      {(acquiescent || mixed || undetermined.length > 0 || data.shared) && (
        <section className="mx-auto max-w-5xl px-4 pt-10 sm:px-6">
          <div className="space-y-2 rounded-xl border border-naranja/40 bg-linea/50 p-5 text-sm leading-6">
            {data.shared && (
              <p>Estás viendo un resultado compartido: se recalculó a partir de los puntajes del enlace.</p>
            )}
            {mixed && (
              <p>
                En varios temas estuviste de acuerdo con afirmaciones que van en sentidos
                opuestos. Puede que tengas posiciones mixtas, pero el resultado es menos preciso:
                tomá las cercanías como orientativas.
              </p>
            )}
            {acquiescent && (
              <p>
                Respondiste casi todo en el mismo sentido. Como cada tema tiene afirmaciones en los dos
                sentidos, tu resultado puede quedar más cerca del centro de lo que realmente pensás.
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

      <Distinctive test={test} scores={scores} profiles={lead.matches.map((m) => m.profile)} catalogName={lead.catalog.name} />

      <Section
        eyebrow="01 · Cercanías"
        title="A quién te parecés, y en qué"
        note="Cada catálogo se compara por separado. Cada perfil respondió el mismo test según su trayectoria documentada (decisiones de gobierno, votos, programas y declaraciones; en figuras históricas, de época), así que se mide con la misma vara que vos."
      >
        <div className="grid gap-6">
          {[lead, ...others].map(({ catalog, matches }, i) => (
            <CatalogSection key={catalog.id} test={test} catalog={catalog} matches={matches} scores={scores} skipFeatured={i === 0} />
          ))}
        </div>
      </Section>

      <section className="mx-auto max-w-5xl px-4 sm:px-6">
        <details className="group rounded-xl border border-azul/14 p-5 sm:p-6">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
            <span>Tu posición tema por tema ({matchAxes.length})</span>
            <span className="text-sm font-normal text-azul/60 group-open:hidden">Ver detalle ↓</span>
            <span className="hidden text-sm font-normal text-azul/60 group-open:inline">Ocultar ↑</span>
          </summary>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-azul/70">
            Escala de −100 a +100 desde la posición neutral, con la intensidad de tu postura. En
            naranja, el tema donde es más marcada.
          </p>
          <div className="mt-8">
            <AxisBars axes={matchAxes} scores={scores} />
          </div>
        </details>
      </section>

      <Section
        eyebrow="02 · Mapas"
        title="Tu lugar en el mapa"
        note={`Tres cruces de dos temas. Los puntos son ${planeCatalogs.map((c) => c.name.toLowerCase()).join(' y ')}; se nombran los más cercanos a vos.`}
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

      {identityAxis && (
        <Section
          eyebrow="03 · Identidad"
          title={identityAxis.name}
          note={identityAxis.description}
        >
          <IdentityMeter axis={identityAxis} score={scores.find((s) => s.axisId === identityAxis.id)} />
        </Section>
      )}

      <section className="bg-arena">
        <div className="mx-auto max-w-5xl px-4 py-16 text-center sm:px-6">
          <p className="text-2xl font-bold">Compartí tu resultado</p>
          <p className="mx-auto mt-3 max-w-md leading-7 text-azul/75">
            El enlace guarda solo tus puntajes por tema, no tus respuestas. Probá también el otro
            test o la versión completa.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <ImageButton
              card={{
                testName: test.name,
                lead: {
                  catalog: lead.catalog.name,
                  family: phraseFor(test.id, top.profile.id)?.familia,
                  name: top.profile.name,
                  similarity: top.similarity,
                  phrase: phraseFor(test.id, top.profile.id)?.frase,
                },
                others: others.flatMap(({ catalog, matches }) =>
                  matches[0] ? [{ catalog: catalog.name, name: matches[0].profile.name, similarity: matches[0].similarity }] : [],
                ),
                url: window.location.href,
              }}
            />
            <ShareButton
              text={`Hice el test ${test.name} de Brújula: ${byCatalog
                .map(({ matches }) => matches[0])
                .filter(Boolean)
                .slice(0, 3)
                .map((m) => `${m.profile.name} ${Math.round(m.similarity)}%`)
                .join(' · ')}. ¿Y vos?`}
            />
            <button
              type="button"
              onClick={onRestart}
              className="rounded-md border border-azul px-8 py-3.5 text-sm font-semibold text-azul transition-colors hover:bg-azul hover:text-marfil"
            >
              Hacer otro test
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

function ImageButton({ card }: { card: ShareCard }) {
  const [busy, setBusy] = useState(false)
  async function make() {
    setBusy(true)
    try {
      const blob = await renderShareImage(card)
      const file = new File([blob], 'brujula-resultado.png', { type: 'image/png' })
      if (navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title: 'Brújula' })
          return
        } catch (e) {
          if ((e as Error).name === 'AbortError') return
        }
      }
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = file.name
      a.click()
      window.setTimeout(() => URL.revokeObjectURL(a.href), 5000)
    } finally {
      setBusy(false)
    }
  }
  return (
    <button
      type="button"
      onClick={make}
      disabled={busy}
      className="rounded-md bg-naranja px-8 py-3.5 text-sm font-semibold text-marfil transition-colors hover:bg-azul disabled:opacity-60"
    >
      {busy ? 'Generando…' : 'Descargar imagen'}
    </button>
  )
}

function ShareButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  async function share() {
    const url = window.location.href
    // En el celular abre el menú de compartir del sistema; en la compu copia texto y enlace.
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Brújula', text, url })
        return
      } catch (e) {
        if ((e as Error).name === 'AbortError') return
      }
    }
    try {
      await navigator.clipboard.writeText(`${text} ${url}`)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2500)
    } catch {
      window.prompt('Copiá este texto', `${text} ${url}`)
    }
  }
  return (
    <button
      type="button"
      onClick={share}
      className="rounded-md bg-azul px-8 py-3.5 text-sm font-semibold text-marfil transition-colors hover:bg-noche"
    >
      {copied ? 'Copiado: pegalo donde quieras' : 'Compartir resultado'}
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
