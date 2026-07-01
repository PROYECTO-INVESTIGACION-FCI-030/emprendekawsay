"use client"

import { useMemo } from "react"
import { Send, Pencil, Plus, Trash2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { DynamicSurvey } from "@/lib/dynamic-surveys"
import { saveSurvey, saveSurveyBlock, updateSurveyQuestion, deleteSurveyQuestion } from "@/lib/dynamic-survey-actions"

export function SurveyBuilder({ surveys, compact = false }: { surveys: DynamicSurvey[]; compact?: boolean }) {
  const publishedSurvey = useMemo(() => surveys.find((survey) => survey.activo) ?? surveys[0] ?? null, [surveys])

  return (
    <div id="constructor-encuestas" className={compact ? "space-y-5" : "space-y-5 px-4 pb-10 sm:px-6"}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Constructor de encuestas</h2>
          <p className="text-sm text-muted-foreground">
            Edita la encuesta publicada desde esta misma página y abre el formulario para responderla.
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
                Desde aquí puedes editar la encuesta publicada, sus bloques y sus preguntas. El formulario público queda disponible
                para la participante.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <a
                href="/diagnostico/encuesta"
                className="inline-flex items-center justify-center rounded-md border border-sky-700 bg-white px-4 py-2 text-sm font-medium text-sky-800 hover:bg-sky-100"
              >
                <Pencil className="mr-2 h-4 w-4" />
                Editar encuesta
              </a>
              <a
                href="/diagnostico/encuesta"
                className="inline-flex items-center justify-center rounded-md bg-sky-700 px-4 py-2 text-sm font-medium text-white hover:bg-sky-800"
              >
                <Send className="mr-2 h-4 w-4" />
                Responder encuesta
              </a>
            </div>
          </div>
          {publishedSurvey ? (
            <div className="rounded-md border border-sky-200 bg-white px-4 py-3 text-sm text-slate-700">
              <p className="font-medium text-slate-900">{publishedSurvey.titulo}</p>
              <p className="mt-1 text-slate-600">{publishedSurvey.bloques.length} bloques publicados disponibles para edición.</p>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {publishedSurvey ? (
        <div className="space-y-4">
          <Card className="border-border bg-card">
          <CardContent className="space-y-4 pt-6">
              <form action={async (formData) => { await saveSurvey(formData) }} className="space-y-4">
                <input type="hidden" name="id" value={publishedSurvey.id} />
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-1.5 text-sm font-medium">
                    <span>Título de la encuesta</span>
                    <Input name="titulo" defaultValue={publishedSurvey.titulo} />
                  </label>
                  <label className="space-y-1.5 text-sm font-medium">
                    <span>Descripción</span>
                    <Input name="descripcion" defaultValue={publishedSurvey.descripcion ?? ""} />
                  </label>
                </div>
                <button type="submit" className="inline-flex items-center gap-2 rounded-md bg-sky-700 px-4 py-2 text-sm font-medium text-white hover:bg-sky-800">
                  Guardar encuesta
                </button>
              </form>
            </CardContent>
          </Card>

          {publishedSurvey.bloques.map((block) => (
            <Card key={block.id} className="border-border bg-card">
              <CardContent className="space-y-5 pt-6">
                <div className="rounded-md border border-border bg-background p-4">
                  <p className="text-sm font-semibold text-slate-900">{block.titulo}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{block.descripcion ?? "Sin descripción"}</p>
                </div>

                <form action={async (formData) => { await saveSurveyBlock(formData) }} className="space-y-4 rounded-md border border-dashed border-sky-300 bg-sky-50 p-4">
                  <input type="hidden" name="encuesta_id" value={publishedSurvey.id} />
                  <div className="grid gap-3 md:grid-cols-[1.2fr_1fr_auto]">
                    <Input name="titulo" placeholder="Nuevo bloque" />
                    <Input name="descripcion" placeholder="Descripción del bloque" />
                    <Input name="orden" type="number" min={1} defaultValue={block.orden + 1} className="w-24" />
                  </div>
                  <button type="submit" className="inline-flex items-center gap-2 rounded-md bg-sky-700 px-4 py-2 text-sm font-medium text-white hover:bg-sky-800">
                    <Plus className="h-4 w-4" />
                    Agregar bloque
                  </button>
                </form>

                <div className="space-y-3">
                  {block.preguntas.map((question) => (
                    <form key={question.id} action={async (formData) => { await updateSurveyQuestion(formData) }} className="space-y-3 rounded-md border border-border bg-white p-4">
                      <input type="hidden" name="id" value={question.id} />
                      <div className="grid gap-3 md:grid-cols-[1.4fr_0.7fr_0.3fr]">
                        <label className="space-y-1.5 text-sm font-medium">
                          <span>Pregunta</span>
                          <Textarea name="pregunta" defaultValue={question.pregunta} rows={3} />
                        </label>
                        <label className="space-y-1.5 text-sm font-medium">
                          <span>Tipo</span>
                          <select name="tipo" defaultValue={question.tipo} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                            <option value="texto">Texto</option>
                            <option value="radio">Selección única</option>
                            <option value="checkbox">Selección múltiple</option>
                          </select>
                        </label>
                        <label className="space-y-1.5 text-sm font-medium">
                          <span>Orden</span>
                          <Input name="orden" type="number" min={1} defaultValue={question.orden} />
                        </label>
                      </div>
                      <label className="space-y-1.5 text-sm font-medium">
                        <span>Opciones, una por línea</span>
                        <Textarea name="opciones" defaultValue={question.opciones.join("\n")} rows={4} />
                      </label>
                      <div className="grid gap-3 md:grid-cols-3">
                        <label className="space-y-1.5 text-sm font-medium">
                          <span>Condición: pregunta origen</span>
                          <Input name="condicion_pregunta" defaultValue={question.visible_cuando?.pregunta_id ?? ""} />
                        </label>
                        <label className="space-y-1.5 text-sm font-medium">
                          <span>Operador</span>
                          <Input name="condicion_operador" defaultValue={question.visible_cuando?.operador ?? "igual"} />
                        </label>
                        <label className="space-y-1.5 text-sm font-medium">
                          <span>Valor</span>
                          <Input name="condicion_valor" defaultValue={question.visible_cuando?.valor ?? ""} />
                        </label>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <label className="inline-flex items-center gap-2 text-sm">
                          <input type="checkbox" name="requerido" defaultChecked={question.requerido} />
                          Requerida
                        </label>
                        <button type="submit" className="inline-flex items-center gap-2 rounded-md bg-sky-700 px-4 py-2 text-sm font-medium text-white hover:bg-sky-800">
                          <Pencil className="h-4 w-4" />
                          Guardar cambios
                        </button>
                        <button
                          formAction={async () => { await deleteSurveyQuestion(question.id) }}
                          type="submit"
                          className="inline-flex items-center gap-2 rounded-md border border-red-200 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                          Eliminar
                        </button>
                      </div>
                    </form>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-border bg-card">
          <CardContent className="p-6 text-sm text-muted-foreground">No hay encuesta publicada para editar todavía.</CardContent>
        </Card>
      )}
    </div>
  )
}
