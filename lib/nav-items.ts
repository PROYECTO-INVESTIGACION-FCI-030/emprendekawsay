import {
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
  Brain,
} from "lucide-react"
import type { ProjectInfo as ProjectInfoData } from "@/lib/project-info"

export const navItems = [
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
] as const

export function visibleForRole(
  item: (typeof navItems)[number],
  rolRaw: string | null | undefined,
  _projectInfo: ProjectInfoData,
) {
  const baseVisible = item.roles.includes("all") || (!!rolRaw && item.roles.includes(rolRaw))
  if (!baseVisible) return false

  if (rolRaw === "mujer_emprendedora") {
    if (item.href === "/evaluaciones") return true
    if (item.href === "/certificados") return false
  }

  return true
}
