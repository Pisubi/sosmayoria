import type { ArchetypeMatch } from '../data/archetypes'

interface AffinityBarsProps {
  matches: ArchetypeMatch[]
}

export function AffinityBars({ matches }: AffinityBarsProps) {
  return (
    <ol className="border-t border-azul/14">
      {matches.map((match, i) => {
        const pct = Math.round(match.similarity)
        const top = i === 0
        return (
          <li key={match.archetype.id} className="border-b border-azul/14 py-5">
            <div className="flex items-baseline justify-between gap-4">
              <p className="font-semibold">{match.archetype.name}</p>
              <p className="text-sm font-semibold tabular-nums">{pct}%</p>
            </div>
            <div className="mt-3 h-2 rounded-full bg-linea" title={`${match.archetype.name}: ${pct}%`}>
              <div
                className={`h-full rounded-full ${top ? 'bg-naranja' : 'bg-dato'}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-azul/70">
              {match.archetype.description}
            </p>
          </li>
        )
      })}
    </ol>
  )
}
