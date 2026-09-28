import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import type { AxisResult } from '../types'

const DATO = '#3D6B84'
const LINEA = '#E4E0D4'
const AZUL = '#1E3A47'

interface AxisRadarChartProps {
  results: AxisResult[]
}

interface Datum {
  axis: string
  valor: number
  score: number
  leaning: string
}

function RadarTooltip({ active, payload }: { active?: boolean; payload?: { payload: Datum }[] }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="rounded-md border border-azul/14 bg-marfil px-3 py-2 text-xs text-azul">
      <p className="font-semibold">{d.axis}</p>
      <p className="mt-0.5 text-azul/75">
        {d.score === 0 ? 'Neutral' : `${Math.abs(d.score)} hacia ${d.leaning}`}
      </p>
    </div>
  )
}

function wrapLabel(label: string, maxChars = 11): string[] {
  const lines: string[] = []
  for (const word of label.split(' ')) {
    const last = lines[lines.length - 1]
    if (last && (last + ' ' + word).length <= maxChars) {
      lines[lines.length - 1] = last + ' ' + word
    } else {
      lines.push(word)
    }
  }
  return lines
}

interface TickProps {
  x?: number
  y?: number
  textAnchor?: 'start' | 'middle' | 'end'
  payload?: { value: string }
}

function AxisTick({ x = 0, y = 0, textAnchor, payload }: TickProps) {
  const lines = wrapLabel(payload?.value ?? '')
  const lineHeight = 13
  const offsetY = -((lines.length - 1) * lineHeight) / 2
  return (
    <text
      x={x}
      y={y + offsetY}
      textAnchor={textAnchor}
      fill={AZUL}
      fontSize={11}
      fontFamily="Montserrat, system-ui, sans-serif"
      fontWeight={500}
      dominantBaseline="central"
    >
      {lines.map((line, i) => (
        <tspan key={i} x={x} dy={i === 0 ? 0 : lineHeight}>
          {line}
        </tspan>
      ))}
    </text>
  )
}

export function AxisRadarChart({ results }: AxisRadarChartProps) {
  const data: Datum[] = results.map((r) => ({
    axis: r.axis.name,
    // -100..100 → 0..100: centro = primer polo, borde = segundo polo
    valor: (r.score + 100) / 2,
    score: r.score,
    leaning: r.score >= 0 ? r.axis.poleB.label : r.axis.poleA.label,
  }))

  return (
    <div className="h-80 w-full sm:h-[34rem]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="62%">
          <PolarGrid stroke={LINEA} />
          <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} tickCount={5} />
          <PolarAngleAxis dataKey="axis" tick={<AxisTick />} />
          <Radar
            dataKey="valor"
            stroke={DATO}
            strokeWidth={2}
            fill={DATO}
            fillOpacity={0.18}
            dot={{ r: 4, fill: DATO, stroke: '#F0ECE3', strokeWidth: 2 }}
            isAnimationActive={false}
          />
          <Tooltip content={<RadarTooltip />} cursor={false} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}
