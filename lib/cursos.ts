import { createClient } from "@/lib/supabase/server"

export type Curso = {
  id: string
  titulo: string
  descripcion: string
  enlace: string | null
  visible: boolean
  estado: "borrador" | "en_diseno" | "en_validacion" | "completado"
  fecha_creacion: string
  fecha_actualizacion: string
}

export type TareaCurso = {
  id: string
  id_curso: string
  id_modulo: string | null
  titulo: string
  descripcion: string | null
  fecha_limite: string
  visible: boolean
  vencida: boolean
  dias_restantes: number
  curso: {
    id: string
    titulo: string
    enlace: string | null
    visible: boolean
  } | null
}

export type EntregaTarea = {
  id: string
  id_tarea: string
  archivo_nombre: string
  fecha_entrega: string
  calificacion?: {
    calificacion: number
    retroalimentacion: string | null
  } | null
}

export type ModuloCurso = {
  id: string
  id_curso: string
  titulo: string
  contenido_html: string
  orden: number
  visible: boolean
}

export type EntregaRevision = {
  id: string
  id_tarea: string
  archivo_nombre: string
  fecha_entrega: string
  archivo_url: string | null
  participante: {
    id: string
    nombre_completo: string | null
    email: string | null
  } | null
  tarea: {
    id: string
    titulo: string
    id_modulo: string | null
  } | null
  calificacion: {
    id: string
    calificacion: number
    retroalimentacion: string | null
  } | null
}

export async function getCursos(incluirOcultos = false): Promise<Curso[]> {
  const supabase = await createClient()
  let query = supabase
    .from("cursos")
    .select("id, titulo, descripcion, enlace, visible, estado, fecha_creacion, fecha_actualizacion")
    .order("fecha_creacion", { ascending: false })

  if (!incluirOcultos) query = query.eq("visible", true)

  const { data, error } = await query
  if (error || !data) return []
  return data as Curso[]
}

export async function getTareasCurso(incluirOcultas = false): Promise<TareaCurso[]> {
  const supabase = await createClient()
  let query = supabase
    .from("tareas_curso")
    .select("id, id_curso, id_modulo, titulo, descripcion, fecha_limite, visible, curso:cursos(id, titulo, enlace, visible)")
    .order("fecha_limite", { ascending: true })

  if (!incluirOcultas) query = query.eq("visible", true)

  const { data, error } = await query
  if (error || !data) return []

  return (data as unknown as Omit<TareaCurso, "vencida">[])
    .filter((tarea) => incluirOcultas || tarea.curso?.visible)
    .map((tarea) => ({
      ...tarea,
      vencida: new Date(tarea.fecha_limite).getTime() < Date.now(),
      dias_restantes: Math.ceil((new Date(tarea.fecha_limite).getTime() - Date.now()) / 86_400_000),
    }))
}

export async function getEntregasUsuario(): Promise<EntregaTarea[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from("entregas_tarea")
    .select("id, id_tarea, archivo_nombre, fecha_entrega")
    .eq("id_participante", user.id)

  if (error || !data) return []
  const entregas = data as Omit<EntregaTarea, "calificacion">[]
  const ids = entregas.map((entrega) => entrega.id)
  if (ids.length === 0) return entregas

  const { data: notas } = await supabase
    .from("calificaciones_entrega")
    .select("id_entrega, calificacion, retroalimentacion")
    .in("id_entrega", ids)

  const porEntrega = new Map(
    (notas ?? []).map((nota) => [nota.id_entrega as string, {
      calificacion: Number(nota.calificacion),
      retroalimentacion: nota.retroalimentacion as string | null,
    }]),
  )

  return entregas.map((entrega) => ({ ...entrega, calificacion: porEntrega.get(entrega.id) ?? null }))
}

export async function getCurso(id: string, incluirOculto = false): Promise<Curso | null> {
  const supabase = await createClient()
  let query = supabase
    .from("cursos")
    .select("id, titulo, descripcion, enlace, visible, estado, fecha_creacion, fecha_actualizacion")
    .eq("id", id)

  if (!incluirOculto) query = query.eq("visible", true)
  const { data, error } = await query.maybeSingle()
  if (error || !data) return null
  return data as Curso
}

export async function getModulosCurso(idCurso: string, incluirOcultos = false): Promise<ModuloCurso[]> {
  const supabase = await createClient()
  let query = supabase
    .from("modulos_curso")
    .select("id, id_curso, titulo, contenido_html, orden, visible")
    .eq("id_curso", idCurso)
    .order("orden", { ascending: true })

  if (!incluirOcultos) query = query.eq("visible", true)
  const { data, error } = await query
  if (error || !data) return []
  return data as ModuloCurso[]
}

export async function getModulosPublicados(): Promise<ModuloCurso[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("modulos_curso")
    .select("id, id_curso, titulo, contenido_html, orden, visible, curso:cursos!inner(visible)")
    .eq("visible", true)
    .eq("curso.visible", true)
    .order("orden", { ascending: true })

  if (error || !data) return []
  return (data as unknown as Array<ModuloCurso & { curso?: { visible: boolean } }>).map(({ curso: _curso, ...modulo }) => modulo)
}

export async function getTareasPorCurso(idCurso: string, incluirOcultas = false): Promise<TareaCurso[]> {
  const tareas = await getTareasCurso(incluirOcultas)
  return tareas.filter((tarea) => tarea.id_curso === idCurso)
}

export async function getTarea(id: string, incluirOculta = false): Promise<TareaCurso | null> {
  const supabase = await createClient()
  let query = supabase
    .from("tareas_curso")
    .select("id, id_curso, id_modulo, titulo, descripcion, fecha_limite, visible, curso:cursos(id, titulo, enlace, visible)")
    .eq("id", id)

  if (!incluirOculta) query = query.eq("visible", true)
  const { data, error } = await query.maybeSingle()
  if (error || !data) return null
  const tarea = data as unknown as Omit<TareaCurso, "vencida" | "dias_restantes">
  const diferencia = new Date(tarea.fecha_limite).getTime() - Date.now()
  return {
    ...tarea,
    vencida: diferencia < 0,
    dias_restantes: Math.ceil(diferencia / 86_400_000),
  }
}

export async function getEntregasCurso(idCurso: string): Promise<EntregaRevision[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("entregas_tarea")
    .select(`
      id, id_tarea, archivo_path, archivo_nombre, fecha_entrega,
      participante:perfiles_usuario!entregas_tarea_id_participante_fkey(id, nombre_completo, email),
      tarea:tareas_curso!inner(id, titulo, id_curso, id_modulo)
    `)
    .eq("tarea.id_curso", idCurso)
    .order("fecha_entrega", { ascending: false })

  if (error || !data) return []
  const raw = data as unknown as Array<Omit<EntregaRevision, "archivo_url" | "calificacion"> & { archivo_path: string }>
  const ids = raw.map((entrega) => entrega.id)
  const { data: notas } = ids.length
    ? await supabase.from("calificaciones_entrega").select("id, id_entrega, calificacion, retroalimentacion").in("id_entrega", ids)
    : { data: [] }
  const porEntrega = new Map((notas ?? []).map((nota) => [nota.id_entrega as string, {
    id: nota.id as string,
    calificacion: Number(nota.calificacion),
    retroalimentacion: nota.retroalimentacion as string | null,
  }]))

  return Promise.all(raw.map(async (entrega) => {
    const { data: signed } = await supabase.storage
      .from("entregas-tareas")
      .createSignedUrl(entrega.archivo_path, 3600)
    return {
      ...entrega,
      archivo_url: signed?.signedUrl ?? null,
      calificacion: porEntrega.get(entrega.id) ?? null,
    }
  }))
}

export async function getEntregasTarea(idTarea: string): Promise<EntregaRevision[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("entregas_tarea")
    .select(`
      id, id_tarea, archivo_path, archivo_nombre, fecha_entrega,
      participante:perfiles_usuario!entregas_tarea_id_participante_fkey(id, nombre_completo, email),
      tarea:tareas_curso(id, titulo, id_curso, id_modulo)
    `)
    .eq("id_tarea", idTarea)
    .order("fecha_entrega", { ascending: false })

  if (error || !data) return []
  const raw = data as unknown as Array<Omit<EntregaRevision, "archivo_url" | "calificacion"> & { archivo_path: string }>
  const ids = raw.map((entrega) => entrega.id)
  const { data: notas } = ids.length
    ? await supabase.from("calificaciones_entrega").select("id, id_entrega, calificacion, retroalimentacion").in("id_entrega", ids)
    : { data: [] }
  const porEntrega = new Map((notas ?? []).map((nota) => [nota.id_entrega as string, {
    id: nota.id as string,
    calificacion: Number(nota.calificacion),
    retroalimentacion: nota.retroalimentacion as string | null,
  }]))

  return Promise.all(raw.map(async (entrega) => {
    const { data: signed } = await supabase.storage.from("entregas-tareas").createSignedUrl(entrega.archivo_path, 3600)
    return {
      ...entrega,
      archivo_url: signed?.signedUrl ?? null,
      calificacion: porEntrega.get(entrega.id) ?? null,
    }
  }))
}
