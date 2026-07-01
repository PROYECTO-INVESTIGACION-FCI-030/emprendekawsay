"use client"

import { useMemo } from "react"
import { Brain, Lightbulb, TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import type { CoursePrediction } from "@/lib/course-prediction"
import type { ProjectDashboardData } from "@/lib/project-dashboard-data"

const colors = ["#2563EB", "#0891B2", "#16A34A", "#F59E0B", "#F97316", "#DC2626"]

const chartConfig = {
  valor: { label: "Porcentaje", color: "#2563EB" },
}

export function NeedsAnalytics({
  data,
  predictions,
}: {
  data: ProjectDashboardData
  predictions: CoursePrediction[]
}) {
  const safePredictions = useMemo(() => (Array.isArray(predictions) ? predictions : []), [predictions])
  const topPrediction = useMemo(() => [...safePredictions].sort((a, b) => b.brecha - a.brecha).slice(0, 5), [safePredictions])
  const topNeeds = useMemo(() => [...data.necesidades].sort((a, b) => b.valor - a.valor).slice(0, 5), [data.necesidades])
  const strongestNeed = topNeeds[0]
  const dominantBlock = topPrediction[0]?.bloque ?? "Sin datos suficientes"
  const dominantCourse = topPrediction[0]
  const responseLabel = data.validacion.encuestadas === 1 ? "respuesta analizada" : "respuestas analizadas"

  return (
    <div className="space-y-5 px-4 pb-8 sm:px-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-blue-100 bg-blue-50/70">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-blue-600 text-white">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-blue-900">Necesidad principal</p>
                <p className="text-2xl font-semibold text-blue-950">{strongestNeed?.valor ?? 0}%</p>
              </div>
            </div>
            <p className="mt-3 text-sm text-blue-900">{strongestNeed?.necesidad ?? "Sin datos suficientes"}</p>
          </CardContent>
        </Card>

        <Card className="border-cyan-100 bg-cyan-50/70">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-cyan-600 text-white">
                <Brain className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-cyan-900">{responseLabel}</p>
                <p className="text-2xl font-semibold text-cyan-950">{data.validacion.encuestadas}</p>
              </div>
            </div>
            <p className="mt-3 text-sm text-cyan-900">Lectura automática desde el cuestionario limpio.</p>
          </CardContent>
        </Card>

        <Card className="border-amber-100 bg-amber-50/70">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-amber-500 text-white">
                <Lightbulb className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-amber-900">Cursos sugeridos</p>
                <p className="text-2xl font-semibold text-amber-950">{safePredictions.length}</p>
              </div>
            </div>
            <p className="mt-3 text-sm text-amber-900">Generados por brechas de conocimiento detectadas.</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Necesidades detectadas por preguntas y respuestas</CardTitle>
          </CardHeader>
          <CardContent className="overflow-hidden">
            <ChartContainer config={chartConfig} className="h-[260px] w-full sm:h-[300px]">
              <BarChart data={topNeeds} layout="vertical" margin={{ left: 10, right: 28 }}>
                <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                <YAxis dataKey="necesidad" type="category" width={120} tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent formatter={(value) => `${value}%`} />} />
                <Bar
                  dataKey="valor"
                  radius={[0, 4, 4, 0]}
                  label={{ position: "right", formatter: (value: unknown) => `${value}%`, fontSize: 11 }}
                >
                  {topNeeds.map((item, index) => (
                    <Cell key={item.necesidad} fill={colors[index] ?? "#2563EB"} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Lectura del agente IA</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-md border border-border bg-card p-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Bloque dominante</p>
              <p className="mt-1 text-sm font-semibold text-foreground">{dominantBlock}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {dominantCourse
                  ? `${dominantCourse.titulo} con prioridad ${dominantCourse.brecha}%`
                  : "Sin sugerencias suficientes todavía."}
              </p>
            </div>
            {topPrediction.map((prediction) => (
              <div key={prediction.id} className="rounded-md border border-border bg-card p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{prediction.titulo}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{prediction.bloque}</p>
                  </div>
                  <Badge variant={prediction.brecha >= 60 ? "destructive" : "secondary"}>{prediction.brecha}%</Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{prediction.descripcion}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Competencias calculadas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.competencias.map((item) => (
              <div key={item.competencia}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground">{item.competencia}</span>
                  <span className="text-muted-foreground">{item.valor}%</span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-muted">
                  <div className="h-2 rounded-full bg-primary" style={{ width: `${item.valor}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Lectura automática</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm text-muted-foreground">
            <p>Las tarjetas y gráficos se actualizan según el conteo real de respuestas por pregunta y el ranking de necesidades detectadas.</p>
            <p>La predicción toma las brechas del cuestionario limpio y prioriza cursos por bloque según el nivel de necesidad observado.</p>
            <p>Las competencias se calculan con el mapeo de preguntas ya definido para Financiera, Digital, Comercial, Innovación y Gestión.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
