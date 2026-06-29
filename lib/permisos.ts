import { createAdminClient } from "@/lib/supabase/admin"

export type PermisoPagina = {
  codigo: string
  nombre: string
  ruta: string
  modulo: string
  descripcion: string
}

export const PAGINAS_PERMITIDAS: PermisoPagina[] = [
  { codigo: "dashboard", nombre: "Dashboard", ruta: "/", modulo: "dashboard", descripcion: "Vista general del proyecto" },
  { codigo: "proyecto", nombre: "Proyecto", ruta: "/proyecto", modulo: "proyecto", descripcion: "Información y avances del proyecto" },
  { codigo: "diagnostico", nombre: "Diagnóstico (Encuesta)", ruta: "/diagnostico", modulo: "diagnostico", descripcion: "Encuesta inicial y resultados" },
  { codigo: "analitica", nombre: "Analítica de Necesidades", ruta: "/analitica", modulo: "analitica", descripcion: "Análisis de resultados y brechas" },
  { codigo: "prediccion", nombre: "Predicción de Cursos", ruta: "/prediccion", modulo: "prediccion", descripcion: "Sugerencia de cursos según diagnóstico" },
  { codigo: "diseno_cursos", nombre: "Diseño de Cursos", ruta: "/diseno-cursos", modulo: "diseno-cursos", descripcion: "Creación y edición de cursos" },
  { codigo: "malla_formativa", nombre: "Malla Formativa", ruta: "/malla-formativa", modulo: "malla-formativa", descripcion: "Ruta formativa del programa" },
  { codigo: "validacion", nombre: "Validación (Encuesta)", ruta: "/validacion", modulo: "validacion", descripcion: "Encuesta de validación del programa" },
  { codigo: "produccion_cientifica", nombre: "Producción Científica", ruta: "/produccion", modulo: "produccion", descripcion: "Gestión de publicaciones" },
  { codigo: "avance", nombre: "Avance del Proyecto", ruta: "/avance", modulo: "avance", descripcion: "Indicadores y seguimiento del avance" },
  { codigo: "reportes", nombre: "Reportes", ruta: "/reportes", modulo: "reportes", descripcion: "Exportación y reportes del sistema" },
]

export function obtenerNombrePaginaPorRuta(ruta: string | null | undefined) {
  if (!ruta) return "Sin ruta"
  const rutaNormalizada = ruta.split("?")[0].split("#")[0]
  const coincidencia = PAGINAS_PERMITIDAS.find(
    (pagina) => rutaNormalizada === pagina.ruta || rutaNormalizada.startsWith(`${pagina.ruta}/`),
  )
  return coincidencia?.nombre ?? rutaNormalizada
}

export function obtenerAccionPorRuta(
  accion: string | null | undefined,
  ruta: string | null | undefined,
) {
  const accionNormalizada = accion?.trim().toLowerCase() || ""
  if (accionNormalizada) {
    return accionNormalizada
  }

  const rutaNormalizada = ruta?.split("?")[0].split("#")[0] ?? ""
  if (!rutaNormalizada) return "navegacion"
  return rutaNormalizada === "/" ? "ingreso_dashboard" : "navegacion_pagina"
}

export type PermisosConfiguracion = {
  paginas: PermisoPagina[]
  permisosPorRol: Record<string, string[]>
}

export async function obtenerPermisosConfiguracion(): Promise<PermisosConfiguracion> {
  const supabase = createAdminClient()

  const { data: permisos, error: permisosError } = await supabase
    .from("permisos")
    .select("codigo, nombre, ruta, modulo, descripcion")
    .order("nombre", { ascending: true })

  const paginas = permisosError || !permisos?.length ? PAGINAS_PERMITIDAS : (permisos as PermisoPagina[])

  const { data: matriz, error: matrizError } = await supabase
    .from("v_roles_permisos_configuracion")
    .select("rol_codigo, permiso_codigo")

  const permisosPorRol: Record<string, string[]> = {}

  if (!matrizError && matriz) {
    for (const row of matriz as Array<{ rol_codigo: string; permiso_codigo: string }>) {
      permisosPorRol[row.rol_codigo] ??= []
      permisosPorRol[row.rol_codigo].push(row.permiso_codigo)
    }
  }

  return { paginas, permisosPorRol }
}

export async function obtenerPermisosRol(rolCodigo: string | null | undefined): Promise<string[]> {
  if (!rolCodigo) return []
  if (rolCodigo === "administradora") {
    return PAGINAS_PERMITIDAS.map((pagina) => pagina.ruta)
  }
  const config = await obtenerPermisosConfiguracion()
  return config.permisosPorRol[rolCodigo] ?? []
}

export async function obtenerHistorialIngresos(limit = 12) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("historial_ingresos")
    .select("id, id_usuario, nombre_usuario, email_usuario, rol_usuario, fecha_ingreso, ruta, user_agent, accion, pagina_nombre")
    .order("fecha_ingreso", { ascending: false })
    .limit(limit)

  if (error || !data) return []
  return (data as Array<{
    id: string
    id_usuario: string
    nombre_usuario: string | null
    email_usuario: string | null
    rol_usuario: string | null
    fecha_ingreso: string
    ruta: string | null
    user_agent: string | null
    accion?: string | null
    pagina_nombre?: string | null
  }>).map((item) => ({
    ...item,
    pagina_nombre: item.pagina_nombre ?? obtenerNombrePaginaPorRuta(item.ruta),
    accion: obtenerAccionPorRuta(item.accion, item.ruta),
  }))
}
