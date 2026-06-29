import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CleanDiagnosticForm } from "@/components/survey/clean-diagnostic-form"
import { getDynamicSurveys } from "@/lib/dynamic-surveys"

export default async function DiagnosticoEncuestaPage() {
  const surveys = await getDynamicSurveys()
  const published = surveys.find((survey) => survey.activo) ?? surveys[0]

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-5">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">Cuestionario de diagnóstico</p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-950">
            Cuestionario para detectar necesidades de formación y capacitación para mujeres emprendedoras indígenas en la ciudad de Guayaquil
          </h1>
          <div className="mt-4 max-w-4xl space-y-3 text-sm leading-6 text-slate-600">
            <p className="font-semibold text-slate-700">Introducción</p>
            <p>
              El presente cuestionario tiene como propósito identificar las principales necesidades de formación y capacitación de las mujeres emprendedoras indígenas de la ciudad de Guayaquil.
            </p>
            <p>
              La información que usted comparta permitirá diseñar un programa de apoyo y aprendizaje que fortalezca sus conocimientos, mejoren la gestión de su negocio y generen mayores oportunidades de crecimiento personal y económico. Su participación es muy valiosa, ya que ayudará a reconocer los desafíos, dificultades y oportunidades reales que enfrentan las mujeres en sus emprendimientos. Toda la información será tratada de forma confidencial y anónima, y se usará únicamente con fines académicos y de formación. Le pedimos responder cada pregunta con sinceridad y según su experiencia personal. No existen respuestas buenas o malas; lo importante es reflejar su realidad como mujer emprendedora.
            </p>
          </div>
        </section>

        <CleanDiagnosticForm />
      </div>
    </main>
  )
}
