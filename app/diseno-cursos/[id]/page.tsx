import { notFound, redirect } from "next/navigation"
import { CourseContentManager } from "@/components/courses/course-content-manager"
import { AppShell } from "@/components/dashboard/app-shell"
import { Toolbar } from "@/components/dashboard/header"
import { getCurso, getModulosCurso, getTareasPorCurso } from "@/lib/cursos"
import { getPerfilContext } from "@/lib/perfil"

const ROLES_GESTION = new Set(["administradora", "investigadora", "formadora"])

export default async function CursoEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const ctx = await getPerfilContext()
  if (!ctx.rolRaw || !ROLES_GESTION.has(ctx.rolRaw)) redirect("/")

  const [curso, modulos, tareas] = await Promise.all([
    getCurso(id, true),
    getModulosCurso(id, true),
    getTareasPorCurso(id, true),
  ])
  if (!curso) notFound()

  return (
    <AppShell>
      <Toolbar titulo="Contenido del Curso" descripcion="Edita modulos, actividades y calificaciones" showControls={false} />
      <CourseContentManager curso={curso} modulos={modulos} tareas={tareas} />
    </AppShell>
  )
}
