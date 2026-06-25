"use client"

import { useState, useTransition } from "react"
import { GitBranch, Plus, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { deleteSurveyQuestion, saveSurvey, saveSurveyBlock, saveSurveyQuestion } from "@/lib/dynamic-survey-actions"
import type { DynamicSurvey } from "@/lib/dynamic-surveys"

export function SurveyBuilder({ surveys, compact = false }: { surveys: DynamicSurvey[]; compact?: boolean }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [selectedId, setSelectedId] = useState(surveys[0]?.id ?? "")
  const [dialog, setDialog] = useState<"survey" | "block" | "question" | null>(null)
  const [blockId, setBlockId] = useState("")
  const [message, setMessage] = useState("")
  const selected = surveys.find((survey) => survey.id === selectedId)
  const questions = selected?.bloques.flatMap((block) => block.preguntas) ?? []

  function run(action: () => Promise<{ ok: boolean; message: string }>) {
    startTransition(async () => {
      const result = await action()
      setMessage(result.message)
      if (result.ok) {
        setDialog(null)
        router.refresh()
      }
    })
  }

  return (
    <div className={compact ? "space-y-5" : "space-y-5 px-4 pb-10 sm:px-6"}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Constructor de encuestas</h2>
          <p className="text-sm text-muted-foreground">Crea bloques, preguntas, opciones y reglas condicionales.</p>
        </div>
        <Button onClick={() => setDialog("survey")}>
          <Plus className="mr-1.5 h-4 w-4" />
          Nueva encuesta
        </Button>
      </div>

      {message ? <div className="rounded-md border border-border bg-card px-4 py-3 text-sm">{message}</div> : null}

      {surveys.length > 0 ? (
        <select
          value={selectedId}
          onChange={(event) => setSelectedId(event.target.value)}
          className="h-9 min-w-72 rounded-md border border-input bg-background px-3 text-sm"
        >
          {surveys.map((survey) => (
            <option key={survey.id} value={survey.id}>
              {survey.titulo}
            </option>
          ))}
        </select>
      ) : null}

      {!selected ? (
        <div className="rounded-md border border-dashed p-12 text-center text-sm text-muted-foreground">
          Crea la primera encuesta dinámica.
        </div>
      ) : (
        <div className="space-y-4">
          {selected.bloques.map((block) => (
            <Card key={block.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <Badge variant="secondary">Bloque {block.orden}</Badge>
                  <CardTitle className="mt-2 text-base">{block.titulo}</CardTitle>
                </div>
                <Button size="sm" variant="outline" onClick={() => { setBlockId(block.id); setDialog("question") }}>
                  <Plus className="mr-1 h-4 w-4" />
                  Pregunta
                </Button>
              </CardHeader>
              <CardContent>
                {block.preguntas.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Sin preguntas.</p>
                ) : (
                  <div className="divide-y divide-border rounded-md border">
                    {block.preguntas.map((question) => (
                      <div key={question.id} className="flex items-start gap-3 p-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-medium">{question.orden}. {question.pregunta}</p>
                            <Badge variant="outline">{question.tipo}</Badge>
                            {question.visible_cuando ? (
                              <Badge className="bg-sky-600">
                                <GitBranch className="mr-1 h-3 w-3" />
                                Condicional
                              </Badge>
                            ) : null}
                          </div>
                          {question.opciones.length ? (
                            <p className="mt-1 text-xs text-muted-foreground">{question.opciones.join(" · ")}</p>
                          ) : null}
                          {question.visible_cuando ? (
                            <p className="mt-1 text-xs text-sky-700">
                              Visible cuando: {questions.find((item) => item.id === question.visible_cuando?.pregunta_id)?.pregunta ?? "Pregunta"} {question.visible_cuando.operador} "{question.visible_cuando.valor}"
                            </p>
                          ) : null}
                        </div>
                        <Button
                          size="icon-sm"
                          variant="destructive"
                          onClick={() => {
                            if (window.confirm("¿Eliminar esta pregunta?")) run(() => deleteSurveyQuestion(question.id))
                          }}
                        >
                          <Trash2 />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
          <Button variant="outline" onClick={() => setDialog("block")}>
            <Plus className="mr-1.5 h-4 w-4" />
            Agregar bloque
          </Button>
        </div>
      )}

      <Dialog open={dialog === "survey"} onOpenChange={(open) => !open && setDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nueva encuesta</DialogTitle>
            <DialogDescription>Define el formulario principal.</DialogDescription>
          </DialogHeader>
          <form action={(data) => run(() => saveSurvey(data))} className="space-y-4">
            <label className="block space-y-1.5 text-sm font-medium">
              <span>Título</span>
              <Input name="titulo" required />
            </label>
            <label className="block space-y-1.5 text-sm font-medium">
              <span>Descripción</span>
              <Textarea name="descripcion" />
            </label>
            <DialogFooter>
              <Button type="submit" disabled={pending}>Crear encuesta</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "block"} onOpenChange={(open) => !open && setDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar bloque</DialogTitle>
          </DialogHeader>
          <form action={(data) => run(() => saveSurveyBlock(data))} className="space-y-4">
            <input type="hidden" name="encuesta_id" value={selectedId} />
            <label className="block space-y-1.5 text-sm font-medium">
              <span>Título</span>
              <Input name="titulo" required />
            </label>
            <label className="block space-y-1.5 text-sm font-medium">
              <span>Descripción</span>
              <Textarea name="descripcion" />
            </label>
            <label className="block space-y-1.5 text-sm font-medium">
              <span>Orden</span>
              <Input name="orden" type="number" min="1" defaultValue={(selected?.bloques.length ?? 0) + 1} required />
            </label>
            <DialogFooter>
              <Button type="submit" disabled={pending}>Crear bloque</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "question"} onOpenChange={(open) => !open && setDialog(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nueva pregunta</DialogTitle>
            <DialogDescription>La condición es opcional.</DialogDescription>
          </DialogHeader>
          <form action={(data) => run(() => saveSurveyQuestion(data))} className="space-y-4">
            <input type="hidden" name="bloque_id" value={blockId} />
            <label className="block space-y-1.5 text-sm font-medium">
              <span>Pregunta</span>
              <Textarea name="pregunta" required />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block space-y-1.5 text-sm font-medium">
                <span>Tipo</span>
                <select name="tipo" className="h-8 w-full rounded-lg border border-input bg-background px-2">
                  <option value="texto">Texto</option>
                  <option value="textarea">Texto largo</option>
                  <option value="radio">Selección única</option>
                  <option value="checkbox">Selección múltiple</option>
                  <option value="numero">Número</option>
                  <option value="fecha">Fecha</option>
                </select>
              </label>
              <label className="block space-y-1.5 text-sm font-medium">
                <span>Orden</span>
                <Input name="orden" type="number" min="1" required />
              </label>
            </div>
            <label className="block space-y-1.5 text-sm font-medium">
              <span>Opciones (una por línea)</span>
              <Textarea name="opciones" />
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="requerido" defaultChecked />
              Obligatoria
            </label>
            <div className="rounded-md border border-sky-200 bg-sky-50 p-3">
              <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-sky-800">
                <GitBranch className="h-4 w-4" />
                Condición de visibilidad
              </p>
              <div className="space-y-3">
                <select name="condicion_pregunta" className="h-8 w-full rounded border bg-white px-2 text-sm">
                  <option value="">Siempre visible</option>
                  {questions.map((question) => (
                    <option key={question.id} value={question.id}>{question.pregunta}</option>
                  ))}
                </select>
                <div className="grid grid-cols-2 gap-2">
                  <select name="condicion_operador" className="h-8 rounded border bg-white px-2 text-sm">
                    <option value="igual">Es igual a</option>
                    <option value="contiene">Contiene</option>
                    <option value="distinto">Es distinto de</option>
                  </select>
                  <Input name="condicion_valor" placeholder="Valor esperado" className="bg-white" />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={pending}>Crear pregunta</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
