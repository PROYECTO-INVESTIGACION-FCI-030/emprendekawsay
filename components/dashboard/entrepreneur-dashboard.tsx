"use client"

import Link from "next/link"
import { useState } from "react"
import { BookOpenCheck, CalendarDays, ClipboardList, Clock3, ListChecks } from "lucide-react"
import { TaskSubmissionButton } from "@/components/courses/task-submission-button"
import { buttonVariants } from "@/components/ui/button"
import type { EntregaTarea, ModuloCurso, TareaCurso } from "@/lib/cursos"
import { cn } from "@/lib/utils"

function dateParts(iso: string) {
  const date = new Date(iso)
  return {
    date: new Intl.DateTimeFormat("es-EC", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date),
    time: new Intl.DateTimeFormat("es-EC", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date),
  }
}

export function EntrepreneurDashboard({
  nombre,
  modulos,
  tareas,
  entregas,
  diagnosticSurvey,
}: {
  nombre: string
  modulos: ModuloCurso[]
  tareas: TareaCurso[]
  entregas: EntregaTarea[]
  diagnosticSurvey: { titulo: string; bloques: number } | null
}) {
  const [timelineFilter, setTimelineFilter] = useState<"todos" | "7" | "30">("todos")
  const entregadas = new Set(entregas.map((entrega) => entrega.id_tarea))
  const total = modulos.length
  const completados = modulos.filter((modulo) => {
    const tareasModulo = tareas.filter((tarea) => tarea.id_modulo === modulo.id)
    return tareasModulo.length > 0 && tareasModulo.every((tarea) => entregadas.has(tarea.id))
  }).length
  const porcentaje = total ? Math.round((completados / total) * 100) : 0
  const filteredTasks = tareas.filter((tarea) => {
    if (timelineFilter === "todos") return true
    const limite = timelineFilter === "7" ? 7 : 30
    return !tarea.vencida && tarea.dias_restantes <= limite
  })

  return (
    <div className="space-y-6 px-4 pb-10 sm:px-6">
      <section className="border-b border-border pb-6">
        <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">
          &iexcl;Hola, {nombre}! &iquest;Lista para continuar impulsando tu negocio?
        </h2>
      </section>

      {diagnosticSurvey ? (
        <section className="rounded-lg border border-sky-200 bg-sky-50 p-5 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-sky-700 text-white">
                  <ClipboardList className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">Diagnóstico visible</p>
                  <h3 className="truncate text-lg font-semibold text-slate-950">{diagnosticSurvey.titulo}</h3>
                </div>
              </div>
              <p className="mt-3 text-sm text-slate-700">
                El formulario está sincronizado con el constructor. Tiene {diagnosticSurvey.bloques} bloques publicados.
              </p>
            </div>
            <Link href="/diagnostico/encuesta" className={buttonVariants({ className: "shrink-0" })}>
              Responder diagnóstico
              <ClipboardList className="ml-1.5 h-4 w-4" />
            </Link>
          </div>
        </section>
      ) : null}

      <section className="grid gap-5 rounded-lg border border-border bg-card p-5 shadow-sm sm:p-6 lg:grid-cols-[auto_1fr] lg:items-center lg:gap-8">
        <div
          className="grid h-32 w-32 place-items-center rounded-full"
          style={{ background: `conic-gradient(var(--primary) ${porcentaje * 3.6}deg, var(--muted) 0deg)` }}
          aria-label={`${porcentaje}% de modulos completados`}
        >
          <div className="grid h-24 w-24 place-items-center rounded-full bg-card text-center">
            <div>
              <p className="text-3xl font-bold text-foreground">{porcentaje}%</p>
              <p className="text-xs text-muted-foreground">completado</p>
            </div>
          </div>
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-accent text-primary">
              <BookOpenCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Progreso general</h3>
              <p className="text-sm text-muted-foreground">Tu avance dentro de la ruta formativa</p>
            </div>
          </div>
          <p className="mt-5 text-lg font-semibold text-foreground">
            Llevas {completados} de {total} m&oacute;dulos completados - {porcentaje}%
          </p>
          <div className="mt-3 h-3 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary" style={{ width: `${porcentaje}%` }} />
          </div>
          <Link href="/malla-formativa" className={buttonVariants({ className: "mt-5" })}>
            Ver formaci&oacute;n
            <BookOpenCheck className="ml-1.5 h-4 w-4" />
          </Link>
        </div>
      </section>

      <section aria-labelledby="timeline-title">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-secondary text-foreground">
              <CalendarDays className="h-5 w-5" />
            </div>
            <div>
              <h3 id="timeline-title" className="text-lg font-semibold text-foreground">L&iacute;nea de tiempo</h3>
              <p className="text-sm text-muted-foreground">Tareas programadas en tus cursos.</p>
            </div>
          </div>
          <div className="flex w-fit rounded-md border border-border bg-card p-1" aria-label="Filtrar linea de tiempo">
            {([
              ["todos", "Todos"],
              ["7", "Pr\u00f3ximos 7 d\u00edas"],
              ["30", "Pr\u00f3ximos 30 d\u00edas"],
            ] as const).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setTimelineFilter(value)}
                className={cn(
                  "rounded px-3 py-1.5 text-xs font-medium transition-colors sm:text-sm",
                  timelineFilter === value
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-md border border-border bg-card">
          {filteredTasks.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <ListChecks className="mx-auto h-7 w-7 text-muted-foreground" />
              <p className="mt-3 font-medium text-foreground">
                {timelineFilter === "todos" ? "No tienes tareas programadas" : "No hay tareas en este periodo"}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Las tareas creadas por los encargados apareceran aqui.
              </p>
            </div>
          ) : (
            <ol className="divide-y divide-border">
              {filteredTasks.map((tarea) => {
                const parts = dateParts(tarea.fecha_limite)
                const entrega = entregas.find((item) => item.id_tarea === tarea.id)
                return (
                  <li key={tarea.id} className="grid gap-3 px-4 py-4 sm:grid-cols-[165px_1fr_auto] sm:items-center sm:px-5">
                    <div>
                      <p className="capitalize text-sm font-semibold text-foreground">{parts.date}</p>
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock3 className="h-3.5 w-3.5" />
                        {parts.time}
                      </p>
                    </div>
                    <div className="min-w-0 border-l-2 border-primary pl-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-foreground">{tarea.titulo}</p>
                        <span className={cn(
                          "rounded-full px-2 py-0.5 text-xs font-medium",
                          entrega
                            ? "bg-emerald-100 text-emerald-700"
                            : tarea.vencida
                              ? "bg-destructive/10 text-destructive"
                              : "bg-sky-100 text-sky-700",
                        )}>
                          {entrega ? "Entregada" : tarea.vencida ? "Vencida" : "Pendiente"}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">Curso: {tarea.curso?.titulo ?? "Sin curso"}</p>
                      {tarea.descripcion ? <p className="mt-1 text-xs text-muted-foreground">{tarea.descripcion}</p> : null}
                    </div>
                    <TaskSubmissionButton
                      idTarea={tarea.id}
                      titulo={tarea.titulo}
                      entrega={entrega}
                    />
                  </li>
                )
              })}
            </ol>
          )}
        </div>
      </section>
    </div>
  )
}
