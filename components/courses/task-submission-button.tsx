"use client"

import { useState, useTransition } from "react"
import { CheckCircle2, FileText, Upload } from "lucide-react"
import { useRouter } from "next/navigation"
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
import { entregarTarea, type EntregaActionResult } from "@/lib/entregas-actions"
import type { EntregaTarea } from "@/lib/cursos"

export function TaskSubmissionButton({
  idTarea,
  titulo,
  entrega,
}: {
  idTarea: string
  titulo: string
  entrega?: EntregaTarea
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const [result, setResult] = useState<EntregaActionResult | null>(null)

  function submit(formData: FormData) {
    startTransition(async () => {
      const response = await entregarTarea(formData)
      setResult(response)
      if (response.ok) {
        setOpen(false)
        router.refresh()
      }
    })
  }

  return (
    <>
      <Button
        size="sm"
        variant={entrega ? "outline" : "default"}
        onClick={() => {
          setResult(null)
          setOpen(true)
        }}
      >
        {entrega ? <CheckCircle2 className="mr-1.5 h-4 w-4" /> : <Upload className="mr-1.5 h-4 w-4" />}
        {entrega ? "Reemplazar PDF" : "Entregar tarea"}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Entregar tarea</DialogTitle>
            <DialogDescription>{titulo}</DialogDescription>
          </DialogHeader>
          <form action={submit} className="space-y-4">
            <input type="hidden" name="id_tarea" value={idTarea} />
            {entrega ? (
              <div className="flex items-center gap-3 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
                <FileText className="h-5 w-5 shrink-0" />
                <div className="min-w-0">
                  <p className="font-medium">PDF entregado</p>
                  <p className="truncate text-xs">{entrega.archivo_nombre}</p>
                </div>
              </div>
            ) : null}
            <label className="block space-y-1.5 text-sm font-medium">
              <span>{entrega ? "Seleccionar nuevo PDF" : "Archivo PDF"}</span>
              <Input name="archivo" type="file" accept="application/pdf,.pdf" required />
            </label>
            <p className="text-xs text-muted-foreground">
              Solo formato PDF. Tamano maximo: 10 MB.
            </p>
            {result ? (
              <p className={result.ok ? "text-sm text-emerald-700" : "text-sm text-destructive"}>
                {result.message}
              </p>
            ) : null}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={pending}>
                <Upload className="mr-1.5 h-4 w-4" />
                {pending ? "Entregando..." : "Entregar PDF"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
