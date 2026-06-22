"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

const data = [
  { necesidad: "Educación financiera", valor: 82 },
  { necesidad: "Marketing digital", valor: 76 },
  { necesidad: "Formalización legal", valor: 68 },
  { necesidad: "Gestión de ventas", valor: 61 },
  { necesidad: "Uso de tecnología", valor: 54 },
  { necesidad: "Asociatividad", valor: 47 },
]

const config = {
  valor: { label: "Necesidad", color: "var(--chart-1)" },
}

export function TrainingNeedsChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Necesidades de Formación Identificadas</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={config} className="h-[280px] w-full">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ left: 8, right: 36, top: 4 }}
          >
            <CartesianGrid horizontal={false} strokeDasharray="3 3" />
            <XAxis type="number" domain={[0, 100]} hide />
            <YAxis
              dataKey="necesidad"
              type="category"
              tickLine={false}
              axisLine={false}
              width={130}
              tickMargin={4}
              style={{ fontSize: 12 }}
            />
            <ChartTooltip
              content={<ChartTooltipContent formatter={(v) => `${v}%`} />}
            />
            <Bar
              dataKey="valor"
              fill="var(--color-valor)"
              radius={[0, 4, 4, 0]}
              label={{
                position: "right",
                formatter: (v: unknown) => `${v}%`,
                fontSize: 12,
                fill: "var(--foreground)",
              }}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
