import Link from "next/link"
import { AppShell } from "@/components/dashboard/app-shell"
import { Toolbar } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { obtenerEncuestaValidacionActiva } from "@/lib/validacion-survey-actions"

export default async function EvaluacionesPage() {
  const survey = await obtenerEncuestaValidacionActiva()
  const habilitada = Boolean(survey)

  return (
    <AppShell>
      <Toolbar titulo="Evaluaciones" descripcion="Responde la encuesta final" showControls={false} />
      <div className="px-4 pb-10 sm:px-6">
        {habilitada && survey ? (
          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle className="text-xl">{survey.titulo}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {survey.descripcion ? <p className="text-sm text-muted-foreground">{survey.descripcion}</p> : null}
              <div className="flex justify-end">
                {survey.enlace ? (
                  <Link
                    href={survey.enlace}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
                  >
                    Llenar encuesta
                  </Link>
                ) : (
                  <span className="inline-flex items-center justify-center rounded-md bg-muted px-4 py-2 text-sm font-medium text-muted-foreground">
                    Llenar encuesta
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle className="text-xl">Encuesta de evaluación</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Aquí verás la encuesta de evaluación cuando se publique.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  )
}
