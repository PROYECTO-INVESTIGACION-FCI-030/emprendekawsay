"use server"

import { revalidatePath } from "next/cache"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { obtenerRolUsuario } from "@/lib/roles"

async function adminContext() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const role = user ? await obtenerRolUsuario(supabase, user.id) : null
  return { supabase, user, allowed: role === "administradora" || role === "formadora" }
}

export async function createValidationSurvey(formData: FormData) {
  const ctx = await adminContext()
  if (!ctx.allowed) return { ok: false, message: "No autorizado." }
  const admin = createAdminClient()
  const titulo = String(formData.get("titulo") ?? "").trim()
  const descripcion = String(formData.get("descripcion") ?? "").trim() || null
  const enlace = String(formData.get("enlace") ?? "").trim() || null
  if (!titulo) return { ok: false, message: "Escribe el titulo." }
  const { error } = await admin.from("encuestas_validacion").insert({
    id_participante: ctx.user?.id ?? null,
    titulo,
    descripcion,
    enlace,
    activo: true,
  })
  if (error) return { ok: false, message: error.message }
  revalidatePath("/validacion")
  return { ok: true, message: "Encuesta de validacion creada." }
}

export async function manageValidationSurvey(formData: FormData) {
  const ctx = await adminContext()
  if (!ctx.allowed) return { ok: false, message: "No autorizado." }
  const admin = createAdminClient()
  const id = String(formData.get("id") ?? "").trim()
  const titulo = String(formData.get("titulo") ?? "").trim()
  const descripcion = String(formData.get("descripcion") ?? "").trim() || null
  const enlace = String(formData.get("enlace") ?? "").trim() || null

  if (!titulo) return { ok: false, message: "Escribe el titulo." }

  if (id) {
    const { error } = await admin
      .from("encuestas_validacion")
      .update({ titulo, descripcion, enlace, actualizado_en: new Date().toISOString() })
      .eq("id", id)
    if (error) return { ok: false, message: error.message }
    revalidatePath("/validacion")
    revalidatePath("/evaluaciones")
    return { ok: true, message: "Tarjeta actualizada." }
  }

  const { error } = await admin.from("encuestas_validacion").insert({
    id_participante: ctx.user?.id ?? null,
    titulo,
    descripcion,
    enlace,
    activo: true,
  })
  if (error) return { ok: false, message: error.message }
  revalidatePath("/validacion")
  revalidatePath("/evaluaciones")
  return { ok: true, message: "Encuesta creada." }
}

export async function updateValidationSurvey(formData: FormData) {
  const ctx = await adminContext()
  if (!ctx.allowed) return { ok: false, message: "No autorizado." }
  const admin = createAdminClient()
  const id = String(formData.get("id") ?? "")
  const titulo = String(formData.get("titulo") ?? "").trim()
  const descripcion = String(formData.get("descripcion") ?? "").trim() || null
  const enlace = String(formData.get("enlace") ?? "").trim() || null
  if (!id || !titulo) return { ok: false, message: "Completa el titulo." }
  const { error } = await admin.from("encuestas_validacion").update({ titulo, descripcion, enlace, actualizado_en: new Date().toISOString() }).eq("id", id)
  if (error) return { ok: false, message: error.message }
  revalidatePath("/validacion")
  revalidatePath("/evaluaciones")
  return { ok: true, message: "Tarjeta actualizada." }
}

export async function createValidationBlock(formData: FormData) {
  const ctx = await adminContext()
  if (!ctx.allowed) return { ok: false, message: "No autorizado." }
  const admin = createAdminClient()
  const encuestaId = String(formData.get("encuesta_id") ?? "")
  const titulo = String(formData.get("titulo") ?? "").trim()
  const descripcion = String(formData.get("descripcion") ?? "").trim() || null
  const orden = Number(formData.get("orden") ?? 1)
  if (!encuestaId || !titulo) return { ok: false, message: "Completa los datos del bloque." }
  const { error } = await admin.from("encuesta_validacion_bloques").insert({ encuesta_id: encuestaId, titulo, descripcion, orden, activo: true })
  if (error) return { ok: false, message: error.message }
  revalidatePath("/validacion")
  return { ok: true, message: "Bloque creado." }
}

export async function createValidationQuestion(formData: FormData) {
  const ctx = await adminContext()
  if (!ctx.allowed) return { ok: false, message: "No autorizado." }
  const admin = createAdminClient()
  const bloqueId = String(formData.get("bloque_id") ?? "")
  const pregunta = String(formData.get("pregunta") ?? "").trim()
  const tipo = String(formData.get("tipo") ?? "texto")
  const orden = Number(formData.get("orden") ?? 1)
  const opciones = String(formData.get("opciones") ?? "").split("\n").map((item) => item.trim()).filter(Boolean)
  const source = String(formData.get("condicion_pregunta") ?? "")
  const operator = String(formData.get("condicion_operador") ?? "igual")
  const value = String(formData.get("condicion_valor") ?? "").trim()
  const condition = source && value ? { pregunta_id: source, operador: operator, valor: value } : null
  if (!bloqueId || !pregunta) return { ok: false, message: "Completa la pregunta." }
  const { error } = await admin.from("encuesta_validacion_preguntas").insert({
    bloque_id: bloqueId,
    pregunta,
    tipo,
    orden,
    requerido: formData.get("requerido") === "on",
    opciones: opciones.length ? { opciones } : null,
    visible_cuando: condition,
    activo: true,
  })
  if (error) return { ok: false, message: error.message }
  revalidatePath("/validacion")
  return { ok: true, message: "Pregunta creada." }
}
