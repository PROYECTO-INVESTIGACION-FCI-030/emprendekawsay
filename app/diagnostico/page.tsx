import { RoleAwareModulePage } from "@/components/roles/role-aware-module-page"
import { redirect } from "next/navigation"
import { AppShell } from "@/components/dashboard/app-shell"
import { Toolbar } from "@/components/dashboard/header"
import { DiagnosticResultsView } from "@/components/survey/diagnostic-results-view"
import { SurveyBuilder } from "@/components/survey/survey-builder"
import { getPerfilContext } from "@/lib/perfil"
import { getDynamicSurveys } from "@/lib/dynamic-surveys"
import { getDiagnosticResults } from "@/lib/diagnostic-results"

export default async function DiagnosticoPage() {
  const ctx = await getPerfilContext()
  if (ctx.rolRaw === "mujer_emprendedora") {
    redirect("/")
  }
  if (ctx.rolRaw === "administradora") {
    const [surveys, results] = await Promise.all([getDynamicSurveys(), getDiagnosticResults()])
    return (
      <AppShell>
        <Toolbar
          titulo="Diagnóstico (Encuesta)"
          descripcion="Constructor de encuestas dinámicas, resultados por bloque y gráficos de análisis"
          showControls={false}
        />
        <div className="space-y-8 px-4 pb-10 sm:px-6">
          <DiagnosticResultsView results={results} />
          <SurveyBuilder surveys={surveys} compact />
        </div>
      </AppShell>
    )
  }

  return <RoleAwareModulePage moduleKey="diagnostico" />
}
