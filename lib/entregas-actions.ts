"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

export type EntregaActionResult = {
  ok: boolean
  message: string
}

const MAX_PDF_SIZE = 10 * 1024 * 1024

export async function entregarTarea(formData: FormData): Promise<EntregaActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, message: "Debes iniciar sesion para entregar la tarea." }

  const idTarea = String(formData.get("id_tarea") ?? "").trim()
  const archivo = formData.get("archivo")

  if (!idTarea || !(archivo instanceof File) || archivo.size === 0) {
    return { ok: false, message: "Selecciona un archivo PDF." }
  }
  if (!archivo.name.toLowerCase().endsWith(".pdf") || archivo.type !== "application/pdf") {
    return { ok: false, message: "Solo se permiten archivos en formato PDF." }
  }
  if (archivo.size > MAX_PDF_SIZE) {
    return { ok: false, message: "El PDF no puede superar los 10 MB." }
  }

  const bytes = Buffer.from(await archivo.arrayBuffer())
  if (bytes.subarray(0, 5).toString("ascii") !== "%PDF-") {
    return { ok: false, message: "El archivo seleccionado no es un PDF valido." }
  }

  const { data: tarea, error: tareaError } = await supabase
    .from("tareas_curso")
    .select("id")
    .eq("id", idTarea)
    .eq("visible", true)
    .maybeSingle()

  if (tareaError || !tarea) {
    return { ok: false, message: "La tarea no existe o ya no esta disponible." }
  }

  const { data: anterior } = await supabase
    .from("entregas_tarea")
    .select("archivo_path")
    .eq("id_tarea", idTarea)
    .eq("id_participante", user.id)
    .maybeSingle()

  const path = `${user.id}/${idTarea}/${crypto.randomUUID()}.pdf`
  const { error: uploadError } = await supabase.storage
    .from("entregas-tareas")
    .upload(path, bytes, { contentType: "application/pdf", upsert: false })

  if (uploadError) {
    return { ok: false, message: `No se pudo cargar el PDF: ${uploadError.message}` }
  }

  const { error: saveError } = await supabase
    .from("entregas_tarea")
    .upsert(
      {
        id_tarea: idTarea,
        id_participante: user.id,
        archivo_path: path,
        archivo_nombre: archivo.name,
        fecha_entrega: new Date().toISOString(),
      },
      { onConflict: "id_tarea,id_participante" },
    )

  if (saveError) {
    await supabase.storage.from("entregas-tareas").remove([path])
    return { ok: false, message: `No se pudo registrar la entrega: ${saveError.message}` }
  }

  if (anterior?.archivo_path && anterior.archivo_path !== path) {
    await supabase.storage.from("entregas-tareas").remove([anterior.archivo_path])
  }

  revalidatePath("/", "layout")
  return { ok: true, message: "Tarea entregada correctamente." }
}
