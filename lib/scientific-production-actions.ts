"use server"

import { revalidatePath } from "next/cache"
import { registrarNotificacion } from "@/lib/notificaciones-db"
import { obtenerRolUsuario } from "@/lib/roles"
import { createClient } from "@/lib/supabase/server"

const TYPES = ["alto_impacto", "regional"]
const STATES = ["pendiente", "en_redaccion", "en_revision", "publicado"]
const ROLES_PRODUCCION = ["administradora", "investigadora", "formadora", "institucion_aliada"]

async function notificarProduccion(titulo: string, estado: string) {
  const tipo = estado === "publicado" ? "exito" : estado === "en_revision" ? "alerta" : "info"
  const mensaje =
    estado === "publicado"
      ? `La publicación "${titulo}" ya quedó publicada.`
      : estado === "en_revision"
        ? `La publicación "${titulo}" está en revisión.`
        : `La publicación "${titulo}" está en redacción.`

  await Promise.allSettled(
    ["administradora", "investigadora", "formadora", "institucion_aliada"].map((rol) =>
      registrarNotificacion({
        rol,
        titulo: "Producción científica actualizada",
        mensaje,
        tipo,
        href: "/produccion",
        accion: "Ver producción",
      }),
    ),
  )
}

async function context() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const role = user ? await obtenerRolUsuario(supabase, user.id) : null
  return { supabase, user, allowed: Boolean(user && role && ROLES_PRODUCCION.includes(role)) }
}

export async function saveScientificProduct(formData: FormData) {
  const ctx = await context()
  if (!ctx.allowed || !ctx.user) return { ok: false, message: "No tienes permiso para gestionar publicaciones." }

  const id = String(formData.get("id") ?? "")
  const titulo = String(formData.get("titulo") ?? "").trim()
  const descripcion = String(formData.get("descripcion") ?? "").trim()
  const tipo = String(formData.get("tipo") ?? "")
  const estado = String(formData.get("estado") ?? "")
  const evidencia = String(formData.get("evidencia_url") ?? "").trim() || null
  const fechaObjetivo = String(formData.get("fecha_objetivo") ?? "").trim() || null
  const fechaPublicacionInput = String(formData.get("fecha_publicacion") ?? "").trim() || null
  const investigadores = formData.getAll("investigadores").map(String).filter(Boolean)
  const responsablePrincipal = investigadores[0] || null

  if (!titulo || !TYPES.includes(tipo) || !STATES.includes(estado)) {
    return { ok: false, message: "Completa título, tipo y estado." }
  }
  if (!fechaObjetivo) {
    return { ok: false, message: "Agrega una fecha objetivo para que aparezca en Próximas Actividades." }
  }
  if (evidencia) {
    try {
      new URL(evidencia)
    } catch {
      return { ok: false, message: "La evidencia debe ser un enlace PDF o DOI válido." }
    }
  }

  const progress = { pendiente: 0, en_redaccion: 35, en_revision: 70, publicado: 100 }[estado] ?? 0
  const tipoDb = tipo === "regional" ? "articulo_latindex" : "articulo_scopus"
  const { data: existingProduct } = id
    ? await ctx.supabase.from("productos_cientificos").select("fecha_publicacion").eq("id", id).maybeSingle()
    : { data: null }
  const fechaPublicacion = estado === "publicado"
    ? (fechaPublicacionInput || existingProduct?.fecha_publicacion || new Date().toISOString())
    : null
  const payload = {
    titulo,
    descripcion: descripcion || null,
    tipo: tipoDb,
    estado,
    avance: progress,
    responsable: responsablePrincipal,
    evidencia_url: evidencia,
    enlace: evidencia,
    fecha_objetivo: fechaObjetivo,
    fecha_publicacion: fechaPublicacion,
    fecha_actualizacion: new Date().toISOString(),
  }

  let productId = id
  if (id) {
    const { error } = await ctx.supabase.from("productos_cientificos").update(payload).eq("id", id)
    if (error) return { ok: false, message: error.message }
  } else {
    const { data, error } = await ctx.supabase.from("productos_cientificos").insert(payload).select("id").single()
    if (error || !data) return { ok: false, message: error?.message ?? "No se pudo crear el producto." }
    productId = data.id
  }

  await notificarProduccion(titulo, estado)

  await ctx.supabase.from("productos_cientificos_investigadores").delete().eq("id_producto", productId)
  if (investigadores.length > 0) {
    const { error: relationError } = await ctx.supabase
      .from("productos_cientificos_investigadores")
      .insert(investigadores.map((investigator) => ({ id_producto: productId, id_investigador: investigator })))
    if (relationError) return { ok: false, message: relationError.message }
  }

  revalidatePath("/", "layout")
  revalidatePath("/produccion")
  return { ok: true, message: id ? "Producto actualizado." : "Publicación registrada." }
}

export async function deleteScientificProduct(id: string) {
  const ctx = await context()
  if (!ctx.allowed) return { ok: false, message: "No autorizado." }
  const { error } = await ctx.supabase.from("productos_cientificos").delete().eq("id", id)
  if (error) return { ok: false, message: error.message }
  revalidatePath("/", "layout")
  revalidatePath("/produccion")
  return { ok: true, message: "Producto eliminado." }
}
