"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import {
  Line,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts"

const data = [
  { fecha: "May", planificado: 8, ejecutado: 6 },
  { fecha: "Jun", planificado: 18, ejecutado: 14 },
  { fecha: "Jul", planificado: 28, ejecutado: 22 },
  { fecha: "Ago", planificado: 40, ejecutado: 31 },
  { fecha: "Sep", planificado: 52, ejecutado: 39 },
  { fecha: "Oct", planificado: 64, ejecutado: 45 },
  { fecha: "Nov", planificado: 75, ejecutado: null },
  { fecha: "Dic", planificado: 85, ejecutado: null },
]

const config = {
  planificado: { label: "Planificado", color: "var(--chart-2)" },
  ejecutado: { label: "Ejecutado", color: "var(--chart-1)" },
}

export function ProjectTimeChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Análisis del Proyecto en el Tiempo</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={config} className="h-[280px] w-full">
          <LineChart data={data} margin={{ left: 0, right: 12, top: 8 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="fecha" tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              domain={[0, 100]}
              tickFormatter={(v) => `${v}%`}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Line
              dataKey="planificado"
              type="monotone"
              stroke="var(--color-planificado)"
              strokeWidth={2}
              strokeDasharray="6 5"
              dot={false}
            />
            <Line
              dataKey="ejecutado"
              type="monotone"
              stroke="var(--color-ejecutado)"
              strokeWidth={2.5}
              dot={{ r: 3 }}
              connectNulls
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
