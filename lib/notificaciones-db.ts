"use server"

import { createAdminClient } from "@/lib/supabase/admin"

export type NotificacionInsert = {
  id_usuario?: string | null
  rol?: string | null
  titulo: string
  mensaje: string
  tipo?: "info" | "alerta" | "exito"
  href?: string | null
  accion?: string | null
}

export async function registrarNotificacion(data: NotificacionInsert) {
  const supabase = createAdminClient()
  const payload = {
    id_usuario: data.id_usuario ?? null,
    rol: data.rol ?? null,
    titulo: data.titulo,
    mensaje: data.mensaje,
    tipo: data.tipo ?? "info",
    href: data.href ?? null,
    accion: data.accion ?? null,
    leida: false,
    fecha_creacion: new Date().toISOString(),
    fecha_actualizacion: new Date().toISOString(),
  }

  const { error } = await supabase.from("notificaciones").insert(payload)
  if (error) {
    console.error("No se pudo registrar la notificacion:", error.message)
    return { ok: false, error: error.message }
  }

  return { ok: true }
}
