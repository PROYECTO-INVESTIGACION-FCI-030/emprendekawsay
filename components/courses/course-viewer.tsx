import Link from "next/link"
import { ArrowLeft, BookOpenCheck, CalendarClock, CheckCircle2, GraduationCap } from "lucide-react"
import { TaskSubmissionButton } from "@/components/courses/task-submission-button"
import { AppShell } from "@/components/dashboard/app-shell"
import { Toolbar } from "@/components/dashboard/header"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Curso, EntregaTarea, ModuloCurso, TareaCurso } from "@/lib/cursos"

function formatDateTime(iso: string) {
  return new Intl.DateTimeFormat("es-EC", { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso))
}

export function CourseViewer({
  curso,
  modulos,
  tareas,
  entregas,
}: {
  curso: Curso
  modulos: ModuloCurso[]
  tareas: TareaCurso[]
  entregas: EntregaTarea[]
}) {
  return (
    <AppShell>
      <Toolbar titulo={curso.titulo} descripcion={curso.descripcion} showControls={false} />
      <div className="space-y-5 px-4 pb-10 sm:px-6">
        <Link href="/malla-formativa" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Volver a formación
        </Link>

        {modulos.length === 0 ? (
          <div className="rounded-md border border-dashed border-border px-6 py-12 text-center">
            <BookOpenCheck className="mx-auto h-7 w-7 text-muted-foreground" />
            <p className="mt-3 font-medium text-foreground">El contenido estará disponible pronto</p>
          </div>
        ) : (
          <div className="space-y-5">
            {modulos.map((module) => {
              const moduleTasks = tareas.filter((task) => task.id_modulo === module.id)
              return (
                <Card key={module.id}>
                  <CardHeader className="border-b border-border">
                    <Badge variant="secondary" className="w-fit">Módulo {module.orden}</Badge>
                    <CardTitle className="mt-2 text-xl">{module.titulo}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6">
                    {module.contenido_html ? (
                      <div
                        className="text-sm leading-7 text-foreground [&_h2]:mb-2 [&_h2]:mt-5 [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:mb-2 [&_h3]:mt-4 [&_h3]:text-lg [&_h3]:font-semibold [&_ol]:ml-6 [&_ol]:list-decimal [&_ul]:ml-6 [&_ul]:list-disc [&_blockquote]:border-l-4 [&_blockquote]:border-primary/40 [&_blockquote]:pl-4 [&_blockquote]:text-muted-foreground"
                        dangerouslySetInnerHTML={{ __html: module.contenido_html }}
                      />
                    ) : null}

                    {moduleTasks.length > 0 ? (
                      <div className="border-t border-border pt-5">
                        <h3 className="mb-3 font-semibold text-foreground">Tareas y actividades</h3>
                        <div className="space-y-3">
                          {moduleTasks.map((task) => {
                            const delivery = entregas.find((item) => item.id_tarea === task.id)
                            return (
                              <div key={task.id} className="rounded-md border border-border p-4">
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                  <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <h4 className="font-semibold text-foreground">{task.titulo}</h4>
                                      {delivery ? (
                                        <Badge className="bg-emerald-600"><CheckCircle2 className="mr-1 h-3.5 w-3.5" />Entregada</Badge>
                                      ) : (
                                        <Badge variant={task.vencida ? "destructive" : "secondary"}>{task.vencida ? "Vencida" : "Pendiente"}</Badge>
                                      )}
                                    </div>
                                    {task.descripcion ? <p className="mt-2 text-sm text-muted-foreground">{task.descripcion}</p> : null}
                                    <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                                      <CalendarClock className="h-3.5 w-3.5" />
                                      Fecha límite: {formatDateTime(task.fecha_limite)}
                                    </p>
                                  </div>
                                  <TaskSubmissionButton idTarea={task.id} titulo={task.titulo} entrega={delivery} />
                                </div>
                                {delivery?.calificacion ? (
                                  <div className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm">
                                    <p className="flex items-center gap-2 font-semibold text-emerald-900">
                                      <GraduationCap className="h-4 w-4" />
                                      Calificación: {delivery.calificacion.calificacion} / 10
                                    </p>
                                    {delivery.calificacion.retroalimentacion ? (
                                      <p className="mt-1 text-emerald-800">{delivery.calificacion.retroalimentacion}</p>
                                    ) : null}
                                  </div>
                                ) : null}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </AppShell>
  )
}
