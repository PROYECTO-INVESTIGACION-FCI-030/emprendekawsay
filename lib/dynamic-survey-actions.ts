"use server"

import { revalidatePath } from "next/cache"
import { obtenerRolUsuario } from "@/lib/roles"
import { createClient } from "@/lib/supabase/server"

async function adminContext() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const role = user ? await obtenerRolUsuario(supabase, user.id) : null
  return { supabase, allowed: role === "administradora" }
}

export async function saveSurvey(formData: FormData) {
  const ctx = await adminContext()
  if (!ctx.allowed) return { ok: false, message: "Solo la administradora puede gestionar encuestas." }
  const id = String(formData.get("id") ?? "")
  const titulo = String(formData.get("titulo") ?? "").trim()
  const descripcion = String(formData.get("descripcion") ?? "").trim() || null
  if (!titulo) return { ok: false, message: "Escribe el titulo de la encuesta." }
  const query = id ? ctx.supabase.from("encuestas").update({ titulo, descripcion, actualizado_en: new Date().toISOString() }).eq("id", id) : ctx.supabase.from("encuestas").insert({ titulo, descripcion, activo: true, estado: true })
  const { error } = await query
  if (error) return { ok: false, message: error.message }
  revalidatePath("/diagnostico")
  return { ok: true, message: "Encuesta guardada." }
}

export async function saveSurveyBlock(formData: FormData) {
  const ctx = await adminContext()
  if (!ctx.allowed) return { ok: false, message: "No autorizado." }
  const encuestaId = String(formData.get("encuesta_id") ?? "")
  const titulo = String(formData.get("titulo") ?? "").trim()
  const descripcion = String(formData.get("descripcion") ?? "").trim() || null
  const orden = Number(formData.get("orden") ?? 1)
  if (!encuestaId || !titulo || !Number.isInteger(orden)) return { ok: false, message: "Completa titulo y orden del bloque." }
  const { error } = await ctx.supabase.from("encuesta_bloques").insert({ encuesta_id: encuestaId, titulo, descripcion, orden, activo: true, estado: true })
  if (error) return { ok: false, message: error.message }
  revalidatePath("/diagnostico")
  return { ok: true, message: "Bloque creado." }
}

export async function saveSurveyQuestion(formData: FormData) {
  const ctx = await adminContext()
  if (!ctx.allowed) return { ok: false, message: "No autorizado." }
  const bloqueId = String(formData.get("bloque_id") ?? "")
  const pregunta = String(formData.get("pregunta") ?? "").trim()
  const tipo = String(formData.get("tipo") ?? "texto")
  const orden = Number(formData.get("orden") ?? 1)
  const opciones = String(formData.get("opciones") ?? "").split("\n").map((item) => item.trim()).filter(Boolean)
  const source = String(formData.get("condicion_pregunta") ?? "")
  const operator = String(formData.get("condicion_operador") ?? "igual")
  const value = String(formData.get("condicion_valor") ?? "").trim()
  const condition = source && value ? { pregunta_id: source, operador: operator, valor: value } : null
  if (!bloqueId || !pregunta || !Number.isInteger(orden)) return { ok: false, message: "Completa pregunta y orden." }
  const { error } = await ctx.supabase.from("encuesta_preguntas").insert({ bloque_id: bloqueId, pregunta, tipo, orden, requerido: formData.get("requerido") === "on", opciones: opciones.length ? { opciones } : null, visible_cuando: condition, activo: true, estado: true })
  if (error) return { ok: false, message: error.message }
  revalidatePath("/diagnostico")
  return { ok: true, message: "Pregunta creada." }
}

export async function updateSurveyQuestion(formData: FormData) {
  const ctx = await adminContext()
  if (!ctx.allowed) return { ok: false, message: "No autorizado." }
  const id = String(formData.get("id") ?? "")
  const pregunta = String(formData.get("pregunta") ?? "").trim()
  const tipo = String(formData.get("tipo") ?? "texto")
  const orden = Number(formData.get("orden") ?? 1)
  const opciones = String(formData.get("opciones") ?? "").split("\n").map((item) => item.trim()).filter(Boolean)
  const source = String(formData.get("condicion_pregunta") ?? "")
  const operator = String(formData.get("condicion_operador") ?? "igual")
  const value = String(formData.get("condicion_valor") ?? "").trim()
  const condition = source && value ? { pregunta_id: source, operador: operator, valor: value } : null
  if (!id || !pregunta || !Number.isInteger(orden)) return { ok: false, message: "Completa pregunta y orden." }
  const { error } = await ctx.supabase
    .from("encuesta_preguntas")
    .update({ pregunta, tipo, orden, requerido: formData.get("requerido") === "on", opciones: opciones.length ? { opciones } : null, visible_cuando: condition })
    .eq("id", id)
  if (error) return { ok: false, message: error.message }
  revalidatePath("/diagnostico")
  return { ok: true, message: "Pregunta actualizada." }
}

export async function deleteSurveyQuestion(id: string) {
  const ctx = await adminContext()
  if (!ctx.allowed) return { ok: false, message: "No autorizado." }
  const { error } = await ctx.supabase.from("encuesta_preguntas").delete().eq("id", id)
  if (error) return { ok: false, message: error.message }
  revalidatePath("/diagnostico")
  return { ok: true, message: "Pregunta eliminada." }
}
