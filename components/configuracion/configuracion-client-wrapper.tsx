"use client"

import { ConfiguracionTabs } from "./configuracion-tabs"
import type { ProjectInfo } from "@/lib/project-info"

type Usuario = {
  id: string
  nombre_completo: string | null
  email: string | null
  rol: string
  activa: boolean
}

export function ConfiguracionClientWrapper({
  usuarios,
  initialRol,
  historialIngresos,
  projectInfo,
}: {
  usuarios: Usuario[]
  initialRol: string | null
  projectInfo: ProjectInfo
  historialIngresos: Array<{
    id: string
    id_usuario: string
    nombre_usuario: string | null
    email_usuario: string | null
    rol_usuario: string | null
    fecha_ingreso: string
    ruta: string | null
    pagina_nombre?: string
    user_agent: string | null
  }>
}) {
  const esAdmin = initialRol === "administradora"

  return <ConfiguracionTabs usuarios={usuarios} esAdmin={esAdmin} projectInfo={projectInfo} historialIngresos={historialIngresos} />
}
