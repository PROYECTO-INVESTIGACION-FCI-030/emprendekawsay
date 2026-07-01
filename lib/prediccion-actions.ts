"use server"

import { revalidatePath } from "next/cache"
import { obtenerRolUsuario } from "@/lib/roles"
import { createClient } from "@/lib/supabase/server"

export async function crearCursoPredicho(titulo: string, descripcion: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, message: "Debes iniciar sesion." }
  const rol = await obtenerRolUsuario(supabase, user.id)
  if (!rol || !["administradora", "investigadora", "formadora"].includes(rol)) {
    return { ok: false, message: "No tienes permiso para crear cursos." }
  }

  const { data: existing } = await supabase.from("cursos").select("id").ilike("titulo", titulo).maybeSingle()
  if (existing) return { ok: false, message: "Este curso ya existe en Diseño de Cursos." }

  const { error } = await supabase.from("cursos").insert({
    titulo,
    descripcion,
    estado: "borrador",
    visible: false,
    creado_por: user.id,
  })
  if (error) return { ok: false, message: `No se pudo crear el curso: ${error.message}` }

  revalidatePath("/", "layout")
  revalidatePath("/prediccion")
  revalidatePath("/diseno-cursos")
  return { ok: true, message: "Curso creado como borrador en Diseño de Cursos." }
}
