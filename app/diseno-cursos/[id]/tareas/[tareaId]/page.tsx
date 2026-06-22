import { notFound, redirect } from "next/navigation"
import { TaskSubmissionsManager } from "@/components/courses/task-submissions-manager"
import { AppShell } from "@/components/dashboard/app-shell"
import { Toolbar } from "@/components/dashboard/header"
import { getCurso, getEntregasTarea, getTarea } from "@/lib/cursos"
import { getPerfilContext } from "@/lib/perfil"

const ROLES_GESTION = new Set(["administradora", "investigadora", "formadora"])

export default async function EntregasTareaPage({
  params,
}: {
  params: Promise<{ id: string; tareaId: string }>
}) {
  const { id, tareaId } = await params
  const ctx = await getPerfilContext()
  if (!ctx.rolRaw || !ROLES_GESTION.has(ctx.rolRaw)) redirect("/")

  const [curso, tarea, entregas] = await Promise.all([
    getCurso(id, true),
    getTarea(tareaId, true),
    getEntregasTarea(tareaId),
  ])
  if (!curso || !tarea || tarea.id_curso !== curso.id) notFound()

  return (
    <AppShell>
      <Toolbar titulo="Entregas de la Tarea" descripcion="Revisa y califica las actividades de las participantes" showControls={false} />
      <TaskSubmissionsManager curso={curso} tarea={tarea} entregas={entregas} />
    </AppShell>
  )
}
