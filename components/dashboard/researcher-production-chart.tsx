"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

const data = [
  { investigador: "R. Vera", planificado: 4, ejecutado: 3 },
  { investigador: "M. Loor", planificado: 3, ejecutado: 2 },
  { investigador: "J. Cedeño", planificado: 3, ejecutado: 1 },
  { investigador: "A. Mora", planificado: 2, ejecutado: 2 },
  { investigador: "P. Solís", planificado: 2, ejecutado: 1 },
]

const config = {
  planificado: { label: "Planificado", color: "var(--chart-2)" },
  ejecutado: { label: "Ejecutado", color: "var(--chart-1)" },
}

export function ResearcherProductionChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Producción por Investigador</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={config} className="h-[280px] w-full">
          <BarChart data={data} margin={{ left: 0, right: 12, top: 8 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="investigador"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} allowDecimals={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey="planificado" fill="var(--color-planificado)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="ejecutado" fill="var(--color-ejecutado)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
