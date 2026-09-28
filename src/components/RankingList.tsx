import { useState } from 'react'
import type { Match } from '../lib/matching'

interface RankingListProps {
  matches: Match[]
  initialCount?: number
  showCountry?: boolean
}

export function RankingList({ matches, initialCount = 5, showCountry = true }: RankingListProps) {
  const [expanded, setExpanded] = useState(false)
  const visible = expanded ? matches : matches.slice(0, initialCount)

  return (
    <div>
      <ol className="border-t border-azul/14">
        {visible.map((match, i) => {
          const pct = Math.round(match.similarity)
          const top = i === 0
          const { reference } = match
          return (
            <li key={reference.id} className="border-b border-azul/14 py-5">
              <div className="flex items-baseline justify-between gap-4">
                <p className="font-semibold">
                  {reference.name}
                  {showCountry && (
                    <span className="ml-2 text-xs font-medium tracking-[0.12em] text-azul/55 uppercase">
                      {reference.country}
                    </span>
                  )}
                </p>
                <p className="text-sm font-semibold tabular-nums">{pct}%</p>
              </div>
              <div
                className="mt-3 h-2 rounded-full bg-linea"
                title={`${reference.name}: ${pct}% de afinidad`}
              >
                <div
                  className={`h-full rounded-full ${top ? 'bg-naranja' : 'bg-dato'}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-azul/70">
                {reference.description}
              </p>
            </li>
          )
        })}
      </ol>
      {matches.length > initialCount && (
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="mt-5 text-sm font-semibold text-azul underline decoration-naranja decoration-2 underline-offset-4 hover:text-noche"
        >
          {expanded ? 'Ver menos' : `Ver los ${matches.length}`}
        </button>
      )}
    </div>
  )
}
