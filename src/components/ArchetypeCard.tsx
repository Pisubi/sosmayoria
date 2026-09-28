import type { ArchetypeMatch } from '../data/archetypes'

interface ArchetypeCardProps {
  match: ArchetypeMatch
  primary?: boolean
}

export function ArchetypeCard({ match, primary }: ArchetypeCardProps) {
  const { archetype, similarity } = match
  return (
    <div
      className={`rounded-2xl border p-5 ${
        primary
          ? 'border-forest bg-forest text-cream'
          : 'border-ink/10 bg-cream-soft text-ink dark:border-cream/10 dark:bg-white/5 dark:text-cream'
      }`}
    >
      <div className="flex items-center justify-between">
        <p className="text-lg font-bold">{archetype.name}</p>
        <span className="text-sm font-semibold opacity-70">
          {Math.round(similarity)}% afinidad
        </span>
      </div>
      <p className="mt-2 text-sm opacity-90">{archetype.description}</p>
    </div>
  )
}
