"use client"

import { useEffect, useMemo, useState } from "react"
import { ArrowLeft, ArrowRight, CheckCircle2, Save } from "lucide-react"
import { initialSurveyBlocks, type SurveyQuestion } from "@/components/survey/initial-survey-data"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { guardarEncuestaInicial, obtenerEncuestaInicial } from "@/lib/encuesta-actions"
import { cn } from "@/lib/utils"

type Answers = Record<string, string | string[]>

const STORAGE_KEY = "kawsay_encuesta_inicial"

function isAnswered(question: SurveyQuestion, answers: Answers) {
  const value = answers[question.id]
  if (question.type === "checkbox") return Array.isArray(value) && value.length > 0
  return typeof value === "string" && value.trim().length > 0
}

function isVisible(question: SurveyQuestion, answers: Answers) {
  if (!question.visibleWhen) return true

  const parent = answers[question.visibleWhen.questionId]
  if (Array.isArray(parent)) {
    return parent.some((value) => question.visibleWhen?.values.includes(value))
  }

  return typeof parent === "string" && question.visibleWhen.values.includes(parent)
}

function capitalizeFirstWord(value: string) {
  const trimmedStart = value.replace(/^\s+/, "")
  if (!trimmedStart) return ""
  return trimmedStart.charAt(0).toUpperCase() + trimmedStart.slice(1)
}

function normalizeAnswers(answers: Answers) {
  const visibleIds = new Set(
    initialSurveyBlocks
      .flatMap((surveyBlock) => surveyBlock.questions)
      .filter((question) => isVisible(question, answers))
      .map((question) => question.id),
  )

  return Object.fromEntries(
    Object.entries(answers)
      .filter(([key]) => visibleIds.has(key))
      .map(([key, value]) => [
        key,
        typeof value === "string" ? capitalizeFirstWord(value) : value,
      ]),
  ) as Answers
}

export function InitialSurveyForm() {
  const [activeBlock, setActiveBlock] = useState(0)
  const [answers, setAnswers] = useState<Answers>({})
  const [saved, setSaved] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    async function loadSurvey() {
      const serverState = await obtenerEncuestaInicial()
      if (serverState.ok && serverState.answers && Object.keys(serverState.answers).length > 0) {
        setAnswers(serverState.answers)
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(serverState.answers))
        setSubmitted(serverState.estado === "enviada")
        setLoading(false)
        return
      }

      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (raw) {
        try {
          setAnswers(JSON.parse(raw))
        } catch {
          window.localStorage.removeItem(STORAGE_KEY)
        }
      }

      if (!serverState.ok) setSaveError(serverState.message)
      setLoading(false)
    }

    loadSurvey()
  }, [])

  const visibleQuestions = useMemo(
    () => initialSurveyBlocks.flatMap((surveyBlock) => surveyBlock.questions).filter((question) => isVisible(question, answers)),
    [answers],
  )
  const requiredQuestions = useMemo(
    () => visibleQuestions.filter((question) => question.required),
    [visibleQuestions],
  )
  const answeredRequired = requiredQuestions.filter((question) => isAnswered(question, answers)).length
  const progress = Math.round((answeredRequired / requiredQuestions.length) * 100)
  const block = initialSurveyBlocks[activeBlock]
  const visibleBlockQuestions = block.questions.filter((question) => isVisible(question, answers))
  const missingInBlock = visibleBlockQuestions.filter((question) => question.required && !isAnswered(question, answers))

  function setAnswer(question: SurveyQuestion, value: string) {
    setSaved(false)
    setAnswers((current) => ({ ...current, [question.id]: value }))
  }

  function normalizeTextAnswer(question: SurveyQuestion, value: string) {
    if (question.type !== "text") return
    setSaved(false)
    setAnswers((current) => ({ ...current, [question.id]: capitalizeFirstWord(value) }))
  }

  function toggleAnswer(question: SurveyQuestion, value: string) {
    setSaved(false)
    setAnswers((current) => {
      const existing = Array.isArray(current[question.id]) ? current[question.id] as string[] : []
      const next = existing.includes(value)
        ? existing.filter((item) => item !== value)
        : [...existing, value]

      return { ...current, [question.id]: next }
    })
  }

  async function saveDraft() {
    setSaving(true)
    setSaveError(null)
    const normalized = normalizeAnswers(answers)
    setAnswers(normalized)
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized))
    const res = await guardarEncuestaInicial({ answers: normalized })
    setSaving(false)
    setSaved(res.ok)
    setMessage(res.ok ? res.message : null)
    setSaveError(res.ok ? null : res.message)
    return res.ok
  }

  async function nextBlock() {
    await saveDraft()
    setActiveBlock((current) => Math.min(current + 1, initialSurveyBlocks.length - 1))
  }

  async function prevBlock() {
    await saveDraft()
    setActiveBlock((current) => Math.max(current - 1, 0))
  }

  async function submitSurvey() {
    if (answeredRequired < requiredQuestions.length) {
      const firstMissing = initialSurveyBlocks.findIndex((surveyBlock) =>
        surveyBlock.questions.some((question) => isVisible(question, answers) && question.required && !isAnswered(question, answers)),
      )
      setActiveBlock(Math.max(firstMissing, 0))
      return
    }
    setSaving(true)
    setSaveError(null)
    const normalized = normalizeAnswers(answers)
    setAnswers(normalized)
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized))
    const res = await guardarEncuestaInicial({ answers: normalized, submit: true })
    setSaving(false)
    setMessage(res.ok ? res.message : null)
    setSaveError(res.ok ? null : res.message)
    if (res.ok) setSubmitted(true)
  }

  if (loading) {
    return (
      <Card className="p-8 text-center">
        <p className="text-sm text-muted-foreground">Cargando encuesta...</p>
      </Card>
    )
  }

  if (submitted) {
    return (
      <Card className="p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-md bg-accent text-primary">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Encuesta completada correctamente</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
          Gracias por compartir su informacion. Sus respuestas ayudaran a recomendar cursos adecuados para fortalecer su emprendimiento.
        </p>
        <Button className="mt-5" onClick={() => setSubmitted(false)}>
          Revisar respuestas
        </Button>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Encuesta inicial de necesidades</h2>
            <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
              La informacion sera utilizada con fines academicos y de formacion, garantizando confidencialidad y respeto a sus respuestas.
            </p>
          </div>
          <Button variant="outline" onClick={saveDraft} disabled={saving}>
            <Save className="mr-1.5 h-4 w-4" />
            {saving ? "Guardando..." : "Guardar borrador"}
          </Button>
        </div>
        <div className="mt-5">
          <div className="mb-1.5 flex justify-between text-sm text-muted-foreground">
            <span>Preguntas obligatorias respondidas</span>
            <span>{answeredRequired} / {requiredQuestions.length}</span>
          </div>
          <Progress value={progress} />
          <p className={cn("mt-2 text-xs", saveError ? "text-destructive" : "text-muted-foreground")}>
            {saveError ?? message ?? (saved ? "Borrador guardado." : "Los cambios se guardan al avanzar o al presionar guardar.")}
          </p>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[260px_1fr]">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-base">Bloques</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {initialSurveyBlocks.map((surveyBlock, index) => {
              const visibleInBlock = surveyBlock.questions.filter((question) => isVisible(question, answers))
              const blockRequired = visibleInBlock.filter((question) => question.required)
              const blockAnswered = blockRequired.filter((question) => isAnswered(question, answers)).length
              const visibleAnswered = visibleInBlock.filter((question) => isAnswered(question, answers)).length
              const counter = blockRequired.length > 0
                ? `${blockAnswered}/${blockRequired.length} obligatorias`
                : `${visibleAnswered}/${visibleInBlock.length} respondidas`
              return (
                <button
                  key={surveyBlock.id}
                  type="button"
                  onClick={() => setActiveBlock(index)}
                  className={cn(
                    "w-full rounded-md border border-border px-3 py-2 text-left text-sm transition-colors",
                    activeBlock === index ? "bg-primary text-primary-foreground" : "hover:bg-secondary",
                  )}
                >
                  <span className="line-clamp-2 font-medium">{surveyBlock.title}</span>
                  <span className={cn("mt-1 block text-xs", activeBlock === index ? "text-primary-foreground/80" : "text-muted-foreground")}>
                    {counter}
                  </span>
                </button>
              )
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">Bloque {activeBlock + 1} de {initialSurveyBlocks.length}</Badge>
              {missingInBlock.length > 0 ? (
                <Badge variant="outline">{missingInBlock.length} obligatorias pendientes</Badge>
              ) : (
                <Badge>Bloque completo</Badge>
              )}
            </div>
            <CardTitle className="text-lg">{block.title}</CardTitle>
            {block.description && <p className="text-sm text-muted-foreground">{block.description}</p>}
          </CardHeader>
          <CardContent className="space-y-5">
            {visibleBlockQuestions.map((question) => (
              <QuestionField
                key={question.id}
                question={question}
                value={answers[question.id]}
                onChange={setAnswer}
                onBlur={normalizeTextAnswer}
                onToggle={toggleAnswer}
              />
            ))}

            <div className="flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
              <Button variant="outline" onClick={prevBlock} disabled={activeBlock === 0 || saving}>
                <ArrowLeft className="mr-1.5 h-4 w-4" />
                Anterior
              </Button>
              <div className="flex gap-2">
                {activeBlock < initialSurveyBlocks.length - 1 ? (
                  <Button onClick={nextBlock} disabled={saving}>
                    Siguiente
                    <ArrowRight className="ml-1.5 h-4 w-4" />
                  </Button>
                ) : (
                  <Button onClick={submitSurvey} disabled={saving}>
                    {saving ? "Enviando..." : "Enviar encuesta"}
                    <CheckCircle2 className="ml-1.5 h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function QuestionField({
  question,
  value,
  onChange,
  onBlur,
  onToggle,
}: {
  question: SurveyQuestion
  value: string | string[] | undefined
  onChange: (question: SurveyQuestion, value: string) => void
  onBlur: (question: SurveyQuestion, value: string) => void
  onToggle: (question: SurveyQuestion, value: string) => void
}) {
  return (
    <fieldset className="space-y-3 rounded-md border border-border p-4">
      <legend className="px-1 text-sm font-medium text-foreground">
        {question.label}
        {question.required && <span className="ml-1 text-destructive">*</span>}
      </legend>

      {question.type === "text" && (
        <Input
          value={typeof value === "string" ? value : ""}
          onChange={(event) => onChange(question, event.target.value)}
          onBlur={(event) => onBlur(question, event.target.value)}
          placeholder={question.placeholder ?? "Su respuesta"}
        />
      )}

      {question.type === "radio" && (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {question.options?.map((option) => (
            <Label key={option} className="flex cursor-pointer items-center gap-2 rounded-md border border-border px-3 py-2 text-sm hover:bg-secondary">
              <input
                type="radio"
                name={question.id}
                value={option}
                checked={value === option}
                onChange={() => onChange(question, option)}
                className="h-4 w-4 accent-primary"
              />
              {option}
            </Label>
          ))}
        </div>
      )}

      {question.type === "checkbox" && (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {question.options?.map((option) => {
            const values = Array.isArray(value) ? value : []
            return (
              <Label key={option} className="flex cursor-pointer items-center gap-2 rounded-md border border-border px-3 py-2 text-sm hover:bg-secondary">
                <input
                  type="checkbox"
                  value={option}
                  checked={values.includes(option)}
                  onChange={() => onToggle(question, option)}
                  className="h-4 w-4 accent-primary"
                />
                {option}
              </Label>
            )
          })}
        </div>
      )}
    </fieldset>
  )
}
