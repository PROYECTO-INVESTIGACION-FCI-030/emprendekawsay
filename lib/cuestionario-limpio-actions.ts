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
  const joinValues = (values: Array<string | null | undefined>) =>
    values
      .map((value) => String(value ?? "").trim())
      .filter(Boolean)
      .join(" | ") || null

  const joinWithOther = (base: string | null, other: string | null) =>
    [String(base ?? "").trim(), String(other ?? "").trim()].filter(Boolean).join(" - ") || null

  const checkedValues = (name: string) =>
    formData
      .getAll(name)
      .map((value) => String(value ?? "").trim())
      .filter(Boolean)

  const payload = {
    parroquia: joinWithOther(
      String(formData.get("parroquia") ?? "").trim() || null,
      String(formData.get("parroquia_otro") ?? "").trim() || null,
    ),
    sector_ubicacion: String(formData.get("sector_ubicacion") ?? "").trim() || null,
    antiguedad_emprendimiento: String(formData.get("antiguedad_emprendimiento") ?? "").trim() || null,
    sector_economico: joinWithOther(
      String(formData.get("sector_economico") ?? "").trim() || null,
      String(formData.get("sector_economico_otro") ?? "").trim() || null,
    ),
    ingreso_mensual: String(formData.get("ingreso_mensual") ?? "").trim() || null,
    nivel_instruccion: String(formData.get("nivel_instruccion") ?? "").trim() || null,
    etnia: joinValues([
      String(formData.get("etnia") ?? "").trim() || null,
      String(formData.get("pueblo_nacionalidad") ?? "").trim() || null,
      String(formData.get("autoidentificacion_otro") ?? "").trim() || null,
    ]),
    situacion_formalizacion: String(formData.get("situacion_formalizacion") ?? "").trim() || null,
    control_dinero: String(formData.get("control_dinero") ?? "").trim() || null,
    planifica_metas: String(formData.get("planifica_metas") ?? "").trim() || null,
    reinvierte_ganancias: String(formData.get("reinvierte_ganancias") ?? "").trim() || null,
    define_precios_costos: String(formData.get("define_precios_costos") ?? "").trim() || null,
    promocion_negocio: String(formData.get("promocion_negocio") ?? "").trim() || null,
    medios_promocion: joinValues([...checkedValues("medios_promocion"), String(formData.get("medios_promocion_otro") ?? "").trim() || null]),
    usa_sugerencias_clientes: String(formData.get("usa_sugerencias_clientes") ?? "").trim() || null,
    dispositivo_internet: String(formData.get("dispositivo_internet") ?? "").trim() || null,
    dispositivos_usados: joinValues([...checkedValues("dispositivos_usados"), String(formData.get("dispositivos_usados_otro") ?? "").trim() || null]),
    usa_apps_digitales: String(formData.get("usa_apps_digitales") ?? "").trim() || null,
    apps_usadas: joinValues([...checkedValues("apps_usadas"), String(formData.get("apps_usadas_otro") ?? "").trim() || null]),
    usa_pagos_digitales: String(formData.get("usa_pagos_digitales") ?? "").trim() || null,
    pagos_usados: joinValues([...checkedValues("pagos_usados"), String(formData.get("pagos_usados_otro") ?? "").trim() || null]),
    dificultad_tecnologia: joinValues([
      String(formData.get("dificultad_tecnologia") ?? "").trim() || null,
      String(formData.get("dificultad_tecnologia_otro") ?? "").trim() || null,
    ]),
    incorpora_cultura: String(formData.get("incorpora_cultura") ?? "").trim() || null,
    elementos_culturales: joinValues([...checkedValues("elementos_culturales"), String(formData.get("elementos_culturales_otro") ?? "").trim() || null]),
    origen_conocimiento_cultural: String(formData.get("origen_conocimiento_cultural") ?? "").trim() || null,
    participa_asociaciones: String(formData.get("participa_asociaciones") ?? "").trim() || null,
    asociaciones: joinValues([...checkedValues("asociaciones"), String(formData.get("asociaciones_otro") ?? "").trim() || null]),
    interes_programa: String(formData.get("interes_programa") ?? "").trim() || null,
    contacto_programa: String(formData.get("contacto_programa") ?? "").trim() || null,
    modalidad_preferida: String(formData.get("modalidad_preferida") ?? "").trim() || null,
  }

  const { error } = await admin.from("cuestionario_limpio_respuestas").insert(payload)
  if (error) return { ok: false, message: error.message }

  revalidatePath("/diagnostico")
  revalidatePath("/diagnostico/encuesta")
  revalidatePath("/")
  return { ok: true, message: "Encuesta guardada correctamente." }
}
