import { redirect } from "next/navigation"
import { CourseManager } from "@/components/courses/course-manager"
import { AppShell } from "@/components/dashboard/app-shell"
import { Toolbar } from "@/components/dashboard/header"
import { getCursos } from "@/lib/cursos"
import { getPerfilContext } from "@/lib/perfil"

const ROLES_GESTION = new Set(["administradora", "investigadora", "formadora"])

export default async function DisenoCursosPage() {
  const ctx = await getPerfilContext()
  if (!ctx.rolRaw || !ROLES_GESTION.has(ctx.rolRaw)) redirect("/")

  const cursos = await getCursos(true)

  return (
    <AppShell>
      <Toolbar
        titulo="Diseno de Cursos"
        descripcion="Crea, publica y administra cursos y tareas formativas"
        showControls={false}
      />
      <CourseManager cursos={cursos} />
    </AppShell>
  )
}
