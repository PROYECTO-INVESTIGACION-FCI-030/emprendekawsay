import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

export type ProjectDocument = {
  id: number
  titulo: string
  descripcion: string | null
  categoria: string
  archivo_nombre: string
  archivo_path: string
  archivo_tipo: string | null
  archivo_tamano: number | null
  enlace_externo: string | null
  visible: boolean
  orden: number
  fecha_creacion: string
  fecha_actualizacion: string
  download_url?: string | null
}

export async function getProjectDocuments() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("documentos_proyecto")
    .select(
      "id, titulo, descripcion, categoria, archivo_nombre, archivo_path, archivo_tipo, archivo_tamano, enlace_externo, visible, orden, fecha_creacion, fecha_actualizacion",
    )
    .order("orden", { ascending: true })
    .order("fecha_creacion", { ascending: false })

  if (error || !data) return []
  const documents = data as ProjectDocument[]
  const admin = createAdminClient()
  const signed = await Promise.all(
    documents.map(async (document) => {
      const { data: urlData } = await admin.storage.from("documentos-proyecto").createSignedUrl(document.archivo_path, 60 * 60)
      return {
        ...document,
        download_url: urlData?.signedUrl ?? null,
      }
    }),
  )
  return signed
}

export async function isAdminUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false
  const { data: perfil } = await supabase
    .from("v_perfiles_usuario_con_rol")
    .select("rol")
    .eq("id", user.id)
    .maybeSingle()
  return perfil?.rol === "administradora"
}
