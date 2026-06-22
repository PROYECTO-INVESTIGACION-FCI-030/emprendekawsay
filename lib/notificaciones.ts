import { getEntregasUsuario, getTareasCurso } from "@/lib/cursos"
import { getNotificacionesDemo, type Notificacion } from "@/lib/perfil"

export async function getNotificacionesUsuario(rolRaw?: string | null): Promise<Notificacion[]> {
  if (rolRaw !== "mujer_emprendedora") return getNotificacionesDemo(rolRaw)

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
