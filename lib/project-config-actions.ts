"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

export type ProjectConfigState = {
  ok: boolean
  message: string
} | null

export async function actualizarConfiguracionProyecto(
  _prev: ProjectConfigState,
  formData: FormData,
): Promise<ProjectConfigState> {
  const nombre = String(formData.get("nombre") ?? "").trim()
  const descripcion = String(formData.get("descripcion") ?? "").trim()
  const fechaInicio = String(formData.get("fecha_inicio") ?? "").trim()
  const fechaFin = String(formData.get("fecha_fin") ?? "").trim()
  const metaValidacion = Number(formData.get("meta_validacion") ?? 0)

  if (!nombre || !descripcion || !fechaInicio || !fechaFin) {
    return { ok: false, message: "Completa nombre, descripcion, fecha inicio y fecha fin." }
  }

  if (!Number.isFinite(metaValidacion) || metaValidacion <= 0) {
    return { ok: false, message: "Indica una meta de validación válida." }
  }

  if (new Date(fechaFin) < new Date(fechaInicio)) {
    return { ok: false, message: "La fecha fin no puede ser anterior a la fecha de inicio." }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from("configuracion_proyecto")
    .upsert(
      {
        id: 1,
        nombre,
        descripcion,
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
        meta_validacion: metaValidacion,
        fecha_actualizacion: new Date().toISOString(),
      },
      { onConflict: "id" },
    )

  if (error) {
    return { ok: false, message: `No se pudo guardar. Verifica que ejecutaste scripts/005_configuracion_proyecto.sql. ${error.message}` }
  }

  revalidatePath("/")
  revalidatePath("/configuracion")
  revalidatePath("/", "layout")
  return { ok: true, message: "Configuración del proyecto guardada correctamente." }
}
