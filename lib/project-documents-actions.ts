"use server"

import { revalidatePath } from "next/cache"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { obtenerRolUsuario } from "@/lib/roles"

async function getAdminContext() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { supabase, user: null, allowed: false }
  const rol = await obtenerRolUsuario(supabase, user.id)
  return { supabase, user, allowed: rol === "administradora" }
}

function sanitizeSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function sanitizeFileName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export async function saveProjectDocument(formData: FormData) {
  const ctx = await getAdminContext()
  if (!ctx.allowed || !ctx.user) return { ok: false, message: "Solo la administradora puede gestionar documentos." }

  const id = Number(formData.get("id"))
  const titulo = String(formData.get("titulo") ?? "").trim()
  const descripcion = String(formData.get("descripcion") ?? "").trim()
  const categoria = String(formData.get("categoria") ?? "General").trim() || "General"
  const enlaceExterno = String(formData.get("enlace_externo") ?? "").trim()
  const visible = formData.get("visible") === "on"
  const archivo = formData.get("archivo")
  const removeArchivo = formData.get("remove_archivo") === "on"
  const orden = Number(formData.get("orden") ?? 0)

  if (!titulo) return { ok: false, message: "El titulo es obligatorio." }

  const admin = createAdminClient()
  let archivoData = {
    archivo_nombre: String(formData.get("archivo_nombre") ?? "").trim(),
    archivo_path: String(formData.get("archivo_path") ?? "").trim(),
    archivo_tipo: String(formData.get("archivo_tipo") ?? "").trim() || null,
    archivo_tamano: Number(formData.get("archivo_tamano") ?? 0) || null,
  }

  const archivoAnteriorPath = archivoData.archivo_path

  if (archivo instanceof File && archivo.size > 0) {
    const bucket = "documentos-proyecto"
    const baseName = sanitizeSlug(titulo) || "documento"
    const safeOriginalName = sanitizeFileName(archivo.name) || "archivo"
    const filePath = `${baseName}/${Date.now()}-${safeOriginalName}`
    const { error: uploadError } = await admin.storage.from(bucket).upload(filePath, archivo, {
      contentType: archivo.type,
      upsert: true,
    })
    if (uploadError) return { ok: false, message: `No se pudo subir el archivo: ${uploadError.message}` }
    archivoData = {
      archivo_nombre: archivo.name,
      archivo_path: filePath,
      archivo_tipo: archivo.type || null,
      archivo_tamano: archivo.size,
    }
    if (archivoAnteriorPath) {
      await admin.storage.from(bucket).remove([archivoAnteriorPath])
    }
  } else if (removeArchivo && archivoData.archivo_path) {
    await admin.storage.from("documentos-proyecto").remove([archivoData.archivo_path])
    archivoData = {
      archivo_nombre: "",
      archivo_path: "",
      archivo_tipo: null,
      archivo_tamano: null,
    }
  }

  const payload = {
    titulo,
    descripcion: descripcion || null,
    categoria,
    enlace_externo: enlaceExterno || null,
    visible,
    orden,
    actualizado_por: ctx.user.id,
    fecha_actualizacion: new Date().toISOString(),
    ...archivoData,
  }

  const query = Number.isFinite(id) && id > 0
    ? admin.from("documentos_proyecto").update(payload).eq("id", id)
    : admin.from("documentos_proyecto").insert({ ...payload, creado_por: ctx.user.id })

  const { error } = await query
  if (error) return { ok: false, message: error.message }

  revalidatePath("/proyecto")
  return { ok: true, message: "Documento guardado correctamente." }
}

export async function deleteProjectDocument(id: number, archivoPath?: string | null) {
  const ctx = await getAdminContext()
  if (!ctx.allowed || !ctx.user) return { ok: false, message: "Solo la administradora puede eliminar documentos." }

  const admin = createAdminClient()
  const { error } = await admin.from("documentos_proyecto").delete().eq("id", id)
  if (error) return { ok: false, message: error.message }

  if (archivoPath) {
    await admin.storage.from("documentos-proyecto").remove([archivoPath])
  }

  revalidatePath("/proyecto")
  return { ok: true, message: "Documento eliminado correctamente." }
}

export async function deleteProjectDocumentFile(id: number, archivoPath?: string | null) {
  const ctx = await getAdminContext()
  if (!ctx.allowed || !ctx.user) return { ok: false, message: "Solo la administradora puede eliminar archivos." }

  const admin = createAdminClient()
  const payload = {
    archivo_nombre: "",
    archivo_path: "",
    archivo_tipo: null,
    archivo_tamano: null,
    actualizado_por: ctx.user.id,
    fecha_actualizacion: new Date().toISOString(),
  }

  const { error } = await admin.from("documentos_proyecto").update(payload).eq("id", id)
  if (error) return { ok: false, message: error.message }

  if (archivoPath) {
    await admin.storage.from("documentos-proyecto").remove([archivoPath])
  }

  revalidatePath("/proyecto")
  return { ok: true, message: "Archivo eliminado correctamente." }
}
