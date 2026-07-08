import { redirect } from "next/navigation"
import { CourseManager } from "@/components/courses/course-manager"
import { MallaFormativaManager } from "@/components/malla-formativa/malla-formativa-manager"
import { AppShell } from "@/components/dashboard/app-shell"
import { Toolbar } from "@/components/dashboard/header"
import { getCursos, getUsuariosAsignablesCurso } from "@/lib/cursos"
import { getMaterialesFormativos, getCursosFormativosParaMalla } from "@/lib/materiales-formativos"
import { getPerfilContext } from "@/lib/perfil"

const ROLES_GESTION = new Set(["administradora", "investigadora", "formadora"])

export default async function DisenoCursosPage() {
  const ctx = await getPerfilContext()
  if (!ctx.rolRaw || !ROLES_GESTION.has(ctx.rolRaw)) redirect("/")

  const [cursos, usuarios, materiales, cursosFormativos] = await Promise.all([
    getCursos(true),
    getUsuariosAsignablesCurso(),
    getMaterialesFormativos(),
    getCursosFormativosParaMalla(),
  ])

  return (
    <AppShell>
      <Toolbar
        titulo="Diseño de Cursos"
        descripcion="Crea, publica y administra cursos, tareas y materiales formativos."
        showControls={false}
      />
      <CourseManager cursos={cursos} encargados={usuarios.encargados} />
      <section id="materiales-formativos" className="mt-2">
        <MallaFormativaManager cursos={cursosFormativos} materiales={materiales} />
      </section>
    </AppShell>
  )
}
