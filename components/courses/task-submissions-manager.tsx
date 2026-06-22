"use client"

import Link from "next/link"
import { useMemo, useState, useTransition } from "react"
import { ArrowLeft, CheckCircle2, FileText, GraduationCap, Search, Users } from "lucide-react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
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
import { calificarEntrega, type CursoActionResult } from "@/lib/cursos-actions"
import type { Curso, EntregaRevision, TareaCurso } from "@/lib/cursos"

function formatDateTime(iso: string) {
  return new Intl.DateTimeFormat("es-EC", { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso))
}

export function TaskSubmissionsManager({
  curso,
  tarea,
  entregas,
}: {
  curso: Curso
  tarea: TareaCurso
  entregas: EntregaRevision[]
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<EntregaRevision | null>(null)
  const [gradeOpen, setGradeOpen] = useState(false)
  const [grade, setGrade] = useState("")
  const [feedback, setFeedback] = useState("")
  const [result, setResult] = useState<CursoActionResult | null>(null)

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return entregas
    return entregas.filter((delivery) => {
      const name = delivery.participante?.nombre_completo?.toLowerCase() ?? ""
      const email = delivery.participante?.email?.toLowerCase() ?? ""
      return name.includes(query) || email.includes(query)
    })
  }, [entregas, search])

  const graded = entregas.filter((delivery) => delivery.calificacion).length

  function openGrade(delivery: EntregaRevision) {
    setSelected(delivery)
    setGrade(String(delivery.calificacion?.calificacion ?? ""))
    setFeedback(delivery.calificacion?.retroalimentacion ?? "")
    setResult(null)
    setGradeOpen(true)
  }

  function submitGrade(formData: FormData) {
    startTransition(async () => {
      const response = await calificarEntrega(formData)
      setResult(response)
      if (response.ok) {
        setGradeOpen(false)
        router.refresh()
      }
    })
  }

  return (
    <div className="space-y-5 px-4 pb-10 sm:px-6">
      <div className="border-b border-border pb-5">
        <Link href={`/diseno-cursos/${curso.id}`} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Volver al curso
        </Link>
        <h2 className="mt-3 text-2xl font-semibold text-foreground">{tarea.titulo}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{curso.titulo}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="p-4">
          <div className="flex items-center gap-3"><Users className="h-5 w-5 text-sky-600" /><div><p className="text-2xl font-semibold">{entregas.length}</p><p className="text-xs text-muted-foreground">Entregas recibidas</p></div></div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-emerald-600" /><div><p className="text-2xl font-semibold">{graded}</p><p className="text-xs text-muted-foreground">Calificadas</p></div></div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3"><GraduationCap className="h-5 w-5 text-amber-600" /><div><p className="text-2xl font-semibold">{entregas.length - graded}</p><p className="text-xs text-muted-foreground">Sin calificar</p></div></div>
        </Card>
      </div>

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-2 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar participante por nombre o correo"
          className="pl-9"
        />
      </div>

      {entregas.length === 0 ? (
        <div className="rounded-md border border-dashed border-border px-6 py-12 text-center">
          <FileText className="mx-auto h-7 w-7 text-muted-foreground" />
          <p className="mt-3 font-medium text-foreground">Aun no hay entregas</p>
          <p className="mt-1 text-sm text-muted-foreground">Las entregas PDF de las emprendedoras apareceran aqui.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-md border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Participante</th>
                <th className="px-4 py-3 font-medium">Fecha de entrega</th>
                <th className="px-4 py-3 font-medium">Archivo</th>
                <th className="px-4 py-3 font-medium">Nota</th>
                <th className="px-4 py-3 text-right font-medium">Accion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((delivery) => (
                <tr key={delivery.id}>
                  <td className="px-4 py-3"><p className="font-medium text-foreground">{delivery.participante?.nombre_completo ?? "Sin nombre"}</p><p className="text-xs text-muted-foreground">{delivery.participante?.email}</p></td>
                  <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{formatDateTime(delivery.fecha_entrega)}</td>
                  <td className="px-4 py-3">{delivery.archivo_url ? <a href={delivery.archivo_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline"><FileText className="h-4 w-4" />{delivery.archivo_nombre}</a> : <span className="text-muted-foreground">No disponible</span>}</td>
                  <td className="px-4 py-3">{delivery.calificacion ? <span className="font-semibold text-foreground">{delivery.calificacion.calificacion} / 10</span> : <Badge variant="secondary">Sin calificar</Badge>}</td>
                  <td className="px-4 py-3 text-right"><Button size="sm" variant="outline" onClick={() => openGrade(delivery)}><GraduationCap className="mr-1.5 h-4 w-4" />{delivery.calificacion ? "Editar nota" : "Calificar"}</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 ? <p className="px-6 py-10 text-center text-sm text-muted-foreground">No se encontraron participantes.</p> : null}
        </div>
      )}

      <Dialog open={gradeOpen} onOpenChange={setGradeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Calificar entrega</DialogTitle>
            <DialogDescription>{selected?.participante?.nombre_completo}</DialogDescription>
          </DialogHeader>
          {selected ? (
            <form action={submitGrade} className="space-y-4">
              <input type="hidden" name="id_entrega" value={selected.id} />
              <input type="hidden" name="id_curso" value={curso.id} />
              <input type="hidden" name="id_tarea" value={tarea.id} />
              {selected.archivo_url ? <a href={selected.archivo_url} target="_blank" rel="noreferrer" className={buttonVariants({ variant: "outline" })}><FileText className="mr-1.5 h-4 w-4" />Revisar PDF</a> : null}
              <label className="block space-y-1.5 text-sm font-medium"><span>Calificacion sobre 10</span><Input name="calificacion" type="number" min="0" max="10" step="0.01" value={grade} onChange={(event) => setGrade(event.target.value)} required /></label>
              <label className="block space-y-1.5 text-sm font-medium"><span>Retroalimentacion</span><Textarea name="retroalimentacion" value={feedback} onChange={(event) => setFeedback(event.target.value)} /></label>
              {result?.message ? <p className={result.ok ? "text-sm text-emerald-700" : "text-sm text-destructive"}>{result.message}</p> : null}
              <DialogFooter><Button type="button" variant="outline" onClick={() => setGradeOpen(false)}>Cancelar</Button><Button type="submit" disabled={pending}>{pending ? "Guardando..." : "Guardar calificacion"}</Button></DialogFooter>
            </form>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}
