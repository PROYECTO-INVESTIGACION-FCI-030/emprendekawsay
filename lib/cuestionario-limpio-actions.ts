"use server"

import { revalidatePath } from "next/cache"
import { createAdminClient } from "@/lib/supabase/admin"

export type CuestionarioLimpioState = {
  ok: boolean
  message: string
} | null

export async function guardarCuestionarioLimpio(
  _prev: CuestionarioLimpioState,
  formData: FormData,
): Promise<CuestionarioLimpioState> {
  const admin = createAdminClient()
  const parsedAnswers = (() => {
    const raw = String(formData.get("answers_json") ?? "").trim()
    if (!raw) return null
    try {
      return JSON.parse(raw) as Record<string, string>
    } catch {
      return null
    }
  })()

  const parsedMulti = (() => {
    const raw = String(formData.get("multi_json") ?? "").trim()
    if (!raw) return null
    try {
      return JSON.parse(raw) as Record<string, string[]>
    } catch {
      return null
    }
  })()

  const getAnswer = (name: string) => {
    const value = parsedAnswers?.[name]
    if (typeof value === "string") return value.trim()
    return String(formData.get(name) ?? "").trim()
  }

  const getMulti = (name: string) => {
    const fromJson = parsedMulti?.[name]
    if (Array.isArray(fromJson)) {
      return fromJson.map((value) => String(value ?? "").trim()).filter(Boolean)
    }
    return formData
      .getAll(name)
      .map((value) => String(value ?? "").trim())
      .filter(Boolean)
  }

  const joinValues = (values: Array<string | null | undefined>) =>
    values
      .map((value) => String(value ?? "").trim())
      .filter(Boolean)
      .join(", ") || null

  const payload = {
    parroquia: getAnswer("parroquia") || null,
    sector_ubicacion: getAnswer("sector_ubicacion") || null,
    antiguedad_emprendimiento: getAnswer("antiguedad_emprendimiento") || null,
    sector_economico: getAnswer("sector_economico") || null,
    ingreso_mensual: getAnswer("ingreso_mensual") || null,
    nivel_instruccion: getAnswer("nivel_instruccion") || null,
    etnia: getAnswer("etnia") || null,
    situacion_formalizacion: getAnswer("situacion_formalizacion") || null,
    control_dinero: getAnswer("control_dinero") || null,
    planifica_metas: getAnswer("planifica_metas") || null,
    reinvierte_ganancias: getAnswer("reinvierte_ganancias") || null,
    define_precios_costos: getAnswer("define_precios_costos") || null,
    promocion_negocio: getAnswer("promocion_negocio") || null,
    medios_promocion: joinValues(getMulti("medios_promocion")),
    usa_sugerencias_clientes: getAnswer("usa_sugerencias_clientes") || null,
    dispositivo_internet: getAnswer("dispositivo_internet") || null,
    dispositivos_usados: joinValues(getMulti("dispositivos_usados")),
    usa_apps_digitales: getAnswer("usa_apps_digitales") || null,
    apps_usadas: joinValues(getMulti("apps_usadas")),
    usa_pagos_digitales: getAnswer("usa_pagos_digitales") || null,
    pagos_usados: joinValues(getMulti("pagos_usados")),
    dificultad_tecnologia: getAnswer("dificultad_tecnologia") || null,
    incorpora_cultura: getAnswer("incorpora_cultura") || null,
    elementos_culturales: joinValues(getMulti("elementos_culturales")),
    origen_conocimiento_cultural: getAnswer("origen_conocimiento_cultural") || null,
    participa_asociaciones: getAnswer("participa_asociaciones") || null,
    asociaciones: joinValues(getMulti("asociaciones")),
    interes_programa: getAnswer("interes_programa") || null,
    contacto_programa: getAnswer("contacto_programa") || null,
    modalidad_preferida: getAnswer("modalidad_preferida") || null,
  }

  const { error } = await admin.from("cuestionario_limpio_respuestas").insert(payload)
  if (error) return { ok: false, message: error.message }

  revalidatePath("/diagnostico")
  revalidatePath("/diagnostico/encuesta")
  revalidatePath("/", "layout")
  return { ok: true, message: "Encuesta guardada correctamente." }
}
