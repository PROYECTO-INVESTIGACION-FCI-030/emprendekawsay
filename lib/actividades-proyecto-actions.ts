"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { obtenerRolUsuario } from "@/lib/roles"

async function contextoGestion() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { supabase, user: null, error: "Debes iniciar sesion." }
  const rol = await obtenerRolUsuario(supabase, user.id)
  if (rol !== "administradora") return { supabase, user: null, error: "No tienes permiso para gestionar actividades." }
  return { supabase, user, error: null }
}

export async function guardarActividadProyecto(formData: FormData): Promise<void> {
  const ctx = await contextoGestion()
  if (ctx.error || !ctx.user) return

  const titulo = String(formData.get("titulo") ?? "").trim()
  const descripcion = String(formData.get("descripcion") ?? "").trim() || null
  const fechaObjetivo = String(formData.get("fecha_objetivo") ?? "").trim()
  const estado = String(formData.get("estado") ?? "programado")
  const orden = Number(formData.get("orden") ?? 1)

  if (!titulo || !fechaObjetivo) {
    return
  }

  const { error } = await ctx.supabase.from("actividades_proyecto").insert({
    titulo,
    descripcion,
    fecha_objetivo: fechaObjetivo,
    estado,
    orden,
    visible: true,
    creado_por: ctx.user.id,
  })

  if (error) return

  revalidatePath("/avance")
  revalidatePath("/")
}

export async function actualizarActividadProyecto(formData: FormData): Promise<void> {
  const ctx = await contextoGestion()
  if (ctx.error || !ctx.user) return

  const id = String(formData.get("id") ?? "").trim()
  const estado = String(formData.get("estado") ?? "").trim()
  const fechaObjetivo = String(formData.get("fecha_objetivo") ?? "").trim()

  if (!id || !estado) return

  const payload: Record<string, string> = { estado }
  if (fechaObjetivo) payload.fecha_objetivo = fechaObjetivo

  const { error } = await ctx.supabase
    .from("actividades_proyecto")
    .update(payload)
    .eq("id", id)

  if (error) return

  revalidatePath("/avance")
  revalidatePath("/")
}
