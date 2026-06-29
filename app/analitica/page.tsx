import { NeedsAnalytics } from "@/components/analytics/needs-analytics"
import { AppShell } from "@/components/dashboard/app-shell"
import { Toolbar } from "@/components/dashboard/header"
import { getCoursePredictions } from "@/lib/course-prediction"
import { getProjectDashboardData } from "@/lib/project-dashboard"

export default async function AnaliticaPage() {
  const [data, predictionResult] = await Promise.all([getProjectDashboardData(), getCoursePredictions()])

  return (
    <AppShell>
      <Toolbar
        titulo="Analítica de Necesidades"
        descripcion="Resultados sincronizados con las preguntas y respuestas del cuestionario limpio"
        showControls={false}
      />
      <NeedsAnalytics data={data} predictions={predictionResult.cursos} />
    </AppShell>
  )
}
