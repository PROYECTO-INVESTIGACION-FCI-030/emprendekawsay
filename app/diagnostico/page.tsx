import { RoleAwareModulePage } from "@/components/roles/role-aware-module-page"
import { InitialSurveyForm } from "@/components/survey/initial-survey-form"
import { AppShell } from "@/components/dashboard/app-shell"
import { Toolbar } from "@/components/dashboard/header"
import { getPerfilContext } from "@/lib/perfil"

export default async function DiagnosticoPage() {
  const ctx = await getPerfilContext()
  if (ctx.rolRaw === "mujer_emprendedora") {
    return (
      <AppShell>
        <Toolbar
          titulo="Diagnostico"
          descripcion="Cuestionario para detectar necesidades de formacion y capacitacion"
          showControls={false}
        />
        <div className="px-6 pb-8">
          <InitialSurveyForm />
        </div>
      </AppShell>
    )
  }

  return <RoleAwareModulePage moduleKey="diagnostico" />
}
