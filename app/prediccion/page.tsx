import { AiCoursePredictor } from "@/components/prediction/ai-course-predictor"
import { AppShell } from "@/components/dashboard/app-shell"
import { getCoursePredictions } from "@/lib/course-prediction"

export default async function PrediccionPage() {
  const { cursos, perfil, source } = await getCoursePredictions()
  return (
    <AppShell>
      <AiCoursePredictor predictions={cursos} profile={perfil} source={source} />
    </AppShell>
  )
}
