"use server"

import { revalidatePath } from "next/cache"
import { initialSurveyBlocks, type SurveyQuestion } from "@/components/survey/initial-survey-data"
import { createClient } from "@/lib/supabase/server"

export type EncuestaAnswers = Record<string, string | string[]>

type SaveEncuestaInput = {
  answers: EncuestaAnswers
  submit?: boolean
}

type EncuestaState = {
  ok: boolean
  message: string
  answers?: EncuestaAnswers
  estado?: string
}

const blockTables = [
  "encuesta_datos_sociodemograficos",
  "encuesta_informacion_emprendimiento",
  "encuesta_gestion_empresarial",
  "encuesta_finanzas",
  "encuesta_marketing_ventas",
  "encuesta_tecnologia_digitalizacion",
  "encuesta_capital_social_redes",
  "encuesta_aspectos_personales_familiares",
  "encuesta_barreras_oportunidades",
] as const

const blockIdToTable: Record<string, (typeof blockTables)[number]> = {
  sociodemograficos: "encuesta_datos_sociodemograficos",
  emprendimiento: "encuesta_informacion_emprendimiento",
  gestion_empresarial: "encuesta_gestion_empresarial",
  finanzas: "encuesta_finanzas",
  marketing_ventas: "encuesta_marketing_ventas",
  tecnologia: "encuesta_tecnologia_digitalizacion",
  redes_apoyo: "encuesta_capital_social_redes",
  aspectos_personales: "encuesta_aspectos_personales_familiares",
  barreras_oportunidades: "encuesta_barreras_oportunidades",
}

function valueForColumn(question: SurveyQuestion, answers: EncuestaAnswers) {
  const value = answers[question.id]
  if (question.type === "checkbox") return Array.isArray(value) ? value : null
  return typeof value === "string" && value.trim() ? value.trim() : null
}

async function getOrCreateEncuestaId(submit = false) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { supabase, error: "No has iniciado sesion." }

  const existing = await supabase
    .from("encuestas_iniciales")
    .select("id, estado")
    .eq("id_participante", user.id)
    .maybeSingle()

  if (existing.error) return { supabase, error: existing.error.message }

  if (existing.data?.id) {
    const updatePayload = submit
      ? { estado: "enviada", fecha_envio: new Date().toISOString(), fecha_actualizacion: new Date().toISOString() }
      : { estado: existing.data.estado === "enviada" ? "enviada" : "borrador", fecha_actualizacion: new Date().toISOString() }

    const { error } = await supabase
      .from("encuestas_iniciales")
      .update(updatePayload)
      .eq("id", existing.data.id)

    if (error) return { supabase, error: error.message }

    return { supabase, encuestaId: existing.data.id }
  }

  const insertPayload = {
    id_participante: user.id,
    estado: submit ? "enviada" : "borrador",
    fecha_inicio: new Date().toISOString(),
    fecha_envio: submit ? new Date().toISOString() : null,
    fecha_actualizacion: new Date().toISOString(),
  }

  const created = await supabase
    .from("encuestas_iniciales")
    .insert(insertPayload)
    .select("id")
    .single()

  if (created.error) return { supabase, error: created.error.message }
  return { supabase, encuestaId: created.data.id }
}

function buildPayloads(encuestaId: string, answers: EncuestaAnswers) {
  const payloads = {} as Record<(typeof blockTables)[number], Record<string, string | string[] | null>>

  for (const block of initialSurveyBlocks) {
    const table = blockIdToTable[block.id]
    payloads[table] = Object.fromEntries([
      ["id_encuesta", encuestaId],
      ...block.questions.map((question) => [question.id, valueForColumn(question, answers)]),
    ]) as Record<string, string | string[] | null>
  }

  return payloads
}

export async function guardarEncuestaInicial({
  answers,
  submit = false,
}: SaveEncuestaInput): Promise<EncuestaState> {
  const { supabase, encuestaId, error } = await getOrCreateEncuestaId(submit)

  if (error || !encuestaId) {
    return { ok: false, message: error ?? "No se pudo crear la encuesta." }
  }

  const payloads = buildPayloads(encuestaId, answers)

  for (const table of blockTables) {
    const { error: upsertError } = await supabase
      .from(table)
      .upsert(payloads[table] as Record<string, unknown>, { onConflict: "id_encuesta" })

    if (upsertError) {
      return {
        ok: false,
        message: `No se pudo guardar ${table}: ${upsertError.message}. Verifica que ejecutaste scripts/003_encuesta_inicial_logica.sql.`,
      }
    }
  }

  revalidatePath("/diagnostico")
  revalidatePath("/")

  return {
    ok: true,
    message: submit ? "Encuesta enviada correctamente." : "Borrador guardado correctamente.",
    estado: submit ? "enviada" : "borrador",
  }
}

export async function obtenerEncuestaInicial(): Promise<EncuestaState> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { ok: false, message: "No has iniciado sesion." }

  const header = await supabase
    .from("encuestas_iniciales")
    .select("id, estado")
    .eq("id_participante", user.id)
    .maybeSingle()

  if (header.error) return { ok: false, message: header.error.message }
  if (!header.data) return { ok: true, message: "Sin encuesta guardada.", answers: {}, estado: "sin_iniciar" }

  const merged: EncuestaAnswers = {}

  for (const table of blockTables) {
    const block = initialSurveyBlocks.find((surveyBlock) => blockIdToTable[surveyBlock.id] === table)
    const questionIds = block?.questions.map((question) => question.id) ?? []

    const { data, error } = await supabase
      .from(table)
      .select("*")
      .eq("id_encuesta", header.data.id)
      .maybeSingle()

    if (error) return { ok: false, message: error.message }
    if (data) {
      for (const id of questionIds) {
        const value = (data as Record<string, unknown>)[id]
        if (typeof value === "string" && value.trim()) merged[id] = value
        if (Array.isArray(value) && value.length > 0) merged[id] = value.filter((item): item is string => typeof item === "string")
      }
    }
  }

  return {
    ok: true,
    message: "Encuesta cargada.",
    answers: merged,
    estado: header.data.estado,
  }
}
