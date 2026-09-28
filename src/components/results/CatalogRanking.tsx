import { useState } from 'react'
import { closenessLabel, expressed, type Match } from '../../engine/matching'
import type { Axis, AxisScore, Catalog, TestId } from '../../types'
import { Avatar } from '../Avatar'

interface CatalogRankingProps {
  testId: TestId
  catalog: Catalog
  matches: Match[]
  axes: Axis[]
  scores: AxisScore[]
}

const TOP = 3

export function CatalogRanking({ testId, catalog, matches, axes, scores }: CatalogRankingProps) {
  const [expanded, setExpanded] = useState(false)
  const rest = matches.slice(TOP)

  return (
    <div>
      <h3 className="text-lg font-bold">{catalog.name}</h3>
      <p className="mt-1 text-sm text-azul/60">{catalog.description}</p>

      <ol className="mt-5 border-t border-azul/14">
        {matches.slice(0, TOP).map((m, i) => (
          <li key={m.profile.id} className="border-b border-azul/14 py-5">
            <MatchHeader testId={testId} match={m} top={i === 0} rank={i + 1} of={matches.length} />
            <p className="mt-3 text-sm leading-6 text-azul/70">{m.profile.description}</p>
            <Versus match={m} axes={axes} scores={scores} />
            <Meta match={m} />
          </li>
        ))}
        {expanded &&
          rest.map((m) => (
            <li key={m.profile.id} className="border-b border-azul/14 py-4">
              <MatchHeader testId={testId} match={m} />
            </li>
          ))}
      </ol>
      {matches.length > TOP + 1 && (
        <p className="mt-4 text-sm text-azul/70">
          Lo más lejano de vos:{' '}
          <span className="font-semibold text-azul">{matches[matches.length - 1].profile.name}</span>{' '}
          <span className="tabular-nums">({Math.round(matches[matches.length - 1].similarity)}%)</span>
        </p>
      )}
      {rest.length > 0 && (
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="mt-4 text-sm font-semibold text-azul underline decoration-naranja decoration-2 underline-offset-4 hover:text-noche"
        >
          {expanded ? 'Ver menos' : `Ver el ranking completo (${matches.length})`}
        </button>
      )}
    </div>
  )
}

function MatchHeader({
  testId,
  match,
  top = false,
  rank,
  of,
}: {
  testId: TestId
  match: Match
  top?: boolean
  rank?: number
  of?: number
}) {
  const pct = Math.round(match.similarity)
  const { profile } = match
  const sub = [profile.country, profile.era].filter(Boolean).join(' · ')
  return (
    <>
      <div className="flex items-center gap-4">
        <Avatar testId={testId} profile={profile} size={top ? 48 : 36} />
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-4">
            <p className="font-semibold">
              {profile.name}
              {sub && <span className="ml-2 text-xs font-normal text-azul/55">{sub}</span>}
            </p>
            <p className="text-sm font-semibold whitespace-nowrap tabular-nums" title="Cercanía de 0 a 100%">
              {pct}% <span className="font-normal text-azul/60">· {closenessLabel(match.similarity)}</span>
              {rank != null && of != null && (
                <span className="ml-2 font-normal text-azul/50">
                  {rank}º de {of}
                </span>
              )}
            </p>
          </div>
          <div className="mt-2 h-2 rounded-full bg-linea">
            <div
              className={`h-full rounded-full ${top ? 'bg-naranja' : 'bg-dato'}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>
    </>
  )
}

function Meta({ match }: { match: Match }) {
  const { profile } = match
  return (
    <p className="mt-3 text-xs leading-5 text-azul/55">
      Confianza {profile.confidence} · semilla editorial
      {match.partial && ' · comparación parcial (pocos temas con dato)'}
      {profile.contextNote && ` · ${profile.contextNote}`}
    </p>
  )
}

/**
 * Vos contra el perfil en tres temas: los dos donde más coinciden y el de mayor diferencia.
 * Cada pista va de un polo al otro, con el centro marcado.
 */
function Versus({ match, axes, scores }: { match: Match; axes: Axis[]; scores: AxisScore[] }) {
  const ids = [...match.agree.slice(0, 2), ...match.differ.slice(0, 1)]
  if (ids.length === 0) return null
  return (
    <ul className="mt-4 grid gap-3 sm:grid-cols-3 sm:gap-5">
      {ids.map((id, i) => {
        const axis = axes.find((a) => a.id === id)!
        const you = scores.find((s) => s.axisId === id)?.score ?? 0
        const them = expressed(axis, match.profile.coords[id]) ?? 0
        const pos = (v: number) => `${50 + v / 2}%`
        return (
          <li key={id} className="text-xs text-azul/70">
            <p className="font-semibold text-azul">
              {axis.name}{' '}
              <span className="font-normal text-azul/55">· {i < Math.min(2, match.agree.length) ? 'coinciden' : 'difieren'}</span>
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
      <li className="text-[11px] text-azul/55 sm:col-span-3">
        <span className="mr-1 inline-block h-2 w-2 rounded-full bg-naranja align-middle" /> vos{' '}
        <span className="mr-1 ml-3 inline-block h-2 w-2 rounded-full bg-azul align-middle" /> {match.profile.name}
      </li>
    </ul>
  )
}
