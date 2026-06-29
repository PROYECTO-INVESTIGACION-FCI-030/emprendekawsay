import { createClient } from "@/lib/supabase/server"

export type ActividadProyecto = {
  id: string
  titulo: string
  descripcion: string | null
  fecha_objetivo: string
  estado: "programado" | "en_proceso" | "completado" | "cancelado"
  orden: number
  visible: boolean
}

export async function getActividadesProyecto(incluirOcultas = false): Promise<ActividadProyecto[]> {
  const supabase = await createClient()
  let query = supabase
    .from("actividades_proyecto")
    .select("id, titulo, descripcion, fecha_objetivo, estado, orden, visible")
    .order("fecha_objetivo", { ascending: true })
    .order("orden", { ascending: true })

  if (!incluirOcultas) query = query.eq("visible", true)

  const { data, error } = await query
  if (error || !data) return []
  return data as ActividadProyecto[]
}
