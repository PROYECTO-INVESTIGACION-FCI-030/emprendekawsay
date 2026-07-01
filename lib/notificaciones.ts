import { getEntregasUsuario, getTareasCurso } from "@/lib/cursos"
import { getActividadesProyecto } from "@/lib/actividades-proyecto"
import { getCursos } from "@/lib/cursos"
import { getMaterialesFormativos } from "@/lib/materiales-formativos"
import { getProductionDashboardData } from "@/lib/scientific-production"
import { isSupabaseConfigured, type Notificacion } from "@/lib/perfil"
import { normalizarRol } from "@/lib/roles"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Ahora"
  return new Intl.DateTimeFormat("es-EC", { dateStyle: "medium", timeStyle: "short" }).format(date)
}

function mergeNotifications(primary: Notificacion[], secondary: Notificacion[]) {
  const map = new Map<string, Notificacion>()
  for (const item of [...primary, ...secondary]) map.set(item.id, item)
  return [...map.values()].slice(0, 20)
}

async function getDynamicGeneralNotifications(rolRaw?: string | null): Promise<Notificacion[]> {
  const [actividadesProyecto, cursos, materiales, production] = await Promise.all([
    getActividadesProyecto(),
    getCursos(true),
    getMaterialesFormativos(),
    getProductionDashboardData(),
  ])

  const items: Notificacion[] = []

  for (const actividad of actividadesProyecto.filter((item) => item.estado === "en_proceso" || item.estado === "programado")) {
    items.push({
      id: `avance-${actividad.id}`,
      titulo: actividad.estado === "en_proceso" ? "Actividad en ejecución" : "Actividad programada",
      mensaje: `${actividad.titulo} · ${actividad.descripcion ?? "Sin descripción"}`,
      fecha: formatDate(actividad.fecha_objetivo),
      tipo: actividad.estado === "en_proceso" ? "alerta" : "info",
      leida: false,
      href: "/avance",
      accion: "Ver avance",
    })
  }

  for (const curso of cursos.filter((item) => item.estado === "en_diseno" || item.estado === "en_validacion")) {
    items.push({
      id: `curso-${curso.id}`,
      titulo: curso.estado === "en_validacion" ? "Curso en validación" : "Curso en diseño",
      mensaje: `${curso.titulo} · ${curso.descripcion}`,
      fecha: formatDate(curso.fecha_actualizacion),
      tipo: curso.estado === "en_validacion" ? "alerta" : "info",
      leida: false,
      href: `/diseno-cursos/${curso.id}`,
      accion: "Abrir curso",
    })
  }

  for (const material of materiales.filter((item) => item.visible)) {
    items.push({
      id: `material-${material.id}`,
      titulo: `Material ${material.tipo}`,
      mensaje: material.titulo,
      fecha: formatDate(material.fecha_actualizacion),
      tipo: "info",
      leida: false,
      href: "/malla-formativa",
      accion: "Ver material",
    })
  }

  for (const product of production.productos ?? []) {
    if (product.estado === "publicado") {
      items.push({
        id: `prod-${product.id}`,
        titulo: "Producción científica publicada",
        mensaje: `${product.titulo} · ${product.tipo === "alto_impacto" ? "Alto impacto" : "Regional"}`,
        fecha: product.fecha_publicacion ? formatDate(product.fecha_publicacion) : "Ahora",
        tipo: "exito",
        leida: false,
        href: "/produccion",
        accion: "Ver publicación",
      })
    } else if (product.estado === "en_revision" || product.estado === "en_redaccion") {
      items.push({
        id: `prod-${product.id}`,
        titulo: "Producción científica en proceso",
        mensaje: `${product.titulo} · ${product.estado === "en_revision" ? "En revisión" : "En redacción"}`,
        fecha: product.fecha_objetivo ? formatDate(product.fecha_objetivo) : "Ahora",
        tipo: "alerta",
        leida: false,
        href: "/produccion",
        accion: "Revisar",
      })
    }
  }

  return items.sort((a, b) => a.fecha.localeCompare(b.fecha))
}

export async function getNotificacionesUsuario(rolRaw?: string | null): Promise<Notificacion[]> {
  const authClient = await createClient()
  const {
    data: { user },
  } = await authClient.auth.getUser()

  if (rolRaw === "mujer_emprendedora") {
    if (!isSupabaseConfigured()) return getNotificacionesDemo(rolRaw)

    const [tareas, entregas] = await Promise.all([getTareasCurso(false), getEntregasUsuario()])
    const entregadas = new Set(entregas.map((entrega) => entrega.id_tarea))
    return tareas.filter((tarea) => !entregadas.has(tarea.id)).slice(0, 8).map((tarea) => {
      const fecha = new Intl.DateTimeFormat("es-EC", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(tarea.fecha_limite))

      return {
        id: `tarea-${tarea.id}`,
        titulo: tarea.titulo,
        mensaje: `${tarea.curso?.titulo ?? "Curso"} - ${tarea.vencida ? "Tarea vencida" : "Fecha limite"}: ${fecha}`,
        fecha: tarea.vencida ? "Vencida" : "Pendiente",
        tipo: tarea.vencida ? "alerta" : "info",
        leida: false,
        href: tarea.curso?.id ? `/formacion/${tarea.curso.id}` : "/malla-formativa",
        accion: "Abrir curso",
      }
    })
  }

  if (!isSupabaseConfigured()) return await getDynamicGeneralNotifications(rolRaw)

  const supabase = createAdminClient()
  const rolObjetivo = rolRaw ? normalizarRol(rolRaw) : null
  const { data: rows, error } = await supabase
    .from("notificaciones")
    .select("*")
    .order("fecha_creacion", { ascending: false })
    .limit(20)

  const ids = (rows ?? []).map((row) => row.id)
  const { data: leidasRows } = user && ids.length
    ? await supabase
        .from("notificaciones_leidas")
        .select("id_notificacion")
        .eq("id_usuario", user.id)
        .in("id_notificacion", ids)
    : { data: [] }
  const leidas = new Set((leidasRows ?? []).map((row) => String(row.id_notificacion)))

  const notificacionesReales =
    !error && rows && rows.length > 0
      ? rows
          .filter((row) => {
            if (row.rol === null || row.rol === undefined) return true
            return rolObjetivo !== null && normalizarRol(String(row.rol)) === rolObjetivo
          })
          .map((row) => ({
            id: String(row.id),
            titulo: row.titulo ?? "Notificacion",
            mensaje: row.mensaje ?? "",
            fecha: row.fecha_creacion
              ? new Intl.DateTimeFormat("es-EC", { dateStyle: "medium", timeStyle: "short" }).format(new Date(row.fecha_creacion))
              : "Ahora",
            tipo: row.tipo === "alerta" || row.tipo === "exito" ? row.tipo : "info",
            leida: Boolean(row.leida) || leidas.has(String(row.id)),
            href: row.href ?? undefined,
            accion: row.accion ?? undefined,
          }))
      : []

  const dynamicGeneral = await getDynamicGeneralNotifications(rolRaw)

  return mergeNotifications(notificacionesReales.length > 0 ? notificacionesReales : dynamicGeneral, dynamicGeneral)
}
