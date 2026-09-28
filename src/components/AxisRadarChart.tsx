import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from 'recharts'
import type { AxisResult } from '../types'

interface AxisRadarChartProps {
  results: AxisResult[]
}

export function AxisRadarChart({ results }: AxisRadarChartProps) {
  const data = results.map((r) => ({
    axis: r.axis.name,
    // recharts radar se lleva mejor con valores positivos: normalizamos -100..100 a 0..100
    valor: (r.score + 100) / 2,
  }))

  return (
    <div className="h-80 w-full sm:h-96">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="70%">
          <PolarGrid stroke="currentColor" className="text-ink/15 dark:text-cream/15" />
          <PolarAngleAxis
            dataKey="axis"
            tick={{ fontSize: 11, fill: 'currentColor' }}
            className="text-ink/70 dark:text-cream/70"
          />
          <Radar
            dataKey="valor"
            stroke="#143a29"
            fill="#143a29"
            fillOpacity={0.35}
            isAnimationActive={false}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}
