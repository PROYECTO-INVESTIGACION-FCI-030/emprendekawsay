import { AiCoursePredictor } from "@/components/prediction/ai-course-predictor"
import { AppShell } from "@/components/dashboard/app-shell"
import { getCoursePredictions } from "@/lib/course-prediction"

export default async function PrediccionPage() {
  let cursos = []
  let perfil = {
    totalRegistros: 0,
    perfilGeneral: [],
    segmentos: {
      parroquia: [],
      nivelInstruccion: [],
      sectorEconomico: [],
      ingresoMensual: [],
      modalidadPreferida: [],
      etnia: [],
      antiguedad: [],
    },
  }
  let source: "gemini" | "fallback" = "fallback"
  let sourceReason = "Sin datos disponibles."

  try {
    const result = await getCoursePredictions()
    cursos = result.cursos
    perfil = result.perfil
    source = result.source
    sourceReason = result.sourceReason
  } catch (error) {
    sourceReason = error instanceof Error ? error.message : "No se pudo generar la predicción."
  }
  return (
    <AppShell>
      <AiCoursePredictor predictions={cursos} profile={perfil} source={source} sourceReason={sourceReason} />
    </AppShell>
  )
}
