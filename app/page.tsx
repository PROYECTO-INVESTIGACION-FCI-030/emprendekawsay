import { AppShell } from "@/components/dashboard/app-shell"
import { EntrepreneurDashboard } from "@/components/dashboard/entrepreneur-dashboard"
import { ProjectDashboard } from "@/components/dashboard/project-dashboard"
import { getPerfilContext } from "@/lib/perfil"
import { getProjectDashboardData } from "@/lib/project-dashboard"
import { getEntregasUsuario, getModulosAsignadosUsuario, getTareasAsignadasUsuario } from "@/lib/cursos"
import { getDynamicSurveys } from "@/lib/dynamic-surveys"

export default async function Page() {
  const ctx = await getPerfilContext()

  if (ctx.rolRaw === "mujer_emprendedora") {
    const [modulos, tareas, entregas, surveys] = await Promise.all([
      getModulosAsignadosUsuario(),
      getTareasAsignadasUsuario(),
      getEntregasUsuario(),
      getDynamicSurveys(),
    ])
    const publishedDiagnostic = surveys.find((survey) => survey.activo) ?? surveys[0] ?? null
    return (
      <AppShell>
        <EntrepreneurDashboard
          nombre={ctx.nombre}
          modulos={modulos}
          tareas={tareas}
          entregas={entregas}
          diagnosticSurvey={publishedDiagnostic ? { titulo: publishedDiagnostic.titulo, bloques: publishedDiagnostic.bloques.length } : null}
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
