"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Label, Pie, PieChart } from "recharts"

const data = [
  { estado: "Completados", valor: 2, fill: "var(--chart-1)" },
  { estado: "En validación", valor: 2, fill: "var(--chart-3)" },
  { estado: "En diseño", valor: 1, fill: "var(--chart-2)" },
  { estado: "Pendientes", valor: 3, fill: "var(--chart-4)" },
]

const total = data.reduce((acc, d) => acc + d.valor, 0)

const config = {
  valor: { label: "Cursos" },
  Completados: { label: "Completados", color: "var(--chart-1)" },
  "En validación": { label: "En validación", color: "var(--chart-3)" },
  "En diseño": { label: "En diseño", color: "var(--chart-2)" },
  Pendientes: { label: "Pendientes", color: "var(--chart-4)" },
}

export function CourseStatusChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Estados de los Cursos</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <ChartContainer config={config} className="mx-auto aspect-square h-[220px]">
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <Pie
              data={data}
              dataKey="valor"
              nameKey="estado"
              innerRadius={62}
              outerRadius={90}
              strokeWidth={3}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {total}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 22}
                          className="fill-muted-foreground text-xs"
                        >
                          Cursos
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
        <div className="grid w-full grid-cols-2 gap-2">
          {data.map((d) => (
            <div key={d.estado} className="flex items-center gap-2 text-sm">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: d.fill }}
              />
              <span className="text-muted-foreground">{d.estado}</span>
              <span className="ml-auto font-medium text-foreground">{d.valor}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
