"use client"

import Link from "next/link"
import { Send } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import type { DynamicSurvey } from "@/lib/dynamic-surveys"

export function SurveyBuilder({ surveys, compact = false }: { surveys: DynamicSurvey[]; compact?: boolean }) {
  return (
    <div id="constructor-encuestas" className={compact ? "space-y-5" : "space-y-5 px-4 pb-10 sm:px-6"}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Constructor de encuestas</h2>
          <p className="text-sm text-muted-foreground">
            Edita la encuesta publicada desde la vista de diagnóstico y accede al formulario para responderla.
          </p>
        </div>
      </div>

      <Card className="border-sky-200 bg-sky-50">
        <CardContent className="space-y-4 pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">Encuesta publicada</p>
              <h3 className="text-lg font-semibold text-slate-900">Administrar y responder formulario</h3>
              <p className="text-sm text-slate-600">
                Desde diagnóstico puedes editar el formulario publicado; desde aquí lo abres para responderlo.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/diagnostico#constructor-encuestas"
                className="inline-flex items-center justify-center rounded-md border border-sky-700 bg-white px-4 py-2 text-sm font-medium text-sky-800 hover:bg-sky-100"
              >
                Editar encuesta
              </Link>
              <Link
                href="/diagnostico/encuesta"
                className="inline-flex items-center justify-center rounded-md bg-sky-700 px-4 py-2 text-sm font-medium text-white hover:bg-sky-800"
              >
                <Send className="mr-2 h-4 w-4" />
                Responder encuesta
              </Link>
            </div>
          </div>
          {surveys.length ? (
            <div className="rounded-md border border-sky-200 bg-white px-4 py-3 text-sm text-slate-700">
              <p className="font-medium text-slate-900">{surveys[0].titulo}</p>
              <p className="mt-1 text-slate-600">
                {surveys[0].bloques.length} bloques publicados disponibles para edición o respuesta.
              </p>
            </div>
          ) : null}
        </CardContent>
      </Card>

    </div>
  )
}
