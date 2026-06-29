"use server"

import { revalidatePath } from "next/cache"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { obtenerRolUsuario } from "@/lib/roles"

async function adminContext() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const role = user ? await obtenerRolUsuario(supabase, user.id) : null
  return { supabase, user, allowed: role === "administradora" || role === "formadora" || role === "investigadora" }
}

export async function guardarRespuestaValidacion(formData: FormData) {
  const supabase = await createClient()
  const admin = createAdminClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, message: "No has iniciado sesion." }

  const encuestaId = String(formData.get("encuesta_id") ?? "")
  const respuestasRaw = String(formData.get("respuestas") ?? "{}")
  let respuestas: Record<string, unknown> = {}
  try {
    respuestas = JSON.parse(respuestasRaw)
  } catch {
    return { ok: false, message: "Las respuestas no son validas." }
  }

  const { error } = await admin.from("encuestas_validacion_respuestas").upsert({
    encuesta_id: encuestaId,
    participante_id: user.id,
    estado: "enviada",
    respuestas,
    fecha_envio: new Date().toISOString(),
  }, { onConflict: "encuesta_id,participante_id" })

  if (error) return { ok: false, message: error.message }

  revalidatePath("/evaluaciones")
  revalidatePath("/validacion")
  return { ok: true, message: "Encuesta enviada correctamente." }
}

export async function obtenerEncuestaValidacionActiva() {
  const supabase = createAdminClient()
  const { data: surveys } = await supabase.from("encuestas_validacion").select("id, titulo, descripcion, enlace").order("creado_en", { ascending: false }).limit(1)
  return surveys?.[0] ?? null
}

export async function obtenerResultadosValidacion() {
  const supabase = createAdminClient()
  const { data: surveys } = await supabase.from("encuestas_validacion").select("id, titulo, descripcion, enlace").order("creado_en", { ascending: false })
  const { data: blocks } = await supabase.from("encuesta_validacion_bloques").select("id, encuesta_id, titulo, descripcion, orden").order("orden")
  const { data: questions } = await supabase.from("encuesta_validacion_preguntas").select("id, bloque_id, pregunta, tipo, opciones, requerido, orden").order("orden")
  const { data: responses } = await supabase.from("encuestas_validacion_respuestas").select("id, encuesta_id, participante_id, respuestas, fecha_envio, estado").order("fecha_envio", { ascending: false })
  return { surveys: surveys ?? [], blocks: blocks ?? [], questions: questions ?? [], responses: responses ?? [] }
}
