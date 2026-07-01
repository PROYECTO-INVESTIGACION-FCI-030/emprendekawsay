"use client"

import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import {
  BarChart3,
  BookOpenCheck,
  ClipboardList,
  FileText,
  GraduationCap,
  LineChart,
  Network,
  ShieldCheck,
  TrendingUp,
  Users,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

type RoleKey = "investigadora" | "formadora" | "institucion_aliada"

type RoleCard = {
  label: string
  value: string
  detail: string
  icon: LucideIcon
  href: string
}

type WorkItem = {
  name: string
  detail: string
  status: string
  progress: number
  href: string
}

const roleDashboards: Record<RoleKey, {
  title: string
  subtitle: string
  action: string
  actionHref: string
  cards: RoleCard[]
  work: WorkItem[]
  focus: string[]
}> = {
  investigadora: {
    title: "Panel de investigadora",
    subtitle: "Analiza resultados, valida datos y prepara insumos cientificos.",
    action: "Ver analitica",
    actionHref: "/analitica",
    cards: [
      { label: "Respuestas validadas", value: "180", detail: "Encuestas listas para analisis", icon: ClipboardList, href: "/diagnostico" },
      { label: "Segmentos", value: "9", detail: "Cruces por grupo y territorio", icon: Users, href: "/analitica" },
      { label: "Indicadores", value: "12", detail: "Sociales, economicos y academicos", icon: LineChart, href: "/avance" },
      { label: "Productos", value: "3/10", detail: "Produccion cientifica", icon: FileText, href: "/produccion-cientifica" },
    ],
    work: [
      { name: "Analisis de necesidades", detail: "Cruzar respuestas del diagnostico", status: "Activo", progress: 76, href: "/analitica" },
      { name: "Validacion metodologica", detail: "Revisar claridad y utilidad", status: "Revision", progress: 50, href: "/validacion" },
      { name: "Dataset anonimizado", detail: "Preparar base para investigacion", status: "Activo", progress: 85, href: "/produccion-cientifica" },
    ],
    focus: [
      "Revisar calidad de datos y consistencia de respuestas",
      "Generar interpretacion estadistica y cualitativa",
      "Preparar reportes academicos y productos cientificos",
    ],
  },
  formadora: {
    title: "Panel de formadora",
    subtitle: "Gestiona cursos, actividades, evaluaciones y avance de participantes.",
    action: "Abrir malla",
    actionHref: "/malla-formativa",
    cards: [
      { label: "Modulos asignados", value: "5", detail: "Cursos activos", icon: GraduationCap, href: "/malla-formativa" },
      { label: "Participantes", value: "83", detail: "En cohortes activas", icon: Users, href: "/malla-formativa" },
      { label: "Evaluaciones", value: "24", detail: "Actividades entregadas", icon: BookOpenCheck, href: "/avance" },
      { label: "Avance promedio", value: "58%", detail: "Seguimiento formativo", icon: TrendingUp, href: "/avance" },
    ],
    work: [
      { name: "Gestion financiera basica", detail: "Modulo en ejecucion", status: "Activo", progress: 62, href: "/malla-formativa" },
      { name: "Marketing digital", detail: "Materiales en revision", status: "Revision", progress: 20, href: "/malla-formativa" },
      { name: "Evaluaciones practicas", detail: "Calificar entregas recientes", status: "Activo", progress: 45, href: "/avance" },
    ],
    focus: [
      "Administrar contenidos y actividades de aprendizaje",
      "Registrar calificaciones y observaciones",
      "Acompanhar avance y necesidades de refuerzo",
    ],
  },
  institucion_aliada: {
    title: "Panel de institucion aliada",
    subtitle: "Consulta avance, indicadores, reportes y evidencias del proyecto.",
    action: "Ver reportes",
    actionHref: "/reportes",
    cards: [
      { label: "Avance general", value: "65%", detail: "Progreso institucional", icon: TrendingUp, href: "/avance" },
      { label: "Fases activas", value: "5", detail: "Cronograma del proyecto", icon: Network, href: "/proyecto" },
      { label: "Indicadores", value: "12", detail: "Seguimiento de metas", icon: BarChart3, href: "/avance" },
      { label: "Reportes", value: "9", detail: "Documentos disponibles", icon: FileText, href: "/reportes" },
    ],
    work: [
      { name: "Reporte general", detail: "Avance consolidado del proyecto", status: "Activo", progress: 65, href: "/reportes" },
      { name: "Indicadores de impacto", detail: "Seguimiento social y economico", status: "Activo", progress: 52, href: "/avance" },
      { name: "Evidencias institucionales", detail: "Documentos y anexos", status: "Revision", progress: 40, href: "/proyecto" },
    ],
    focus: [
      "Consultar informacion institucional y reportes",
      "Revisar cumplimiento de fases y metas",
      "Acompanhar impacto y evidencias del proyecto",
    ],
  },
}

export function RoleDashboard({ rolRaw }: { rolRaw: RoleKey }) {
  const data = roleDashboards[rolRaw]

  return (
    <div className="space-y-4 px-4 pb-8 sm:px-6">
      <Card className="p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">{data.title}</h2>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{data.subtitle}</p>
          </div>
          <Link href={data.actionHref}>
            <Button>{data.action}</Button>
          </Link>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {data.cards.map((card) => (
          <Link key={card.label} href={card.href}>
            <Card className="h-full p-5 transition-colors hover:bg-secondary/60">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
                  <p className="mt-2 text-3xl font-semibold text-foreground">{card.value}</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-accent text-primary">
                  <card.icon className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{card.detail}</p>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Trabajo principal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.work.map((item) => (
              <Link key={item.name} href={item.href} className="block rounded-md border border-border p-4 transition-colors hover:bg-secondary/60">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.detail}</p>
                  </div>
                  <Badge variant={item.status === "Activo" ? "default" : "secondary"}>{item.status}</Badge>
                </div>
                <div className="mt-3">
                  <div className="mb-1.5 flex justify-between text-xs text-muted-foreground">
                    <span>Avance</span>
                    <span>{item.progress}%</span>
                  </div>
                  <Progress value={item.progress} />
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Enfoque del rol</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {data.focus.map((item) => (
                <li key={item} className="flex gap-2 text-sm text-muted-foreground">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
