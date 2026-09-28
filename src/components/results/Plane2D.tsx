import type { Axis, AxisScore, Profile } from '../../types'
import { expressed } from '../../engine/matching'

interface Plane2DProps {
  xAxis: Axis
  yAxis: Axis
  scores: AxisScore[]
  profiles: Profile[]
  labelCount?: number
}

const SIZE = 340
const PAD = 44
const INNER = SIZE - PAD * 2

const toX = (v: number) => PAD + ((v + 100) / 200) * INNER
const toY = (v: number) => PAD + ((100 - v) / 200) * INNER

interface Label {
  id: string
  text: string
  x: number
  y: number
  anchor: 'start' | 'end' | 'middle'
}

type Box = { x0: number; y0: number; x1: number; y1: number }

const CHAR_WIDTH = 5.9
const LINE = 11

function boxOf(l: Omit<Label, 'id'>): Box {
  const w = l.text.length * CHAR_WIDTH
  const x0 = l.anchor === 'start' ? l.x : l.anchor === 'end' ? l.x - w : l.x - w / 2
  return { x0, y0: l.y - LINE + 2, x1: x0 + w, y1: l.y + 2 }
}

const overlaps = (a: Box, b: Box) => a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1

/** Coloca etiquetas sin superposiciones: prueba derecha, izquierda, arriba y abajo del punto. */
function placeLabels(
  candidates: { profile: Profile; x: number; y: number }[],
  user: { x: number; y: number },
  max: number,
): Label[] {
  const taken: Box[] = [{ x0: user.x - 12, y0: user.y - 22, x1: user.x + 12, y1: user.y + 8 }]
  const placed: Label[] = []
  for (const { profile, x, y } of candidates) {
    if (placed.length >= max) break
    const px = toX(x)
    const py = toY(y)
    const options: Omit<Label, 'id'>[] = [
      { text: profile.name, x: px + 6, y: py + 3, anchor: 'start' },
      { text: profile.name, x: px - 6, y: py + 3, anchor: 'end' },
      { text: profile.name, x: px, y: py - 7, anchor: 'middle' },
      { text: profile.name, x: px, y: py + 13, anchor: 'middle' },
    ]
    const fit = options.find((o) => {
      const b = boxOf(o)
      return b.x0 >= 0 && b.x1 <= SIZE && !taken.some((t) => overlaps(t, b))
    })
    if (!fit) continue
    taken.push(boxOf(fit))
    placed.push({ id: profile.id, ...fit })
  }
  return placed
}

export function Plane2D({ xAxis, yAxis, scores, profiles, labelCount = 6 }: Plane2DProps) {
  const u = {
    x: scores.find((s) => s.axisId === xAxis.id)?.score ?? null,
    y: scores.find((s) => s.axisId === yAxis.id)?.score ?? null,
  }
  // Como en el ranking: cada perfil se ubica donde quedaría en el test alguien que piensa como él.
  const points = profiles.flatMap((p) => {
    const x = expressed(xAxis, p.coords[xAxis.id])
    const y = expressed(yAxis, p.coords[yAxis.id])
    return x == null || y == null ? [] : [{ profile: p, x, y }]
  })
  const hasUser = u.x != null && u.y != null
  const labels = hasUser
    ? placeLabels(
        [...points]
          .sort((a, b) => Math.hypot(a.x - u.x!, a.y - u.y!) - Math.hypot(b.x - u.x!, b.y - u.y!))
          .slice(0, labelCount * 2),
        { x: toX(u.x!), y: toY(u.y!) },
        labelCount,
      )
    : []
  const labeled = new Set(labels.map((l) => l.id))

  return (
    <figure>
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        role="img"
        aria-label={`Plano ${xAxis.name} por ${yAxis.name}`}
        className="w-full"
      >
        <rect x={PAD} y={PAD} width={INNER} height={INNER} fill="var(--color-marfil)" />
        {[-50, 50].map((v) => (
          <g key={v} stroke="var(--color-linea)" strokeWidth={1}>
            <line x1={toX(v)} x2={toX(v)} y1={PAD} y2={PAD + INNER} />
            <line x1={PAD} x2={PAD + INNER} y1={toY(v)} y2={toY(v)} />
          </g>
        ))}
        <g stroke="rgb(30 58 71 / 0.35)" strokeWidth={1}>
          <line x1={toX(0)} x2={toX(0)} y1={PAD} y2={PAD + INNER} />
          <line x1={PAD} x2={PAD + INNER} y1={toY(0)} y2={toY(0)} />
        </g>
        <rect
          x={PAD}
          y={PAD}
          width={INNER}
          height={INNER}
          fill="none"
          stroke="rgb(30 58 71 / 0.2)"
        />

        <g fontSize={9} fill="var(--color-azul)" fillOpacity={0.7} fontFamily="Montserrat, system-ui">
          <text x={PAD} y={SIZE - PAD + 16}>{xAxis.poleA.label}</text>
          <text x={PAD + INNER} y={SIZE - PAD + 16} textAnchor="end">{xAxis.poleB.label}</text>
          <text x={PAD} y={PAD - 8}>↑ {yAxis.poleB.label}</text>
          <text x={PAD} y={SIZE - PAD + 30}>↓ {yAxis.poleA.label}</text>
        </g>

        {points.map(({ profile, x, y }) => (
          <circle
            key={profile.id}
            cx={toX(x)}
            cy={toY(y)}
            r={labeled.has(profile.id) ? 4 : 3}
            fill="var(--color-dato)"
            fillOpacity={labeled.has(profile.id) ? 1 : 0.35}
            stroke="var(--color-marfil)"
            strokeWidth={1}
          >
            <title>{profile.name}</title>
          </circle>
        ))}
        <g fontSize={9} fontWeight={500} fill="var(--color-azul)" fontFamily="Montserrat, system-ui">
          {labels.map((l) => (
            <text
              key={l.id}
              x={l.x}
              y={l.y}
              textAnchor={l.anchor}
              paintOrder="stroke"
              stroke="var(--color-marfil)"
              strokeWidth={3}
            >
              {l.text}
            </text>
          ))}
        </g>

        {hasUser && (
          <g>
            <circle cx={toX(u.x!)} cy={toY(u.y!)} r={7} fill="var(--color-naranja)" stroke="var(--color-marfil)" strokeWidth={2}>
              <title>Vos</title>
            </circle>
            <text
              x={toX(u.x!)}
              y={toY(u.y!) - 11}
              textAnchor="middle"
              fontSize={10}
              fontWeight={700}
              fill="var(--color-naranja)"
              fontFamily="Montserrat, system-ui"
              paintOrder="stroke"
              stroke="var(--color-marfil)"
              strokeWidth={3}
            >
              Vos
            </text>
          </g>
        )}
      </svg>
      <figcaption className="mt-2 text-sm">
        <span className="font-semibold">{xAxis.name}</span> ×{' '}
        <span className="font-semibold">{yAxis.name}</span>
        {!hasUser && (
          <span className="block text-xs text-azul/60">
            Algún tema quedó indeterminado: tu posición no se puede ubicar en este plano.
          </span>
        )}
      </figcaption>
    </figure>
  )
}
