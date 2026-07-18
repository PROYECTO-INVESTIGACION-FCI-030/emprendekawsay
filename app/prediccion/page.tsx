import { AiCoursePredictor } from "@/components/prediction/ai-course-predictor"
import { AppShell } from "@/components/dashboard/app-shell"
import { getCoursePredictions, getCoursePredictionsFast } from "@/lib/course-prediction"
import type { CoursePrediction, CoursePredictionProfile } from "@/lib/course-prediction"

export const dynamic = "force-dynamic"

export default async function PrediccionPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = (await searchParams) ?? {}
  const geminiParam = params.gemini
  const geminiEnabled = Array.isArray(geminiParam) ? geminiParam.includes("1") : geminiParam === "1"

  let cursos: CoursePrediction[] = []
  let perfil: CoursePredictionProfile = {
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
  let sourceReason: string | undefined = geminiEnabled ? "Sin datos disponibles." : "Vista rápida cargada sin Gemini."

  try {
    const result = geminiEnabled ? await getCoursePredictions() : await getCoursePredictionsFast()
    cursos = result.cursos
    perfil = result.perfil
    source = result.source
    sourceReason = result.sourceReason
  } catch (error) {
    sourceReason = error instanceof Error ? error.message : "No se pudo generar la predicción."
  }

  return (
    <AppShell>
      <AiCoursePredictor
        predictions={cursos}
        profile={perfil}
        source={source}
        sourceReason={sourceReason}
        geminiEnabled={geminiEnabled}
      />
    </AppShell>
  )
}
