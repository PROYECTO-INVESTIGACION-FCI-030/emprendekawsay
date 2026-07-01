"use client"

import Link from "next/link"
import { useEffect, useState, useTransition } from "react"
import { Eye, EyeOff, FilePenLine, Pencil, Plus, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
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
  cambiarVisibilidadCurso,
  eliminarCurso,
  guardarCurso,
  type CursoActionResult,
} from "@/lib/cursos-actions"
import type { Curso, CursoUsuario } from "@/lib/cursos"
import { cn } from "@/lib/utils"

export function CourseManager({ cursos, encargados }: { cursos: Curso[]; encargados: CursoUsuario[] }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Curso | null>(null)
  const [result, setResult] = useState<CursoActionResult | null>(null)
  const [courseTitle, setCourseTitle] = useState("")
  const [courseDescription, setCourseDescription] = useState("")
  const [courseStatus, setCourseStatus] = useState<Curso["estado"]>("en_diseno")
  const [courseManagerId, setCourseManagerId] = useState("")

  useEffect(() => {
    if (!result?.message) return
    const timeout = window.setTimeout(() => setResult(null), 3500)
    return () => window.clearTimeout(timeout)
  }, [result])

  function run(action: () => Promise<CursoActionResult>, close = false) {
    startTransition(async () => {
      const response = await action()
      setResult(response)
      if (response.ok) {
        if (close) setOpen(false)
        router.refresh()
      }
    })
  }

  function openCourse(course?: Curso) {
    setEditing(course ?? null)
    setCourseTitle(course?.titulo ?? "")
    setCourseDescription(course?.descripcion ?? "")
    setCourseStatus(course?.estado ?? "en_diseno")
    setCourseManagerId(course?.id_encargado ?? "")
    setResult(null)
    setOpen(true)
  }

  return (
    <div className="space-y-5 px-4 pb-10 sm:px-6">
      {result?.message ? (
        <div className={cn(
          "rounded-md border px-4 py-3 text-sm",
          result.ok ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-destructive/30 bg-destructive/10 text-destructive",
        )}>
          {result.message}
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Cursos</h2>
          <p className="text-sm text-muted-foreground">
            Crea el curso y luego edita sus modulos, contenido y tareas.
          </p>
        </div>
        <Button onClick={() => openCourse()}>
          <Plus className="mr-1.5 h-4 w-4" />
          Crear curso
        </Button>
      </div>

      {cursos.length === 0 ? (
        <div className="rounded-md border border-dashed border-border px-6 py-12 text-center">
          <FilePenLine className="mx-auto h-7 w-7 text-muted-foreground" />
          <p className="mt-3 font-medium text-foreground">Aun no hay cursos registrados</p>
          <p className="mt-1 text-sm text-muted-foreground">Crea el primero para comenzar a agregar modulos.</p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {cursos.map((curso) => (
            <Card key={curso.id} className={cn("flex flex-col", !curso.visible && "opacity-70")}>
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <CardTitle className="text-lg">{curso.titulo}</CardTitle>
                    <Badge variant={curso.visible ? "default" : "secondary"} className="mt-2">
                      {curso.visible ? "Publicado" : "Oculto"}
                    </Badge>
                    <Badge variant="outline" className="ml-2 mt-2">
                      {{ borrador: "Borrador", en_diseno: "En diseño", en_validacion: "En validación", completado: "Completado" }[curso.estado]}
                    </Badge>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      title={curso.visible ? "Ocultar curso" : "Publicar curso"}
                      disabled={pending}
                      onClick={() => run(() => cambiarVisibilidadCurso(curso.id, !curso.visible))}
                    >
                      {curso.visible ? <EyeOff /> : <Eye />}
                    </Button>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      title="Editar datos"
                      onClick={() => openCourse(curso)}
                    >
                      <Pencil />
                    </Button>
                    <Button
                      size="icon-sm"
                      variant="destructive"
                      title="Eliminar curso"
                      disabled={pending}
                      onClick={() => {
                        if (window.confirm(`Eliminar ${curso.titulo}, sus modulos y tareas?`)) {
                          run(() => eliminarCurso(curso.id))
                        }
                      }}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col">
                <p className="flex-1 text-sm leading-6 text-muted-foreground">{curso.descripcion}</p>
                <div className="mt-4 grid gap-2 rounded-md bg-muted/40 p-3 text-sm">
                  <p><span className="font-medium text-foreground">Encargado:</span> {curso.encargado?.nombre_completo ?? "Sin asignar"}</p>
                  <p><span className="font-medium text-foreground">Emprendedoras:</span> {curso.participantes_count ?? 0} asignadas</p>
                </div>
                <Link href={`/diseno-cursos/${curso.id}`} className={buttonVariants({ className: "mt-5 w-full" })}>
                  <FilePenLine className="mr-1.5 h-4 w-4" />
                  Editar contenido
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Editar curso" : "Crear curso"}</DialogTitle>
            <DialogDescription>
              Después podrás crear los módulos, textos, tareas y asignar emprendedoras dentro del curso.
            </DialogDescription>
          </DialogHeader>
          <form
            key={editing?.id ?? "new-course"}
            className="space-y-4"
            action={(formData) => run(() => guardarCurso(formData), true)}
          >
            <input type="hidden" name="id" value={editing?.id ?? ""} />
            <label className="block space-y-1.5 text-sm font-medium">
              <span>Título</span>
              <Input name="titulo" value={courseTitle} onChange={(event) => setCourseTitle(event.target.value)} required />
            </label>
            <label className="block space-y-1.5 text-sm font-medium">
              <span>Descripción</span>
              <Textarea name="descripcion" value={courseDescription} onChange={(event) => setCourseDescription(event.target.value)} required />
            </label>
            <label className="block space-y-1.5 text-sm font-medium">
              <span>Encargado del curso</span>
              <select
                name="id_encargado"
                value={courseManagerId}
                onChange={(event) => setCourseManagerId(event.target.value)}
                className="h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/50"
              >
                <option value="">Sin asignar</option>
                {encargados.map((encargado) => (
                  <option key={encargado.id} value={encargado.id}>
                    {encargado.nombre_completo ?? encargado.email ?? "Usuario"} · {encargado.rol}
                  </option>
                ))}
              </select>
            </label>
            <label className="block space-y-1.5 text-sm font-medium">
              <span>Estado del curso</span>
              <select
                name="estado"
                value={courseStatus}
                onChange={(event) => setCourseStatus(event.target.value as Curso["estado"])}
                className="h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/50"
              >
                <option value="borrador">Borrador</option>
                <option value="en_diseno">En diseño</option>
                <option value="en_validacion">En validación</option>
                <option value="completado">Completado</option>
              </select>
            </label>
            {!result?.ok && result?.message ? <p className="text-sm text-destructive">{result.message}</p> : null}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={pending}>{pending ? "Guardando..." : "Guardar curso"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
