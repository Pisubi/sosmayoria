import { useState } from 'react'
import type { Match } from '../../engine/matching'
import type { Axis, Catalog, TestId } from '../../types'
import { Avatar } from '../Avatar'

interface CatalogRankingProps {
  testId: TestId
  catalog: Catalog
  matches: Match[]
  axes: Axis[]
}

const TOP = 3

export function CatalogRanking({ testId, catalog, matches, axes }: CatalogRankingProps) {
  const [expanded, setExpanded] = useState(false)
  const name = (id: string) => axes.find((a) => a.id === id)?.name ?? id
  const rest = matches.slice(TOP)

  return (
    <div>
      <h3 className="text-lg font-bold">{catalog.name}</h3>
      <p className="mt-1 text-sm text-azul/60">{catalog.description}</p>

      <ol className="mt-5 border-t border-azul/14">
        {matches.slice(0, TOP).map((m, i) => (
          <li key={m.profile.id} className="border-b border-azul/14 py-5">
            <MatchHeader testId={testId} match={m} top={i === 0} />
            <p className="mt-3 text-sm leading-6 text-azul/70">{m.profile.description}</p>
            <dl className="mt-3 grid gap-1 text-sm sm:grid-cols-2 sm:gap-6">
              <div>
                <dt className="inline font-semibold">Coincidís en: </dt>
                <dd className="inline text-azul/75">{m.agree.map(name).join(', ')}</dd>
              </div>
              <div>
                <dt className="inline font-semibold">Diferís en: </dt>
                <dd className="inline text-azul/75">{m.differ.map(name).join(', ')}</dd>
              </div>
            </dl>
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
}: {
  testId: TestId
  match: Match
  top?: boolean
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
            <p className="text-sm font-semibold tabular-nums" title="Cercanía de 0 a 100%">
              {pct}%
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
      {match.partial && ' · comparación parcial (pocos ejes con dato)'}
      {profile.contextNote && ` · ${profile.contextNote}`}
    </p>
  )
}
