"use client"

import { useMemo, useState } from "react"
import { BarChart3, BookOpen, ClipboardList, FileText, TrendingUp } from "lucide-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Label,
  LabelList,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  XAxis,
  YAxis,
} from "recharts"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import type { ProjectDashboardData } from "@/lib/project-dashboard-data"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

const lineConfig = {
  planificado: { label: "Planificado", color: "#22C55E" },
  ejecutado: { label: "Ejecutado", color: "#2563EB" },
}

const productionConfig = {
  altoImpacto: { label: "Alto impacto", color: "#3B82F6" },
  regional: { label: "Regional", color: "#16A34A" },
}

const needsConfig = {
  valor: { label: "Necesidad", color: "#EF4444" },
}

const needsColors = [
  "#2563EB",
  "#0891B2",
  "#16A34A",
  "#F59E0B",
  "#F97316",
  "#DC2626",
]

const radarConfig = {
  valor: { label: "Promedio", color: "#10B981" },
}

const pieConfig = {
  valor: { label: "Cursos" },
}

const MONTH_ORDER: Record<string, number> = {
  ene: 1,
  feb: 2,
  mar: 3,
  abr: 4,
  may: 5,
  jun: 6,
  jul: 7,
  ago: 8,
  sep: 9,
  set: 9,
  oct: 10,
  nov: 11,
  dic: 12,
}

const MONTH_NAMES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"]

type DashboardCardData = {
  title: string
  value: string
  detail: string
  icon: typeof TrendingUp
  color: string
  progress?: number
  footer: string
  startDate?: string
  endDate?: string
}

function ChartFilter({
  value,
  onChange,
  options,
  label,
}: {
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  label: string
}) {
  return (
    <select
      aria-label={label}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-8 rounded-md border border-border bg-background px-2 text-xs font-medium text-foreground outline-none transition-colors hover:border-primary focus:border-primary"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}

function filterTimeData(data: ProjectDashboardData["tiempo"], mode: string) {
  const sourceApplied = [...data].sort((a, b) => {
    const parseValue = (value: string) => {
      const [monthRaw, yearRaw] = value.split(/\s+/)
      const month = MONTH_ORDER[monthRaw.slice(0, 3).toLowerCase()] ?? 0
      const year = Number(yearRaw) || 0
      return year * 100 + month
    }
    return parseValue(a.fecha) - parseValue(b.fecha)
  })
  if (mode === "anual") {
    const byYear = new Map<string, { fecha: string; planificado: number; ejecutado: number }>()
    let minYear = Number.POSITIVE_INFINITY
    let maxYear = 0
    for (const item of sourceApplied) {
      const year = Number(item.fecha.match(/\d{4}/)?.[0] ?? item.fecha)
      if (!Number.isFinite(year)) continue
      if (year < minYear) minYear = year
      if (year > maxYear) maxYear = year
      byYear.set(String(year), { fecha: String(year), planificado: item.planificado, ejecutado: item.ejecutado })
    }
    const timeline: { fecha: string; planificado: number; ejecutado: number }[] = []
    const startYear = Number.isFinite(minYear) ? minYear : maxYear || 2025
    const endYear = maxYear || startYear
    for (let year = startYear; year <= endYear; year += 1) {
      timeline.push(
        byYear.get(String(year)) ?? {
          fecha: String(year),
          planificado: 0,
          ejecutado: 0,
        },
      )
    }
    return timeline
  }
  if (mode === "mensual") {
    const byMonth = new Map<string, { fecha: string; planificado: number; ejecutado: number }>()
    for (const item of sourceApplied) {
      const [monthRaw, yearRaw] = item.fecha.split(/\s+/)
      const month = MONTH_ORDER[monthRaw.slice(0, 3).toLowerCase()] ?? 0
      const year = Number(yearRaw) || 0
      const key = `${year}-${String(month).padStart(2, "0")}`
      const current = byMonth.get(key) ?? { fecha: `${MONTH_NAMES[month - 1] ?? monthRaw} ${year}`, planificado: 0, ejecutado: 0 }
      current.planificado += item.planificado
      current.ejecutado += item.ejecutado
      byMonth.set(key, current)
    }

    const start = new Date(2026, 5, 1)
    const end = new Date(2027, 5, 1)
    const timeline: { fecha: string; planificado: number; ejecutado: number }[] = []
    for (let current = new Date(start); current <= end; current.setMonth(current.getMonth() + 1)) {
      const year = current.getFullYear()
      const month = current.getMonth() + 1
      const key = `${year}-${String(month).padStart(2, "0")}`
      timeline.push(
        byMonth.get(key) ?? {
          fecha: `${MONTH_NAMES[month - 1]} ${year}`,
          planificado: 0,
          ejecutado: 0,
        },
      )
    }
    return timeline
  }
  return sourceApplied
}

function DashboardCard({
  title,
  value,
  detail,
  icon: Icon,
  color,
  progress,
  footer,
  startDate,
  endDate,
}: DashboardCardData) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <p className="mt-4 text-3xl font-bold text-foreground">{value}</p>
          <p className="mt-1 text-sm text-muted-foreground">{detail}</p>
        </div>
        <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent", color)}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
      {progress !== undefined ? <Progress value={progress} className="mt-5" /> : <div className="mt-5 border-t border-border" />}
      {startDate && endDate ? (
        <div className="mt-4 flex items-start justify-between gap-4 text-sm">
          <div className="min-w-0">
            <p className={cn("font-medium", color)}>Fecha inicio</p>
            <p className="mt-1 text-foreground">{startDate}</p>
          </div>
          <div className="min-w-0 text-right">
            <p className={cn("font-medium", color)}>Fecha fin</p>
            <p className="mt-1 text-foreground">{endDate}</p>
          </div>
        </div>
      ) : (
        <p className={cn("mt-4 text-sm font-medium", color)}>{footer}</p>
      )}
    </Card>
  )
}

function getTopCards(data: ProjectDashboardData): DashboardCardData[] {
  return [
    {
      title: "Avance del Proyecto",
      value: `${data.proyecto.avance}%`,
      detail: "En progreso",
      icon: TrendingUp,
      color: "text-primary",
      progress: data.proyecto.avance,
      footer: "",
      startDate: data.proyecto.inicio,
      endDate: data.proyecto.fin,
    },
    {
      title: "Cursos Diseñados",
      value: `${data.cursos.disenados}`,
      detail: `${data.cursos.enValidacion} en validación`,
      icon: BookOpen,
      color: "text-chart-2",
      footer: `${data.cursos.total} cursos totales`,
    },
    {
      title: "Producción Científica",
      value: `${data.produccion.completados} / ${data.produccion.meta}`,
      detail: "Productos completados",
      icon: FileText,
      color: "text-chart-3",
      footer: `${data.produccion.cumplimiento}% de cumplimiento`,
    },
    {
      title: "Validación del Programa",
      value: `${data.validacion.encuestadas}`,
      detail: "Participantes encuestadas",
      icon: ClipboardList,
      color: "text-chart-4",
      progress: data.validacion.porcentaje,
      footer: `Meta: ${data.validacion.meta} participantes (${data.validacion.porcentaje}%)`,
    },
  ]
}

export function ProjectDashboard({ data }: { data: ProjectDashboardData }) {
  const [timeFilter, setTimeFilter] = useState("mensual")
  const [productionFilter, setProductionFilter] = useState("todos")
  const [competencyFilter, setCompetencyFilter] = useState("todos")
  const [needsFilter, setNeedsFilter] = useState("top5")
  const topCards = getTopCards(data)
  const totalCursos = data.cursos.estados.reduce((acc, item) => acc + item.valor, 0)
  const timeData = useMemo(() => filterTimeData(data.tiempo, timeFilter), [data.tiempo, timeFilter])
  const productionData = useMemo(
    () =>
      data.produccionPorInvestigador.map((item) => ({
        ...item,
        altoImpacto: productionFilter === "regional" ? 0 : item.altoImpacto,
        regional: productionFilter === "altoImpacto" ? 0 : item.regional,
      })),
    [data.produccionPorInvestigador, productionFilter],
  )
  const competencyData = useMemo(() => {
    if (competencyFilter === "bajas") return data.competencias.filter((item) => item.valor < 50)
    if (competencyFilter === "altas") return data.competencias.filter((item) => item.valor >= 50)
    return data.competencias
  }, [data.competencias, competencyFilter])
  const needsData = useMemo(() => {
    if (needsFilter === "todas") return data.necesidades
    const limit = Number(needsFilter.replace("top", ""))
    return data.necesidades.slice(0, Number.isFinite(limit) ? limit : 5)
  }, [data.necesidades, needsFilter])
  const activities = useMemo(() => [...data.actividades].sort((a, b) => a.fechaOrden.localeCompare(b.fechaOrden)), [data.actividades])

  return (
    <div className="space-y-4 px-6 pb-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Dashboard</h2>
          <p className="text-sm text-muted-foreground">Resumen general del proyecto</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {topCards.map((card) => (
          <DashboardCard key={card.title} {...card} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.2fr_1fr_1fr]">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base">Avance del Proyecto en el Tiempo</CardTitle>
            </div>
              <ChartFilter
              label="Filtrar avance del proyecto"
              value={timeFilter}
              onChange={setTimeFilter}
              options={[
                { value: "mensual", label: "Mensual" },
                { value: "anual", label: "Anual" },
              ]}
            />
          </CardHeader>
          <CardContent>
            <ChartContainer config={lineConfig} className="h-[260px] w-full">
              <LineChart data={timeData} margin={{ left: 0, right: 12, top: 8 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="fecha" tickLine={false} axisLine={false} tickMargin={8} style={{ fontSize: 11 }} />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value, name) => `${name === "planificado" ? "Planificado" : "Ejecutado"}: ${value}%`}
                    />
                  }
                />
                <ChartLegend content={<ChartLegendContent />} />
                <Line dataKey="planificado" type="monotone" stroke="var(--color-planificado)" strokeWidth={2.5} strokeDasharray="6 5" dot={{ r: 4 }} activeDot={false} />
                <Line dataKey="ejecutado" type="monotone" stroke="var(--color-ejecutado)" strokeWidth={3} dot={{ r: 4 }} activeDot={false} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-3">
              <CardTitle className="text-base">Producción por Investigador</CardTitle>
            <ChartFilter
              label="Filtrar producción por investigador"
              value={productionFilter}
              onChange={setProductionFilter}
              options={[
                { value: "todos", label: "Todos" },
                { value: "altoImpacto", label: "Alto impacto" },
                { value: "regional", label: "Regional" },
              ]}
            />
          </CardHeader>
          <CardContent>
            <ChartContainer config={productionConfig} className="h-[260px] w-full">
              <BarChart data={productionData} margin={{ left: 0, right: 12, top: 8 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="investigador" tickLine={false} axisLine={false} tickMargin={8} style={{ fontSize: 11 }} />
                <YAxis tickLine={false} axisLine={false} allowDecimals={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="altoImpacto" fill="var(--color-altoImpacto)" radius={[4, 4, 0, 0]}>
                  <LabelList dataKey="altoImpacto" position="top" className="fill-foreground text-xs font-medium" />
                </Bar>
                <Bar dataKey="regional" fill="var(--color-regional)" radius={[4, 4, 0, 0]}>
                  <LabelList dataKey="regional" position="top" className="fill-foreground text-xs font-medium" />
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <CardTitle className="text-base">Competencias Promedio (Diagnóstico)</CardTitle>
            <ChartFilter
              label="Filtrar competencias promedio"
              value={competencyFilter}
              onChange={setCompetencyFilter}
              options={[
                { value: "todos", label: "Todas" },
                { value: "bajas", label: "Bajas" },
                { value: "altas", label: "Altas" },
              ]}
            />
          </CardHeader>
          <CardContent>
            <ChartContainer config={radarConfig} className="h-[260px] w-full">
              <RadarChart data={competencyData} outerRadius={90}>
                <PolarGrid />
                <PolarAngleAxis dataKey="competencia" tick={{ fontSize: 11 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Radar dataKey="valor" stroke="var(--color-valor)" fill="var(--color-valor)" fillOpacity={0.35} />
              </RadarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_0.9fr_1.1fr]">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <CardTitle className="text-base">Necesidades de Formación Identificadas</CardTitle>
            <ChartFilter
              label="Filtrar necesidades de formación"
              value={needsFilter}
              onChange={setNeedsFilter}
              options={[
                { value: "top5", label: "Top 5" },
                { value: "top3", label: "Top 3" },
                { value: "todas", label: "Todas" },
              ]}
            />
          </CardHeader>
          <CardContent>
            <ChartContainer config={needsConfig} className="h-[260px] w-full">
              <BarChart data={needsData} layout="vertical" margin={{ left: 8, right: 36, top: 4 }}>
                <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                <YAxis dataKey="necesidad" type="category" tickLine={false} axisLine={false} width={125} style={{ fontSize: 11 }} />
                <ChartTooltip content={<ChartTooltipContent formatter={(v) => `${v}%`} />} />
                <Bar dataKey="valor" radius={[0, 4, 4, 0]} label={{ position: "right", formatter: (v: unknown) => `${v}%`, fontSize: 11 }}>
                  {needsData.map((item, index) => (
                    <Cell key={item.necesidad} fill={needsColors[index] ?? "var(--chart-1)"} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Estado de los Cursos</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-[0.9fr_1fr] xl:grid-cols-1">
            <ChartContainer config={pieConfig} className="mx-auto h-[190px] w-full">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Pie data={data.cursos.estados} dataKey="valor" nameKey="estado" innerRadius={52} outerRadius={78} strokeWidth={3}>
                  {data.cursos.estados.map((item) => (
                    <Cell key={item.estado} fill={item.fill} />
                  ))}
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                        return (
                          <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                            <tspan x={viewBox.cx} y={(viewBox.cy || 0) - 6} className="fill-foreground text-2xl font-bold">
                              {totalCursos}
                            </tspan>
                            <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 16} className="fill-muted-foreground text-xs">
                              cursos
                            </tspan>
                          </text>
                        )
                      }
                    }}
                  />
                </Pie>
              </PieChart>
            </ChartContainer>
            <div className="space-y-2">
              {data.cursos.estados.map((item) => (
                <div key={item.estado} className="flex items-center gap-2 text-sm">
                  <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: item.fill }} />
                  <span className="text-muted-foreground">{item.estado}</span>
                  <span className="ml-auto font-medium text-foreground">
                    {item.valor} ({item.porcentaje}%)
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Próximas Actividades</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {activities.map((activity) => (
                <li key={activity.titulo} className="flex items-center gap-3">
                  <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-white", activity.color)}>
                    <BarChart3 className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{activity.titulo}</p>
                    <p className="text-xs text-muted-foreground">{activity.fecha} · {activity.fuente}</p>
                  </div>
                  <Badge variant={activity.estado === "En proceso" ? "default" : "secondary"}>{activity.estado}</Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
