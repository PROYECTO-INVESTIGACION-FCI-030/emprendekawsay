"use server"

import { revalidatePath } from "next/cache"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { isSupabaseConfigured } from "@/lib/perfil"

export type ActualizarPerfilState = {
  ok: boolean
  message: string
} | null

export async function actualizarPerfil(
  _prev: ActualizarPerfilState,
  formData: FormData,
): Promise<ActualizarPerfilState> {
  if (!isSupabaseConfigured()) {
    return { ok: false, message: "Supabase no está configurado." }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { ok: false, message: "No has iniciado sesión." }

  const admin = createAdminClient()
  const payload = {
    nombre_completo: (formData.get("nombre_completo") as string)?.trim() || null,
    email: (formData.get("email") as string)?.trim() || null,
    telefono: (formData.get("telefono") as string)?.trim() || null,
    breve_descripcion: (formData.get("breve_descripcion") as string)?.trim() || null,
    linkedin: (formData.get("linkedin") as string)?.trim() || null,
    avatar_url: (formData.get("avatar_url") as string)?.trim() || null,
    fecha_actualizacion: new Date().toISOString(),
  }

  const { error } = await admin
    .from("perfiles_usuario")
    .update(payload)
    .eq("id", user.id)

  if (error) return { ok: false, message: `No se pudo guardar: ${error.message}` }

  revalidatePath("/perfil")
  revalidatePath("/", "layout")
  return { ok: true, message: "Datos personales actualizados correctamente." }
}

export async function actualizarNotificaciones(activas: boolean): Promise<ActualizarPerfilState> {
  if (!isSupabaseConfigured()) {
    return { ok: false, message: "Supabase no está configurado." }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { ok: false, message: "No has iniciado sesión." }

  const admin = createAdminClient()
  const { error } = await admin
    .from("perfiles_usuario")
    .update({ notificaciones_activas: activas, fecha_actualizacion: new Date().toISOString() })
    .eq("id", user.id)

  if (error) return { ok: false, message: error.message }

  revalidatePath("/perfil")
  revalidatePath("/", "layout")
  return { ok: true, message: "Preferencia de notificaciones actualizada." }
}
