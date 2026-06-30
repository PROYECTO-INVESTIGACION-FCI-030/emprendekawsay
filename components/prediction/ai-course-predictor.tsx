"use client"

import { useState, useTransition } from "react"
import { Bot, CheckCircle2, Database, LineChart, Plus, Sparkles, Users } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import type { CoursePrediction, CoursePredictionProfile } from "@/lib/course-prediction"
import { crearCursoPredicho } from "@/lib/prediccion-actions"
import { cn } from "@/lib/utils"

export function AiCoursePredictor({
  predictions,
  profile,
}: {
  predictions: CoursePrediction[]
  profile: CoursePredictionProfile
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [selected, setSelected] = useState<Record<number, string>>({})
  const [message, setMessage] = useState("")
  const blocks = [...new Set(predictions.map((prediction) => prediction.numeroBloque))]
  const responseCount = predictions[0]?.respuestas ?? 0

  if (!predictions.length) {
    return (
      <div className="min-h-full bg-[#f4f8fc] pb-10">
        <section className="border-b-4 border-[#00a6d6] bg-[#00529b] px-6 py-7 text-white">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-cyan-100">
                <Bot className="h-5 w-5" />
                Agente IA de prediccion formativa
              </div>
              <h2 className="mt-2 text-2xl font-semibold">Cursos recomendados desde el diagnostico</h2>
              <p className="mt-2 max-w-3xl text-sm text-blue-100">
                Todavia no hay respuestas registradas en la encuesta, por eso la IA no puede sugerir cursos reales.
              </p>
            </div>
          </div>
        </section>
        <div className="px-4 pt-6 sm:px-6">
          <div className="rounded-md border border-[#bdd7ea] bg-white px-5 py-8 text-sm text-muted-foreground shadow-sm">
            Cuando existan respuestas en <span className="font-medium text-[#00529b]">cuestionario_limpio_respuestas</span>, aqui se generaran
            automaticamente los cursos sugeridos por bloque.
          </div>
        </div>
      </div>
    )
  }

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

        <section className="rounded-md border border-[#bdd7ea] bg-white shadow-sm">
          <div className="border-b border-[#d7e7f2] bg-[#eef6fc] px-5 py-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#00529b]">
              <LineChart className="h-4 w-4" />
              Perfilamiento de la muestra
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              La IA analiza la base de respuestas y agrupa a las emprendedoras por patrones de formación y demanda.
            </p>
          </div>
          <div className="grid gap-4 p-4 lg:grid-cols-[1.1fr_1.4fr]">
            <div className="space-y-3">
              <div className="rounded-md border border-[#d7e7f2] bg-[#f8fbfd] p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-[#003b6f]">
                  <Users className="h-4 w-4 text-[#0077b6]" />
                  Resumen general
                </div>
                <p className="mt-2 text-3xl font-bold text-[#00529b]">{profile.totalRegistros}</p>
                <p className="text-sm text-muted-foreground">registros analizados para la prediccion de cursos</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {profile.perfilGeneral.map((item) => (
                  <div key={item.etiqueta} className="rounded-md border border-[#d7e7f2] bg-white p-3">
                    <p className="text-xs font-semibold uppercase text-[#0077b6]">{item.etiqueta}</p>
                    <p className="mt-1 font-semibold text-[#003b6f]">{item.valor}</p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">{item.detalle}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {(
                [
                  ["Parroquia", profile.segmentos.parroquia],
                  ["Nivel de instruccion", profile.segmentos.nivelInstruccion],
                  ["Sector economico", profile.segmentos.sectorEconomico],
                  ["Ingreso mensual", profile.segmentos.ingresoMensual],
                  ["Modalidad preferida", profile.segmentos.modalidadPreferida],
                ] as const
              ).map(([title, items]) => (
                <div key={title} className="rounded-md border border-[#d7e7f2] bg-[#f8fbfd] p-4">
                  <p className="text-sm font-semibold text-[#003b6f]">{title}</p>
                  <div className="mt-3 space-y-2">
                    {items.length ? (
                      items.map((item) => (
                        <div key={item.categoria} className="flex items-center justify-between gap-3 rounded-md bg-white px-3 py-2 text-sm">
                          <span className="truncate text-muted-foreground">{item.categoria}</span>
                          <span className="shrink-0 rounded-full bg-[#e6f4fb] px-2.5 py-1 text-xs font-semibold text-[#00529b]">{item.total}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">Sin datos suficientes.</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

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
