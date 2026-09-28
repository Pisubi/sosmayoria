import { useState } from 'react'
import type { Match } from '../lib/matching'
import type { Era } from '../types'

interface RankingListProps {
  matches: Match[]
  initialCount?: number
  showCountry?: boolean
  eraFilter?: boolean
}

const ERA_OPTIONS: { value: Era | 'todas'; label: string }[] = [
  { value: 'todas', label: 'Todas' },
  { value: 'historica', label: 'Históricas' },
  { value: 'actual', label: 'Actuales' },
]

export function RankingList({
  matches,
  initialCount = 5,
  showCountry = true,
  eraFilter = false,
}: RankingListProps) {
  const [expanded, setExpanded] = useState(false)
  const [era, setEra] = useState<Era | 'todas'>('todas')

  const filtered = era === 'todas' ? matches : matches.filter((m) => m.reference.era === era)
  const visible = expanded ? filtered : filtered.slice(0, initialCount)

  return (
    <div>
      {eraFilter && (
        <div className="mb-6 flex flex-wrap gap-2">
          {ERA_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              aria-pressed={era === option.value}
              onClick={() => setEra(option.value)}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                era === option.value
                  ? 'border-azul bg-azul text-marfil'
                  : 'border-azul/20 text-azul/75 hover:border-azul'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}

      <ol className="border-t border-azul/14">
        {visible.map((match, i) => {
          const pct = Math.round(match.similarity)
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
                  className={`h-full rounded-full ${i === 0 ? 'bg-naranja' : 'bg-dato'}`}
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
      {filtered.length > initialCount && (
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="mt-5 text-sm font-semibold text-azul underline decoration-naranja decoration-2 underline-offset-4 hover:text-noche"
        >
          {expanded ? 'Ver menos' : `Ver los ${filtered.length}`}
        </button>
      )}
    </div>
  )
}
