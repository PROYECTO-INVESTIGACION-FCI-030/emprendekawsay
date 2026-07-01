"use client"

import { useEffect, useMemo, useState, useTransition } from "react"
import { Eye, EyeOff, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  cambiarVisibilidadMaterialFormativo,
  eliminarMaterialFormativo,
  guardarMaterialFormativo,
} from "@/lib/materiales-formativos-actions"
import type { MaterialFormativo, MaterialFormativoCurso, TipoMaterialFormativo } from "@/lib/materiales-formativos-data"
import { TIPOS_MATERIALES } from "@/lib/materiales-formativos-data"
import { cn } from "@/lib/utils"

const TIPOS_ORDENADOS: TipoMaterialFormativo[] = [
  "Silabo",
  "Malla curricular",
  "Guia docente",
  "Guia de estudio o cuadernillo de trabajo",
  "Banco de reactivos o propuesta de evaluacion",
  "Rubrica de evaluacion",
  "Informe de justificacion tecnica",
  "Ficha tecnica del curso",
]

type FormState = {
  id: string
  id_curso: string
  tipo: TipoMaterialFormativo | ""
  titulo: string
  descripcion: string
  enlace: string
  orden: string
  visible: boolean
}

const initialForm: FormState = {
  id: "",
  id_curso: "",
  tipo: "",
  titulo: "",
  descripcion: "",
  enlace: "",
  orden: "1",
  visible: true,
}

export function MallaFormativaManager({ cursos, materiales }: { cursos: MaterialFormativoCurso[]; materiales: MaterialFormativo[] }) {
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<MaterialFormativo | null>(null)
  const [form, setForm] = useState<FormState>(initialForm)

  useEffect(() => {
    if (!message) return
    const timeout = window.setTimeout(() => setMessage(null), 3500)
    return () => window.clearTimeout(timeout)
  }, [message])

  const groupedByCourse = useMemo(() => {
    const map = new Map<string, MaterialFormativo[]>()
    for (const curso of cursos) map.set(curso.id, [])
    for (const material of materiales) {
      const list = map.get(material.id_curso) ?? []
      list.push(material)
      map.set(material.id_curso, list)
    }
    return map
  }, [cursos, materiales])

  function open(material?: MaterialFormativo, courseId?: string, tipo?: TipoMaterialFormativo) {
    setEditing(material ?? null)
    setForm(
      material
        ? {
            id: material.id,
            id_curso: material.id_curso,
            tipo: material.tipo,
            titulo: material.titulo,
            descripcion: material.descripcion ?? "",
            enlace: material.enlace ?? "",
            orden: String(material.orden ?? 1),
            visible: material.visible,
          }
        : {
            ...initialForm,
            id_curso: courseId ?? cursos[0]?.id ?? "",
            tipo: tipo ?? TIPOS_MATERIALES[0],
          },
    )
    setMessage(null)
    setDialogOpen(true)
  }

  function run(action: () => Promise<{ ok: boolean; message: string }>, close = false) {
    startTransition(async () => {
      const result = await action()
      setMessage(result.message)
      if (result.ok && close) setDialogOpen(false)
    })
  }

  return (
    <div className="px-4 pb-10 sm:px-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Gestión de materiales</h2>
            <p className="text-sm text-muted-foreground">Cada curso organiza sus 8 documentos base y cada tipo admite una versión activa.</p>
          </div>
          <Button onClick={() => open()}>
            <Plus className="mr-1.5 h-4 w-4" />
            Crear material
          </Button>
        </div>

        {message ? <div className="mb-4 rounded-md border border-border bg-card px-4 py-3 text-sm text-foreground">{message}</div> : null}

        <div className="grid gap-4 xl:grid-cols-2">
          {cursos.map((curso) => {
            const items = groupedByCourse.get(curso.id) ?? []
            return (
              <Card key={curso.id} className="h-full">
                <CardHeader className="flex flex-row items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-base">{curso.titulo}</CardTitle>
                    <p className="text-sm text-muted-foreground">{items.length} documentos creados</p>
                  </div>
                  <Badge variant={items.length >= 8 ? "default" : "secondary"}>{items.length >= 8 ? "Completo" : "En progreso"}</Badge>
                </CardHeader>
                <CardContent className="space-y-2">
                  {TIPOS_ORDENADOS.map((tipo) => {
                    const item = items.find((material) => material.tipo === tipo)
                    return (
                      <div key={tipo} className={cn("rounded-md border border-border p-3", item && !item.visible && "opacity-70")}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-medium text-foreground">{tipo}</p>
                            {item ? (
                              <>
                                <p className="mt-1 text-sm text-muted-foreground">{item.titulo}</p>
                                {item.descripcion ? <p className="mt-1 text-sm text-muted-foreground">{item.descripcion}</p> : null}
                              </>
                            ) : (
                              <p className="mt-1 text-sm text-muted-foreground">Sin crear todavía.</p>
                            )}
                          </div>
                          <Badge variant={item?.visible ? "default" : "secondary"}>{item ? (item.visible ? "Visible" : "Oculto") : "Vacío"}</Badge>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-1">
                          <Button size="sm" variant="outline" onClick={() => open(item ?? undefined, curso.id, tipo)}>
                            <Plus className="mr-1.5 h-4 w-4" />
                            {item ? "Editar" : "Crear"}
                          </Button>
                          {item ? (
                            <>
                              <Button
                                size="icon-sm"
                                variant="ghost"
                                title={item.visible ? "Ocultar" : "Mostrar"}
                                onClick={() => run(() => cambiarVisibilidadMaterialFormativo(item.id, !item.visible))}
                              >
                                {item.visible ? <EyeOff /> : <Eye />}
                              </Button>
                              <Button
                                size="icon-sm"
                                variant="destructive"
                                title="Eliminar"
                                onClick={() => {
                                  if (window.confirm(`¿Eliminar ${item.titulo}?`)) run(() => eliminarMaterialFormativo(item.id))
                                }}
                              >
                                <Trash2 />
                              </Button>
                            </>
                          ) : null}
                        </div>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
            )
          })}
        </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar material" : "Crear material"}</DialogTitle>
            <DialogDescription>Registra cada recurso formativo por curso y por tipo de documento.</DialogDescription>
          </DialogHeader>
          <form action={(fd) => run(() => guardarMaterialFormativo(fd), true)} className="space-y-4">
            <input type="hidden" name="id" value={form.id} />
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-1.5 text-sm font-medium">
                <span>Curso</span>
                <select name="id_curso" value={form.id_curso} onChange={(e) => setForm((v) => ({ ...v, id_curso: e.target.value }))} className="h-9 w-full rounded-md border border-border bg-background px-3">
                  {cursos.map((curso) => <option key={curso.id} value={curso.id}>{curso.titulo}</option>)}
                </select>
              </label>
              <label className="space-y-1.5 text-sm font-medium">
                <span>Tipo de material</span>
                <select name="tipo" value={form.tipo} onChange={(e) => setForm((v) => ({ ...v, tipo: e.target.value as TipoMaterialFormativo }))} className="h-9 w-full rounded-md border border-border bg-background px-3">
                  {TIPOS_MATERIALES.map((tipo) => <option key={tipo} value={tipo}>{tipo}</option>)}
                </select>
              </label>
            </div>
            <div className="grid gap-4 sm:grid-cols-[1fr_120px]">
              <label className="space-y-1.5 text-sm font-medium"><span>Título</span><Input name="titulo" value={form.titulo} onChange={(e) => setForm((v) => ({ ...v, titulo: e.target.value }))} required /></label>
              <label className="space-y-1.5 text-sm font-medium"><span>Orden</span><Input name="orden" type="number" min="1" max="6" value={form.orden} onChange={(e) => setForm((v) => ({ ...v, orden: e.target.value }))} required /></label>
            </div>
            <label className="space-y-1.5 text-sm font-medium"><span>Descripción</span><Textarea name="descripcion" value={form.descripcion} onChange={(e) => setForm((v) => ({ ...v, descripcion: e.target.value }))} /></label>
            <label className="space-y-1.5 text-sm font-medium"><span>Enlace</span><Input name="enlace" value={form.enlace} onChange={(e) => setForm((v) => ({ ...v, enlace: e.target.value }))} placeholder="Opcional" /></label>
            <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" name="visible" checked={form.visible} onChange={(e) => setForm((v) => ({ ...v, visible: e.target.checked }))} /> Visible para la comunidad</label>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={pending}>{pending ? "Guardando..." : "Guardar material"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
