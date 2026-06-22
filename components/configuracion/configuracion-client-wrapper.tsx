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
  projectInfo,
}: {
  usuarios: Usuario[]
  initialRol: string | null
  projectInfo: ProjectInfo
}) {
  const esAdmin = initialRol === "administradora"

  return <ConfiguracionTabs usuarios={usuarios} esAdmin={esAdmin} projectInfo={projectInfo} />
}
