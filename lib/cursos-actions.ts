"use server"

import { revalidatePath } from "next/cache"
import sanitizeHtml from "sanitize-html"
import { registrarNotificacion } from "@/lib/notificaciones-db"
import { obtenerRolUsuario } from "@/lib/roles"
import { createClient } from "@/lib/supabase/server"

export type CursoActionResult = {
  ok: boolean
  message: string
}

const ROLES_GESTION = new Set(["administradora", "investigadora", "formadora"])

function texto(formData: FormData, campo: string) {
  return String(formData.get(campo) ?? "").trim()
}

function capitalizarPrimera(value: string) {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : value
}

function datetimeLocalToIsoGuayaquil(value: string) {
  if (!value) return null
  const [datePart, timePart] = value.split("T")
  if (!datePart || !timePart) return null
  const [year, month, day] = datePart.split("-").map(Number)
  const [hours, minutes] = timePart.split(":").map(Number)
  if ([year, month, day, hours, minutes].some((item) => Number.isNaN(item))) return null
  const utcMillis = Date.UTC(year, month - 1, day, hours + 5, minutes, 0, 0)
  return new Date(utcMillis).toISOString()
}

function revalidarCursos() {
  revalidatePath("/", "layout")
  revalidatePath("/diseno-cursos")
  revalidatePath("/malla-formativa")
}

async function notificarRoles(roles: string[], payload: { titulo: string; mensaje: string; tipo?: "info" | "alerta" | "exito"; href?: string; accion?: string }) {
  await Promise.allSettled(
    roles.map((rol) =>
      registrarNotificacion({
        rol,
        titulo: payload.titulo,
        mensaje: payload.mensaje,
        tipo: payload.tipo ?? "info",
        href: payload.href ?? null,
        accion: payload.accion ?? null,
      }),
    ),
  )
}

async function contextoGestion() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Debes iniciar sesion.", supabase, user: null }

  const rol = await obtenerRolUsuario(supabase, user.id)
  if (!rol || !ROLES_GESTION.has(rol)) {
    return { error: "No tienes permiso para gestionar cursos.", supabase, user: null }
  }

  return { error: null, supabase, user }
}

export async function guardarCurso(formData: FormData): Promise<CursoActionResult> {
  const ctx = await contextoGestion()
  if (ctx.error || !ctx.user) return { ok: false, message: ctx.error ?? "No autorizado." }

  const id = texto(formData, "id")
  const titulo = capitalizarPrimera(texto(formData, "titulo"))
  const descripcion = capitalizarPrimera(texto(formData, "descripcion"))
  const estado = texto(formData, "estado") || "en_diseno"
  const idEncargado = texto(formData, "id_encargado") || null

  if (!titulo || !descripcion) {
    return { ok: false, message: "Completa título y descripción." }
  }
  if (!["borrador", "en_diseno", "en_validacion", "completado"].includes(estado)) {
    return { ok: false, message: "Selecciona un estado válido para el curso." }
  }

  const payload = {
    titulo,
    descripcion,
    estado,
    id_encargado: idEncargado,
    fecha_actualizacion: new Date().toISOString(),
  }

  const query = id
    ? ctx.supabase.from("cursos").update(payload).eq("id", id)
    : ctx.supabase.from("cursos").insert({ ...payload, creado_por: ctx.user.id })
  const { error } = await query

  if (error) return { ok: false, message: `No se pudo guardar el curso: ${error.message}` }
  await notificarRoles(
    ["administradora", "formadora", "investigadora", "institucion_aliada", "mujer_emprendedora"],
    {
      titulo: id ? "Curso actualizado" : "Curso creado",
      mensaje: `El curso "${titulo}" fue ${id ? "actualizado" : "creado"} en Diseño de Cursos.`,
      tipo: "info",
      href: "/diseno-cursos",
      accion: "Abrir cursos",
    },
  )
  revalidarCursos()
  return { ok: true, message: id ? "Curso actualizado." : "Curso creado." }
}

export async function guardarParticipantesCurso(formData: FormData): Promise<CursoActionResult> {
  const ctx = await contextoGestion()
  if (ctx.error || !ctx.user) return { ok: false, message: ctx.error ?? "No autorizado." }

  const idCurso = texto(formData, "id_curso")
  const participantes = formData.getAll("participantes").map((value) => String(value))
  if (!idCurso) return { ok: false, message: "Selecciona un curso." }

  const { data: current, error: currentError } = await ctx.supabase
    .from("curso_participantes")
    .select("id_participante")
    .eq("id_curso", idCurso)
    .eq("activo", true)

  if (currentError) return { ok: false, message: `No se pudieron leer las asignaciones: ${currentError.message}` }

  const actuales = new Set((current ?? []).map((item) => item.id_participante as string))
  const seleccionados = new Set(participantes)
  const remover = [...actuales].filter((id) => !seleccionados.has(id))
  const agregar = [...seleccionados].filter((id) => !actuales.has(id))

  if (remover.length) {
    const { error } = await ctx.supabase
      .from("curso_participantes")
      .update({ activo: false })
      .eq("id_curso", idCurso)
      .in("id_participante", remover)
    if (error) return { ok: false, message: `No se pudieron quitar participantes: ${error.message}` }
  }

  if (agregar.length) {
    const { error } = await ctx.supabase
      .from("curso_participantes")
      .upsert(agregar.map((idParticipante) => ({
        id_curso: idCurso,
        id_participante: idParticipante,
        asignado_por: ctx.user.id,
        activo: true,
        fecha_asignacion: new Date().toISOString(),
      })), { onConflict: "id_curso,id_participante" })
    if (error) return { ok: false, message: `No se pudieron asignar participantes: ${error.message}` }
  }

  revalidarCursos()
  revalidatePath(`/diseno-cursos/${idCurso}`)
  return { ok: true, message: "Participantes del curso actualizadas." }
}

export async function cambiarVisibilidadCurso(id: string, visible: boolean): Promise<CursoActionResult> {
  const ctx = await contextoGestion()
  if (ctx.error) return { ok: false, message: ctx.error }

  const { error } = await ctx.supabase
    .from("cursos")
    .update({ visible, fecha_actualizacion: new Date().toISOString() })
    .eq("id", id)

  if (error) return { ok: false, message: `No se pudo cambiar la visibilidad: ${error.message}` }
  revalidarCursos()
  return { ok: true, message: visible ? "Curso publicado." : "Curso ocultado." }
}

export async function eliminarCurso(id: string): Promise<CursoActionResult> {
  const ctx = await contextoGestion()
  if (ctx.error) return { ok: false, message: ctx.error }
  const { error } = await ctx.supabase.from("cursos").delete().eq("id", id)

  if (error) return { ok: false, message: `No se pudo eliminar el curso: ${error.message}` }
  revalidarCursos()
  return { ok: true, message: "Curso eliminado junto con sus tareas." }
}

export async function guardarTarea(formData: FormData): Promise<CursoActionResult> {
  const ctx = await contextoGestion()
  if (ctx.error || !ctx.user) return { ok: false, message: ctx.error ?? "No autorizado." }

  const id = texto(formData, "id")
  const idCurso = texto(formData, "id_curso")
  const idModulo = texto(formData, "id_modulo")
  const titulo = capitalizarPrimera(texto(formData, "titulo"))
  const descripcionRaw = capitalizarPrimera(texto(formData, "descripcion"))
  const fechaRaw = texto(formData, "fecha_limite")
  const fecha = new Date(fechaRaw)

  if (!idCurso || !idModulo || !titulo || !fechaRaw || Number.isNaN(fecha.getTime())) {
    return { ok: false, message: "Selecciona el modulo y completa titulo, fecha y hora." }
  }

  const { data: modulo } = await ctx.supabase
    .from("modulos_curso")
    .select("id")
    .eq("id", idModulo)
    .eq("id_curso", idCurso)
    .maybeSingle()
  if (!modulo) return { ok: false, message: "El modulo no pertenece a este curso." }

  const payload = {
    id_curso: idCurso,
    id_modulo: idModulo,
    titulo,
    descripcion: descripcionRaw || null,
    fecha_limite: fecha.toISOString(),
    fecha_actualizacion: new Date().toISOString(),
  }

  const query = id
    ? ctx.supabase.from("tareas_curso").update(payload).eq("id", id)
    : ctx.supabase.from("tareas_curso").insert({ ...payload, creado_por: ctx.user.id })
  const { error } = await query

  if (error) return { ok: false, message: `No se pudo guardar la tarea: ${error.message}` }
  await notificarRoles(
    ["mujer_emprendedora", "formadora", "investigadora", "administradora"],
    {
      titulo: id ? "Tarea actualizada" : "Nueva tarea",
      mensaje: `La tarea "${titulo}" fue ${id ? "actualizada" : "creada"} para el curso.`,
      tipo: "alerta",
      href: `/formacion/${idCurso}`,
      accion: "Ver tarea",
    },
  )
  revalidarCursos()
  return { ok: true, message: id ? "Tarea actualizada." : "Tarea creada." }
}

export async function cambiarVisibilidadTarea(id: string, visible: boolean): Promise<CursoActionResult> {
  const ctx = await contextoGestion()
  if (ctx.error) return { ok: false, message: ctx.error }
  const { error } = await ctx.supabase
    .from("tareas_curso")
    .update({ visible, fecha_actualizacion: new Date().toISOString() })
    .eq("id", id)

  if (error) return { ok: false, message: `No se pudo cambiar la visibilidad: ${error.message}` }
  if (visible) {
    await notificarRoles(["mujer_emprendedora", "formadora", "investigadora", "administradora"], {
      titulo: "Tarea publicada",
      mensaje: "Una tarea del curso quedó disponible para las participantes.",
      tipo: "info",
      href: "/diseno-cursos",
      accion: "Revisar",
    })
  }
  revalidarCursos()
  return { ok: true, message: visible ? "Tarea publicada." : "Tarea ocultada." }
}

export async function eliminarTarea(id: string): Promise<CursoActionResult> {
  const ctx = await contextoGestion()
  if (ctx.error) return { ok: false, message: ctx.error }
  const { error } = await ctx.supabase.from("tareas_curso").delete().eq("id", id)

  if (error) return { ok: false, message: `No se pudo eliminar la tarea: ${error.message}` }
  revalidarCursos()
  return { ok: true, message: "Tarea eliminada." }
}

function limpiarContenido(html: string) {
  return sanitizeHtml(html, {
    allowedTags: [
      "p", "br", "h2", "h3", "h4", "strong", "em", "s", "blockquote",
      "ul", "ol", "li", "code", "pre", "span",
    ],
    allowedAttributes: {
      p: ["style"],
      h2: ["style"],
      h3: ["style"],
      h4: ["style"],
      span: ["style"],
    },
    allowedStyles: {
      "*": {
        color: [/^#[0-9a-fA-F]{6}$/],
        "text-align": [/^(left|center|right|justify)$/],
      },
    },
  })
}

export async function guardarModulo(formData: FormData): Promise<CursoActionResult> {
  const ctx = await contextoGestion()
  if (ctx.error) return { ok: false, message: ctx.error }

  const id = texto(formData, "id")
  const idCurso = texto(formData, "id_curso")
  const titulo = capitalizarPrimera(texto(formData, "titulo"))
  const contenidoHtml = limpiarContenido(texto(formData, "contenido_html"))
  const orden = Number(texto(formData, "orden"))

  if (!idCurso || !titulo || !Number.isInteger(orden) || orden < 1) {
    return { ok: false, message: "Completa el titulo y un orden valido para el modulo." }
  }

  const payload = {
    id_curso: idCurso,
    titulo,
    contenido_html: contenidoHtml,
    orden,
    fecha_actualizacion: new Date().toISOString(),
  }
  const query = id
    ? ctx.supabase.from("modulos_curso").update(payload).eq("id", id)
    : ctx.supabase.from("modulos_curso").insert(payload)
  const { error } = await query

  if (error) return { ok: false, message: `No se pudo guardar el modulo: ${error.message}` }
  await notificarRoles(["formadora", "investigadora", "administradora"], {
    titulo: id ? "Modulo actualizado" : "Nuevo modulo",
    mensaje: `Se ${id ? "actualizó" : "creó"} el modulo "${titulo}" del curso.`,
    tipo: "info",
    href: `/diseno-cursos/${idCurso}`,
    accion: "Abrir curso",
  })
  revalidarCursos()
  revalidatePath(`/diseno-cursos/${idCurso}`)
  revalidatePath(`/formacion/${idCurso}`)
  return { ok: true, message: id ? "Modulo actualizado." : "Modulo creado." }
}

export async function cambiarVisibilidadModulo(id: string, idCurso: string, visible: boolean): Promise<CursoActionResult> {
  const ctx = await contextoGestion()
  if (ctx.error) return { ok: false, message: ctx.error }
  const { error } = await ctx.supabase
    .from("modulos_curso")
    .update({ visible, fecha_actualizacion: new Date().toISOString() })
    .eq("id", id)

  if (error) return { ok: false, message: `No se pudo cambiar la visibilidad: ${error.message}` }
  if (visible) {
    await notificarRoles(["formadora", "investigadora", "administradora"], {
      titulo: "Modulo publicado",
      mensaje: "Un modulo del curso quedó visible.",
      tipo: "info",
      href: `/diseno-cursos/${idCurso}`,
      accion: "Ver modulo",
    })
  }
  revalidatePath(`/diseno-cursos/${idCurso}`)
  revalidatePath(`/formacion/${idCurso}`)
  return { ok: true, message: visible ? "Modulo publicado." : "Modulo ocultado." }
}

export async function eliminarModulo(id: string, idCurso: string): Promise<CursoActionResult> {
  const ctx = await contextoGestion()
  if (ctx.error) return { ok: false, message: ctx.error }
  const { error } = await ctx.supabase.from("modulos_curso").delete().eq("id", id)
  if (error) return { ok: false, message: `No se pudo eliminar el modulo: ${error.message}` }
  revalidatePath(`/diseno-cursos/${idCurso}`)
  revalidatePath(`/formacion/${idCurso}`)
  return { ok: true, message: "Modulo y sus tareas eliminados." }
}

export async function calificarEntrega(formData: FormData): Promise<CursoActionResult> {
  const ctx = await contextoGestion()
  if (ctx.error || !ctx.user) return { ok: false, message: ctx.error ?? "No autorizado." }

  const idEntrega = texto(formData, "id_entrega")
  const idCurso = texto(formData, "id_curso")
  const idTarea = texto(formData, "id_tarea")
  const calificacion = Number(texto(formData, "calificacion"))
  const retroalimentacion = capitalizarPrimera(texto(formData, "retroalimentacion")) || null

  if (!idEntrega || Number.isNaN(calificacion) || calificacion < 0 || calificacion > 10) {
    return { ok: false, message: "La calificacion debe estar entre 0 y 10." }
  }

  const { error } = await ctx.supabase.from("calificaciones_entrega").upsert({
    id_entrega: idEntrega,
    calificacion,
    retroalimentacion,
    calificado_por: ctx.user.id,
    fecha_calificacion: new Date().toISOString(),
  }, { onConflict: "id_entrega" })

  if (error) return { ok: false, message: `No se pudo guardar la calificacion: ${error.message}` }
  revalidatePath(`/diseno-cursos/${idCurso}`)
  if (idTarea) revalidatePath(`/diseno-cursos/${idCurso}/tareas/${idTarea}`)
  revalidatePath(`/formacion/${idCurso}`)
  revalidatePath("/", "layout")
  await notificarRoles(["mujer_emprendedora"], {
    titulo: "Entrega calificada",
    mensaje: `Tu tarea recibió una calificación de ${calificacion}/10.`,
    tipo: calificacion >= 7 ? "exito" : "alerta",
    href: `/formacion/${idCurso}`,
    accion: "Ver resultado",
  })
  return { ok: true, message: "Calificacion guardada." }
}
