import { createClient } from "@/lib/supabase/server"
import type { MaterialFormativo, MaterialFormativoCurso } from "@/lib/materiales-formativos-data"
export type { MaterialFormativo, MaterialFormativoCurso, TipoMaterialFormativo } from "@/lib/materiales-formativos-data"
export { TIPOS_MATERIALES } from "@/lib/materiales-formativos-data"

export async function getMaterialesFormativos(): Promise<MaterialFormativo[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("materiales_curso")
    .select("id, id_curso, tipo, titulo, descripcion, enlace, visible, orden, fecha_creacion, fecha_actualizacion, curso:cursos(id, titulo, visible)")
    .order("tipo", { ascending: true })
    .order("orden", { ascending: true })

  if (error || !data) return []
  return data as unknown as MaterialFormativo[]
}

export async function getCursosFormativosParaMalla(): Promise<MaterialFormativoCurso[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("cursos")
    .select("id, titulo, descripcion, visible")
    .order("fecha_creacion", { ascending: false })

  if (error || !data) return []
  return data as unknown as MaterialFormativoCurso[]
}
