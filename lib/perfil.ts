import { toTitleCase } from "@/lib/format"
import { etiquetaRol, obtenerRolUsuario } from "@/lib/roles"
import { createClient } from "@/lib/supabase/server"

export { toTitleCase }

export type Perfil = {
  id: string
  nombre_completo: string | null
  email: string | null
  telefono: string | null
  breve_descripcion: string | null
  rol: string | null
  linkedin: string | null
  avatar_url: string | null
  notificaciones_activas: boolean
}

export type Notificacion = {
  id: string
  titulo: string
  mensaje: string
  fecha: string
  tipo: "info" | "alerta" | "exito"
  leida: boolean
  href?: string
  accion?: string
}

export function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  )
}

export type PerfilContext = {
  perfil: Perfil | null
  nombre: string
  rol: string
  rolRaw: string | null
  avatarUrl: string | null
  notificacionesActivas: boolean
}

function demoContext(): PerfilContext {
  return {
    perfil: null,
    nombre: "Usuario Invitado",
    rol: "Miembro del proyecto",
    rolRaw: null,
    avatarUrl: null,
    notificacionesActivas: true,
  }
}

export async function getPerfilContext(): Promise<PerfilContext> {
  if (!isSupabaseConfigured()) return demoContext()

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return demoContext()

  const select =
    "id, nombre_completo, email, telefono, breve_descripcion, rol, linkedin, avatar_url, notificaciones_activas"

  const desdeVista = await supabase
    .from("v_perfiles_usuario_con_rol")
    .select(select)
    .eq("id", user.id)
    .maybeSingle()

  const perfilQuery = desdeVista.error
    ? await supabase.from("perfiles_usuario").select(select).eq("id", user.id).maybeSingle()
    : desdeVista

  const perfil = perfilQuery.data
  const nombreBase =
    perfil?.nombre_completo?.trim() ||
    (user.user_metadata?.nombre_completo as string | undefined)?.trim() ||
    null

  const rolRaw = perfil?.rol ?? null

  return {
    perfil: (perfil as Perfil) ?? null,
    nombre: nombreBase ? toTitleCase(nombreBase) : "Sin nombre",
    rol: rolRaw ? etiquetaRol(rolRaw) : "Miembro del proyecto",
    rolRaw,
    avatarUrl: perfil?.avatar_url ?? null,
    notificacionesActivas: perfil?.notificaciones_activas ?? true,
  }
}

export async function getRolActual(): Promise<string | null> {
  if (!isSupabaseConfigured()) return null

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  return obtenerRolUsuario(supabase, user.id)
}

export function getNotificacionesDemo(rolRaw?: string | null): Notificacion[] {
  if (rolRaw === "mujer_emprendedora") {
    return [
      {
        id: "diagnostico-pendiente",
        titulo: "Diagnóstico pendiente",
        mensaje: "Tienes una encuesta de diagnóstico pendiente por responder.",
        fecha: "Pendiente",
        tipo: "alerta",
        leida: false,
        href: "/diagnostico",
        accion: "Responder encuesta",
      },
      {
        id: "tarea-finanzas",
        titulo: "Nueva tarea disponible",
        mensaje: "Tienes una nueva tarea en el módulo de Finanzas.",
        fecha: "Hoy",
        tipo: "info",
        leida: false,
        href: "/evaluaciones",
        accion: "Ver tarea",
      },
    ]
  }

  return [
    {
      id: "1",
      titulo: "Nueva encuesta de validación",
      mensaje: "Se habilitó la encuesta del módulo 3 para las participantes.",
      fecha: "Hace 2 horas",
      tipo: "info",
      leida: false,
    },
    {
      id: "2",
      titulo: "Producto científico aprobado",
      mensaje: "El artículo sobre saberes ancestrales fue aceptado.",
      fecha: "Ayer",
      tipo: "exito",
      leida: false,
    },
    {
      id: "3",
      titulo: "Plazo proximo a vencer",
      mensaje: "La planificacion del curso 4 vence en 3 dias.",
      fecha: "Hace 2 dias",
      tipo: "alerta",
      leida: true,
    },
  ]
}
