"use client"

import { useMemo, useState } from "react"
import {
  BarChart3,
  BookOpen,
  CalendarDays,
  ClipboardList,
  FileText,
  TrendingUp,
} from "lucide-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Label,
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
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

const lineConfig = {
  planificado: { label: "Planificado", color: "#22C55E" },
  ejecutado: { label: "Ejecutado", color: "#2563EB" },
}

const productionConfig = {
  planificado: { label: "Planificado", color: "#3B82F6" },
  ejecutado: { label: "Ejecutado", color: "#16A34A" },
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

type DashboardCardData = {
  title: string
  value: string
  detail: string
  icon: typeof TrendingUp
  color: string
  progress?: number
  footer: string
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
  if (mode === "anual") {
    const byYear = new Map<string, ProjectDashboardData["tiempo"][number]>()
    for (const item of data) {
      const year = item.fecha.match(/\d{4}/)?.[0] ?? item.fecha
      byYear.set(year, { ...item, fecha: year })
    }
    return [...byYear.values()]
  }
  if (mode === "semestral") {
    return data.filter((_, index) => index % 2 === 0 || index === data.length - 1)
  }
  return data
}

function DashboardCard({
  title,
  value,
  detail,
  icon: Icon,
  color,
  progress,
  footer,
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
      <p className={cn("mt-4 text-sm font-medium", color)}>{footer}</p>
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
      footer: `Fecha inicio ${data.proyecto.inicio}`,
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
        planificado: productionFilter === "ejecutado" ? 0 : item.planificado,
        ejecutado: productionFilter === "planificado" ? 0 : item.ejecutado,
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

  return (
    <div className="space-y-4 px-6 pb-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Dashboard</h2>
          <p className="text-sm text-muted-foreground">Resumen general del proyecto</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            <span>{data.periodo}</span>
          </div>
          <Button>
            <FileText className="mr-1.5 h-4 w-4" />
            Exportar reporte
          </Button>
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
            <CardTitle className="text-base">Avance del Proyecto en el Tiempo</CardTitle>
            <ChartFilter
              label="Filtrar avance del proyecto"
              value={timeFilter}
              onChange={setTimeFilter}
              options={[
                { value: "mensual", label: "Mensual" },
                { value: "semestral", label: "Semestral" },
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
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Line dataKey="planificado" type="monotone" stroke="var(--color-planificado)" strokeWidth={2} strokeDasharray="6 5" dot={false} />
                <Line dataKey="ejecutado" type="monotone" stroke="var(--color-ejecutado)" strokeWidth={2.5} dot={{ r: 3 }} />
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
                { value: "planificado", label: "Planificado" },
                { value: "ejecutado", label: "Ejecutado" },
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
                <Bar dataKey="planificado" fill="var(--color-planificado)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="ejecutado" fill="var(--color-ejecutado)" radius={[4, 4, 0, 0]} />
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
              {data.actividades.map((activity) => (
                <li key={activity.titulo} className="flex items-center gap-3">
                  <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-white", activity.color)}>
                    <BarChart3 className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{activity.titulo}</p>
                    <p className="text-xs text-muted-foreground">{activity.fecha}</p>
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
