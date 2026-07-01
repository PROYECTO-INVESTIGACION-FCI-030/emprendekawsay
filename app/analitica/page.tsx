import { NeedsAnalytics } from "@/components/analytics/needs-analytics"
import { AppShell } from "@/components/dashboard/app-shell"
import { Toolbar } from "@/components/dashboard/header"
import { getCoursePredictions } from "@/lib/course-prediction"
import { getProjectDashboardData } from "@/lib/project-dashboard"
import { fallbackProjectDashboardData } from "@/lib/project-dashboard-data"

export default async function AnaliticaPage() {
  let data = fallbackProjectDashboardData
  let predictionResult = { cursos: [] }

  try {
    const [dashboard, predictions] = await Promise.all([getProjectDashboardData(), getCoursePredictions()])
    data = dashboard
    predictionResult = predictions
  } catch {
    data = fallbackProjectDashboardData
    predictionResult = { cursos: [] }
  }

  return (
    <AppShell>
      <Toolbar
        titulo="Analítica de Necesidades"
        descripcion="Resultados sincronizados con las preguntas y respuestas del cuestionario limpio"
        showControls={false}
      />
      <NeedsAnalytics data={data} predictions={predictionResult.cursos ?? []} />
    </AppShell>
  )
}
