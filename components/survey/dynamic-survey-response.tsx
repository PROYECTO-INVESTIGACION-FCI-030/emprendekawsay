"use client"

import { useMemo, useState } from "react"
import { CheckCircle2, Save } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { guardarRespuestaValidacion } from "@/lib/validacion-survey-actions"
import { cn } from "@/lib/utils"

type Question = {
  id: string
  pregunta: string
  tipo: string
  opciones: string[]
  requerido: boolean
  orden: number
  visible_cuando: { pregunta_id?: string; operador?: string; valor?: string } | null
}

type Block = { id: string; titulo: string; descripcion: string | null; orden: number; preguntas: Question[] }
type Survey = { id: string; titulo: string; descripcion?: string | null; bloques: Block[] }

type Answers = Record<string, string | string[]>

function isVisible(question: Question, answers: Answers) {
  if (!question.visible_cuando?.pregunta_id) return true
  const current = answers[question.visible_cuando.pregunta_id]
  if (Array.isArray(current)) return current.includes(question.visible_cuando.valor ?? "")
  return typeof current === "string" && current === question.visible_cuando.valor
}

export function DynamicSurveyResponse({ survey }: { survey: Survey | null }) {
  const [activeBlock, setActiveBlock] = useState(0)
  const [answers, setAnswers] = useState<Answers>({})
  const [message, setMessage] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const visibleBlocks = useMemo(() => survey?.bloques ?? [], [survey])
  const block = visibleBlocks[activeBlock]
  const visibleQuestions = useMemo(
    () => (block?.preguntas ?? []).filter((question) => isVisible(question, answers)),
    [answers, block],
  )

  if (!survey) {
    return (
      <Card className="px-4 py-10 text-center">
        <CardTitle className="text-base">No hay encuesta activa</CardTitle>
        <p className="mt-2 text-sm text-muted-foreground">La formadora o administradora debe crear y activar una encuesta de validación.</p>
      </Card>
    )
  }

  function setAnswer(questionId: string, value: string) {
    setAnswers((current) => ({ ...current, [questionId]: value }))
  }

  function toggleAnswer(questionId: string, value: string) {
    setAnswers((current) => {
      const existing = Array.isArray(current[questionId]) ? current[questionId] as string[] : []
      return {
        ...current,
        [questionId]: existing.includes(value) ? existing.filter((item) => item !== value) : [...existing, value],
      }
    })
  }

  async function submit() {
    if (!survey) return
    setSaving(true)
    const formData = new FormData()
    formData.set("encuesta_id", survey.id)
    formData.set("respuestas", JSON.stringify(answers))
    const res = await guardarRespuestaValidacion(formData)
    setSaving(false)
    setMessage(res.message)
  }

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold text-foreground">{survey.titulo}</h2>
          {survey.descripcion ? <p className="text-sm text-muted-foreground">{survey.descripcion}</p> : null}
        </div>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[260px_1fr]">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-base">Bloques</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {visibleBlocks.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveBlock(index)}
                className={cn(
                  "w-full rounded-md border px-3 py-2 text-left text-sm",
                  index === activeBlock ? "bg-primary text-primary-foreground" : "hover:bg-muted",
                )}
              >
                <span className="block font-medium">{item.titulo}</span>
                <span className="text-xs opacity-80">{item.preguntas.length} preguntas</span>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{block?.titulo ?? "Bloque"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {visibleQuestions.map((question) => (
              <div key={question.id} className="space-y-2 rounded-md border border-border p-4">
                <Label className="text-sm font-medium">
                  {question.pregunta} {question.requerido ? <span className="text-destructive">*</span> : null}
                </Label>
                {question.tipo === "texto" || question.tipo === "textarea" ? (
                  question.tipo === "texto" ? (
                    <Input value={typeof answers[question.id] === "string" ? answers[question.id] as string : ""} onChange={(e) => setAnswer(question.id, e.target.value)} />
                  ) : (
                    <Textarea value={typeof answers[question.id] === "string" ? answers[question.id] as string : ""} onChange={(e) => setAnswer(question.id, e.target.value)} />
                  )
                ) : question.tipo === "radio" ? (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {question.opciones.map((opcion) => (
                      <Label key={opcion} className="flex cursor-pointer items-center gap-2 rounded-md border p-2 text-sm">
                        <input type="radio" checked={answers[question.id] === opcion} onChange={() => setAnswer(question.id, opcion)} />
                        {opcion}
                      </Label>
                    ))}
                  </div>
                ) : (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {question.opciones.map((opcion) => {
                      const selected = Array.isArray(answers[question.id]) ? answers[question.id] as string[] : []
                      return (
                        <Label key={opcion} className="flex cursor-pointer items-center gap-2 rounded-md border p-2 text-sm">
                          <input type="checkbox" checked={selected.includes(opcion)} onChange={() => toggleAnswer(question.id, opcion)} />
                          {opcion}
                        </Label>
                      )
                    })}
                  </div>
                )}
              </div>
            ))}

            <div className="flex justify-end border-t border-border pt-4">
              <Button onClick={submit} disabled={saving}>
                <Save className="mr-1.5 h-4 w-4" />
                {saving ? "Enviando..." : "Enviar evaluación"}
              </Button>
            </div>
            {message ? (
              <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
                <CheckCircle2 className="mr-2 inline h-4 w-4" />
                {message}
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
