"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Download, FileUp, Pencil, Plus, Trash2, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { ProjectDocument } from "@/lib/project-documents"
import { deleteProjectDocument, deleteProjectDocumentFile, saveProjectDocument } from "@/lib/project-documents-actions"

type Props = {
  documents: ProjectDocument[]
  isAdmin: boolean
}

const EMPTY_FORM = {
  id: "",
  titulo: "",
  descripcion: "",
  categoria: "General",
  enlace_externo: "",
  orden: "0",
  visible: true,
  remove_archivo: false,
  archivo_nombre: "",
  archivo_path: "",
  archivo_tipo: "",
  archivo_tamano: "",
}

export function ProjectDocumentsManager({ documents, isAdmin }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<ProjectDocument | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [selectedFileName, setSelectedFileName] = useState<string>("")

  useEffect(() => {
    if (!open) {
      setEditing(null)
      setForm(EMPTY_FORM)
      setSelectedFileName("")
    }
  }, [open])

  const totalVisible = useMemo(() => documents.filter((doc) => doc.visible).length, [documents])

  function openCreate() {
    setEditing(null)
    setForm(EMPTY_FORM)
    setSelectedFileName("")
    setOpen(true)
  }

  function openEdit(doc: ProjectDocument) {
    setEditing(doc)
    setForm({
      id: String(doc.id),
      titulo: doc.titulo,
      descripcion: doc.descripcion ?? "",
      categoria: doc.categoria,
      enlace_externo: doc.enlace_externo ?? "",
      orden: String(doc.orden),
      visible: doc.visible,
      remove_archivo: false,
      archivo_nombre: doc.archivo_nombre,
      archivo_path: doc.archivo_path,
      archivo_tipo: doc.archivo_tipo ?? "",
      archivo_tamano: String(doc.archivo_tamano ?? ""),
    })
    setSelectedFileName("")
    setOpen(true)
  }

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setMessage(null)
    const formData = new FormData(event.currentTarget)
    if (form.remove_archivo) {
      formData.set("remove_archivo", "on")
    }
    if (!(formData.get("archivo") instanceof File) || (formData.get("archivo") as File).size === 0) {
      formData.delete("archivo")
    }
    const res = await saveProjectDocument(formData)
    setLoading(false)
    setMessage(res.message)
    if (res.ok) {
      setOpen(false)
      router.refresh()
    }
  }

  async function handleDelete(doc: ProjectDocument) {
    if (!confirm(`Eliminar "${doc.titulo}"?`)) return
    setLoading(true)
    setMessage(null)
    const res = await deleteProjectDocument(doc.id, doc.archivo_path)
    setLoading(false)
    setMessage(res.message)
    if (res.ok) router.refresh()
  }

  async function handleDeleteFile(doc: ProjectDocument) {
    if (!confirm(`Eliminar el archivo de "${doc.titulo}"?`)) return
    setLoading(true)
    setMessage(null)
    const res = await deleteProjectDocumentFile(doc.id, doc.archivo_path)
    setLoading(false)
    setMessage(res.message)
    if (res.ok) {
      setForm((v) => ({
        ...v,
        archivo_nombre: "",
        archivo_path: "",
        archivo_tipo: "",
        archivo_tamano: "",
      }))
      setSelectedFileName("")
      setEditing((current) => (current ? { ...current, archivo_nombre: "", archivo_path: "", archivo_tipo: null, archivo_tamano: null } : current))
      router.refresh()
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base">Documentos del proyecto</CardTitle>
            <p className="text-sm text-muted-foreground">
              Biblioteca institucional con {documents.length} documentos, {totalVisible} visibles en la interfaz.
            </p>
          </div>
          {isAdmin ? (
            <Button onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Subir documento
            </Button>
          ) : null}
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {documents.length === 0 ? (
            <div className="rounded-md border border-dashed border-border p-6 text-sm text-muted-foreground md:col-span-2 xl:col-span-3">
              Aún no hay documentos cargados.
            </div>
          ) : (
            documents.map((doc) => (
              <article key={doc.id} className="rounded-lg border border-border bg-card p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate text-sm font-semibold text-foreground">{doc.titulo}</h3>
                      <Badge variant={doc.visible ? "default" : "secondary"} className="shrink-0">
                        {doc.visible ? "Visible" : "Oculto"}
                      </Badge>
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{doc.descripcion || "Sin descripción"}</p>
                  </div>
                  <FileUp className="h-5 w-5 shrink-0 text-primary" />
                </div>
                <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span className="rounded-full bg-secondary px-2 py-1">{doc.categoria}</span>
                  <span className="rounded-full bg-secondary px-2 py-1">Orden {doc.orden}</span>
                  <span className="rounded-full bg-secondary px-2 py-1">{doc.archivo_tipo || "archivo"}</span>
                </div>
                <div className="mt-4 flex items-center justify-between gap-2">
                  <a
                    href={doc.enlace_externo || "#"}
                    target="_blank"
                    rel="noreferrer"
                    className={cn("text-sm font-medium", doc.enlace_externo ? "text-primary underline" : "pointer-events-none text-muted-foreground")}
                  >
                    {doc.enlace_externo ? "Abrir enlace" : "Sin enlace"}
                  </a>
                  <div className="flex gap-1">
                    {doc.download_url ? (
                      <a
                        href={`/api/proyecto/documentos/${doc.id}/download`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-8 items-center justify-center gap-2 rounded-lg border border-border bg-background px-2.5 text-sm font-medium text-foreground hover:bg-muted"
                      >
                        <Download className="h-4 w-4" />
                      </a>
                    ) : null}
                    {isAdmin ? (
                      <>
                        <Button variant="ghost" size="sm" onClick={() => openEdit(doc)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(doc)} className="text-destructive hover:bg-destructive/10">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    ) : null}
                  </div>
                </div>
              </article>
            ))
          )}
        </CardContent>
      </Card>

      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar documento" : "Subir documento"}</DialogTitle>
            <DialogDescription>Gestiona el archivo, su descripción y visibilidad desde aquí.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <input type="hidden" name="id" value={form.id} />
            <input type="hidden" name="archivo_nombre" value={form.archivo_nombre} />
            <input type="hidden" name="archivo_path" value={form.archivo_path} />
            <input type="hidden" name="archivo_tipo" value={form.archivo_tipo} />
            <input type="hidden" name="archivo_tamano" value={form.archivo_tamano} />
            <input type="hidden" name="remove_archivo" value={form.remove_archivo ? "on" : ""} />
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="titulo">Título</Label>
                <Input id="titulo" name="titulo" value={form.titulo} onChange={(e) => setForm((v) => ({ ...v, titulo: e.target.value }))} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="categoria">Categoría</Label>
                <Input id="categoria" name="categoria" value={form.categoria} onChange={(e) => setForm((v) => ({ ...v, categoria: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="orden">Orden</Label>
                <Input id="orden" name="orden" type="number" value={form.orden} onChange={(e) => setForm((v) => ({ ...v, orden: e.target.value }))} />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <Input id="descripcion" name="descripcion" value={form.descripcion} onChange={(e) => setForm((v) => ({ ...v, descripcion: e.target.value }))} />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="enlace_externo">Enlace externo</Label>
                <Input id="enlace_externo" name="enlace_externo" value={form.enlace_externo} onChange={(e) => setForm((v) => ({ ...v, enlace_externo: e.target.value }))} />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="archivo">Archivo PDF / documento</Label>
                <Input
                  id="archivo"
                  name="archivo"
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                  onChange={(e) => setSelectedFileName(e.target.files?.[0]?.name ?? "")}
                />
                <p className="text-xs text-muted-foreground">Si subes un nuevo archivo reemplazará el anterior.</p>
                <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                  {form.archivo_nombre ? (
                    <p>
                      Archivo actual: <span className="font-medium text-foreground">{form.archivo_nombre}</span>
                    </p>
                  ) : null}
                  {selectedFileName ? (
                    <p>
                      Nuevo archivo seleccionado: <span className="font-medium text-foreground">{selectedFileName}</span>
                    </p>
                  ) : null}
                </div>
                {editing?.archivo_path ? (
                  <button
                    type="button"
                    onClick={() => handleDeleteFile(editing)}
                    className={cn(
                      "mt-2 inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors",
                      "border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive/15",
                    )}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Eliminar archivo actual
                  </button>
                ) : null}
              </div>
              <label className="flex items-center gap-2 md:col-span-2">
                <input type="checkbox" name="visible" checked={form.visible} onChange={(e) => setForm((v) => ({ ...v, visible: e.target.checked }))} />
                <span className="text-sm">Visible en la página del proyecto</span>
              </label>
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Upload className="mr-2 h-4 w-4 animate-pulse" />
                    Guardando...
                  </>
                ) : (
                  "Guardar documento"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
