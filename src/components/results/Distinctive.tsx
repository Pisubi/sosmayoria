import { distinctive, type AxisReading } from '../../engine/insights'
import type { AxisScore, Profile, TestDefinition } from '../../types'

interface DistinctiveProps {
  test: TestDefinition
  scores: AxisScore[]
  /** Catálogo de referencia (ideologías o tradiciones). */
  profiles: Profile[]
  catalogName: string
}

/** Lo que te distingue frente al catálogo de referencia: lo inusual, lo típico y una tensión. */
export function Distinctive({ test, scores, profiles, catalogName }: DistinctiveProps) {
  const { unusual, typical, tension } = distinctive(scores, test.axes, profiles)
  if (!unusual) return null
  const catalog = catalogName.toLowerCase()
  const pole = (r: AxisReading) => (r.score >= 0 ? r.axis.poleB.label : r.axis.poleA.label).toLowerCase()

  return (
    <section className="mx-auto max-w-5xl px-4 pt-16 sm:px-6">
      <p className="flex items-center gap-3 text-xs font-medium tracking-[0.12em] text-naranja uppercase">
        <span aria-hidden className="h-0.5 w-7 bg-naranja" />
        Lo que te distingue
      </p>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Card label="Tu posición más inusual" title={unusual.axis.name}>
          {Math.abs(unusual.score) < 15
            ? `Estás en el centro, mientras que las ${catalog} suelen inclinarse hacia un lado.`
            : unusual.beyond >= 0.99
              ? `Ninguna de las ${catalog} se inclina tanto como vos hacia ${pole(unusual)}.`
              : `Te inclinás hacia ${pole(unusual)} más que el ${Math.round(unusual.beyond * 100)}% de las ${catalog}.`}
          <Track reading={unusual} />
        </Card>
        {typical && (
          <Card label="Tu posición más típica" title={typical.axis.name}>
            Ahí estás cerca de lo más común entre las {catalog}: es terreno compartido.
            <Track reading={typical} />
          </Card>
        )}
        {tension ? (
          <Card label="Tu combinación poco común" title={`${tension.a.axis.name} y ${tension.b.axis.name}`} dark>
            En las {catalog}, estos dos temas suelen ir juntos; vos los combinás al revés (
            {pole(tension.a)} y {pole(tension.b)}). Solo {tension.share.length} de {tension.total} comparten esa
            combinación
            {tension.share.length > 0 && `: ${tension.share.slice(0, 3).map((p) => p.name).join(', ')}`}.
          </Card>
        ) : (
          <Card label="Tu combinación" title="Coherente con el catálogo" dark>
            Tus posiciones se combinan como en la mayoría de las {catalog}: no aparece ninguna
            tensión marcada entre temas.
          </Card>
        )}
      </div>
    </section>
  )
}

function Card({
  label,
  title,
  dark = false,
  children,
}: {
  label: string
  title: string
  dark?: boolean
  children: React.ReactNode
}) {
  return (
    <div className={`rounded-3xl p-6 ${dark ? 'bg-azul text-marfil' : 'border border-azul/12 bg-papel'}`}>
      <p className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${dark ? 'bg-marfil/15' : 'bg-linea'}`}>
        {label}
      </p>
      <p className="mt-4 text-xl leading-snug font-bold">{title}</p>
      <div className={`mt-3 text-sm leading-6 ${dark ? 'text-marfil/80' : 'text-azul/75'}`}>{children}</div>
    </div>
  )
}

function Track({ reading }: { reading: AxisReading }) {
  const pos = (v: number) => `${50 + v / 2}%`
  return (
    <span className="mt-4 block">
      <span className="relative block h-1.5 rounded-full bg-linea">
        <span aria-hidden className="absolute top-1/2 left-1/2 h-3 w-px -translate-y-1/2 bg-azul/30" />
        <span
          className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-papel bg-azul/50"
          style={{ left: pos(reading.median) }}
          title="Mediana del catálogo"
        />
        <span
          className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-papel bg-naranja"
          style={{ left: pos(reading.score) }}
          title="Vos"
        />
      </span>
      <span className="mt-1.5 flex justify-between text-[11px] text-azul/50">
        <span>{reading.axis.poleA.label}</span>
        <span>{reading.axis.poleB.label}</span>
      </span>
      <span className="mt-1 block text-[11px] text-azul/55">
        <span className="mr-1 inline-block h-2 w-2 rounded-full bg-naranja align-middle" /> vos
        <span className="mr-1 ml-3 inline-block h-2 w-2 rounded-full bg-azul/50 align-middle" /> mediana del catálogo
      </span>
    </span>
  )
}
