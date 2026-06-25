"use client"

import { useMemo, useState } from "react"
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import type { DiagnosticResults } from "@/lib/diagnostic-results"

const chartConfig = {
  total: { label: "Respuestas", color: "#2563EB" },
}

const colors = ["#2563EB", "#0891B2", "#16A34A", "#F59E0B", "#F97316", "#DC2626", "#7C3AED", "#0F766E"]

export function DiagnosticResultsView({ results }: { results: DiagnosticResults }) {
  const [blockId, setBlockId] = useState(results.bloques[0]?.id ?? "")
  const selectedBlock = useMemo(
    () => results.bloques.find((block) => block.id === blockId) ?? results.bloques[0],
    [blockId, results.bloques],
  )
  const answeredQuestions = selectedBlock?.preguntas.filter((question) => question.total > 0).length ?? 0

  if (!selectedBlock) {
    return (
      <div className="rounded-md border border-dashed p-10 text-center text-sm text-muted-foreground">
        Todavía no hay resultados de encuestas para analizar.
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 rounded-lg border border-blue-100 bg-blue-50/70 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-blue-950">Resultados de encuestas</h3>
          <p className="text-sm text-blue-900">Análisis por bloques desde la tabla cuestionario_limpio_respuestas.</p>
        </div>
        <select
          value={blockId}
          onChange={(event) => setBlockId(event.target.value)}
          className="h-9 min-w-72 rounded-md border border-blue-200 bg-white px-3 text-sm font-medium text-blue-950"
          aria-label="Seleccionar bloque de resultados"
        >
          {results.bloques.map((block) => (
            <option key={block.id} value={block.id}>
              {block.title}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Encuestas analizadas</p>
            <p className="mt-2 text-3xl font-semibold text-foreground">{results.totalEncuestas}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Preguntas del bloque</p>
            <p className="mt-2 text-3xl font-semibold text-foreground">{selectedBlock.totalPreguntas}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Preguntas con respuestas</p>
            <p className="mt-2 text-3xl font-semibold text-foreground">{answeredQuestions}/{selectedBlock.totalPreguntas}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle className="text-base">{selectedBlock.title}</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">{selectedBlock.description}</p>
            </div>
            <Badge variant="secondary">{selectedBlock.totalRespuestas} respuestas registradas</Badge>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 xl:grid-cols-2">
          {selectedBlock.preguntas.map((question) => (
            <div key={question.id} className="rounded-md border border-border p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">{question.label}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {question.total} respuestas · {question.sinRespuesta} sin respuesta
                  </p>
                </div>
                <Badge variant="outline">Top {question.respuestas.length}</Badge>
              </div>

              {question.respuestas.length === 0 ? (
                <p className="mt-6 text-sm text-muted-foreground">Sin respuestas para graficar.</p>
              ) : (
                <ChartContainer config={chartConfig} className="mt-4 h-[230px] w-full">
                  <BarChart data={question.respuestas} layout="vertical" margin={{ left: 8, right: 28, top: 4, bottom: 4 }}>
                    <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                    <XAxis type="number" allowDecimals={false} />
                    <YAxis dataKey="respuesta" type="category" width={135} tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                    <ChartTooltip content={<ChartTooltipContent formatter={(value) => `${value} respuestas`} />} />
                    <Bar dataKey="total" radius={[0, 4, 4, 0]} label={{ position: "right", formatter: (value: unknown) => `${value}`, fontSize: 11 }}>
                      {question.respuestas.map((answer, index) => (
                        <Cell key={answer.respuesta} fill={colors[index] ?? "#2563EB"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ChartContainer>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
