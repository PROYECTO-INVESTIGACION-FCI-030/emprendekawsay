"use client"

import { useState, useTransition } from "react"
import { ExternalLink, FilePlus2, Pencil, Trash2, Users } from "lucide-react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
import type { Investigator, ScientificProduct } from "@/lib/scientific-production"
import { deleteScientificProduct, saveScientificProduct } from "@/lib/scientific-production-actions"
import { cn } from "@/lib/utils"

const TYPE_LABELS = { articulo_scopus: "Articulo indexado Scopus", articulo_latindex: "Articulo indexado Latindex", ponencia: "Ponencia en congreso", capitulo_libro: "Capitulo de libro", politica_publica: "Insumo para politica publica" }
const STATE_LABELS = { pendiente: "Pendiente", en_redaccion: "En redaccion", en_revision: "En revision por pares", publicado: "Publicado / Completado" }
const STATE_STYLE = { pendiente: "bg-slate-100 text-slate-700", en_redaccion: "bg-sky-100 text-sky-700", en_revision: "bg-amber-100 text-amber-700", publicado: "bg-emerald-100 text-emerald-700" }

export function ScientificProductionManager({ products, investigators }: { products: ScientificProduct[]; investigators: Investigator[] }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [view, setView] = useState<"planificados" | "ejecutados">("planificados")
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<ScientificProduct | null>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [type, setType] = useState<ScientificProduct["tipo"]>("articulo_scopus")
  const [status, setStatus] = useState<ScientificProduct["estado"]>("pendiente")
  const [evidence, setEvidence] = useState("")
  const [responsibles, setResponsibles] = useState<string[]>([])
  const [message, setMessage] = useState("")
  const visible = products.filter((product) => view === "ejecutados" ? product.estado === "publicado" : product.estado !== "publicado")

  function openProduct(product?: ScientificProduct) {
    setEditing(product ?? null)
    setTitle(product?.titulo ?? "")
    setDescription(product?.descripcion ?? "")
    setType(product?.tipo ?? "articulo_scopus")
    setStatus(product?.estado ?? "pendiente")
    setEvidence(product?.evidencia_url ?? "")
    setResponsibles(product?.investigadores.map((item) => item.id) ?? [])
    setMessage("")
    setOpen(true)
  }

  function submit(formData: FormData) {
    startTransition(async () => {
      const result = await saveScientificProduct(formData)
      setMessage(result.message)
      if (result.ok) { setOpen(false); router.refresh() }
    })
  }

  return (
    <div className="min-h-full bg-[#f4f8fc] pb-10">
      <section className="border-b-4 border-[#00a6d6] bg-[#00529b] px-6 py-7 text-white">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div><p className="text-sm font-medium text-cyan-100">Gestión académica</p><h2 className="mt-1 text-2xl font-semibold">Producción Científica</h2><p className="mt-2 text-sm text-blue-100">Publicaciones, responsables, evidencias y avance sincronizado con el dashboard.</p></div>
          <Button onClick={() => openProduct()} className="bg-white text-[#00529b] hover:bg-blue-50"><FilePlus2 className="mr-1.5 h-4 w-4" />Registrar publicacion</Button>
        </div>
      </section>
      <div className="space-y-5 px-4 pt-6 sm:px-6">
        {message ? <div className="rounded-md border border-[#8bc9e8] bg-white px-4 py-3 text-sm text-[#004b87]">{message}</div> : null}
        {investigators.length === 0 ? <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">No hay usuarios con rol investigadora. Asigna el rol desde Configuración para registrar responsables.</div> : null}
        <div className="flex w-fit rounded-md border border-[#bdd7ea] bg-white p-1">
          <button type="button" onClick={() => setView("planificados")} className={cn("rounded px-4 py-2 text-sm font-medium", view === "planificados" ? "bg-[#00529b] text-white" : "text-[#00529b]")}>Planificados ({products.filter((item) => item.estado !== "publicado").length})</button>
          <button type="button" onClick={() => setView("ejecutados")} className={cn("rounded px-4 py-2 text-sm font-medium", view === "ejecutados" ? "bg-[#00529b] text-white" : "text-[#00529b]")}>Ejecutados ({products.filter((item) => item.estado === "publicado").length})</button>
        </div>
        <div className="overflow-x-auto rounded-md border border-[#bdd7ea] bg-white">
          <table className="w-full text-sm">
            <thead className="bg-[#eaf4fb] text-left text-[#004b87]"><tr><th className="px-4 py-3">Investigacion / Articulo</th><th className="px-4 py-3">Tipo</th><th className="px-4 py-3">Responsables</th><th className="px-4 py-3">Estado</th><th className="px-4 py-3">Evidencia</th><th className="px-4 py-3 text-right">Acciones</th></tr></thead>
            <tbody className="divide-y divide-border">
              {visible.map((product) => (
                <tr key={product.id}><td className="max-w-sm px-4 py-3"><p className="font-semibold text-foreground">{product.titulo}</p><p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{product.descripcion}</p></td><td className="px-4 py-3 text-muted-foreground">{TYPE_LABELS[product.tipo]}</td><td className="px-4 py-3"><span className="flex items-center gap-1.5 text-muted-foreground"><Users className="h-4 w-4" />{product.investigadores.map((item) => item.nombre).join(", ") || "Sin asignar"}</span></td><td className="px-4 py-3"><span className={cn("rounded-full px-2.5 py-1 text-xs font-medium", STATE_STYLE[product.estado])}>{STATE_LABELS[product.estado]}</span></td><td className="px-4 py-3">{product.evidencia_url ? <a href={product.evidencia_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[#0077b6] hover:underline">Abrir <ExternalLink className="h-3.5 w-3.5" /></a> : <Badge variant="secondary">Pendiente</Badge>}</td><td className="px-4 py-3"><div className="flex justify-end gap-1"><Button size="icon-sm" variant="ghost" onClick={() => openProduct(product)}><Pencil /></Button><Button size="icon-sm" variant="destructive" onClick={() => { if (window.confirm(`Eliminar ${product.titulo}?`)) startTransition(async () => { const result = await deleteScientificProduct(product.id); setMessage(result.message); router.refresh() }) }}><Trash2 /></Button></div></td></tr>
              ))}
            </tbody>
          </table>
          {visible.length === 0 ? <p className="px-6 py-12 text-center text-sm text-muted-foreground">No hay productos en esta vista.</p> : null}
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}><DialogContent className="max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle>{editing ? "Editar producto científico" : "Registrar publicación"}</DialogTitle><DialogDescription>Los estados alimentan automáticamente Producción por Investigador.</DialogDescription></DialogHeader><form action={submit} className="space-y-4"><input type="hidden" name="id" value={editing?.id ?? ""} /><label className="block space-y-1.5 text-sm font-medium"><span>Título de la investigación / artículo</span><Input name="titulo" value={title} onChange={(event) => setTitle(event.target.value)} required /></label><label className="block space-y-1.5 text-sm font-medium"><span>Descripción</span><Textarea name="descripcion" value={description} onChange={(event) => setDescription(event.target.value)} /></label><label className="block space-y-1.5 text-sm font-medium"><span>Tipo de producto</span><select name="tipo" value={type} onChange={(event) => setType(event.target.value as ScientificProduct["tipo"])} className="h-8 w-full rounded-lg border border-input bg-background px-2.5"><option value="articulo_scopus">Artículo indexado Scopus</option><option value="articulo_latindex">Artículo indexado Latindex</option><option value="ponencia">Ponencia en congreso</option><option value="capitulo_libro">Capítulo de libro</option><option value="politica_publica">Insumo para política pública</option></select></label><div className="space-y-2"><p className="text-sm font-medium">Investigadores responsables</p>{investigators.map((investigator) => <label key={investigator.id} className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm"><input type="checkbox" name="investigadores" value={investigator.id} checked={responsibles.includes(investigator.id)} onChange={(event) => setResponsibles((current) => event.target.checked ? [...current, investigator.id] : current.filter((id) => id !== investigator.id))} />{investigator.nombre}</label>)}</div><div className="space-y-2"><p className="text-sm font-medium">Estado del proceso</p><div className="grid grid-cols-2 gap-2">{Object.entries(STATE_LABELS).map(([value, label]) => <button key={value} type="button" onClick={() => setStatus(value as ScientificProduct["estado"])} className={cn("rounded-md border px-3 py-2 text-sm", status === value ? "border-[#0077b6] bg-[#eaf4fb] text-[#00529b]" : "border-border")}>{label}</button>)}</div><input type="hidden" name="estado" value={status} /></div><label className="block space-y-1.5 text-sm font-medium"><span>Archivo PDF / Enlace DOI</span><Input name="evidencia_url" type="url" value={evidence} onChange={(event) => setEvidence(event.target.value)} placeholder="https://doi.org/... o enlace al PDF" /></label>{message ? <p className="text-sm text-destructive">{message}</p> : null}<DialogFooter><Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button><Button type="submit" disabled={pending || !investigators.length}>{pending ? "Guardando..." : "Guardar publicación"}</Button></DialogFooter></form></DialogContent></Dialog>
    </div>
  )
}
