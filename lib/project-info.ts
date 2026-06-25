import { createClient } from "@/lib/supabase/server"

export type ProjectInfo = {
  nombre: string
  descripcion: string
  fechaInicioInput: string
  fechaFinInput: string
  fechaInicio: string
  fechaFin: string
  duracionMeses: number
  mesesTranscurridos: number
  porcentajeTranscurrido: number
}

export const fallbackProjectInfo: ProjectInfo = {
  nombre: "Proyecto FCI 2025",
  descripcion: "Programa de formación y apoyo técnico para el emprendimiento de mujeres indígenas residentes en Guayaquil",
  fechaInicioInput: "2026-06-01",
  fechaFinInput: "2028-06-30",
  fechaInicio: "01/06/2026",
  fechaFin: "30/06/2028",
  duracionMeses: 24,
  mesesTranscurridos: 12,
  porcentajeTranscurrido: 50,
}

function formatDate(value: string | null | undefined) {
  if (!value) return ""
  const [year, month, day] = value.split("-")
  if (!year || !month || !day) return value
  return `${day}/${month}/${year}`
}

function monthsBetween(start: Date, end: Date) {
  const months = (end.getFullYear() - start.getFullYear()) * 12 + end.getMonth() - start.getMonth()
  return Math.max(0, months)
}

export async function getProjectInfo(): Promise<ProjectInfo> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("configuracion_proyecto")
    .select("nombre, descripcion, fecha_inicio, fecha_fin")
    .eq("id", 1)
    .maybeSingle()

  if (error || !data?.fecha_inicio || !data?.fecha_fin) {
    return fallbackProjectInfo
  }

  const start = new Date(`${data.fecha_inicio}T00:00:00`)
  const end = new Date(`${data.fecha_fin}T00:00:00`)
  const now = new Date()
  const duracionMeses = Math.max(1, monthsBetween(start, end))
  const mesesTranscurridos = Math.min(duracionMeses, monthsBetween(start, now))
  const porcentajeTranscurrido = Math.round((mesesTranscurridos / duracionMeses) * 100)

  return {
    nombre: data.nombre ?? fallbackProjectInfo.nombre,
    descripcion: data.descripcion ?? fallbackProjectInfo.descripcion,
    fechaInicioInput: data.fecha_inicio,
    fechaFinInput: data.fecha_fin,
    fechaInicio: formatDate(data.fecha_inicio),
    fechaFin: formatDate(data.fecha_fin),
    duracionMeses,
    mesesTranscurridos,
    porcentajeTranscurrido,
  }
}
