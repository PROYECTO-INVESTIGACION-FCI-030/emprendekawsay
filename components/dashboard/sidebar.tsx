"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Brain,
  Award,
  BookOpenCheck,
  CheckSquare,
  ClipboardList,
  FileText,
  FlaskConical,
  FolderKanban,
  LayoutDashboard,
  LineChart,
  Network,
  Settings,
  TrendingUp,
} from "lucide-react"
import type { ProjectInfo as ProjectInfoData } from "@/lib/project-info"
import { cn } from "@/lib/utils"

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/", roles: ["all"] },
  { label: "Proyecto", icon: FolderKanban, href: "/proyecto", roles: ["administradora", "investigadora", "formadora", "institucion_aliada"] },
  { label: "Diagnóstico (Encuesta)", icon: ClipboardList, href: "/diagnostico", roles: ["administradora", "investigadora"] },
  { label: "Analítica de Necesidades", icon: LineChart, href: "/analitica", roles: ["administradora", "investigadora", "formadora"] },
  { label: "Predicción de Cursos", icon: Brain, href: "/prediccion", roles: ["administradora", "investigadora", "formadora"] },
  { label: "Diseño de Cursos", icon: BookOpenCheck, href: "/diseno-cursos", roles: ["administradora", "investigadora", "formadora"] },
  { label: "Malla Formativa", icon: Network, href: "/malla-formativa", roles: ["administradora", "investigadora", "formadora"] },
  { label: "Formación", icon: BookOpenCheck, href: "/malla-formativa", roles: ["mujer_emprendedora"] },
  { label: "Evaluaciones", icon: CheckSquare, href: "/evaluaciones", roles: ["mujer_emprendedora"] },
  { label: "Certificados", icon: Award, href: "/certificados", roles: ["mujer_emprendedora"] },
  { label: "Producción Científica", icon: FlaskConical, href: "/produccion", roles: ["administradora", "investigadora"] },
  { label: "Avance del Proyecto", icon: TrendingUp, href: "/avance", roles: ["administradora", "investigadora", "formadora", "institucion_aliada"] },
  { label: "Reportes", icon: FileText, href: "/reportes", roles: ["administradora", "investigadora", "institucion_aliada"] },
  { label: "Configuración", icon: Settings, href: "/configuracion", roles: ["administradora"] },
]

function visibleForRole(
  item: (typeof navItems)[number],
  rolRaw: string | null | undefined,
  projectInfo: ProjectInfoData,
) {
  const baseVisible = item.roles.includes("all") || (!!rolRaw && item.roles.includes(rolRaw))
  if (!baseVisible) return false

  if (rolRaw === "mujer_emprendedora") {
    if (item.href === "/evaluaciones") return true
    if (item.href === "/certificados") return false
  }

  return true
}

function ProjectInfo({ info }: { info: ProjectInfoData }) {
  return (
    <div className="mt-auto border-t border-slate-200 px-4 py-5">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
        Información del Proyecto
      </p>
      <dl className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <dt className="text-slate-500">Inicio</dt>
          <dd className="font-medium text-slate-800">{info.fechaInicio}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-slate-500">Fin</dt>
          <dd className="font-medium text-slate-800">{info.fechaFin}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-slate-500">Duración</dt>
          <dd className="font-medium text-slate-800">{info.duracionMeses} meses</dd>
        </div>
      </dl>
      <div className="mt-4">
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className="text-slate-500">Tiempo transcurrido</span>
          <span className="font-semibold text-slate-800">
            {info.mesesTranscurridos} / {info.duracionMeses} meses
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
          <div className="h-full rounded-full bg-sky-500" style={{ width: `${info.porcentajeTranscurrido}%` }} />
        </div>
        <p className="mt-1 text-right text-xs font-medium text-sky-700">
          {info.porcentajeTranscurrido}% transcurrido
        </p>
      </div>
    </div>
  )
}

export function Sidebar({
  rolRaw,
  projectInfo,
}: {
  rolRaw?: string | null
  projectInfo: ProjectInfoData
}) {
  const pathname = usePathname()
  const visibles = navItems.filter((item) => visibleForRole(item, rolRaw, projectInfo))

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-slate-200 bg-white text-slate-800">
      <Link href="/" className="flex items-center gap-3 border-b border-slate-200 bg-[#0d4f93] px-4 py-4 text-white">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white shadow-sm ring-1 ring-white/30">
          <Image
            src="/ugcircle.png"
            alt="Universidad de Guayaquil"
            width={44}
            height={44}
            className="h-11 w-11 object-contain"
            priority
          />
        </div>
        <div className="leading-tight">
          <p className="text-[0.78rem] font-semibold uppercase tracking-wide text-white/95">Universidad</p>
          <p className="text-xs text-white/80">de Guayaquil</p>
        </div>
      </Link>

      <nav className="flex-1 overflow-y-auto px-3 py-2">
        <ul className="space-y-1">
          {visibles.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
            return (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors",
                    active
                      ? "bg-sky-50 font-semibold text-sky-800 shadow-[inset_0_0_0_1px_rgba(14,165,233,0.18)]"
                      : "text-slate-700 hover:bg-sky-50 hover:text-sky-800",
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <ProjectInfo info={projectInfo} />
    </aside>
  )
}
