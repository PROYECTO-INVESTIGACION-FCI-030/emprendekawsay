"use server"

import { revalidatePath } from "next/cache"
import { obtenerRolUsuario } from "@/lib/roles"
import { createClient } from "@/lib/supabase/server"
import { TIPOS_MATERIALES } from "@/lib/materiales-formativos-data"

const TIPOS_VALIDOS = new Set(TIPOS_MATERIALES)

function texto(formData: FormData, campo: string) {
  return String(formData.get(campo) ?? "").trim()
}

function capitalizar(value: string) {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : value
}

async function contextoGestion() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Debes iniciar sesion.", supabase, user: null }
  const rol = await obtenerRolUsuario(supabase, user.id)
  if (!rol || !["administradora", "investigadora", "formadora"].includes(rol)) {
    return { error: "No tienes permiso para gestionar la malla formativa.", supabase, user: null }
  }
  return { error: null, supabase, user }
}

function revalidar() {
  revalidatePath("/malla-formativa")
  revalidatePath("/")
}

export async function guardarMaterialFormativo(formData: FormData) {
  const ctx = await contextoGestion()
  if (ctx.error || !ctx.user) return { ok: false, message: ctx.error ?? "No autorizado." }

  const id = texto(formData, "id")
  const idCurso = texto(formData, "id_curso")
  const tipo = texto(formData, "tipo")
  const titulo = capitalizar(texto(formData, "titulo"))
  const descripcion = capitalizar(texto(formData, "descripcion"))
  const enlace = texto(formData, "enlace")
  const orden = Number(texto(formData, "orden") || "1")
  const visible = formData.get("visible") === "on"

  if (!idCurso || !TIPOS_VALIDOS.has(tipo as (typeof TIPOS_VALIDOS extends Set<infer T> ? T : never)) || !titulo || !Number.isInteger(orden) || orden < 1) {
    return { ok: false, message: "Completa curso, tipo, titulo y orden." }
  }

  const payload = {
    id_curso: idCurso,
    tipo,
    titulo,
    descripcion: descripcion || null,
    enlace: enlace || null,
    visible,
    orden,
    fecha_actualizacion: new Date().toISOString(),
  }

  const query = id
    ? ctx.supabase.from("materiales_curso").update(payload).eq("id", id)
    : ctx.supabase.from("materiales_curso").insert({ ...payload, creado_por: ctx.user.id })

  const { error } = await query
  if (error) return { ok: false, message: `No se pudo guardar el material: ${error.message}` }
  revalidar()
  return { ok: true, message: id ? "Material actualizado." : "Material creado." }
}

export async function cambiarVisibilidadMaterialFormativo(id: string, visible: boolean) {
  const ctx = await contextoGestion()
  if (ctx.error) return { ok: false, message: ctx.error }
  const { error } = await ctx.supabase.from("materiales_curso").update({ visible, fecha_actualizacion: new Date().toISOString() }).eq("id", id)
  if (error) return { ok: false, message: `No se pudo cambiar la visibilidad: ${error.message}` }
  revalidar()
  return { ok: true, message: visible ? "Material publicado." : "Material ocultado." }
}

export async function eliminarMaterialFormativo(id: string) {
  const ctx = await contextoGestion()
  if (ctx.error) return { ok: false, message: ctx.error }
  const { error } = await ctx.supabase.from("materiales_curso").delete().eq("id", id)
  if (error) return { ok: false, message: `No se pudo eliminar el material: ${error.message}` }
  revalidar()
  return { ok: true, message: "Material eliminado." }
}
