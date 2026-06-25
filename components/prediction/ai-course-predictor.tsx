"use client"

import { useState, useTransition } from "react"
import { Bot, CheckCircle2, Database, Plus, Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import type { CoursePrediction } from "@/lib/course-prediction"
import { crearCursoPredicho } from "@/lib/prediccion-actions"
import { cn } from "@/lib/utils"

export function AiCoursePredictor({ predictions }: { predictions: CoursePrediction[] }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [selected, setSelected] = useState<Record<number, string>>({})
  const [message, setMessage] = useState("")
  const blocks = [...new Set(predictions.map((prediction) => prediction.numeroBloque))]
  const responseCount = predictions[0]?.respuestas ?? 0

  function createSelected(block: number) {
    const prediction = predictions.find((item) => item.id === selected[block])
    if (!prediction) return
    startTransition(async () => {
      const result = await crearCursoPredicho(prediction.titulo, prediction.descripcion)
      setMessage(result.message)
      if (result.ok) router.refresh()
    })
  }

  return (
    <div className="min-h-full bg-[#f4f8fc] pb-10">
      <section className="border-b-4 border-[#00a6d6] bg-[#00529b] px-6 py-7 text-white">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-cyan-100"><Bot className="h-5 w-5" />Agente IA de prediccion formativa</div>
            <h2 className="mt-2 text-2xl font-semibold">Cursos recomendados desde el diagnostico</h2>
            <p className="mt-2 max-w-3xl text-sm text-blue-100">Analiza brechas por bloque y propone cursos específicos. Selecciona una propuesta por bloque para enviarla a Diseño de Cursos.</p>
          </div>
          <div className="flex items-center gap-3 rounded-md border border-white/20 bg-white/10 px-4 py-3">
            <Database className="h-5 w-5 text-cyan-200" />
            <div><p className="text-xl font-semibold">{responseCount}</p><p className="text-xs text-blue-100">respuestas analizadas</p></div>
          </div>
        </div>
      </section>

      <div className="space-y-5 px-4 pt-6 sm:px-6">
        {message ? <div className="rounded-md border border-[#8bc9e8] bg-white px-4 py-3 text-sm font-medium text-[#004b87]">{message}</div> : null}
        {blocks.map((block) => {
          const options = predictions.filter((prediction) => prediction.numeroBloque === block)
          return (
            <section key={block} className="overflow-hidden rounded-md border border-[#bdd7ea] bg-white shadow-sm">
              <div className="flex flex-col gap-2 border-b border-[#d7e7f2] bg-[#eaf4fb] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div><p className="text-xs font-semibold uppercase text-[#0077b6]">Bloque {block}</p><h3 className="font-semibold text-[#003b6f]">{options[0]?.bloque}</h3></div>
                <span className="w-fit rounded-full bg-[#00529b] px-3 py-1 text-xs font-semibold text-white">Brecha detectada: {options[0]?.brecha}%</span>
              </div>
              <div className="grid gap-3 p-4 lg:grid-cols-2">
                {options.map((option) => {
                  const active = selected[block] === option.id
                  return (
                    <button key={option.id} type="button" onClick={() => setSelected((current) => ({ ...current, [block]: option.id }))} className={cn("flex min-h-36 gap-3 rounded-md border p-4 text-left transition-colors", active ? "border-[#0077b6] bg-[#eef8fd] ring-2 ring-[#00a6d6]/20" : "border-border hover:border-[#8bc9e8]")}>
                      <span className={cn("mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border", active ? "border-[#0077b6] bg-[#0077b6] text-white" : "border-muted-foreground/30")}>
                        {active ? <CheckCircle2 className="h-4 w-4" /> : <Sparkles className="h-4 w-4 text-[#0077b6]" />}
                      </span>
                      <span><span className="block font-semibold text-[#003b6f]">{option.titulo}</span><span className="mt-2 block text-sm leading-6 text-muted-foreground">{option.descripcion}</span></span>
                    </button>
                  )
                })}
              </div>
              <div className="flex justify-end border-t border-[#d7e7f2] bg-[#f8fbfd] px-4 py-3">
                <Button disabled={!selected[block] || pending} onClick={() => createSelected(block)} className="bg-[#00529b] hover:bg-[#003f78]">
                  <Plus className="mr-1.5 h-4 w-4" />{pending ? "Creando..." : "Crear curso seleccionado"}
                </Button>
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
