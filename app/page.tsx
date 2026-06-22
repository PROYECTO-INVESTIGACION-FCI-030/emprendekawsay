import { AppShell } from "@/components/dashboard/app-shell"
import { EntrepreneurDashboard } from "@/components/dashboard/entrepreneur-dashboard"
import { ProjectDashboard } from "@/components/dashboard/project-dashboard"
import { getPerfilContext } from "@/lib/perfil"
import { getProjectDashboardData } from "@/lib/project-dashboard"
import { getEntregasUsuario, getModulosPublicados, getTareasCurso } from "@/lib/cursos"

export default async function Page() {
  const ctx = await getPerfilContext()

  if (ctx.rolRaw === "mujer_emprendedora") {
    const [modulos, tareas, entregas] = await Promise.all([
      getModulosPublicados(),
      getTareasCurso(false),
      getEntregasUsuario(),
    ])
    return (
      <AppShell>
        <EntrepreneurDashboard
          nombre={ctx.nombre}
          modulos={modulos}
          tareas={tareas}
          entregas={entregas}
        />
      </AppShell>
    )
  }

  const dashboardData = await getProjectDashboardData()

  return (
    <AppShell>
      <ProjectDashboard data={dashboardData} />
    </AppShell>
  )
}
