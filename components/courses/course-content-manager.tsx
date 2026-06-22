"use client"

import Link from "next/link"
import { useState, useTransition } from "react"
import {
  ArrowLeft,
  CalendarClock,
  Eye,
  EyeOff,
  GraduationCap,
  Pencil,
  Plus,
  Trash2,
  Users,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { RichTextEditor } from "@/components/courses/rich-text-editor"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  cambiarVisibilidadModulo,
  cambiarVisibilidadTarea,
  eliminarModulo,
  eliminarTarea,
  guardarModulo,
  guardarTarea,
  type CursoActionResult,
} from "@/lib/cursos-actions"
import type { Curso, ModuloCurso, TareaCurso } from "@/lib/cursos"
import { cn } from "@/lib/utils"

function localDateTimeInput(iso: string) {
  const date = new Date(iso)
  const pad = (value: number) => String(value).padStart(2, "0")
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function formatDateTime(iso: string) {
  return new Intl.DateTimeFormat("es-EC", { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso))
}

export function CourseContentManager({
  curso,
  modulos,
  tareas,
}: {
  curso: Curso
  modulos: ModuloCurso[]
  tareas: TareaCurso[]
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [result, setResult] = useState<CursoActionResult | null>(null)
  const [moduleDialog, setModuleDialog] = useState(false)
  const [taskDialog, setTaskDialog] = useState(false)
  const [editingModule, setEditingModule] = useState<ModuloCurso | null>(null)
  const [editingTask, setEditingTask] = useState<TareaCurso | null>(null)
  const [selectedModuleId, setSelectedModuleId] = useState("")
  const [moduleContent, setModuleContent] = useState("")
  const [moduleTitle, setModuleTitle] = useState("")
  const [moduleOrder, setModuleOrder] = useState("1")
  const [taskTitle, setTaskTitle] = useState("")
  const [taskDescription, setTaskDescription] = useState("")
  const [taskDeadline, setTaskDeadline] = useState("")

  function run(action: () => Promise<CursoActionResult>, close?: () => void) {
    startTransition(async () => {
      const response = await action()
      setResult(response)
      if (response.ok) {
        close?.()
        router.refresh()
      }
    })
  }

  function openModule(module?: ModuloCurso) {
    setEditingModule(module ?? null)
    setModuleContent(module?.contenido_html ?? "")
    setModuleTitle(module?.titulo ?? "")
    setModuleOrder(String(module?.orden ?? modulos.length + 1))
    setResult(null)
    setModuleDialog(true)
  }

  function openTask(moduleId: string, task?: TareaCurso) {
    setSelectedModuleId(moduleId)
    setEditingTask(task ?? null)
    setTaskTitle(task?.titulo ?? "")
    setTaskDescription(task?.descripcion ?? "")
    setTaskDeadline(task ? localDateTimeInput(task.fecha_limite) : "")
    setResult(null)
    setTaskDialog(true)
  }

  return (
    <div className="space-y-6 px-4 pb-10 sm:px-6">
      <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link href="/diseno-cursos" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Volver a cursos
          </Link>
          <h2 className="mt-3 text-2xl font-semibold text-foreground">{curso.titulo}</h2>
          <p className="mt-1 max-w-3xl text-sm text-muted-foreground">{curso.descripcion}</p>
        </div>
        <Button onClick={() => openModule()}>
          <Plus className="mr-1.5 h-4 w-4" />
          Crear modulo
        </Button>
      </div>

      {result?.message ? (
        <div className={cn(
          "rounded-md border px-4 py-3 text-sm",
          result.ok ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-destructive/30 bg-destructive/10 text-destructive",
        )}>
          {result.message}
        </div>
      ) : null}

      <section>
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-foreground">Modulos y contenido</h3>
          <p className="text-sm text-muted-foreground">Organiza los textos y asigna las actividades dentro de cada modulo.</p>
        </div>

        {modulos.length === 0 ? (
          <div className="rounded-md border border-dashed border-border px-6 py-12 text-center">
            <GraduationCap className="mx-auto h-7 w-7 text-muted-foreground" />
            <p className="mt-3 font-medium text-foreground">Este curso aun no tiene modulos</p>
            <p className="mt-1 text-sm text-muted-foreground">Crea el primer modulo para agregar contenido y tareas.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {modulos.map((module) => {
              const moduleTasks = tareas.filter((task) => task.id_modulo === module.id)
              return (
                <Card key={module.id} className={!module.visible ? "opacity-70" : undefined}>
                  <CardHeader className="border-b border-border">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="secondary">Modulo {module.orden}</Badge>
                          <Badge variant={module.visible ? "default" : "secondary"}>{module.visible ? "Publicado" : "Oculto"}</Badge>
                        </div>
                        <CardTitle className="mt-2 text-lg">{module.titulo}</CardTitle>
                      </div>
                      <div className="flex gap-1">
                        <Button size="icon-sm" variant="ghost" title={module.visible ? "Ocultar modulo" : "Publicar modulo"} onClick={() => run(() => cambiarVisibilidadModulo(module.id, curso.id, !module.visible))}>
                          {module.visible ? <EyeOff /> : <Eye />}
                        </Button>
                        <Button size="icon-sm" variant="ghost" title="Editar modulo" onClick={() => openModule(module)}><Pencil /></Button>
                        <Button
                          size="icon-sm"
                          variant="destructive"
                          title="Eliminar modulo"
                          onClick={() => {
                            if (window.confirm(`Eliminar ${module.titulo} y sus tareas?`)) {
                              run(() => eliminarModulo(module.id, curso.id))
                            }
                          }}
                        >
                          <Trash2 />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-5 pt-5">
                    {module.contenido_html ? (
                      <div
                        className="text-sm leading-7 text-foreground [&_h2]:mb-2 [&_h2]:mt-4 [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:mb-2 [&_h3]:mt-3 [&_h3]:text-lg [&_h3]:font-semibold [&_ol]:ml-6 [&_ol]:list-decimal [&_ul]:ml-6 [&_ul]:list-disc [&_blockquote]:border-l-4 [&_blockquote]:border-border [&_blockquote]:pl-4"
                        dangerouslySetInnerHTML={{ __html: module.contenido_html }}
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground">Este modulo aun no tiene texto.</p>
                    )}

                    <div className="border-t border-border pt-4">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <h4 className="font-semibold text-foreground">Tareas y actividades</h4>
                        <Button size="sm" variant="outline" onClick={() => openTask(module.id)}>
                          <Plus className="mr-1 h-4 w-4" />
                          Crear tarea
                        </Button>
                      </div>
                      {moduleTasks.length === 0 ? (
                        <p className="rounded-md bg-muted/40 px-4 py-3 text-sm text-muted-foreground">No hay tareas en este modulo.</p>
                      ) : (
                        <div className="divide-y divide-border rounded-md border border-border">
                          {moduleTasks.map((task) => (
                            <div key={task.id} className="p-3">
                              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                <div className="min-w-0 flex-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <p className="font-medium text-foreground">{task.titulo}</p>
                                    <Badge variant={task.visible ? "default" : "secondary"}>{task.visible ? "Publicada" : "Oculta"}</Badge>
                                  </div>
                                  <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <CalendarClock className="h-3.5 w-3.5" />
                                    {formatDateTime(task.fecha_limite)}
                                  </p>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  <Link
                                    href={`/diseno-cursos/${curso.id}/tareas/${task.id}`}
                                    className={buttonVariants({ variant: "outline", size: "sm" })}
                                  >
                                    <Users className="mr-1.5 h-4 w-4" />
                                    Ver entregas
                                  </Link>
                                  <Button size="icon-sm" variant="ghost" title={task.visible ? "Ocultar tarea" : "Publicar tarea"} onClick={() => run(() => cambiarVisibilidadTarea(task.id, !task.visible))}>
                                    {task.visible ? <EyeOff /> : <Eye />}
                                  </Button>
                                  <Button size="icon-sm" variant="ghost" title="Editar tarea" onClick={() => openTask(module.id, task)}><Pencil /></Button>
                                  <Button size="icon-sm" variant="destructive" title="Eliminar tarea" onClick={() => {
                                    if (window.confirm(`Eliminar la tarea ${task.titulo}?`)) run(() => eliminarTarea(task.id))
                                  }}><Trash2 /></Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </section>

      <Dialog open={moduleDialog} onOpenChange={setModuleDialog}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingModule ? "Editar modulo" : "Crear modulo"}</DialogTitle>
            <DialogDescription>Escribe y da formato al contenido que vera la emprendedora.</DialogDescription>
          </DialogHeader>
          <form key={editingModule?.id ?? "new-module"} className="space-y-4" action={(data) => run(() => guardarModulo(data), () => setModuleDialog(false))}>
            <input type="hidden" name="id" value={editingModule?.id ?? ""} />
            <input type="hidden" name="id_curso" value={curso.id} />
            <input type="hidden" name="contenido_html" value={moduleContent} />
            <div className="grid gap-4 sm:grid-cols-[1fr_120px]">
              <label className="block space-y-1.5 text-sm font-medium"><span>Titulo</span><Input name="titulo" value={moduleTitle} onChange={(event) => setModuleTitle(event.target.value)} required /></label>
              <label className="block space-y-1.5 text-sm font-medium"><span>Orden</span><Input name="orden" type="number" min="1" value={moduleOrder} onChange={(event) => setModuleOrder(event.target.value)} required /></label>
            </div>
            <div className="space-y-1.5"><p className="text-sm font-medium">Contenido</p><RichTextEditor key={editingModule?.id ?? "new-editor"} value={moduleContent} onChange={setModuleContent} /></div>
            {!result?.ok && result?.message ? <p className="text-sm text-destructive">{result.message}</p> : null}
            <DialogFooter><Button type="button" variant="outline" onClick={() => setModuleDialog(false)}>Cancelar</Button><Button type="submit" disabled={pending}>{pending ? "Guardando..." : "Guardar modulo"}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={taskDialog} onOpenChange={setTaskDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingTask ? "Editar tarea" : "Crear tarea"}</DialogTitle><DialogDescription>La tarea aparecera dentro del modulo y en la linea de tiempo.</DialogDescription></DialogHeader>
          <form key={editingTask?.id ?? `new-${selectedModuleId}`} className="space-y-4" action={(data) => run(() => guardarTarea(data), () => setTaskDialog(false))}>
            <input type="hidden" name="id" value={editingTask?.id ?? ""} />
            <input type="hidden" name="id_curso" value={curso.id} />
            <input type="hidden" name="id_modulo" value={selectedModuleId} />
            <label className="block space-y-1.5 text-sm font-medium"><span>Titulo</span><Input name="titulo" value={taskTitle} onChange={(event) => setTaskTitle(event.target.value)} required /></label>
            <label className="block space-y-1.5 text-sm font-medium"><span>Descripcion</span><Textarea name="descripcion" value={taskDescription} onChange={(event) => setTaskDescription(event.target.value)} /></label>
            <label className="block space-y-1.5 text-sm font-medium"><span>Fecha y hora limite</span><Input name="fecha_limite" type="datetime-local" value={taskDeadline} onChange={(event) => setTaskDeadline(event.target.value)} required /></label>
            {!result?.ok && result?.message ? <p className="text-sm text-destructive">{result.message}</p> : null}
            <DialogFooter><Button type="button" variant="outline" onClick={() => setTaskDialog(false)}>Cancelar</Button><Button type="submit" disabled={pending}>{pending ? "Guardando..." : "Guardar tarea"}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  )
}
