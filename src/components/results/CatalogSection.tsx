import { useState } from 'react'
import { closenessLabel, expressed, type Match } from '../../engine/matching'
import { dimensionMatches } from '../../engine/insights'
import type { Axis, AxisScore, Catalog, Profile, TestDefinition } from '../../types'
import { Avatar } from '../Avatar'

interface CatalogSectionProps {
  test: TestDefinition
  catalog: Catalog
  matches: Match[]
  scores: AxisScore[]
  /** El primero ya se mostró arriba como resultado principal. */
  skipFeatured?: boolean
}

const GRID = 6
const DIMENSION_POOL = 16

/**
 * Un catálogo: el más cercano destacado, con qué los acerca; los siguientes en grilla; los más
 * cercanos por dimensión (economía, valores, instituciones); y lo más lejano, que da contraste.
 */
export function CatalogSection({ test, catalog, matches, scores, skipFeatured = false }: CatalogSectionProps) {
  const [expanded, setExpanded] = useState(false)
  if (matches.length === 0) return null
  const [top, ...rest] = matches
  const figures = catalog.kind === 'figuras'
  const shown = new Set(matches.slice(0, GRID + 1).map((m) => m.profile.id))
  // Solo entre los que ya te quedan razonablemente cerca en general: si no, aparecen
  // coincidencias en un tema con perfiles que en todo lo demás son tu opuesto.
  const byDimension = dimensionMatches(
    scores,
    test.axes,
    test.profiles.filter((p) => p.catalog === catalog.id),
    test.dimensions,
    shown,
    matches.slice(0, DIMENSION_POOL).map((m) => m.profile),
  )
  const furthest = [...matches].reverse().slice(0, figures ? 3 : 1)

  return (
    <section className="rounded-3xl border border-azul/12 bg-papel p-5 sm:p-8">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-2xl font-bold tracking-[-0.01em]">{catalog.name}</h3>
        <p className="text-sm text-azul/55">{matches.length} perfiles</p>
      </div>
      <p className="mt-1 max-w-2xl text-sm text-azul/60">{catalog.description}</p>

      {!skipFeatured && <Featured test={test} match={top} scores={scores} of={matches.length} />}

      <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {(skipFeatured ? matches.slice(1, GRID + 1) : rest.slice(0, GRID)).map((m, i) => (
          <li key={m.profile.id}>
            <MiniCard test={test} match={m} rank={i + 2} />
          </li>
        ))}
      </ul>

      {byDimension.length > 0 && (
        <div className="mt-8">
          <p className="text-sm font-semibold">También cerca de vos, por dimensión</p>
          <ul className="mt-3 grid gap-3 sm:grid-cols-3">
            {byDimension.map(({ dimension, match }) => (
              <li key={dimension.label}>
                <MiniCard test={test} match={match} label={dimension.label} />
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-8">
        <p className="text-sm font-semibold">{furthest.length > 1 ? 'Lo más lejano de vos' : 'Lo más lejano de vos'}</p>
        <ul className="mt-3 grid gap-2">
          {furthest.map((m) => (
            <li key={m.profile.id} className="flex items-center justify-between gap-4 rounded-xl bg-linea/70 px-4 py-3">
              <div className="flex min-w-0 items-center gap-3">
                <Avatar testId={test.id} profile={m.profile} size={32} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{m.profile.name}</p>
                  <p className="truncate text-xs text-azul/55">{subtitle(m.profile)}</p>
                </div>
              </div>
              <p className="text-sm font-semibold tabular-nums">{Math.round(m.similarity)}%</p>
            </li>
          ))}
        </ul>
      </div>

      {matches.length > GRID + 1 && (
        <>
          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            className="mt-6 text-sm font-semibold text-azul underline decoration-naranja decoration-2 underline-offset-4 hover:text-noche"
          >
            {expanded ? 'Ocultar el ranking completo' : `Ver el ranking completo (${matches.length})`}
          </button>
          {expanded && (
            <ol className="mt-4 border-t border-azul/12">
              {matches.map((m, i) => (
                <li key={m.profile.id} className="flex items-center gap-3 border-b border-azul/12 py-2.5 text-sm">
                  <span className="w-7 text-right text-azul/50 tabular-nums">{i + 1}</span>
                  <Avatar testId={test.id} profile={m.profile} size={28} />
                  <span className="min-w-0 flex-1 truncate font-medium">{m.profile.name}</span>
                  <span className="font-semibold tabular-nums">{Math.round(m.similarity)}%</span>
                </li>
              ))}
            </ol>
          )}
        </>
      )}
    </section>
  )
}

function subtitle(profile: Profile): string {
  return [profile.country, profile.era].filter(Boolean).join(' · ')
}

/** El más cercano del catálogo: foto grande, cercanía, descripción y en qué se parecen. */
export function Featured({
  test,
  match,
  scores,
  of,
}: {
  test: TestDefinition
  match: Match
  scores: AxisScore[]
  of: number
}) {
  const { profile } = match
  return (
    <div className="mt-6 grid gap-6 rounded-2xl border border-azul/10 bg-marfil p-5 sm:grid-cols-[auto_1fr] sm:p-6">
      <div className="flex items-center gap-4 sm:flex-col sm:items-center">
        <Avatar testId={test.id} profile={profile} size={104} />
        <p className="rounded-full bg-azul px-3 py-1 text-xs font-semibold text-marfil sm:mt-1">
          1º de {of} · {Math.round(match.similarity)}%
        </p>
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold tracking-[0.12em] text-naranja uppercase">El más cercano</p>
        <p className="mt-1 text-2xl leading-tight font-bold">{profile.name}</p>
        {subtitle(profile) && <p className="mt-1 text-sm text-azul/55">{subtitle(profile)}</p>}
        <p className="mt-3 text-sm leading-6 text-azul/75">{profile.description}</p>
        <p className="mt-2 text-xs text-azul/55">
          {closenessLabel(match.similarity)}
          {match.partial && ' · comparación parcial (pocos temas con dato)'}
        </p>
        <Versus match={match} axes={test.axes} scores={scores} />
      </div>
    </div>
  )
}

function MiniCard({ test, match, rank, label }: { test: TestDefinition; match: Match; rank?: number; label?: string }) {
  const { profile } = match
  return (
    <div className="flex h-full flex-col items-center rounded-2xl border border-azul/10 bg-marfil px-3 py-4 text-center">
      {label && <p className="mb-2 text-[11px] font-semibold tracking-[0.1em] text-naranja uppercase">{label}</p>}
      <Avatar testId={test.id} profile={profile} size={56} />
      <p className="mt-2 text-sm leading-snug font-semibold">{profile.name}</p>
      {subtitle(profile) && <p className="mt-0.5 text-[11px] text-azul/55">{subtitle(profile)}</p>}
      <p className="mt-auto pt-2 text-lg font-bold tabular-nums">
        {Math.round(match.similarity)}%
        {rank != null && <span className="ml-1.5 text-xs font-normal text-azul/50">{rank}º</span>}
      </p>
    </div>
  )
}

/**
 * Vos contra el perfil en tres temas: los dos donde más coinciden y el de mayor diferencia.
 * Cada pista va de un polo al otro, con el centro marcado.
 */
export function Versus({ match, axes, scores }: { match: Match; axes: Axis[]; scores: AxisScore[] }) {
  const ids = [...match.agree.slice(0, 2), ...match.differ.slice(0, 1)]
  if (ids.length === 0) return null
  return (
    <div className="mt-5">
      <ul className="grid gap-3 sm:grid-cols-3 sm:gap-5">
        {ids.map((id, i) => {
          const axis = axes.find((a) => a.id === id)!
          const you = scores.find((s) => s.axisId === id)?.score ?? 0
          const them = expressed(axis, match.profile.coords[id]) ?? 0
          const pos = (v: number) => `${50 + v / 2}%`
          return (
            <li key={id} className="text-xs text-azul/70">
              <p className="font-semibold text-azul">
                {axis.name}{' '}
                <span className="font-normal text-azul/55">
                  · {i < Math.min(2, match.agree.length) ? 'coinciden' : 'difieren'}
                </span>
              </p>
              <div className="relative mt-2 h-1.5 rounded-full bg-linea">
                <span aria-hidden className="absolute top-1/2 left-1/2 h-3 w-px -translate-y-1/2 bg-azul/30" />
                <span
                  title={`${match.profile.name}: ${Math.round(them)}`}
                  className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-marfil bg-azul"
                  style={{ left: pos(them) }}
                />
                <span
                  title={`Vos: ${you}`}
                  className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-marfil bg-naranja"
                  style={{ left: pos(you) }}
                />
              </div>
              <p className="mt-1.5 flex justify-between gap-2 text-[11px] text-azul/50">
                <span>{axis.poleA.label}</span>
                <span className="text-right">{axis.poleB.label}</span>
              </p>
            </li>
          )
        })}
      </ul>
      <p className="mt-2 text-[11px] text-azul/55">
        <span className="mr-1 inline-block h-2 w-2 rounded-full bg-naranja align-middle" /> vos{' '}
        <span className="mr-1 ml-3 inline-block h-2 w-2 rounded-full bg-azul align-middle" /> {match.profile.name}
      </p>
    </div>
  )
}
